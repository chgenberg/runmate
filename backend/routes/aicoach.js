const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

// Initialize OpenAI client if API key is available
let openai;
try {
  if (process.env.OPENAI_API_KEY) {
    const { OpenAI } = require('openai');
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (error) {
  console.log('OpenAI not available, using fallback responses');
}

// Get user's AI coach profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      profile: user.aiCoachProfile || null
    });
  } catch (error) {
    console.error('Error fetching AI coach profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Store user's training profile and goals
router.post('/profile', protect, async (req, res) => {
  try {
    const { 
      goals, 
      currentLevel, 
      targetDistance, 
      targetTime, 
      deadline,
      injuries,
      limitations,
      weeklyVolume,
      restDays,
      workSchedule,
      equipment,
      priorities 
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user with AI coaching profile
    user.aiCoachProfile = {
      goals,
      currentLevel,
      targetDistance,
      targetTime,
      deadline: new Date(deadline),
      injuries: injuries || [],
      limitations: limitations || [],
      weeklyVolume,
      restDays,
      workSchedule,
      equipment: equipment || [],
      priorities: priorities || [],
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    await user.save();

    res.json({ 
      message: 'AI Coach profile created successfully',
      profile: user.aiCoachProfile 
    });
  } catch (error) {
    console.error('Error creating AI coach profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get AI-recommended challenges based on user profile
router.get('/recommended-challenges', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.aiCoachProfile) {
      return res.status(400).json({ message: 'Complete AI Coach profile first' });
    }

    const Challenge = require('../models/Challenge');
    
    // Get all active challenges
    const challenges = await Challenge.find({
      status: 'active',
      startDate: { $gte: new Date() }
    }).populate('participants.user', 'firstName lastName profileImage');

    // Score challenges based on user profile
    const scoredChallenges = challenges.map(challenge => {
      let score = 0;
      const profile = user.aiCoachProfile;
      
      // Match challenge type with user goals
      if (profile.primaryGoal === 'weight_loss' && challenge.type === 'activities') {
        score += 30;
      } else if (profile.primaryGoal === 'fitness' && challenge.type === 'distance') {
        score += 30;
      } else if (profile.primaryGoal === 'race_prep' && challenge.type === 'time') {
        score += 30;
      }
      
      // Match difficulty level
      const challengeDifficulty = calculateChallengeDifficulty(challenge);
      const userLevel = getLevelScore(profile.currentLevel);
      const levelDiff = Math.abs(challengeDifficulty - userLevel);
      score += Math.max(0, 25 - (levelDiff * 5));
      
      // Social preference matching
      if (profile.social_preference === 'group' && challenge.participants.length > 5) {
        score += 20;
      } else if (profile.social_preference === 'partner' && challenge.participants.length <= 5) {
        score += 20;
      }
      
      // Time commitment matching
      const challengeDuration = Math.ceil((new Date(challenge.endDate) - new Date(challenge.startDate)) / (1000 * 60 * 60 * 24));
      if (profile.weekly_runs >= 3 && challengeDuration >= 21) {
        score += 15;
      } else if (profile.weekly_runs <= 2 && challengeDuration <= 14) {
        score += 15;
      }
      
      // Add randomness for variety
      score += Math.random() * 10;
      
      return {
        ...challenge.toObject(),
        aiScore: score,
        aiReasons: generateReasons(challenge, profile, score)
      };
    });
    
    // Sort by score and return top recommendations
    const recommendations = scoredChallenges
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 5);
    
    res.json({
      recommendations,
      profileUsed: {
        primaryGoal: user.aiCoachProfile.primaryGoal,
        currentLevel: user.aiCoachProfile.currentLevel,
        weeklyRuns: user.aiCoachProfile.weekly_runs
      }
    });
    
  } catch (error) {
    console.error('Error getting AI challenge recommendations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Helper functions for challenge recommendation
function calculateChallengeDifficulty(challenge) {
  const target = challenge.goal.target;
  const unit = challenge.goal.unit;
  const duration = Math.ceil((new Date(challenge.endDate) - new Date(challenge.startDate)) / (1000 * 60 * 60 * 24));
  
  let difficulty = 1;
  
  if (unit === 'km') {
    const dailyTarget = target / duration;
    if (dailyTarget > 10) difficulty = 5;
    else if (dailyTarget > 7) difficulty = 4;
    else if (dailyTarget > 5) difficulty = 3;
    else if (dailyTarget > 3) difficulty = 2;
  } else if (unit === 'activities') {
    const weeklyTarget = (target / duration) * 7;
    if (weeklyTarget > 5) difficulty = 5;
    else if (weeklyTarget > 4) difficulty = 4;
    else if (weeklyTarget > 3) difficulty = 3;
    else if (weeklyTarget > 2) difficulty = 2;
  }
  
  return difficulty;
}

function getLevelScore(level) {
  const levels = {
    'beginner': 1,
    'casual': 2,
    'regular': 3,
    'experienced': 4,
    'competitive': 5
  };
  return levels[level] || 3;
}

function generateReasons(challenge, profile, score) {
  const reasons = [];
  
  if (score > 70) {
    reasons.push('Perfekt matchning för din nivå');
  }
  if (challenge.participants.length > 10) {
    reasons.push('Populär utmaning med många deltagare');
  }
  if (profile.primaryGoal === 'weight_loss' && challenge.type === 'activities') {
    reasons.push('Bra för viktminskning');
  }
  if (profile.currentLevel === 'beginner' && calculateChallengeDifficulty(challenge) <= 2) {
    reasons.push('Nybörjarvänlig');
  }
  
  return reasons;
}

// Generate personalized training plan
router.post('/generate-plan', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.aiCoachProfile) {
      return res.status(400).json({ message: 'AI Coach profile not found' });
    }

    const profile = user.aiCoachProfile;
    
    // Get user's recent activities for analysis
    const recentActivities = await Activity.find({ 
      user: req.user._id 
    }).sort({ date: -1 }).limit(10);

    // Simple wrapper for backward compatibility
    const generateTrainingPlan = (profile, recentActivities) => {
      // Convert old format to new format
      const userAnswers = {
        currentLevel: profile.currentLevel || 'beginner',
        primaryGoal: profile.goals?.[0] || 'health',
        hoursPerWeek: profile.timeCommitment || 3,
        preferredTime: profile.preferredTime || 'morning',
        preferredEnvironment: profile.preferredEnvironment || 'outdoor',
        equipment: profile.equipment || ['running_shoes']
      };
      
      const raceInfo = {
        name: 'General Training',
        distance: '5K',
        location: 'Local'
      };
      
      // Call the new function
      return generateTrainingPlanNew(raceInfo, userAnswers, null);
    };

    // Generate base training plan
    const trainingPlan = generateTrainingPlan(profile, recentActivities);

    // Enhance with OpenAI if available
    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `Du är en expertlöpcoach som skapar personliga träningsplaner. Analysera den genererade planen och ge förbättringsförslag på svenska.`
            },
            {
              role: "user",
              content: `Här är min träningsprofil och genererad plan:
              
              Profil: ${JSON.stringify(profile, null, 2)}
              Senaste aktiviteter: ${JSON.stringify(recentActivities.slice(0, 3), null, 2)}
              Genererad plan: ${JSON.stringify(trainingPlan, null, 2)}
              
              Ge 3 specifika förbättringsförslag för denna plan baserat på profilen.`
            }
          ],
          max_tokens: 300,
          temperature: 0.6,
        });

        trainingPlan.aiEnhancements = completion.choices[0].message.content;
      } catch (openaiError) {
        console.error('OpenAI enhancement error:', openaiError);
      }
    }

    res.json({ 
      trainingPlan,
      generatedAt: new Date(),
      planId: `plan_${Date.now()}`,
      enhanced: !!openai
    });
  } catch (error) {
    console.error('Error generating training plan:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Generate structured training plan based on user answers (NO CHAT)
router.post('/generate-structured-plan', protect, async (req, res) => {
  try {
    const formData = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Save AI coach profile from answers
    user.aiCoachProfile = {
      ...formData,
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    await user.save();

    // Generate structured plan based on answers
    const structuredPlan = generateStructuredPlanFromAnswers(formData, user);

    res.json({ 
      success: true,
      plan: structuredPlan,
      message: `Personlig plan skapad för ${user.firstName}`,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error generating structured plan:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get loading messages for AI processing
router.get('/loading-messages', (req, res) => {
  const messages = [
    { id: 1, text: "Analyserar din träningsprofil...", icon: "🏃‍♂️" },
    { id: 2, text: "Skapar personlig träningsplan...", icon: "📋" },
    { id: 3, text: "Optimerar nutritionsråd...", icon: "🥗" },
    { id: 4, text: "Föreslår livsstilsförändringar...", icon: "💪" },
    { id: 5, text: "Matchar med träningspartners...", icon: "👥" },
    { id: 6, text: "Finsliper din plan...", icon: "✨" }
  ];
  
  res.json({ messages });
});

// Comprehensive coaching plan endpoint
router.post('/comprehensive-plan', protect, async (req, res) => {
  try {
    const {
      // Basic profile
      ageGroup,
      
      // Goals and level
      primaryGoal,
      currentLevel,
      trainingExperience,
      
      // Training status
      weeklyRuns,
      weeklyHours,
      distancePreference,
      pacePreference,
      personalBest5k,
      
      // Preferences
      preferredTime,
      preferredEnvironment,
      socialPreference,
      musicPreference,
      
      // Health and lifestyle
      healthConcerns,
      dietStyle,
      sleepQuality,
      stressLevel,
      motivationFactors,
      
      // Matching profile
      matchingProfile
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Save AI coach profile
    user.aiCoachProfile = {
      ageGroup,
      primaryGoal,
      currentLevel,
      trainingExperience,
      weeklyRuns,
      weeklyHours,
      distancePreference,
      pacePreference,
      personalBest5k,
      preferredTime,
      preferredEnvironment,
      socialPreference,
      musicPreference,
      healthConcerns,
      dietStyle,
      sleepQuality,
      stressLevel,
      motivationFactors,
      matchingProfile,
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    await user.save();

    // Generate comprehensive plan
    const levelMap = {
      'beginner': 'Nybörjare',
      'occasional': 'Tillfällig',
      'regular': 'Regelbunden',
      'advanced': 'Avancerad'
    };
    
    const goalMap = {
      'first_5k': 'Springa första 5K',
      'improve_time': 'Förbättra tid',
      'marathon': 'Marathon-träning',
      'health': 'Förbättra hälsa',
      'weight_loss': 'Gå ner i vikt',
      'social': 'Hitta löparvänner'
    };

    const comprehensivePlan = {
      success: true,
      plan: {
        summary: {
          name: 'Din Personliga Löparplan',
          level: levelMap[currentLevel] || 'Medel',
          goal: goalMap[primaryGoal] || 'Prestation',
          duration: '12 veckor',
          startDate: new Date().toLocaleDateString('sv-SE'),
          weeklyCommitment: `${weeklyHours || '3-4'} timmar/vecka`,
          keyStrategies: [
            'Progressiv ökning av träningsvolym',
            'Balanserad mix av intensiteter',
            'Fokus på återhämtning och skadeförebyggning'
          ],
          expectedResults: [
            'Förbättrad kondition med 15-20%',
            'Ökad löphastighet med 30-45 sekunder/km',
            'Starkare muskulatur och bättre löpteknik'
          ]
        },
        training: {
          weeklySchedule: [
            { day: 'Måndag', type: 'Vila', duration: '-', pace: '-', description: 'Fullständig vila eller lätt yoga' },
            { day: 'Tisdag', type: 'Intervaller', duration: '40 min', pace: '5:00-5:30/km', description: 'Högt tempo för förbättrad hastighet' },
            { day: 'Onsdag', type: 'Vila', duration: '-', pace: '-', description: 'Återhämtning' },
            { day: 'Torsdag', type: 'Lugn löpning', duration: '30 min', pace: '6:00/km', description: 'Återhämtningslöpning i lugnt tempo' },
            { day: 'Fredag', type: 'Vila', duration: '-', pace: '-', description: 'Förbered för helgens träning' },
            { day: 'Lördag', type: 'Långpass', duration: '60 min', pace: '5:45/km', description: 'Bygger uthållighet och aerob kapacitet' },
            { day: 'Söndag', type: 'Vila/Styrka', duration: '30 min', pace: '-', description: 'Vila eller lätt styrketräning' }
          ],
          phases: [
            {
              name: 'Grundfas (Vecka 1-4)',
              focus: 'Bygga uthållighet och vana',
              weeklyDistance: '25 km',
              keyWorkouts: [
                'Lugna löprundor 30-45 min',
                'Långpass 60-90 min i samtalstempo'
              ]
            },
            {
              name: 'Uppbyggnadsfas (Vecka 5-8)',
              focus: 'Öka distans och tempo',
              weeklyDistance: '30 km',
              keyWorkouts: [
                'Tempopass 20-30 min i tröskeltempo',
                'Intervaller 5x3 min med 90 sek vila',
                'Långpass med tempoväxlingar'
              ]
            },
            {
              name: 'Toppfas (Vecka 9-12)',
              focus: 'Maximera prestation',
              weeklyDistance: '35 km',
              keyWorkouts: [
                'Intervaller 8x2 min i hög hastighet',
                'Tempopass 30-40 min',
                'Simuleringslopp på 80% av målsträcka'
              ]
            }
          ],
          recovery: {
            betweenSessions: 'Minst 1 vilodag mellan hårda pass',
            weekly: '1-2 kompletta vilodagar per vecka',
            stretching: 'Stretching 10-15 min efter varje pass',
            foamRolling: 'Foam rolling 2-3 ggr/vecka',
            activeRecovery: 'Lätt yoga eller simning på vilodagar'
          }
        },
        nutrition: {
          dailyCalories: 2400,
          hydration: '2.5-3 liter per dag',
          macros: {
            carbs: '50-60%',
            protein: '20-25%',
            fat: '20-25%'
          },
          preworkout: {
            timing: '1-2 timmar före träning',
            options: [
              'Havregrynsgröt med banan och honung',
              'Toast med jordnötssmör och sylt',
              'Smoothie med bär, banan och yoghurt'
            ]
          },
          postworkout: {
            timing: 'Inom 30-60 minuter efter träning',
            options: [
              'Proteinshake med banan',
              'Grekisk yoghurt med granola och bär',
              'Kycklingsmörgås med grönsaker'
            ]
          }
        },
        lifestyle: {
          sleep: {
            hours: '7-9 timmar per natt',
            tips: [
              'Gå och lägg dig samma tid varje kväll',
              'Undvik skärmar 1 timme före sömn',
              'Håll sovrummet svalt (16-18°C)'
            ]
          },
          crossTraining: [
            'Cykling eller simning för variation',
            'Core-träning 2-3 ggr/vecka'
          ],
          injuryPrevention: [
            'Värm alltid upp 5-10 min före löpning',
            'Lyssna på kroppen - vila vid smärta'
          ]
        },
        matches: {
          topMatches: [
            {
              initial: 'E',
              name: 'Emma Johansson',
              reason: 'Samma träningsmål och tempo',
              compatibility: '95%',
              distance: '2.3 km bort'
            },
            {
              initial: 'M', 
              name: 'Marcus Lindberg',
              reason: 'Tränar samma tider och miljö',
              compatibility: '92%',
              distance: '3.1 km bort'
            },
            {
              initial: 'S',
              name: 'Sofia Andersson', 
              reason: 'Liknande träningsfrekvens',
              compatibility: '88%',
              distance: '1.8 km bort'
            }
          ]
        },
        profile: {
          ageGroup: ageGroup || '25-35',
          primaryGoal: primaryGoal || 'fitness',
          currentLevel: currentLevel || 'regular',
          weeklyRuns: weeklyRuns || 3,
          weeklyHours: weeklyHours || 4,
          trainingExperience: trainingExperience || 'beginner',
          createdAt: new Date()
        },
        source: 'fallback',
        generatedAt: new Date()
      }
    };

    return res.json(comprehensivePlan);
  } catch (error) {
    console.error('Error creating comprehensive plan:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Onboarding endpoint to create training plan
router.post('/onboarding', protect, async (req, res) => {
  try {
    const { goal, currentLevel, weeklyRuns, personalBest, injuries, timeCommitment } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create AI coach profile from onboarding data
    const aiCoachProfile = {
      goals: [goal],
      currentLevel,
      weeklyVolume: weeklyRuns,
      personalBest,
      injuries: injuries === 'none' ? [] : [injuries],
      timeCommitment,
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    user.aiCoachProfile = aiCoachProfile;
    await user.save();

    // Generate a basic training plan
    const trainingPlan = {
      weeklyGoal: getWeeklyGoal(currentLevel, timeCommitment),
      weeklySchedule: getWeeklySchedule(weeklyRuns, timeCommitment),
      focusAreas: getFocusAreas(goal, currentLevel),
      completedSessions: 0,
      totalSessions: parseInt(weeklyRuns.split('-')[1] || weeklyRuns.split('+')[0] || '3'),
      averagePace: getEstimatedPace(personalBest),
      streak: 0
    };

    res.json({ 
      success: true,
      plan: trainingPlan,
      profile: aiCoachProfile
    });
  } catch (error) {
    console.error('Error in onboarding:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get AI coaching advice with OpenAI integration
router.post('/advice', protect, async (req, res) => {
  try {
    const { question, context } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let advice;
    
    // Use OpenAI if available, otherwise fallback to simple responses
    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `Du är en världsklass löpcoach och träningsexpert med över 20 års erfarenhet. Du svarar på svenska och ger djupa, vetenskapligt baserade råd som är personligt anpassade för varje användare.

              VIKTIGA FORMATERINGSREGLER:
              - Använd HTML-formatering: <strong>text</strong> för fetstil (INTE ** eller markdown)
              - Dela upp text i paragrafer med <p>-taggar
              - Avsluta alltid meningar komplett - klipp ALDRIG av mitt i en mening
              - Strukturera svaret logiskt med tydliga stycken
              - Använd <br/> för radbrytningar vid behov
              - Max 2-3 emojis per svar, använd naturligt

              ANVÄNDARENS PROFIL:
              - Namn: ${user.firstName}
              - Träningsnivå: ${user.activityLevel || 'okänd'}
              - AI Coach profil: ${user.aiCoachProfile ? JSON.stringify(user.aiCoachProfile) : 'Inte konfigurerad'}
              
              DINA INSTRUKTIONER:
              1. Ge konkreta, actionable råd som användaren kan implementera direkt
              2. Basera råden på användarens specifika nivå och mål
              3. Inkludera vetenskapliga referenser när relevant
              4. Anpassa språket till svenska löpterminologi
              5. Fokusera på långsiktig utveckling och skadeförebyggning
              6. Ge specifika siffror och mätbara mål när möjligt
              
              EXPERTOMRÅDEN:
              - Träningsperiodisering och progression
              - Löpteknik och biomekanik
              - Sportnutrition och återhämtning
              - Skadeförebyggning och rehabilitering
              - Mental träning och motivation
              - Tävlingsförberedelse
              
              Ge detaljerade, välstrukturerade svar (300-800 ord). Använd personlig ton och inkludera användarens namn.`
            },
            {
              role: "user",
              content: question
            }
          ],
          max_tokens: 3000,
          temperature: 0.7,
        });

        advice = completion.choices[0].message.content;
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError);
        // Fallback to simple response if OpenAI fails
        advice = generateAIAdvice(question, context, user);
      }
    } else {
      // Use fallback responses when OpenAI is not available
      advice = generateAIAdvice(question, context, user);
    }

    res.json({ 
      advice,
      timestamp: new Date(),
      source: openai ? 'openai' : 'fallback'
    });
  } catch (error) {
    console.error('Error generating AI advice:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update training plan based on performance
router.post('/adapt-plan', protect, async (req, res) => {
  try {
    const { 
      completedWorkouts, 
      missedWorkouts, 
      recoveryLevel, 
      performanceMetrics 
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user || !user.aiCoachProfile) {
      return res.status(400).json({ message: 'AI Coach profile not found' });
    }

    // Adapt training plan based on real performance data
    const adaptedPlan = adaptTrainingPlan(
      user.aiCoachProfile, 
      completedWorkouts, 
      missedWorkouts, 
      recoveryLevel, 
      performanceMetrics
    );

    res.json({ 
      adaptedPlan,
      adaptationReason: getAdaptationReason(completedWorkouts, missedWorkouts, recoveryLevel),
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error adapting training plan:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Removed old generateTrainingPlan function - using Apple Health enhanced version instead

function calculateWeeklyDistance(baseVolume, week, totalWeeks) {
  const buildPhase = Math.floor(totalWeeks * 0.7);
  const taperPhase = totalWeeks - buildPhase;
  
  if (week <= buildPhase) {
    // Progressive build - increase 10% per week
    return Math.round(baseVolume * Math.pow(1.1, week - 1));
  } else {
    // Taper phase - reduce volume
    const peakVolume = baseVolume * Math.pow(1.1, buildPhase - 1);
    const reductionFactor = 0.85 ** (week - buildPhase);
    return Math.round(peakVolume * reductionFactor);
  }
}

function generateWeeklyWorkouts(weeklyDistance, avgPace, priorities, restDays) {
  const workoutsPerWeek = 7 - (restDays || 2);
  const longRunPercent = 0.35; // 35% of weekly volume
  const tempoPercent = 0.25;   // 25% for tempo work
  const easyPercent = 0.4;     // 40% easy running

  const longRunDistance = weeklyDistance * longRunPercent;
  const tempoDistance = weeklyDistance * tempoPercent;
  const easyDistance = weeklyDistance * easyPercent;

  const workouts = [
    {
      day: 'Måndag',
      type: 'Vila',
      description: 'Fullständig vila eller lätt yoga',
      duration: 0,
      intensity: 'Vila',
      benefits: 'Återhämtning och reparation'
    },
    {
      day: 'Tisdag',
      type: 'Intervalträning',
      description: `${Math.ceil(tempoDistance/2)}x 1km i 5K-tempo`,
      duration: Math.round(tempoDistance * avgPace / 60),
      intensity: 'Hög',
      benefits: 'VO2 max och löpekonomi'
    },
    {
      day: 'Onsdag',
      type: 'Easy Run',
      description: 'Lugn löpning för återhämtning',
      duration: Math.round(easyDistance/2 * avgPace / 60),
      intensity: 'Låg',
      benefits: 'Aerob bas och återhämtning'
    },
    {
      day: 'Torsdag',
      type: 'Tempoträning',
      description: `${Math.round(tempoDistance/2)} km i halvmaraton-tempo`,
      duration: Math.round(tempoDistance/2 * avgPace * 0.95 / 60),
      intensity: 'Medel-hög',
      benefits: 'Laktattröskel och uthållighet'
    },
    {
      day: 'Fredag',
      type: 'Vila',
      description: 'Vila eller lätt styrketräning',
      duration: 0,
      intensity: 'Vila',
      benefits: 'Förberedelse för helgens träning'
    },
    {
      day: 'Lördag',
      type: 'Lång löpning',
      description: `${Math.round(longRunDistance)} km stadigt tempo`,
      duration: Math.round(longRunDistance * avgPace * 1.1 / 60),
      intensity: 'Låg-medel',
      benefits: 'Aerob kapacitet och uthållighet'
    },
    {
      day: 'Söndag',
      type: 'Recovery Run',
      description: `${Math.round(easyDistance/2)} km mycket lätt`,
      duration: Math.round(easyDistance/2 * avgPace * 1.2 / 60),
      intensity: 'Mycket låg',
      benefits: 'Aktiv återhämtning'
    }
  ];

  return workouts;
}

function getWeeklyFocus(week, priorities) {
  const focuses = {
    1: 'Basbyggande - etablera rutiner',
    2: 'Aerob utveckling',
    3: 'Löpteknik och effektivitet', 
    4: 'Återhämtningsvecka',
    5: 'Uthållighetsbyggande',
    6: 'Tempotolerans',
    7: 'Lång löpning fokus',
    8: 'Återhämtningsvecka',
    9: 'Racetempo träning',
    10: 'Mental förberedelse',
    11: 'Taper - minska volym',
    12: 'Race week!'
  };
  
  return focuses[week] || 'Fortsatt utveckling';
}

function generateAIAdvice(question, context, user) {
  // Simplified AI advice generation
  const adviceDatabase = {
    'förbättra tid': `Baserat på din profil rekommenderar jag att fokusera på tempoträning och intervalträning. Öka gradvis din veckovolym med max 10% per vecka.`,
    'skadeförebyggande': `För att undvika skador, se till att 80% av din träning sker i aerob zon. Inkludera styrketräning 2x/vecka och stretching dagligen.`,
    'nutrition': `För optimala prestationer, ät kompletta kolhydrater 2-3h före träning och protein inom 30min efter. Håll dig hydratiserad genom dagen.`,
    'återhämtning': `Kvalitetssömn (7-9h) är avgörande. Lyssna på din kropp - vid hög vilopuls eller trötthet, ta en extra vilodag.`,
    'mental träning': `Visualisering och positiv självprat är kraftfulla verktyg. Sätt delmål och fira framsteg. Träna medveten närvaro under löpning.`
  };

  // Simple keyword matching - in real implementation this would use proper NLP/AI
  const keywords = question.toLowerCase();
  
  for (const [key, advice] of Object.entries(adviceDatabase)) {
    if (keywords.includes(key)) {
      return advice;
    }
  }

  return `Tack för din fråga! Baserat på din träningsprofil rekommenderar jag att du fokuserar på gradvis progression och lyssnar på din kropp. Kontakta mig gärna med mer specifika frågor.`;
}

function adaptTrainingPlan(profile, completed, missed, recovery, metrics) {
  // Simplified adaptation logic
  let adaptations = [];
  
  if (missed.length > completed.length) {
    adaptations.push({
      type: 'volume_reduction',
      reason: 'För många missade pass',
      adjustment: 'Minska veckovolym med 15%'
    });
  }
  
  if (recovery < 6) {
    adaptations.push({
      type: 'recovery_focus',
      reason: 'Låg återhämtningsnivå',
      adjustment: 'Lägg till extra vilodag och minska intensitet'
    });
  }
  
  if (metrics && metrics.averageHR > profile.maxHR * 0.85) {
    adaptations.push({
      type: 'intensity_reduction', 
      reason: 'För hög träningsbelastning',
      adjustment: 'Sänk intensitet på tempopassen'
    });
  }

  return {
    adaptations,
    nextWeekRecommendation: adaptations.length > 0 ? 'Fokusera på återhämtning' : 'Fortsätt enligt plan'
  };
}

function getAdaptationReason(completed, missed, recovery) {
  if (missed.length > 2) return 'Justerat för missade träningspass';
  if (recovery < 6) return 'Anpassat för förbättrad återhämtning';
  return 'Plan anpassad baserat på prestanda';
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

function formatPace(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Helper functions for onboarding
function getWeeklyGoal(currentLevel, timeCommitment) {
  const timeHours = parseInt(timeCommitment.split('-')[0] || timeCommitment.split('+')[0] || '3');
  
  switch (currentLevel) {
    case 'beginner':
      return `${Math.min(timeHours * 3, 15)} km`;
    case 'intermediate':
      return `${Math.min(timeHours * 4, 25)} km`;
    case 'advanced':
      return `${Math.min(timeHours * 5, 40)} km`;
    case 'elite':
      return `${Math.min(timeHours * 6, 60)} km`;
    default:
      return '20 km';
  }
}

function getWeeklySchedule(weeklyRuns, timeCommitment) {
  const runs = parseInt(weeklyRuns.split('-')[1] || weeklyRuns.split('+')[0] || '3');
  const timeHours = parseInt(timeCommitment.split('-')[0] || timeCommitment.split('+')[0] || '3');
  
  if (runs <= 2) {
    return `${runs} pass per vecka: 1 längre pass (${Math.floor(timeHours/2)}0 min), 1 intervallpass (30 min)`;
  } else if (runs <= 3) {
    return `${runs} pass per vecka: 1 långpass, 1 intervallpass, 1 lugnt pass`;
  } else {
    return `${runs} pass per vecka: 2 kvalitetspass, ${runs-2} lugna pass`;
  }
}

function getFocusAreas(goal, currentLevel) {
  const areas = [];
  
  switch (goal) {
    case 'speed':
      areas.push('Intervallträning', 'Teknikförbättring');
      break;
    case 'distance':
      areas.push('Uthållighet', 'Långpass');
      break;
    case 'weight':
      areas.push('Fettförbränning', 'Regelbundenhet');
      break;
    case 'health':
      areas.push('Grundkondition', 'Återhämtning');
      break;
    case 'race':
      areas.push('Specifik träning', 'Tävlingsförberedelse');
      break;
    default:
      areas.push('Allmän kondition', 'Löpglädje');
  }
  
  if (currentLevel === 'beginner') {
    areas.push('Skadeförebyggning');
  }
  
  return areas.join(', ');
}

function getEstimatedPace(personalBest) {
  switch (personalBest) {
    case 'sub20':
      return '4:00/km';
    case '20-25':
      return '4:30/km';
    case '25-30':
      return '5:30/km';
    case '30-35':
      return '6:30/km';
    case '35+':
      return '7:00/km';
    default:
      return '6:00/km';
  }
}

// Helper functions for comprehensive plan parsing
function extractKeyStrategies(aiResponse) {
  // Extract key strategies from AI response
  const strategies = [];
  const lines = aiResponse.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('strategi') || line.includes('fokus') || line.includes('nyckel')) {
      strategies.push(lines[i].replace(/^[•\-\*]\s*/, '').trim());
    }
  }
  
  return strategies.slice(0, 3); // Top 3 strategies
}

function extractExpectedResults(aiResponse) {
  // Extract expected results from AI response
  const results = [];
  const lines = aiResponse.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('resultat') || line.includes('förvänta') || line.includes('mål')) {
      results.push(lines[i].replace(/^[•\-\*]\s*/, '').trim());
    }
  }
  
  return results.slice(0, 3); // Top 3 expected results
}

function extractTrainingPlan(aiResponse) {
  // Extract training plan section from AI response
  const sections = aiResponse.split(/(?:TRÄNING|TRAINING)/i);
  if (sections.length > 1) {
    return sections[1].split(/(?:KOST|NUTRITION|LIVSSTIL|LIFESTYLE)/i)[0].trim();
  }
  return 'Detaljerat träningsschema finns i den fullständiga planen.';
}

function extractNutritionPlan(aiResponse) {
  // Extract nutrition plan section from AI response
  const sections = aiResponse.split(/(?:KOST|NUTRITION)/i);
  if (sections.length > 1) {
    return sections[1].split(/(?:LIVSSTIL|LIFESTYLE|UPPFÖLJNING|TRACKING)/i)[0].trim();
  }
  return 'Detaljerad kostplan finns i den fullständiga planen.';
}

function extractLifestylePlan(aiResponse) {
  // Extract lifestyle plan section from AI response
  const sections = aiResponse.split(/(?:LIVSSTIL|LIFESTYLE)/i);
  if (sections.length > 1) {
    return sections[1].split(/(?:UPPFÖLJNING|TRACKING)/i)[0].trim();
  }
  return 'Detaljerade livsstilsråd finns i den fullständiga planen.';
}

function extractProgressTracking(aiResponse) {
  // Extract progress tracking section from AI response
  const sections = aiResponse.split(/(?:UPPFÖLJNING|TRACKING|PROGRESS)/i);
  if (sections.length > 1) {
    return sections[1].trim();
  }
  return 'Detaljerad uppföljningsplan finns i den fullständiga planen.';
}

function generateStructuredPlanFromAnswers(formData, user) {
  const {
    primaryGoal,
    currentLevel,
    weeklyHours,
    dietStyle,
    sleepQuality,
    stressLevel,
    preferredTime,
    preferredEnvironment,
    healthConcerns,
    equipment
  } = formData;

  // Calculate training intensity based on level
  const intensityMap = {
    'beginner': { easy: 85, moderate: 10, hard: 5 },
    'casual': { easy: 80, moderate: 15, hard: 5 },
    'regular': { easy: 75, moderate: 20, hard: 5 },
    'experienced': { easy: 70, moderate: 25, hard: 5 },
    'competitive': { easy: 65, moderate: 25, hard: 10 }
  };

  const intensity = intensityMap[currentLevel] || intensityMap['regular'];
  const hoursPerWeek = parseInt(weeklyHours) || 4;

  // Generate training schedule
  const trainingSchedule = generateTrainingScheduleFromAnswers(
    primaryGoal, 
    currentLevel, 
    hoursPerWeek, 
    preferredTime, 
    preferredEnvironment,
    equipment
  );

  // Generate nutrition plan
  const nutritionPlan = generateNutritionPlanFromAnswers(
    primaryGoal, 
    dietStyle, 
    currentLevel
  );

  // Generate lifestyle recommendations
  const lifestylePlan = generateLifestylePlanFromAnswers(
    sleepQuality, 
    stressLevel, 
    healthConcerns
  );

  // Generate recovery plan
  const recoveryPlan = generateRecoveryPlanFromAnswers(
    currentLevel, 
    hoursPerWeek, 
    healthConcerns
  );

  return {
    summary: {
      name: `${user.firstName}s Personliga Träningsplan`,
      goal: getGoalDescription(primaryGoal),
      level: getLevelDescription(currentLevel),
      commitment: `${hoursPerWeek} timmar/vecka`,
      startDate: new Date().toLocaleDateString('sv-SE'),
      duration: '12 veckor'
    },
    training: trainingSchedule,
    nutrition: nutritionPlan,
    lifestyle: lifestylePlan,
    recovery: recoveryPlan,
    progressTracking: generateProgressTrackingFromAnswers(primaryGoal),
    createdAt: new Date(),
    source: 'structured_answers'
  };
}

function generateStructuredPlan(formData, user) {
  // Fallback structured plan when OpenAI is not available
  const {
    // Basic profile
    ageGroup,
    gender,
    weight,
    height,
    
    // Goals and level
    primaryGoal,
    weightGoal,
    targetRace,
    currentLevel,
    
    // Training status
    weeklyRuns,
    weeklyHours,
    longestRun,
    
    // Health
    injuries,
    injuryDetails,
    
    // Lifestyle
    dietStyle,
    sleepHours,
    
    // Technology
    currentDevices,
    
    // Motivation
    motivationFactors,
    biggestChallenges
  } = formData;

  return {
    aiGenerated: false,
    summary: {
      primaryFocus: primaryGoal,
      weeklyCommitment: `${weeklyHours} timmar/vecka`,
      keyStrategies: [
        'Progressiv överbelastning anpassad efter din nivå',
        'Balanserad kost som stödjer dina mål',
        'Optimal återhämtning för bästa resultat'
      ],
      expectedResults: [
        'Märkbara förbättringar inom 2-4 veckor',
        'Ökad styrka och uthållighet',
        'Bättre allmän hälsa och välbefinnande'
      ]
    },
    trainingPlan: generateBasicTrainingPlan(primaryGoal, currentLevel, weeklyHours, currentDevices),
    nutritionPlan: generateBasicNutritionPlan(primaryGoal, dietStyle),
    lifestylePlan: generateBasicLifestylePlan(sleepHours, biggestChallenges),
    progressTracking: generateBasicProgressTracking(primaryGoal),
    rawPlan: `Personlig tränings- och kostplan för ${user.firstName}

TRÄNINGSSCHEMA:
${generateBasicTrainingPlan(primaryGoal, currentLevel, weeklyHours, currentDevices)}

KOSTPLAN:
${generateBasicNutritionPlan(primaryGoal, dietStyle)}

LIVSSTILSRÅD:
${generateBasicLifestylePlan(sleepHours, biggestChallenges)}

UPPFÖLJNING:
${generateBasicProgressTracking(primaryGoal)}`
  };
}

function generateBasicTrainingPlan(goal, level, hours, equipment) {
  const equipmentList = Array.isArray(equipment) ? equipment : [];
  const hasGym = equipmentList.includes('full-gym');
  const hasWeights = equipmentList.includes('dumbbells') || equipmentList.includes('barbell');
  
  let plan = `Veckoschema (${hours} timmar/vecka):\n\n`;
  
  if (parseInt(hours) <= 3) {
    plan += `MÅNDAG: Helkroppsstyrka (45 min)
ONSDAG: Konditionsträning (30-45 min)
FREDAG: Funktionell träning (45 min)`;
  } else if (parseInt(hours) <= 6) {
    plan += `MÅNDAG: Överkropp styrka (45 min)
TISDAG: Kondition/löpning (45 min)
TORSDAG: Underkropp styrka (45 min)
LÖRDAG: Aktiv återhämtning/yoga (30 min)`;
  } else {
    plan += `MÅNDAG: Bröst/triceps (60 min)
TISDAG: Kondition HIIT (45 min)
ONSDAG: Rygg/biceps (60 min)
TORSDAG: Löpning/cykling (45 min)
FREDAG: Ben/rumpa (60 min)
LÖRDAG: Axlar/core (45 min)
SÖNDAG: Aktiv vila`;
  }
  
  if (!hasGym && !hasWeights) {
    plan += `\n\nAnpassat för hemmaträning med kroppsvikt och ${equipmentList.join(', ')}.`;
  }
  
  return plan;
}

function generateBasicNutritionPlan(goal, currentDiet) {
  let plan = 'Grundläggande kostprinciper:\n\n';
  
  switch (goal) {
    case 'weight-loss':
      plan += `• Kaloriunderskott på 300-500 kcal/dag
• Hög proteinintag (1,6-2,2g per kg kroppsvikt)
• Mycket grönsaker och fibrer
• Begränsa processad mat och socker`;
      break;
    case 'muscle-gain':
      plan += `• Kaloriöverskott på 200-400 kcal/dag
• Hög proteinintag (2-2,5g per kg kroppsvikt)
• Komplexa kolhydrater runt träning
• Nyttiga fetter för hormonproduktion`;
      break;
    default:
      plan += `• Balanserad makrofördelning (40% kolhydrater, 30% protein, 30% fett)
• Regelbundna måltider
• Mycket vatten (2-3 liter/dag)
• Fokus på näringstäta livsmedel`;
  }
  
  plan += `\n\nExempel på dagsmeny kommer i den detaljerade planen.`;
  
  return plan;
}

function generateBasicLifestylePlan(sleepHours, lifestyle) {
  let plan = 'Livsstilsoptimering:\n\n';
  
  plan += `SÖMN:
• Mål: 7-9 timmar per natt (du sover ${sleepHours}h)
• Regelbundna sovtider
• Mörkt och svalt sovrum
• Ingen skärmtid 1h före sömn\n\n`;
  
  plan += `STRESSHANTERING:
• Daglig meditation (10-15 min)
• Djupandning mellan träningspass
• Regelbundna pauser från arbete
• Naturvistelse när möjligt\n\n`;
  
  plan += `ÅTERHÄMTNING:
• Aktiva vilopass (promenader, yoga)
• Stretching efter träning
• Varmbadd eller sauna 1-2 ggr/vecka
• Massage eller foamrolling`;
  
  return plan;
}

function generateBasicProgressTracking(goal) {
  let plan = 'Uppföljning och mätningar:\n\n';
  
  plan += `VECKOVIS MÄTNING:
• Kroppsvikt (samma tid, samma dag)
• Energinivå (skala 1-10)
• Träningskvalitet (skala 1-10)
• Sömnkvalitet (skala 1-10)\n\n`;
  
  plan += `MÅNADSVIS MÄTNING:
• Kroppsmått (midja, höfter, armar)
• Konditionstest
• Styrketest (max antal push-ups)
• Progressbilder\n\n`;
  
  plan += `MILSTOLPAR:
• Vecka 2: Första förbättringarna märks
• Vecka 4: Tydliga resultat
• Vecka 8: Betydande förändringar
• Vecka 12: Måluppfyllelse`;
  
  return plan;
}

// Advanced AI response parsing functions for comprehensive plan
function extractPersonalizedInsights(aiResponse, user) {
  const insights = [];
  const text = aiResponse.toLowerCase();
  
  if (text.includes('personlig') || text.includes('individuel')) {
    insights.push('Plan anpassad specifikt för dina unika förutsättningar');
  }
  if (text.includes('potential') || text.includes('förbättring')) {
    insights.push('Stor potential för snabba förbättringar identifierad');
  }
  if (text.includes('hållbar') || text.includes('långsiktig')) {
    insights.push('Fokus på långsiktigt hållbara vanor och rutiner');
  }
  
  return insights.length > 0 ? insights : ['Personligt anpassad plan baserad på dina specifika mål och förutsättningar'];
}

function extractSuccessPredictors(aiResponse) {
  const predictors = [];
  const text = aiResponse.toLowerCase();
  
  if (text.includes('konsekvent') || text.includes('regelbunden')) {
    predictors.push('Konsekvent träning 4-5 dagar/vecka');
  }
  if (text.includes('sömn') || text.includes('vila')) {
    predictors.push('Prioritera 7-9 timmars kvalitetssömn');
  }
  if (text.includes('kost') || text.includes('näring')) {
    predictors.push('Följa näringsplanen 80% av tiden');
  }
  if (text.includes('mental') || text.includes('motivation')) {
    predictors.push('Daglig mental träning och målvisualisering');
  }
  
  return predictors.length > 0 ? predictors : [
    'Konsekvent träning enligt schema',
    'Prioritera återhämtning och sömn',
    'Följa näringsriktlinjerna',
    'Hålla motivation genom mental träning'
  ];
}

function extractTrainingOverview(aiResponse) {
  const lines = aiResponse.split('\n');
  const overviewLines = lines.filter(line => 
    line.toLowerCase().includes('träning') && 
    (line.toLowerCase().includes('översikt') || line.toLowerCase().includes('plan'))
  );
  
  return overviewLines.length > 0 ? overviewLines.join(' ') : 
    'Strukturerad träningsplan med fokus på progressiv överbelastning och periodisering';
}

function extractWeeklySchedule(aiResponse) {
  const schedule = {};
  const days = ['måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag', 'söndag'];
  
  days.forEach(day => {
    const dayPattern = new RegExp(`${day}[:\\-\\s]+(.*?)(?=\\n|${days.join('|')}|$)`, 'gi');
    const match = aiResponse.match(dayPattern);
    if (match) {
      schedule[day] = match[0].replace(day, '').replace(/[:\-\s]+/, '').trim();
    }
  });
  
  // Fallback schedule if none found
  if (Object.keys(schedule).length === 0) {
    return {
      måndag: 'Lätt löpning 30-45 min + styrka',
      tisdag: 'Intervallträning 25-35 min',
      onsdag: 'Vila eller lätt aktivitet',
      torsdag: 'Medeldistans 40-60 min',
      fredag: 'Vila eller yoga',
      lördag: 'Lång löpning 60-90 min',
      söndag: 'Aktiv vila eller lätt promenad'
    };
  }
  
  return schedule;
}

function extractEightWeekProgression(aiResponse) {
  const weeks = [];
  for (let i = 1; i <= 8; i++) {
    const weekPattern = new RegExp(`vecka\\s+${i}[:\\-\\s]+(.*?)(?=vecka\\s+${i+1}|$)`, 'gi');
    const match = aiResponse.match(weekPattern);
    weeks.push({
      week: i,
      focus: match ? match[0].replace(`vecka ${i}`, '').replace(/[:\-\s]+/, '').trim() : 
             `Vecka ${i}: Progressiv utveckling`,
      volume: `${60 + (i * 10)}% av maxvolym`,
      intensity: i <= 2 ? 'Låg-medel' : i <= 6 ? 'Medel-hög' : 'Hög-maximal'
    });
  }
  return weeks;
}

function extractIntensityZones(aiResponse) {
  return {
    zone1: { name: 'Aktiv återhämtning', heartRate: '50-60% av max', effort: 'Mycket lätt', description: 'Kan prata i hela meningar' },
    zone2: { name: 'Aerob bas', heartRate: '60-70% av max', effort: 'Lätt', description: 'Bekväm konversation möjlig' },
    zone3: { name: 'Aerob', heartRate: '70-80% av max', effort: 'Måttlig', description: 'Korta fraser möjliga' },
    zone4: { name: 'Laktattröskel', heartRate: '80-90% av max', effort: 'Hård', description: 'Enstaka ord möjliga' },
    zone5: { name: 'Neuromuskulär kraft', heartRate: '90-100% av max', effort: 'Maximal', description: 'Ingen konversation möjlig' }
  };
}

function extractStrengthTraining(aiResponse) {
  return {
    frequency: '2-3 gånger per vecka',
    duration: '30-45 minuter',
    focus: 'Funktionell styrka för löpare',
    exercises: [
      'Squats (3x12-15)',
      'Lunges (3x10 per ben)',
      'Plankan (3x30-60s)',
      'Glute bridges (3x15)',
      'Calf raises (3x20)',
      'Russian twists (3x20)'
    ],
    progression: 'Öka repetitioner eller vikt varje vecka'
  };
}

function extractMobilityWork(aiResponse) {
  return {
    dailyRoutine: '10-15 minuter dagligen',
    preWorkout: ['Dynamisk uppvärmning 5-10 min', 'Leg swings', 'Arm circles', 'Walking lunges'],
    postWorkout: ['Statisk stretching 10-15 min', 'Calf stretch', 'Hamstring stretch', 'Hip flexor stretch'],
    weeklyFocus: ['Måndag: Höfter och bäcken', 'Onsdag: Vader och anklar', 'Fredag: Rygg och axlar']
  };
}

function extractRecoveryProtocol(aiResponse) {
  return {
    daily: ['8 timmars sömn', 'Hydratisering', 'Lätt stretching'],
    weekly: ['En komplett vilodag', 'Massage eller foam rolling', 'Sauna eller varmt bad'],
    signs: ['Förhöjd vilopuls', 'Trötthet', 'Irritation', 'Minskad prestanda'],
    interventions: ['Extra vilodag', 'Reducerad intensitet', 'Fokus på sömn och näring']
  };
}

function extractNutritionOverview(aiResponse) {
  return 'Balanserad näringsplan optimerad för löpning och återhämtning med fokus på timing och kvalitet';
}

function extractDailyMealPlans(aiResponse) {
  return {
    breakfast: 'Havregrynsgröt med bär och nötter, kaffe',
    lunch: 'Quinoasallad med kyckling och grönsaker',
    dinner: 'Lax med sötpotatis och broccoli',
    snacks: ['Frukt och nötter', 'Yoghurt med granola', 'Proteinshake']
  };
}

function extractMacroTargets(aiResponse) {
  return {
    carbs: '45-65% av totala kalorier',
    protein: '15-25% av totala kalorier',
    fat: '20-35% av totala kalorier',
    dailyCalories: '2000-2500 kcal (justeras efter behov)',
    timing: 'Kolhydrater före/efter träning, protein jämnt fördelat'
  };
}

function extractMealTiming(aiResponse) {
  return {
    preWorkout: '1-2 timmar innan: Lätt måltid med kolhydrater',
    postWorkout: '30 min efter: Protein + kolhydrater (3:1 ratio)',
    hydration: '2-3 liter vatten per dag, extra vid träning'
  };
}

function extractSupplementation(aiResponse) {
  return {
    essential: ['Vitamin D3', 'Omega-3', 'Magnesium'],
    performance: ['Kreatin', 'Beta-alanin', 'Koffein'],
    recovery: ['Protein pulver', 'BCAA', 'Tart cherry juice'],
    timing: 'Följ produktrekommendationer och konsultera läkare'
  };
}

function extractHydrationStrategy(aiResponse) {
  return {
    daily: '35ml per kg kroppsvikt',
    preWorkout: '400-600ml 2-3 timmar innan',
    duringWorkout: '150-250ml var 15-20 min',
    postWorkout: '150% av förlorad vätska',
    electrolytes: 'Tillsätt vid träning över 60 minuter'
  };
}

function extractRecipes(aiResponse) {
  return [
    {
      name: 'Energirik frukost',
      ingredients: ['Havregryn', 'Banan', 'Blåbär', 'Mandelmjöl', 'Honung'],
      instructions: 'Blanda allt och låt stå 10 minuter'
    },
    {
      name: 'Post-workout smoothie',
      ingredients: ['Proteinpulver', 'Banan', 'Spenat', 'Mandelmjöl', 'Is'],
      instructions: 'Mixa alla ingredienser tills slätt'
    }
  ];
}

function extractSleepOptimization(aiResponse) {
  return {
    bedtimeRoutine: ['Stäng av skärmar 1 timme innan', 'Läs bok eller meditation', 'Mörkt och svalt rum'],
    sleepEnvironment: ['18-20°C temperatur', 'Mörkläggning', 'Tystnad eller white noise'],
    supplements: ['Melatonin 0.5-3mg', 'Magnesium glycinat', 'L-theanin'],
    tracking: 'Följ sömnkvalitet med wearable eller app'
  };
}

function extractStressManagement(aiResponse) {
  return {
    dailyPractices: ['10 min meditation', 'Djupandning', 'Gratitudjournal'],
    weeklyActivities: ['Yoga', 'Naturpromenader', 'Social tid'],
    stressSignals: ['Förhöjd vilopuls', 'Sömnproblem', 'Irritation'],
    interventions: ['Extra vila', 'Reducerad träning', 'Professionell hjälp vid behov']
  };
}

function extractMentalTraining(aiResponse) {
  return {
    visualization: '5-10 min daglig målvisualisering',
    affirmations: ['Jag blir starkare för varje dag', 'Jag når mina mål', 'Jag är disciplinerad'],
    mindfulness: 'Närvarande under träning, fokus på andning',
    goalSetting: 'SMART-mål med veckovisa checkpoints'
  };
}

function extractBiohacking(aiResponse) {
  return {
    coldExposure: 'Kall dusch 2-3 min dagligen',
    heatTherapy: 'Sauna 15-20 min 2-3x/vecka',
    breathwork: 'Wim Hof metod eller Box breathing',
    lightTherapy: 'Morgonljus 10-15 min, blåljusfilter kvällar'
  };
}

function extractCircadianOptimization(aiResponse) {
  return {
    morningLight: 'Naturligt ljus inom 30 min efter uppvaknande',
    eveningDimming: 'Dimma ljus 2 timmar innan sänggåendet',
    mealTiming: 'Sista måltid 3 timmar innan sömn',
    exerciseTiming: 'Undvik intensiv träning 4 timmar innan sömn'
  };
}

function extractEnvironmentalFactors(aiResponse) {
  return {
    airQuality: 'Träna inomhus vid dålig luftkvalitet',
    temperature: 'Anpassa kläder och hydratisering efter väder',
    altitude: 'Gradvis anpassning vid höjdträning',
    pollution: 'Undvik trafikintensiva rutter'
  };
}

function extractRecommendedApps(aiResponse) {
  return [
    { name: 'Strava', purpose: 'Träningsspårning och community', category: 'Träning' },
    { name: 'MyFitnessPal', purpose: 'Kaloriräkning och näring', category: 'Näring' },
    { name: 'Headspace', purpose: 'Meditation och mindfulness', category: 'Mental hälsa' },
    { name: 'Sleep Cycle', purpose: 'Sömnanalys och väckning', category: 'Sömn' },
    { name: 'HRV4Training', purpose: 'Återhämtningsmätning', category: 'Återhämtning' }
  ];
}

function extractWearables(aiResponse) {
  return [
    { device: 'Garmin Forerunner', features: 'GPS, pulsmätning, träningsanalys' },
    { device: 'Oura Ring', features: 'Sömn, HRV, återhämtning' },
    { device: 'Apple Watch', features: 'Allround spårning, appar' },
    { device: 'Polar H10', features: 'Exakt pulsmätning' }
  ];
}

function extractTrackingProtocols(aiResponse) {
  return {
    daily: ['Vilopuls', 'Sömnkvalitet', 'Energinivå', 'Stress'],
    weekly: ['Kroppsvikt', 'Omkrets', 'Prestationstest'],
    monthly: ['Kroppssammansättning', 'VO2 max test', 'Flexibilitetstest'],
    quarterly: ['Blodprover', 'Hälsokontroll', 'Målrevision']
  };
}

function generateCalendarEvents(aiResponse, user) {
  const events = [];
  const startDate = new Date();
  
  // Generate 8 weeks of training events
  for (let week = 0; week < 8; week++) {
    for (let day = 0; day < 7; day++) {
      const eventDate = new Date(startDate);
      eventDate.setDate(startDate.getDate() + (week * 7) + day);
      
      const dayName = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'][eventDate.getDay()];
      
      // Training schedule based on day
      let eventTitle = '';
      let duration = 60;
      
      switch (dayName) {
        case 'måndag':
          eventTitle = 'Lätt löpning + styrketräning';
          duration = 75;
          break;
        case 'tisdag':
          eventTitle = 'Intervallträning';
          duration = 45;
          break;
        case 'onsdag':
          eventTitle = 'Vila eller yoga';
          duration = 30;
          break;
        case 'torsdag':
          eventTitle = 'Medeldistans löpning';
          duration = 60;
          break;
        case 'fredag':
          eventTitle = 'Vila eller lätt aktivitet';
          duration = 30;
          break;
        case 'lördag':
          eventTitle = 'Lång löpning';
          duration = 90 + (week * 10); // Progressive increase
          break;
        case 'söndag':
          eventTitle = 'Aktiv vila';
          duration = 45;
          break;
      }
      
      if (eventTitle) {
        events.push({
          title: eventTitle,
          date: eventDate.toISOString().split('T')[0],
          time: '07:00',
          duration: duration,
          type: dayName === 'onsdag' || dayName === 'fredag' || dayName === 'söndag' ? 'recovery' : 'training',
          week: week + 1
        });
      }
    }
  }
  
  return events;
}

function extractAutomationTips(aiResponse) {
  return [
    'Synka träningsdata automatiskt mellan appar',
    'Ställ in påminnelser för måltider och hydratisering',
    'Automatisk sömnspårning med smart klocka',
    'Veckovis analys av träningsdata',
    'Push-notiser för återhämtningsmätningar'
  ];
}

function extractWeeklyMetrics(aiResponse) {
  return [
    { metric: 'Total löpdistans', target: 'Progressiv ökning', unit: 'km' },
    { metric: 'Genomsnittspuls', target: 'Stabil eller sjunkande', unit: 'slag/min' },
    { metric: 'Sömnkvalitet', target: '7-9 timmar', unit: 'timmar' },
    { metric: 'Energinivå', target: '7-8/10', unit: 'skala' },
    { metric: 'Återhämtning', target: 'God HRV', unit: 'ms' }
  ];
}

function extractMonthlyAssessments(aiResponse) {
  return [
    { test: '5K tidstest', frequency: 'Månadsvis', purpose: 'Aerob kapacitet' },
    { test: 'Vilopulsmätning', frequency: 'Veckovis medel', purpose: 'Återhämtning' },
    { test: 'Kroppsvikt och sammansättning', frequency: 'Månadsvis', purpose: 'Kroppsförändring' },
    { test: 'Flexibilitetstest', frequency: 'Månadsvis', purpose: 'Mobilitet' }
  ];
}

function extractBiomarkers(aiResponse) {
  return [
    { marker: 'Vilopuls', optimal: '40-60 slag/min', frequency: 'Dagligen' },
    { marker: 'HRV', optimal: 'Individuell baseline', frequency: 'Dagligen' },
    { marker: 'Sömneffektivitet', optimal: '>85%', frequency: 'Dagligen' },
    { marker: 'Stressnivå', optimal: '<30% av dagen', frequency: 'Dagligen' }
  ];
}

function extractPerformanceTests(aiResponse) {
  return [
    { test: '5K löptest', protocol: 'Maximal ansträngning', frequency: 'Månadsvis' },
    { test: 'Planktest', protocol: 'Maximal tid', frequency: 'Veckovis' },
    { test: 'VO2 max uppskattning', protocol: 'Beep test eller Cooper test', frequency: 'Kvartalsvis' },
    { test: 'Flexibilitetstest', protocol: 'Sit-and-reach', frequency: 'Månadsvis' }
  ];
}

function extractAdaptationProtocols(aiResponse) {
  return {
    overreaching: 'Reducera volym 20-30% i en vecka',
    plateau: 'Ändra träningstyp eller intensitet',
    injury: 'Komplett vila eller alternativ träning',
    illness: 'Pausa träning tills symptomfri i 24h'
  };
}

function extractMilestones(aiResponse) {
  const milestones = [];
  for (let week = 1; week <= 8; week++) {
    milestones.push({
      week: week,
      target: week <= 2 ? 'Etablera rutiner' : 
              week <= 4 ? 'Förbättra uthållighet' :
              week <= 6 ? 'Öka intensitet' : 'Maximera prestanda',
      metrics: ['Distans', 'Tid', 'Återhämtning'],
      celebration: week % 2 === 0 ? 'Belöna dig själv med något kul!' : 'Reflektera över framstegen'
    });
  }
  return milestones;
}

function extractTrainingPartners(aiResponse) {
  return [
    'Hitta löpargrupper i din stad',
    'Anslut till RunMate community',
    'Träna med familj eller vänner',
    'Delta i lokala löplopp'
  ];
}

function extractCommunityEngagement(aiResponse) {
  return [
    'Dela dina framsteg på sociala medier',
    'Gå med i löparforum och grupper',
    'Delta i virtuella utmaningar',
    'Mentora nybörjare'
  ];
}

function extractAccountabilityStrategies(aiResponse) {
  return [
    'Träningspartner eller coach',
    'Offentliga mål på sociala medier',
    'Veckovisa check-ins med vän',
    'Träningsdagbok och reflektion'
  ];
}

function extractMotivationalSupport(aiResponse) {
  return [
    'Sätt små, uppnåeliga delmål',
    'Belöna framsteg (inte bara slutmål)',
    'Håll en framstegsdagbok',
    'Omge dig med positiva människor'
  ];
}

// Get Apple Health data for enhanced analysis
const getAppleHealthAnalysis = async (userId) => {
  try {
    const appleHealthActivities = await Activity.find({
      userId: userId,
      source: 'apple_health'
    }).sort({ startTime: -1 }).limit(50); // Last 50 Apple Health activities

    if (appleHealthActivities.length === 0) {
      return null;
    }

    // Calculate comprehensive Apple Health stats
    const totalActivities = appleHealthActivities.length;
    const totalDistance = appleHealthActivities.reduce((sum, act) => sum + (act.distance || 0), 0);
    const totalDuration = appleHealthActivities.reduce((sum, act) => sum + (act.duration || 0), 0);
    const avgDistance = totalDistance / totalActivities;
    const avgDuration = totalDuration / totalActivities / 60; // in minutes
    const avgPace = appleHealthActivities.reduce((sum, act) => sum + (act.averagePace || 0), 0) / totalActivities;

    // Heart rate analysis
    const heartRateActivities = appleHealthActivities.filter(act => act.averageHeartRate);
    const avgHeartRate = heartRateActivities.length > 0 ? 
      heartRateActivities.reduce((sum, act) => sum + act.averageHeartRate, 0) / heartRateActivities.length : null;
    const maxHeartRate = Math.max(...appleHealthActivities.map(act => act.maxHeartRate || 0));

    // Training frequency analysis
    const recentActivities = appleHealthActivities.filter(act => 
      new Date(act.startTime) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    );
    const weeklyFrequency = (recentActivities.length / 4.3).toFixed(1); // Approximate weeks in a month

    // Performance trends
    const last10Activities = appleHealthActivities.slice(0, 10);
    const previous10Activities = appleHealthActivities.slice(10, 20);
    
    let paceImprovement = null;
    if (last10Activities.length >= 5 && previous10Activities.length >= 5) {
      const recentAvgPace = last10Activities.reduce((sum, act) => sum + (act.averagePace || 0), 0) / last10Activities.length;
      const previousAvgPace = previous10Activities.reduce((sum, act) => sum + (act.averagePace || 0), 0) / previous10Activities.length;
      paceImprovement = previousAvgPace > 0 ? ((previousAvgPace - recentAvgPace) / previousAvgPace * 100).toFixed(1) : null;
    }

    // Distance categories
    const shortRuns = appleHealthActivities.filter(act => act.distance < 5).length;
    const mediumRuns = appleHealthActivities.filter(act => act.distance >= 5 && act.distance < 10).length;
    const longRuns = appleHealthActivities.filter(act => act.distance >= 10).length;

    // Activity type distribution
    const activityTypes = {};
    appleHealthActivities.forEach(act => {
      const type = act.activityType || 'easy';
      activityTypes[type] = (activityTypes[type] || 0) + 1;
    });

    return {
      hasData: true,
      totalActivities,
      totalDistance: Math.round(totalDistance * 10) / 10,
      avgDistance: Math.round(avgDistance * 10) / 10,
      avgDuration: Math.round(avgDuration),
      avgPace: Math.round(avgPace),
      avgHeartRate: avgHeartRate ? Math.round(avgHeartRate) : null,
      maxHeartRate: maxHeartRate > 0 ? maxHeartRate : null,
      weeklyFrequency: parseFloat(weeklyFrequency),
      paceImprovement,
      distanceDistribution: {
        short: shortRuns,
        medium: mediumRuns,
        long: longRuns
      },
      activityTypes,
      lastActivity: appleHealthActivities[0]?.startTime,
      longestRun: Math.max(...appleHealthActivities.map(act => act.distance || 0)),
      fastestPace: Math.min(...appleHealthActivities.map(act => act.averagePace || Infinity).filter(p => p < Infinity)),
      totalCalories: appleHealthActivities.reduce((sum, act) => sum + (act.calories || 0), 0),
      avgCaloriesPerKm: totalDistance > 0 ? Math.round(appleHealthActivities.reduce((sum, act) => sum + (act.calories || 0), 0) / totalDistance) : null
    };

  } catch (error) {
    console.error('Error analyzing Apple Health data:', error);
    return null;
  }
};

// Generate comprehensive race plan with Apple Health integration
const generateRaceWeeklySchedule = (raceInfo, userAnswers, appleHealthData = null) => {
  const { race, goal, level, timeGoal, preferences, health } = userAnswers;
  
  // Base schedule template
  const weeklyTemplate = {
    monday: { type: 'rest', activity: 'Vildag eller lätt cross-training' },
    tuesday: { type: 'interval', activity: 'Intervallträning' },
    wednesday: { type: 'easy', activity: 'Lugnt löppass' },
    thursday: { type: 'tempo', activity: 'Tempoträning' },
    friday: { type: 'rest', activity: 'Vila' },
    saturday: { type: 'long', activity: 'Långpass' },
    sunday: { type: 'recovery', activity: 'Återhämtningspass' }
  };

  // Adjust based on Apple Health data if available
  if (appleHealthData && appleHealthData.hasData) {
    // Adjust training volume based on current fitness
    if (appleHealthData.weeklyFrequency < 2) {
      // Low frequency - reduce intensity
      weeklyTemplate.tuesday.activity = 'Lätt fartlek';
      weeklyTemplate.thursday.activity = 'Steady state-löpning';
    } else if (appleHealthData.weeklyFrequency > 5) {
      // High frequency - can handle more intensity
      weeklyTemplate.monday.activity = 'Lätt återhämtningspass';
      weeklyTemplate.friday.activity = 'Kort intervallpass';
    }

    // Adjust pace targets based on current performance
    if (appleHealthData.avgPace > 0) {
      const currentPaceMinKm = Math.floor(appleHealthData.avgPace / 60);
      const currentPaceSecKm = Math.round(appleHealthData.avgPace % 60);
      
      // Add specific pace recommendations
      weeklyTemplate.tuesday.paceTarget = `${currentPaceMinKm}:${currentPaceSecKm.toString().padStart(2, '0')} - 30s snabbare`;
      weeklyTemplate.wednesday.paceTarget = `${currentPaceMinKm}:${(currentPaceSecKm + 30).toString().padStart(2, '0')} - 1min långsammare`;
      weeklyTemplate.thursday.paceTarget = `${currentPaceMinKm}:${(currentPaceSecKm - 15).toString().padStart(2, '0')} - 15s snabbare`;
    }

    // Adjust long run distance based on current longest runs
    if (appleHealthData.longestRun > 0) {
      const targetLongRun = Math.min(appleHealthData.longestRun * 1.2, race.distance * 0.8);
      weeklyTemplate.saturday.distance = `${Math.round(targetLongRun)}km`;
    }
  }

  // Generate 16-week progressive schedule
  const schedule = [];
  const weeksToRace = 16;
  const baseDistance = race.distance || 10;

  for (let week = 1; week <= weeksToRace; week++) {
    const weekData = { ...weeklyTemplate };
    const progressFactor = week / weeksToRace;
    
    // Progressive volume increase
    if (week <= 12) {
      // Build phase
      const weeklyDistance = Math.round(baseDistance * (0.3 + progressFactor * 0.5));
      weekData.weeklyTarget = `${weeklyDistance}km total`;
    } else {
      // Taper phase
      const taperFactor = (16 - week) / 4;
      const weeklyDistance = Math.round(baseDistance * 0.6 * taperFactor);
      weekData.weeklyTarget = `${weeklyDistance}km total (nedtrappning)`;
    }

    schedule.push({
      week,
      ...weekData,
      focus: week <= 4 ? 'Grundkondition' : 
             week <= 8 ? 'Uthållighet' :
             week <= 12 ? 'Hastighet' : 'Nedtrappning'
    });
  }

  return schedule;
};

// Get race information from race ID
const getRaceInfo = (raceId) => {
  const races = {
    'boston_marathon': {
      name: 'Boston Marathon',
      distance: '42.2km',
      location: 'Boston, USA',
      terrain: 'Flat',
      difficulty: 'Hög',
      elevation: '120m'
    },
    'stockholm_marathon': {
      name: 'Stockholm Marathon',
      distance: '42.2km', 
      location: 'Stockholm, Sverige',
      terrain: 'Flat',
      difficulty: 'Medel',
      elevation: '80m'
    },
    'new_york_marathon': {
      name: 'New York Marathon',
      distance: '42.2km',
      location: 'New York, USA', 
      terrain: 'Hilly',
      difficulty: 'Hög',
      elevation: '200m'
    },
    'london_marathon': {
      name: 'London Marathon',
      distance: '42.2km',
      location: 'London, UK',
      terrain: 'Flat',
      difficulty: 'Medel',
      elevation: '60m'
    },
    'berlin_marathon': {
      name: 'Berlin Marathon',
      distance: '42.2km',
      location: 'Berlin, Tyskland',
      terrain: 'Flat',
      difficulty: 'Låg',
      elevation: '40m'
    }
  };
  
  return races[raceId] || {
    name: 'Okänt lopp',
    distance: '42.2km',
    location: 'Okänd plats',
    terrain: 'Varierad',
    difficulty: 'Medel',
    elevation: '100m'
  };
};

// Race-specific training plan endpoint
router.post('/race-plan', protect, async (req, res) => {
  try {
    const { raceId, answers } = req.body;
    
    if (!raceId || !answers) {
      return res.status(400).json({ 
        success: false, 
        message: 'Race ID och svar krävs' 
      });
    }

    // Get race information
    const raceInfo = getRaceInfo(raceId);
    if (!raceInfo) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lopp hittades inte' 
      });
    }

    // Get Apple Health analysis for enhanced personalization
    const appleHealthData = await getAppleHealthAnalysis(req.user._id);

    // Generate race description with Apple Health context
    let raceDescription;
    try {
      const appleHealthContext = appleHealthData && appleHealthData.hasData ? 
        `\n\nBaserat på användarens Apple Health-data:\n- Genomsnittlig träningsfrekvens: ${appleHealthData.weeklyFrequency} pass/vecka\n- Genomsnittsdistans: ${appleHealthData.avgDistance}km\n- Genomsnittligt tempo: ${Math.floor(appleHealthData.avgPace / 60)}:${Math.round(appleHealthData.avgPace % 60).toString().padStart(2, '0')} min/km\n- Längsta pass: ${appleHealthData.longestRun}km\n- Genomsnittspuls: ${appleHealthData.avgHeartRate || 'Ej tillgänglig'}\n- Senaste aktivitet: ${appleHealthData.lastActivity ? new Date(appleHealthData.lastActivity).toLocaleDateString('sv-SE') : 'Okänd'}` : 
        '';

      raceDescription = await generateRaceDescriptionNew(raceInfo, answers, appleHealthContext);
    } catch (error) {
      console.error('Error generating race description:', error);
      raceDescription = `${raceInfo.name} är ett fantastiskt lopp som kommer utmana dig på bästa sätt. Baserat på dina svar kommer vi att skapa en personlig träningsplan som förbereder dig optimalt för detta lopp.`;
    }

    // Generate comprehensive training plan with Apple Health integration (with error handling)
    let trainingPlan, nutritionPlan, lifestylePlan, recoveryPlan, progressTracking, weeklySchedule;
    
    try {
      trainingPlan = generateTrainingPlanNew(raceInfo, answers, appleHealthData);
    } catch (error) {
      console.error('Error generating training plan:', error);
      trainingPlan = { overview: 'Grundläggande träningsplan', phases: [] };
    }
    
    try {
      nutritionPlan = generateNutritionPlan(raceInfo, answers, appleHealthData);
    } catch (error) {
      console.error('Error generating nutrition plan:', error);
      nutritionPlan = { overview: 'Grundläggande nutritionsplan', dailyCalories: 2000 };
    }
    
    try {
      lifestylePlan = generateLifestylePlan(raceInfo, answers, appleHealthData);
    } catch (error) {
      console.error('Error generating lifestyle plan:', error);
      lifestylePlan = { overview: 'Grundläggande livsstilsplan' };
    }
    
    try {
      recoveryPlan = generateRecoveryPlan(raceInfo, answers, appleHealthData);
    } catch (error) {
      console.error('Error generating recovery plan:', error);
      recoveryPlan = { overview: 'Grundläggande återhämtningsplan' };
    }
    
    try {
      progressTracking = generateProgressTracking(raceInfo, answers, appleHealthData);
    } catch (error) {
      console.error('Error generating progress tracking:', error);
      progressTracking = { overview: 'Grundläggande progressuppföljning' };
    }
    
    try {
      weeklySchedule = generateRaceWeeklySchedule(raceInfo, answers, appleHealthData);
    } catch (error) {
      console.error('Error generating weekly schedule:', error);
      weeklySchedule = [];
    }



    // Enhanced plan with Apple Health insights
    const enhancedPlan = {
      race: {
        id: raceId,
        name: raceInfo.name,
        distance: raceInfo.distance,
        date: raceInfo.date,
        location: raceInfo.location,
        difficulty: raceInfo.difficulty,
        description: raceDescription
      },
      raceDescription,
      training: {
        ...trainingPlan,
        weeklySchedule
      },
      nutrition: nutritionPlan,
      lifestyle: lifestylePlan,
      recovery: recoveryPlan,
      progress: progressTracking,
      
      // Apple Health integration summary
      appleHealthIntegration: appleHealthData ? {
        hasData: appleHealthData.hasData,
        summary: appleHealthData.hasData ? {
          totalActivities: appleHealthData.totalActivities,
          avgWeeklyDistance: Math.round(appleHealthData.avgDistance * appleHealthData.weeklyFrequency * 10) / 10,
          currentFitnessLevel: appleHealthData.weeklyFrequency >= 4 ? 'Hög' : 
                             appleHealthData.weeklyFrequency >= 2 ? 'Medel' : 'Grundnivå',
          recommendedAdjustments: [
            appleHealthData.weeklyFrequency < 2 ? 'Öka träningsfrekvensen gradvis' : null,
            appleHealthData.longestRun < raceInfo.distance * 0.6 ? 'Fokusera på längre pass' : null,
            appleHealthData.paceImprovement && parseFloat(appleHealthData.paceImprovement) < 0 ? 'Inkludera mer tempoträning' : null
          ].filter(Boolean)
        } : null
      } : null,

      userAnswers: answers,
      generatedAt: new Date(),
      planDuration: '16 veckor',
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      plan: enhancedPlan
    });

  } catch (error) {
    console.error('Error generating race plan:', error);
    res.status(500).json({
      success: false,
      message: 'Kunde inte generera träningsplan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper functions for race plan generation
function generateRaceTrainingPhases(weeks, data) {
  const phases = [];
  
  if (weeks > 16) {
    phases.push({
      name: 'Basbyggande fas',
      weeks: Math.floor(weeks * 0.25),
      focus: 'Bygga aerob kapacitet och löpvana',
      weeklyDistance: calculateWeeklyDistance(data.current_fitness, 'base'),
      keyWorkouts: [
        'Lugna långpass för att bygga uthållighet',
        'Lätta löprundor för att öka veckovolym',
        'Styrketräning 2 ggr/vecka'
      ]
    });
  }
  
  phases.push({
    name: 'Uppbyggnadsfas',
    weeks: Math.floor(weeks * 0.35),
    focus: 'Öka träningsvolym och introducera kvalitetspass',
    weeklyDistance: calculateWeeklyDistance(data.current_fitness, 'build'),
    keyWorkouts: [
      'Tempopass i målfart',
      'Intervaller för hastighet',
      'Progressiva långpass'
    ]
  });
  
  phases.push({
    name: 'Toppningsfas',
    weeks: Math.floor(weeks * 0.25),
    focus: 'Racefart och specifik träning',
    weeklyDistance: calculateWeeklyDistance(data.current_fitness, 'peak'),
    keyWorkouts: [
      'Racesimulering på delar av distansen',
      'Målfartpass',
      'Snabbdistansträning'
    ]
  });
  
  phases.push({
    name: 'Nedtrappning',
    weeks: Math.min(3, Math.floor(weeks * 0.15)),
    focus: 'Vila och förberedelse',
    weeklyDistance: calculateWeeklyDistance(data.current_fitness, 'taper'),
    keyWorkouts: [
      'Korta pass i racefart',
      'Lätta löprundor',
      'Mental förberedelse'
    ]
  });
  
  return phases;
}

function calculateWeeklyDistance(fitness, phase) {
  const baseDistances = {
    'beginner': { base: 15, build: 25, peak: 35, taper: 20 },
    'recreational': { base: 25, build: 40, peak: 55, taper: 30 },
    'experienced': { base: 40, build: 60, peak: 80, taper: 40 },
    'competitive': { base: 60, build: 80, peak: 100, taper: 50 }
  };
  
  const distances = baseDistances[fitness] || baseDistances.recreational;
  return `${distances[phase]}-${distances[phase] + 10} km`;
}

function generateRaceNutritionPlan(data, race) {
  return {
    dailyCalories: calculateRaceDailyCalories(data),
    carbLoading: {
      when: '3 dagar före loppet',
      how: 'Öka kolhydratintag till 70% av kalorier',
      foods: ['Pasta', 'Ris', 'Potatis', 'Bröd', 'Frukt']
    },
    raceDay: {
      breakfast: 'Havregrynsgröt med banan och honung, 3h före start',
      preRace: 'Energibar och sportdryck 1h före',
      during: (race.distance && String(race.distance).includes('Marathon')) ? 'Energigel var 45 min' : 'Vatten vid vätskestationer',
      postRace: 'Proteinshake och banan direkt efter målgång'
    },
    hydration: {
      daily: '3-4 liter per dag',
      raceWeek: 'Öka till 4-5 liter per dag',
      raceDay: 'Sluta dricka 30 min före start'
    }
  };
}

function calculateRaceDailyCalories(data) {
  const base = 2000;
  const activityMultiplier = {
    '2-3': 1.3,
    '3-4': 1.4,
    '4-5': 1.5,
    '5-6': 1.6,
    '6+': 1.7
  };
  return Math.round(base * (activityMultiplier[data.weekly_runs] || 1.4));
}

function generateRaceRecoveryProtocol(data) {
  const priority = data.recovery_priority;
  return {
    immediate: {
      stretching: priority === 'high' ? '20 min efter varje pass' : '10-15 min',
      foamRolling: priority === 'high' ? 'Dagligen 15 min' : '3 ggr/vecka',
      icing: 'Vid behov efter hårda pass'
    },
    weekly: {
      massage: priority === 'high' ? 'Varje vecka' : 'Varannan vecka',
      restDays: data.weekly_runs === '6+' ? '1 per vecka' : '2 per vecka',
      activeRecovery: 'Lätt cykling eller simning på vilodagar'
    },
    sleep: {
      target: data.sleep_hours === '8+' ? 'Behåll 8+ timmar' : 'Sikta på 8 timmar',
      tips: [
        'Gå och lägg dig samma tid varje kväll',
        'Undvik koffein efter 14:00',
        'Mörkt och svalt sovrum'
      ]
    }
  };
}

function generateTaperingPlan(weeks, race) {
  return {
    duration: Math.min(3, Math.floor(weeks * 0.15)) + ' veckor',
    strategy: [
      'Minska volym med 40-50%',
      'Behåll intensitet men förkorta intervaller',
      'Fokus på vila och mental förberedelse'
    ],
    lastWeek: [
      'Max 3 korta pass',
      'Ett kort racefartpass 3 dagar före',
      'Vila 2 dagar före loppet'
    ]
  };
}

function generateRaceStrategy(race, data) {
  return {
    pacing: data.race_goal === 'finish' ? 'Starta lugnt, håll jämn fart' : 'Negativ split - snabbare andra halvan',
    nutrition: (race.distance && String(race.distance).includes('Marathon')) ? 'Ta energi var 45 min från start' : 'Drick vid alla vätskestationer',
    mentalStrategy: [
      'Dela upp loppet i mindre segment',
      'Ha mantran redo för svåra stunder',
      'Visualisera målgången'
    ],
    contingencyPlan: [
      'Om du får kramp: sakta ner och stretcha',
      'Om du blir yr: gå och drick',
      'Om du vill ge upp: tänk på träningen du lagt ner'
    ]
  };
}

function generateEquipmentRecommendations(race, currentEquipment) {
  const recommendations = [];
  
  if (!currentEquipment || !currentEquipment.includes('watch')) {
    recommendations.push({
      item: 'GPS-klocka',
      priority: 'Hög',
      reason: 'För att hålla koll på tempo och distans'
    });
  }
  
  if (race.terrain === 'Terräng' && (!currentEquipment || !currentEquipment.includes('trails'))) {
    recommendations.push({
      item: 'Terrängskor',
      priority: 'Kritisk',
      reason: 'Nödvändigt för säkerhet och prestanda'
    });
  }
  
  recommendations.push({
    item: 'Tävlingskläder',
    priority: 'Medium',
    reason: 'Testa alla kläder på träning först'
  });
  
  return recommendations;
}

function generateMentalPreparation(weeks, goal) {
  return {
    visualization: {
      frequency: '3 ggr/vecka sista månaden',
      focus: 'Se dig själv genomföra loppet framgångsrikt'
    },
    mantras: [
      goal === 'finish' ? 'Ett steg i taget' : 'Jag är stark och snabb',
      'Jag har tränat för detta',
      'Smärta är tillfällig, stolthet är för evigt'
    ],
    raceWeekTips: [
      'Undvik att läsa för mycket om loppet',
      'Håll rutiner som vanligt',
      'Förbered allt kvällen innan'
    ]
  };
}



async function generateComprehensiveRaceInfo(race, userData) {
  try {
    if (!race || !race.name || !openai) return generateFallbackRaceInfo(race, userData);
    
    const prompt = `Generera en omfattande guide för ${race.name} i ${race.location} (${race.distance}). 
    
    Användarens profil:
    - Träningsnivå: ${userData.current_fitness}
    - Målsättning: ${userData.race_goal}
    - Veckans löprundor: ${userData.weekly_runs}
    - Längsta distans: ${userData.longest_recent_run}
    
    Skapa en detaljerad guide med följande sektioner:
    
    1. LOPPÖVERSIKT
    - Detaljerad beskrivning av loppet (historia, prestige, unika aspekter)
    - Banprofil och utmaningar
    - Väder och klimat under loppperioden
    - Publikstöd och atmosfär
    
    2. TRÄNINGSPLAN ÖVERSIKT
    - Specifika träningsråd för detta lopp
    - Viktigaste träningspassen att fokusera på
    - Terrängspecifik träning om relevant
    - Höjdträning om relevant
    
    3. NUTRITIONSSTRATEGI
    - Veckan före loppet
    - Carb-loading protokoll
    - Racedagens frukost (timing och innehåll)
    - Energistrategi under loppet
    - Återhämtning efter loppet
    
    4. UTRUSTNINGSGUIDE
    - Skor (specifika rekommendationer för banan)
    - Kläder för väderförhållanden
    - Tillbehör (bälte, klocka, etc)
    - Vad som ska packas i väskan
    
    5. MENTAL FÖRBEREDELSE
    - Visualiseringsövningar
    - Mantran och positiva affirmationer
    - Strategier för svåra delar av banan
    - Nervositet och prestation
    
    6. RACEDAGSSTRATEGI
    - Detaljerad tidsplanering från uppvaknande
    - Uppvärmningsrutin
    - Pacing-strategi för varje del
    - Vätskestationer och energiintag
    
    7. PRAKTISK INFORMATION
    - Transport till start
    - Väskförvaring
    - Toaletter och faciliteter
    - Efterloppet logistik
    
    8. VANLIGA MISSTAG
    - Top 5 misstag att undvika
    - Nybörjarfällor
    - Väderfällor
    
    9. ÅTERHÄMTNINGSPLAN
    - Första 24 timmarna
    - Första veckan
    - Återgång till träning
    
    10. PERSONLIGA TIPS
    - Baserat på användarens profil
    - Specifika råd för deras mål
    - Anpassningar för deras nivå
    
    Skriv på svenska, var detaljerad och ge konkreta, praktiska råd. Använd HTML-formatering med <h3>, <p>, <ul>, <li>, <strong> etc.`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Du är en erfaren löpcoach och loppexpert med djup kunskap om internationella lopp. Du ger detaljerade, praktiska råd anpassade för varje löpare."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.7
    });
    
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating comprehensive race info:', error);
    return generateFallbackRaceInfo(race, userData);
  }
}

function generateFallbackRaceInfo(race, userData) {
  const fitnessLevel = userData.current_fitness || 'recreational';
  const weeklyRuns = userData.weekly_runs || '3-4';
  const goal = userData.race_goal || 'finish';
  
  // Generate comprehensive HTML content with all sections
  return `
    <div class="comprehensive-race-guide">
      <h2 class="text-3xl font-bold mb-6 text-gray-900">🏃‍♂️ ${race.name} - Din Kompletta Guide</h2>
      
      <!-- Loppöversikt -->
      <section class="mb-8">
        <h3 class="text-2xl font-bold mb-4 text-purple-600">📍 Loppöversikt</h3>
        <div class="bg-purple-50 rounded-lg p-6">
          <h4 class="font-bold text-lg mb-2">Om ${race.name}</h4>
          <p class="mb-4">${race.name} i ${race.location} är ett av världens mest prestigefyllda ${race.distance}-lopp. Med sin ${race.terrain || 'varierande'} terräng och ${race.difficulty || 'utmanande'} svårighetsgrad lockar det löpare från hela världen.</p>
          
          <div class="grid grid-cols-2 gap-4 mt-4">
            <div class="bg-white rounded p-4">
              <h5 class="font-semibold text-purple-700">Banprofil</h5>
              <p>Banan bjuder på ${race.terrain === 'Flat' ? 'platt och snabb löpning' : race.terrain === 'Hilly' ? 'kuperad terräng med utmanande backar' : 'varierande terräng'}. Höjdskillnaden är ${race.elevation || 'måttlig'}.</p>
            </div>
            <div class="bg-white rounded p-4">
              <h5 class="font-semibold text-purple-700">Väder & Klimat</h5>
              <p>Typiskt väder under loppperioden är ${getTypicalWeather(race.location)}. Förbered dig på temperaturer mellan 10-20°C.</p>
            </div>
          </div>
          
          <div class="mt-4 p-4 bg-yellow-50 rounded">
            <h5 class="font-semibold text-yellow-800">🎯 Publikstöd & Atmosfär</h5>
            <p>Loppet är känt för sitt fantastiska publikstöd med över ${race.spectators || '100,000'} åskådare längs banan. Speciellt vid ${getKeySpectatorPoints(race.name)}.</p>
          </div>
        </div>
      </section>
      
      <!-- Träningsplan Översikt -->
      <section class="mb-8">
        <h3 class="text-2xl font-bold mb-4 text-blue-600">🏋️ Träningsplan Översikt</h3>
        <div class="bg-blue-50 rounded-lg p-6">
          <h4 class="font-bold text-lg mb-2">Specifik Träning för ${race.name}</h4>
          <p class="mb-4">Med ${userData.weeksUntilRace} veckor kvar och din nuvarande kondition som "${fitnessLevel}", här är din anpassade träningsstrategi:</p>
          
          <div class="space-y-4">
            <div class="bg-white rounded p-4">
              <h5 class="font-semibold text-blue-700 mb-2">🎯 Nyckelfokus för Ditt Lopp</h5>
              <ul class="space-y-2">
                <li class="flex items-start">
                  <span class="text-blue-500 mr-2">•</span>
                  <span><strong>Distansträning:</strong> Progressiv ökning till ${getTargetLongRun(race.distance, fitnessLevel)} som längsta pass</span>
                </li>
                <li class="flex items-start">
                  <span class="text-blue-500 mr-2">•</span>
                  <span><strong>Tempoträning:</strong> ${getTempoWorkouts(goal, fitnessLevel)}</span>
                </li>
                <li class="flex items-start">
                  <span class="text-blue-500 mr-2">•</span>
                  <span><strong>Terrängspecifik träning:</strong> ${getTerrainTraining(race.terrain)}</span>
                </li>
              </ul>
            </div>
            
            <div class="bg-white rounded p-4">
              <h5 class="font-semibold text-blue-700 mb-2">📅 Träningsfaser</h5>
              <div class="space-y-3">
                ${generateTrainingPhasesHTML(userData.weeksUntilRace, fitnessLevel)}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Nutritionsstrategi -->
      <section class="mb-8">
        <h3 class="text-2xl font-bold mb-4 text-green-600">🥗 Nutritionsstrategi</h3>
        <div class="bg-green-50 rounded-lg p-6">
          <h4 class="font-bold text-lg mb-2">Komplett Nutritionsplan</h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white rounded p-4">
              <h5 class="font-semibold text-green-700 mb-2">📅 Veckan Före Loppet</h5>
              <ul class="space-y-2 text-sm">
                <li><strong>7 dagar före:</strong> Normal kost, öka vätska</li>
                <li><strong>5 dagar före:</strong> Börja öka kolhydrater (60%)</li>
                <li><strong>3 dagar före:</strong> Carb-loading (70% kolhydrater)</li>
                <li><strong>1 dag före:</strong> Lätt smältbar mat, undvik fiber</li>
              </ul>
            </div>
            
            <div class="bg-white rounded p-4">
              <h5 class="font-semibold text-green-700 mb-2">🏃 Racedagens Nutrition</h5>
              <ul class="space-y-2 text-sm">
                <li><strong>3h före:</strong> ${getRaceBreakfast(race.distance)}</li>
                <li><strong>1h före:</strong> Banan + 500ml sportdryck</li>
                <li><strong>Under loppet:</strong> ${getRaceFueling(race.distance)}</li>
                <li><strong>Efter:</strong> Protein + kolhydrater inom 30 min</li>
              </ul>
            </div>
          </div>
          
          <div class="mt-4 p-4 bg-orange-50 rounded">
            <h5 class="font-semibold text-orange-800">💧 Vätskestrategi</h5>
            <p>${getHydrationStrategy(race.distance, race.location)}</p>
          </div>
        </div>
      </section>
      
      <!-- Utrustningsguide -->
      <section class="mb-8">
        <h3 class="text-2xl font-bold mb-4 text-indigo-600">👟 Utrustningsguide</h3>
        <div class="bg-indigo-50 rounded-lg p-6">
          <h4 class="font-bold text-lg mb-2">Rekommenderad Utrustning för ${race.name}</h4>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white rounded p-4">
              <h5 class="font-semibold text-indigo-700 mb-2">👟 Skor</h5>
              <p class="text-sm mb-2">${getShoeRecommendation(race.terrain, race.distance)}</p>
              <p class="text-xs text-gray-600">Tips: Använd skor som du sprungit minst 50 km i</p>
            </div>
            
            <div class="bg-white rounded p-4">
              <h5 class="font-semibold text-indigo-700 mb-2">👕 Kläder</h5>
              <p class="text-sm mb-2">${getClothingRecommendation(race.location)}</p>
              <p class="text-xs text-gray-600">Undvik bomull, välj tekniska material</p>
            </div>
            
            <div class="bg-white rounded p-4">
              <h5 class="font-semibold text-indigo-700 mb-2">🎒 Tillbehör</h5>
              <ul class="text-sm space-y-1">
                <li>• GPS-klocka</li>
                <li>• Energigels/bars</li>
                <li>• ${race.distance.includes('Ultra') ? 'Vätskebälte' : 'Handhållen flaska (valfritt)'}</li>
                <li>• Solglasögon & keps</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Mental Förberedelse -->
      <section class="mb-8">
        <h3 class="text-2xl font-bold mb-4 text-pink-600">🧠 Mental Förberedelse</h3>
        <div class="bg-pink-50 rounded-lg p-6">
          <h4 class="font-bold text-lg mb-2">Psykologiska Strategier</h4>
          
          <div class="space-y-4">
            <div class="bg-white rounded p-4">
              <h5 class="font-semibold text-pink-700 mb-2">🎯 Visualisering</h5>
              <p>Ägna 10 minuter varje dag åt att visualisera:</p>
              <ul class="mt-2 space-y-1 text-sm">
                <li>• Starten och de första kilometrarna</li>
                <li>• Svåra delar av banan (${getChallengingParts(race.name)})</li>
                <li>• Din starka finish över mållinjen</li>
              </ul>
            </div>
            
            <div class="bg-white rounded p-4">
              <h5 class="font-semibold text-pink-700 mb-2">💪 Mantran & Affirmationer</h5>
              <ul class="space-y-2 text-sm">
                <li>"Jag är stark, jag är redo"</li>
                <li>"Ett steg i taget tar mig till målet"</li>
                <li>"Jag har tränat för detta"</li>
                <li>${getPersonalizedMantra(goal)}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Racedagsstrategi -->
      <section class="mb-8">
        <h3 class="text-2xl font-bold mb-4 text-red-600">🏁 Racedagsstrategi</h3>
        <div class="bg-red-50 rounded-lg p-6">
          <h4 class="font-bold text-lg mb-2">Din Kompletta Racedagsplan</h4>
          
          <div class="space-y-4">
            <div class="bg-white rounded p-4">
              <h5 class="font-semibold text-red-700 mb-2">⏰ Tidsschema</h5>
              <div class="space-y-2 text-sm">
                ${generateRaceDaySchedule(race.startTime || '09:00')}
              </div>
            </div>
            
            <div class="bg-white rounded p-4">
              <h5 class="font-semibold text-red-700 mb-2">📊 Pacing-strategi</h5>
              <p class="mb-2">${getPacingStrategy(goal, race.distance, fitnessLevel)}</p>
              <div class="bg-gray-100 rounded p-3 mt-2">
                <p class="text-sm"><strong>Måltempo:</strong> ${getTargetPace(goal, race.distance, fitnessLevel)}</p>
              </div>
            </div>
            
            <div class="bg-white rounded p-4">
              <h5 class="font-semibold text-red-700 mb-2">🚰 Vätskestationer</h5>
              <p>${getAidStationStrategy(race.distance)}</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Vanliga Misstag -->
      <section class="mb-8">
        <h3 class="text-2xl font-bold mb-4 text-yellow-600">⚠️ Vanliga Misstag att Undvika</h3>
        <div class="bg-yellow-50 rounded-lg p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${generateCommonMistakesHTML(race, fitnessLevel)}
          </div>
        </div>
      </section>
      
      <!-- Återhämtningsplan -->
      <section class="mb-8">
        <h3 class="text-2xl font-bold mb-4 text-teal-600">🔄 Återhämtningsplan</h3>
        <div class="bg-teal-50 rounded-lg p-6">
          <h4 class="font-bold text-lg mb-2">Efter Loppet</h4>
          
          <div class="space-y-4">
            <div class="bg-white rounded p-4">
              <h5 class="font-semibold text-teal-700 mb-2">🕐 Första 24 timmarna</h5>
              <ul class="space-y-2 text-sm">
                <li>• Direkt: Vätska, protein & kolhydrater</li>
                <li>• 2h: Lätt promenad, stretching</li>
                <li>• 4h: Riktig måltid, fortsätt dricka</li>
                <li>• Kväll: Foam rolling, tidigt till sängs</li>
              </ul>
            </div>
            
            <div class="bg-white rounded p-4">
              <h5 class="font-semibold text-teal-700 mb-2">📅 Första veckan</h5>
              <ul class="space-y-2 text-sm">
                <li>• Dag 1-3: Vila eller lätt promenad</li>
                <li>• Dag 4-5: Lätt cykling eller simning</li>
                <li>• Dag 6-7: Första lätta joggen (20-30 min)</li>
                <li>• Fokus: Sömn, nutrition, stretching</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Personliga Tips -->
      <section class="mb-8">
        <h3 class="text-2xl font-bold mb-4 text-purple-600">💜 Personliga Tips för Dig</h3>
        <div class="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6">
          <h4 class="font-bold text-lg mb-2">Baserat på Din Profil</h4>
          <div class="space-y-3">
            ${generatePersonalizedTips(userData)}
          </div>
        </div>
      </section>
    </div>
  `;
}

// Removed duplicate generateRaceWeeklySchedule function - using the Apple Health enhanced version instead

// Helper functions for generating structured plans from answers
function generateTrainingScheduleFromAnswers(primaryGoal, currentLevel, hoursPerWeek, preferredTime, preferredEnvironment, equipment) {
  const sessionsPerWeek = Math.min(Math.max(Math.floor(hoursPerWeek / 1.5), 3), 6);
  
  const goalTrainingMap = {
    'first_5k': {
      focus: 'Bygga grundkondition och uthållighet',
      weeklyDistance: '15-25 km',
      keyWorkouts: ['Intervaller 2x/vecka', 'Långpass 1x/vecka', 'Lugna löprundor']
    },
    'improve_time': {
      focus: 'Hastighet och tröskeltempo',
      weeklyDistance: '25-35 km', 
      keyWorkouts: ['Tempopass 2x/vecka', 'Intervaller 1x/vecka', 'Långpass 1x/vecka']
    },
    'marathon': {
      focus: 'Uthållighet och volym',
      weeklyDistance: '40-60 km',
      keyWorkouts: ['Långpass 1x/vecka', 'Tempopass 1x/vecka', 'Lugna löprundor 4x/vecka']
    },
    'health': {
      focus: 'Allmän hälsa och välmående',
      weeklyDistance: '15-30 km',
      keyWorkouts: ['Lugna löprundor 3x/vecka', 'Intervaller 1x/vecka']
    },
    'weight_loss': {
      focus: 'Fettförbränning och kondition',
      weeklyDistance: '20-35 km',
      keyWorkouts: ['Långa lugna pass 2x/vecka', 'Intervaller 2x/vecka']
    }
  };

  const trainingPlan = goalTrainingMap[primaryGoal] || goalTrainingMap['health'];
  
  // Generate weekly schedule based on preferences
  const schedule = [];
  const timeMap = {
    'morning': '06:00-08:00',
    'lunch': '11:00-13:00', 
    'evening': '17:00-19:00',
    'flexible': 'Flexibel tid'
  };

  const days = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
  const workoutTypes = ['Lugn löpning', 'Intervaller', 'Tempopass', 'Långpass', 'Vila', 'Styrketräning'];
  
  for (let i = 0; i < 7; i++) {
    let workout;
    if (i < sessionsPerWeek) {
      const type = workoutTypes[i % workoutTypes.length];
      workout = {
        day: days[i],
        type: type,
        duration: type === 'Vila' ? '-' : `${Math.floor(hoursPerWeek / sessionsPerWeek * 60)} min`,
        time: timeMap[preferredTime] || 'Flexibel tid',
        location: preferredEnvironment === 'outdoor' ? 'Utomhus' : preferredEnvironment === 'indoor' ? 'Inomhus' : 'Valfritt',
        description: getWorkoutDescription(type, currentLevel)
      };
    } else {
      workout = {
        day: days[i],
        type: 'Vila',
        duration: '-',
        time: '-',
        location: '-',
        description: 'Fullständig vila eller lätt stretching'
      };
    }
    schedule.push(workout);
  }

  return {
    summary: trainingPlan,
    weeklySchedule: schedule,
    progressionPlan: generateProgressionPlan(currentLevel, primaryGoal)
  };
}

function generateNutritionPlanFromAnswers(primaryGoal, dietStyle, currentLevel) {
  const goalNutritionMap = {
    'weight_loss': {
      calories: 1800,
      macros: { carbs: '40%', protein: '30%', fat: '30%' },
      focus: 'Kaloriunderskott för viktminskning'
    },
    'marathon': {
      calories: 2800,
      macros: { carbs: '60%', protein: '20%', fat: '20%' },
      focus: 'Hög kolhydratintag för uthållighet'
    },
    'improve_time': {
      calories: 2400,
      macros: { carbs: '50%', protein: '25%', fat: '25%' },
      focus: 'Balanserad kost för prestationsförbättring'
    },
    'health': {
      calories: 2200,
      macros: { carbs: '45%', protein: '25%', fat: '30%' },
      focus: 'Hälsosam och balanserad kost'
    }
  };

  const basePlan = goalNutritionMap[primaryGoal] || goalNutritionMap['health'];
  
  const dietAdjustments = {
    'vegetarian': {
      proteinSources: ['Bönor', 'Linser', 'Quinoa', 'Nötter', 'Ägg', 'Mejeriprodukt'],
      supplements: ['B12-vitamin', 'Järn', 'Omega-3']
    },
    'vegan': {
      proteinSources: ['Bönor', 'Linser', 'Quinoa', 'Nötter', 'Frön', 'Tofu'],
      supplements: ['B12-vitamin', 'Järn', 'Omega-3', 'D-vitamin']
    },
    'keto': {
      macros: { carbs: '5%', protein: '25%', fat: '70%' },
      focus: 'Ketogen kost för fettförbränning'
    },
    'paleo': {
      foods: ['Kött', 'Fisk', 'Ägg', 'Grönsaker', 'Nötter', 'Bär'],
      avoid: ['Spannmål', 'Mejeriprodukter', 'Bönor']
    }
  };

  return {
    dailyCalories: basePlan.calories,
    macroDistribution: basePlan.macros,
    focus: basePlan.focus,
    mealPlan: generateMealPlan(dietStyle),
    hydration: '2.5-3 liter vatten per dag',
    preWorkout: 'Banan och havregrynsgröt 1-2h före träning',
    postWorkout: 'Protein och kolhydrater inom 30 min efter träning',
    supplements: dietAdjustments[dietStyle]?.supplements || ['Multivitamin', 'D-vitamin'],
    specialConsiderations: dietAdjustments[dietStyle] || null
  };
}

function generateLifestylePlanFromAnswers(sleepQuality, stressLevel, healthConcerns) {
  const sleepRecommendations = {
    'poor': {
      hours: '8-9 timmar',
      tips: [
        'Gå till sängs samma tid varje kväll',
        'Undvik skärmar 2 timmar före sömn',
        'Mörkt och svalt sovrum (16-18°C)',
        'Melatonin-tillskott efter konsultation med läkare'
      ]
    },
    'average': {
      hours: '7-8 timmar',
      tips: [
        'Regelbundna sovtider',
        'Undvik koffein efter 14:00',
        'Avslappning före sänggående'
      ]
    },
    'good': {
      hours: '7-8 timmar',
      tips: [
        'Fortsätt med nuvarande rutiner',
        'Övervaka sömnkvalitet med app eller klocka'
      ]
    }
  };

  const stressManagement = {
    'high': [
      'Meditation 10-15 min dagligen',
      'Andningsövningar före träning',
      'Yoga eller tai chi 2x/vecka',
      'Överväg professionell hjälp'
    ],
    'medium': [
      'Meditation 5-10 min dagligen',
      'Regelbundna promenader',
      'Begränsa nyheter och sociala medier'
    ],
    'low': [
      'Fortsätt med nuvarande stresshantering',
      'Bibehåll work-life balance'
    ]
  };

  return {
    sleep: sleepRecommendations[sleepQuality] || sleepRecommendations['average'],
    stressManagement: stressManagement[stressLevel] || stressManagement['medium'],
    healthConsiderations: generateHealthRecommendations(healthConcerns),
    dailyRoutine: [
      'Morgon: Stretching 5-10 min',
      'Lunch: Kort promenad 10-15 min',
      'Kväll: Avslappning och reflektion'
    ]
  };
}

function generateRecoveryPlanFromAnswers(currentLevel, hoursPerWeek, healthConcerns) {
  const recoveryIntensity = {
    'beginner': 'Hög fokus på återhämtning',
    'casual': 'Medel återhämtning', 
    'regular': 'Balanserad återhämtning',
    'experienced': 'Aktiv återhämtning',
    'competitive': 'Strukturerad återhämtning'
  };

  return {
    philosophy: recoveryIntensity[currentLevel] || 'Balanserad återhämtning',
    weeklyPlan: {
      restDays: Math.max(1, 7 - Math.floor(hoursPerWeek / 1.5)),
      activeRecovery: 'Lätt yoga eller promenad 2x/vecka',
      stretching: 'Daglig stretching 10-15 min',
      massage: 'Foam rolling eller massage 1x/vecka'
    },
    sleepPriority: 'Minst 7-8 timmar sömn per natt',
    nutritionTiming: 'Protein och kolhydrater inom 30 min efter träning',
    hydration: 'Extra vätskeintag på träningsdagar',
    warningSignals: [
      'Ökad vilopuls på morgonen',
      'Minskad motivation',
      'Försämrad sömnkvalitet',
      'Ihållande muskelvärk'
    ]
  };
}

function generateProgressTrackingFromAnswers(primaryGoal) {
  const trackingMap = {
    'first_5k': {
      metrics: ['Löpavstånd', 'Löptid', 'Genomsnittspuls', 'Upplevd ansträngning'],
      milestones: ['1 km utan paus', '2 km utan paus', '5 km på under 35 min'],
      frequency: 'Veckovis uppföljning'
    },
    'improve_time': {
      metrics: ['Tempo per km', 'Intervallprestanda', 'Återhämtningstid', 'VO2 max'],
      milestones: ['5% förbättring av 5K-tid', '10% förbättring av 10K-tid'],
      frequency: 'Bi-veckovis tester'
    },
    'marathon': {
      metrics: ['Veckovolym', 'Långpassdistans', 'Genomsnittspuls', 'Näringsintag'],
      milestones: ['20 km långpass', '30 km långpass', 'Fullständig marathon'],
      frequency: 'Månadsvis utvärdering'
    },
    'weight_loss': {
      metrics: ['Vikt', 'Kroppsfett%', 'Midjeomfång', 'Energinivå'],
      milestones: ['2 kg viktminskning', '5 kg viktminskning', 'Målvikt uppnådd'],
      frequency: 'Veckovis vägning'
    }
  };

  return trackingMap[primaryGoal] || trackingMap['health'];
}

function getWorkoutDescription(type, level) {
  const descriptions = {
    'Lugn löpning': `Behagligt tempo där du kan prata. ${level === 'beginner' ? 'Fokus på att bygga uthållighet.' : 'Aktiv återhämtning.'}`,
    'Intervaller': `Korta intensiva perioder följt av vila. ${level === 'beginner' ? '30 sek hårt, 90 sek vila.' : '1-2 min hårt, 1 min vila.'}`,
    'Tempopass': `Måttligt hårt tempo under längre tid. ${level === 'beginner' ? '10-15 min.' : '20-30 min.'}`,
    'Långpass': `Långsam och steady löpning. ${level === 'beginner' ? '30-45 min.' : '60-90 min.'}`,
    'Styrketräning': 'Fokus på ben, core och stabilitet för löpare.',
    'Vila': 'Fullständig vila eller lätt stretching/yoga.'
  };
  
  return descriptions[type] || 'Anpassad träning enligt plan.';
}

function generateProgressionPlan(currentLevel, primaryGoal) {
  return {
    week1to4: 'Grundfas - Bygga bas och vana',
    week5to8: 'Utvecklingsfas - Öka intensitet och volym', 
    week9to12: 'Prestationsfas - Maximera resultat',
    progressionRate: currentLevel === 'beginner' ? '5-10% ökning per vecka' : '10-15% ökning per vecka'
  };
}

function generateMealPlan(dietStyle) {
  const baseMeals = {
    breakfast: 'Havregrynsgröt med bär och nötter',
    lunch: 'Quinoasallad med grönsaker och protein',
    dinner: 'Grillad fisk/kyckling med ris och grönsaker',
    snacks: ['Frukt och nötter', 'Grekisk yoghurt', 'Smoothie']
  };

  if (dietStyle === 'vegan') {
    return {
      breakfast: 'Havregrynsgröt med växtmjölk, bär och mandlar',
      lunch: 'Bönbowl med quinoa och grönsaker',
      dinner: 'Tofu-wok med ris och grönsaker',
      snacks: ['Frukt och nötter', 'Hummus med grönsaker', 'Vegansk smoothie']
    };
  }

  return baseMeals;
}

function generateHealthRecommendations(healthConcerns) {
  if (!healthConcerns || healthConcerns.length === 0) {
    return ['Regelbundna hälsokontroller', 'Lyssna på kroppen under träning'];
  }

  const recommendations = [];
  
  if (healthConcerns.includes('joints')) {
    recommendations.push('Låg-impact träning', 'Extra uppvärmning', 'Styrketräning för stabilitet');
  }
  
  if (healthConcerns.includes('heart')) {
    recommendations.push('Pulskontroll under träning', 'Gradvis progression', 'Regelbunden läkarkontakt');
  }
  
  if (healthConcerns.includes('diabetes')) {
    recommendations.push('Blodsockerkontroll', 'Måltidsplanering', 'Konsultera diabetessjuksköterska');
  }

  return recommendations.length > 0 ? recommendations : ['Konsultera läkare före träningsstart'];
}

function getGoalDescription(goal) {
  const goals = {
    'first_5k': 'Springa första 5K',
    'improve_time': 'Förbättra löptider',
    'marathon': 'Träna för marathon',
    'health': 'Förbättra allmän hälsa',
    'weight_loss': 'Gå ner i vikt',
    'social': 'Hitta löparvänner'
  };
  return goals[goal] || 'Allmän träning';
}

function getLevelDescription(level) {
  const levels = {
    'beginner': 'Nybörjare',
    'casual': 'Tillfällig löpare', 
    'regular': 'Regelbunden löpare',
    'experienced': 'Erfaren löpare',
    'competitive': 'Tävlingsløpare'
  };
  return levels[level] || 'Medelnivå';
}

// New helper functions for comprehensive race planning
function generateDetailedWorkouts(weeks, data) {
  const workouts = [];
  const fitness = data.current_fitness || 'recreational';
  
  // Generate specific workouts for key weeks
  const keyWeeks = [
    Math.floor(weeks * 0.25), // Early build
    Math.floor(weeks * 0.5),  // Mid-training
    Math.floor(weeks * 0.75), // Peak
    weeks - 2                  // Taper
  ];
  
  keyWeeks.forEach(week => {
    workouts.push({
      week,
      keyWorkout: {
        type: week < weeks/2 ? 'Långpass' : 'Racesimulering',
        distance: calculateWorkoutDistance(week, weeks, fitness),
        pace: 'Racefart minus 10-15 sek/km',
        tips: 'Öva på vätskeintag och energi'
      }
    });
  });
  
  return workouts;
}

function generateWeekByWeekPlan(weeks, data) {
  const plan = [];
  
  for (let week = 1; week <= weeks; week++) {
    const phase = week <= weeks * 0.3 ? 'Bas' : 
                  week <= weeks * 0.6 ? 'Uppbyggnad' :
                  week <= weeks * 0.85 ? 'Topp' : 'Nedtrappning';
    
    plan.push({
      week,
      phase,
      focus: getWeeklyFocus(week, data),
      keyWorkouts: getWeeklyKeyWorkouts(week, weeks, data),
      totalDistance: calculateWeeklyTotal(week, weeks, data),
      intensity: getWeeklyIntensity(week, weeks)
    });
  }
  
  return plan;
}

function generatePerformanceMetrics(data) {
  const currentPace = estimateCurrentPace(data.longest_recent_run, data.current_fitness);
  const targetPace = calculateTargetPace(data.target_time, data.selectedRace);
  
  return {
    current: {
      estimatedPace: currentPace,
      vo2max: estimateVO2Max(data.current_fitness),
      weeklyMileage: data.weekly_runs
    },
    target: {
      racePace: targetPace,
      requiredVO2Max: calculateRequiredVO2Max(targetPace),
      peakWeeklyMileage: calculatePeakMileage(data)
    },
    progression: {
      paceImprovement: `${Math.round((currentPace - targetPace) / currentPace * 100)}%`,
      timeToGoal: 'Realistiskt med rätt träning'
    }
  };
}

function generateInjuryPreventionPlan(data) {
  const riskFactors = [];
  
  if (data.weekly_runs === '6+') {
    riskFactors.push('Hög träningsvolym');
  }
  
  if (data.injury_history && data.injury_history !== 'none') {
    riskFactors.push('Tidigare skador');
  }
  
  return {
    riskAssessment: riskFactors.length > 0 ? 'Medel-Hög' : 'Låg',
    preventionStrategies: [
      'Dynamisk uppvärmning före varje pass',
      'Styrketräning 2x/vecka fokus på core och ben',
      'Foam rolling dagligen',
      'Gradvis ökning av volym (max 10% per vecka)'
    ],
    warningSignals: [
      'Ihållande smärta som inte försvinner med vila',
      'Ökad morgonstelhet',
      'Försämrad löpteknik'
    ],
    recoveryProtocol: {
      daily: 'Stretching 10-15 min',
      weekly: 'Massage eller yoga',
      nutrition: 'Protein inom 30 min efter träning'
    }
  };
}

function generateWeatherPrep(race) {
  // Weather preparation based on race location and typical conditions
  const typicalConditions = {
    'Stockholm Marathon': { temp: '15-20°C', conditions: 'Växlande, risk för regn' },
    'Berlin Marathon': { temp: '12-18°C', conditions: 'Stabilt, ofta mulet' },
    'New York Marathon': { temp: '8-15°C', conditions: 'Kyligt, blåsigt' }
  };
  
  const conditions = typicalConditions[race.name] || { temp: '10-20°C', conditions: 'Varierande' };
  
  return {
    expectedConditions: conditions,
    clothingRecommendations: [
      'Lager-på-lager för start',
      'Tekniskt material som andas',
      'Keps eller pannband'
    ],
    preparation: [
      'Träna i liknande väder',
      'Testa kläder på långpass',
      'Ha backup-kläder'
    ]
  };
}

function generateRaceWeekScheduleOld(race, data) {
  return {
    sevenDaysBefore: {
      training: 'Sista kvalitetspasset - 30 min tempopass',
      nutrition: 'Börja öka kolhydratintag',
      mental: 'Visualisera loppet'
    },
    threeDaysBefore: {
      training: 'Lätt löpning 20-30 min',
      nutrition: 'Carb-loading på allvar',
      logistics: 'Packa väskan, kolla utrustning'
    },
    dayBefore: {
      training: 'Vila eller 15 min shakeout',
      nutrition: 'Tidig middag, undvik nya rätter',
      preparation: 'Lägg fram alla kläder, sätt klockan'
    },
    raceDay: {
      wakeUp: '3-4h före start',
      breakfast: '3h före start - testad frukost',
      arrival: '1h före start',
      warmup: '20 min före start'
    }
  };
}

// Helper calculation functions
function calculateWorkoutDistance(week, totalWeeks, fitness) {
  const base = fitness === 'beginner' ? 5 : 
               fitness === 'recreational' ? 10 : 
               fitness === 'experienced' ? 15 : 20;
  
  const progression = week / totalWeeks;
  return Math.round(base * (1 + progression * 0.5));
}

function getWeeklyKeyWorkouts(week, totalWeeks, data) {
  const phase = week / totalWeeks;
  
  if (phase < 0.3) {
    return ['Långpass', 'Lätta löprundor', 'Styrketräning'];
  } else if (phase < 0.6) {
    return ['Tempopass', 'Intervaller', 'Progressivt långpass'];
  } else if (phase < 0.85) {
    return ['Racefartpass', 'Långpass med fartväxlingar', 'Snabbdistans'];
  } else {
    return ['Kort racefart', 'Lätta löprundor', 'Vila'];
  }
}

function calculateWeeklyTotal(week, totalWeeks, data) {
  const base = parseInt(data.weekly_runs?.split('-')[0] || '3') * 10;
  const peak = base * 1.5;
  const current = base + (peak - base) * (week / totalWeeks) * 
                  (week < totalWeeks - 3 ? 1 : 0.6); // Taper last 3 weeks
  
  return `${Math.round(current)}-${Math.round(current * 1.1)} km`;
}

function getWeeklyIntensity(week, totalWeeks) {
  const phase = week / totalWeeks;
  
  if (phase < 0.3) return 'Låg-Medel';
  if (phase < 0.6) return 'Medel';
  if (phase < 0.85) return 'Medel-Hög';
  return 'Låg'; // Taper
}

function estimateCurrentPace(longestRun, fitness) {
  const paceMap = {
    'beginner': 420, // 7:00/km
    'recreational': 360, // 6:00/km
    'experienced': 300, // 5:00/km
    'competitive': 240 // 4:00/km
  };
  
  return paceMap[fitness] || 360;
}

function calculateTargetPace(targetTime, race) {
  if (!targetTime || !race.distance) return 360;
  
  // Parse target time (format: "3:30" or similar)
  const [hours, minutes] = targetTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  
  // Extract distance in km
  const distanceKm = parseInt(race.distance) || 42.195;
  
  return Math.round((totalMinutes * 60) / distanceKm);
}

function estimateVO2Max(fitness) {
  const vo2Map = {
    'beginner': 35,
    'recreational': 45,
    'experienced': 55,
    'competitive': 65
  };
  
  return vo2Map[fitness] || 45;
}

function calculateRequiredVO2Max(targetPace) {
  // Simplified calculation
  return Math.round(70 - (targetPace / 10));
}

function calculatePeakMileage(data) {
  const base = parseInt(data.weekly_runs?.split('-')[0] || '3') * 10;
  return Math.round(base * 1.5);
}

// Helper functions for comprehensive race guide
function getTypicalWeather(location) {
  const weatherMap = {
    'Boston': 'svalt och klart, 10-15°C',
    'Berlin': 'milt och stabilt, 12-18°C',
    'Stockholm': 'växlande med risk för regn, 10-20°C',
    'New York': 'kyligt på morgonen, 8-15°C',
    'London': 'mulet med risk för regn, 10-16°C'
  };
  
  for (const [city, weather] of Object.entries(weatherMap)) {
    if (location.includes(city)) return weather;
  }
  return 'varierande väder, 10-20°C';
}

function getKeySpectatorPoints(raceName) {
  const points = {
    'Boston Marathon': 'Wellesley College och Heartbreak Hill',
    'Stockholm Marathon': 'Gamla Stan och Östermalm',
    'Berlin Marathon': 'Brandenburg Gate och Potsdamer Platz',
    'New York Marathon': 'Brooklyn och Central Park'
  };
  return points[raceName] || 'start- och målområdet';
}

function getTargetLongRun(distance, fitness) {
  if (distance.includes('Marathon')) {
    const targets = {
      'beginner': '28-30 km',
      'recreational': '30-32 km',
      'experienced': '32-35 km',
      'competitive': '35-38 km'
    };
    return targets[fitness] || '30 km';
  }
  return '80% av loppdistansen';
}

function getTempoWorkouts(goal, fitness) {
  if (goal === 'pb') {
    return 'Tempopass på måltempo, intervaller för hastighet';
  } else if (goal === 'finish') {
    return 'Lugna tempopass för att bygga uthållighet';
  }
  return 'Varierade tempopass för allsidig utveckling';
}

function getTerrainTraining(terrain) {
  if (terrain === 'Hilly') {
    return 'Backträning 1-2 ggr/vecka, styrka för quadriceps';
  } else if (terrain === 'Trail') {
    return 'Terrängløpning, balans- och stabilitetsövningar';
  }
  return 'Varierad träning på olika underlag';
}

function generateTrainingPhasesHTML(weeks, fitness) {
  const phases = [];
  
  if (weeks > 12) {
    phases.push(`
      <div class="border-l-4 border-blue-500 pl-4">
        <h6 class="font-semibold">Vecka 1-${Math.floor(weeks * 0.3)}: Basbyggande</h6>
        <p class="text-sm text-gray-600">Fokus på volym och aerob kapacitet</p>
      </div>
    `);
  }
  
  phases.push(`
    <div class="border-l-4 border-green-500 pl-4">
      <h6 class="font-semibold">Vecka ${Math.floor(weeks * 0.3)}-${Math.floor(weeks * 0.7)}: Uppbyggnad</h6>
      <p class="text-sm text-gray-600">Öka intensitet och specifik träning</p>
    </div>
  `);
  
  phases.push(`
    <div class="border-l-4 border-orange-500 pl-4">
      <h6 class="font-semibold">Vecka ${Math.floor(weeks * 0.7)}-${weeks - 2}: Toppning</h6>
      <p class="text-sm text-gray-600">Racefart och mental förberedelse</p>
    </div>
  `);
  
  phases.push(`
    <div class="border-l-4 border-purple-500 pl-4">
      <h6 class="font-semibold">Sista 2 veckorna: Nedtrappning</h6>
      <p class="text-sm text-gray-600">Minska volym, behåll intensitet</p>
    </div>
  `);
  
  return phases.join('');
}

function getRaceBreakfast(distance) {
  if (distance.includes('Ultra')) {
    return 'Stor portion havregrynsgröt med banan, bröd med honung, kaffe';
  } else if (distance.includes('Marathon')) {
    return 'Havregrynsgröt med banan, vitt bröd med sylt, sportdryck';
  }
  return 'Lätt frukost: banan, toast, sportdryck';
}

function getRaceFueling(distance) {
  if (distance.includes('Ultra')) {
    return 'Energi var 30 min, växla mellan gels, bars och riktig mat';
  } else if (distance.includes('Marathon')) {
    return 'Energigel var 45 min från 60 min, totalt 4-6 gels';
  }
  return 'Sportdryck vid vätskestationer';
}

function getHydrationStrategy(distance, location) {
  const base = 'Drick vid alla vätskestationer, lyssna på törsten.';
  if (location.includes('hot') || location.includes('humid')) {
    return base + ' Extra fokus på elektrolyter i varmt väder.';
  }
  return base + ' Växla mellan vatten och sportdryck.';
}

function getShoeRecommendation(terrain, distance) {
  if (terrain === 'Trail') {
    return 'Terrängskor med bra grepp och skydd';
  } else if (distance.includes('Ultra')) {
    return 'Maximalt dämpade skor för lång distans';
  }
  return 'Välbeprövade löparskor med 50+ km användning';
}

function getClothingRecommendation(location) {
  return 'Tekniskt material, shorts/tights, singlet/t-shirt beroende på väder';
}

function getChallengingParts(raceName) {
  const challenges = {
    'Boston Marathon': 'Newton Hills och Heartbreak Hill',
    'Stockholm Marathon': 'Västerbron och slutet',
    'Berlin Marathon': 'km 30-35 när energin tar slut'
  };
  return challenges[raceName] || 'de sista 10 kilometrarna';
}

function getPersonalizedMantra(goal) {
  const mantras = {
    'finish': '"Jag klarar detta, ett steg i taget"',
    'pb': '"Jag är snabb, jag är stark"',
    'enjoy': '"Njut av resan, le och spring"',
    'podium': '"Detta är min dag att glänsa"'
  };
  return mantras[goal] || '"Jag är redo för denna utmaning"';
}

function generateRaceDaySchedule(startTime) {
  const start = parseInt(startTime.split(':')[0]);
  return `
    <p><strong>${start - 4}:00</strong> - Vakna, drick vatten</p>
    <p><strong>${start - 3}:30</strong> - Frukost</p>
    <p><strong>${start - 2}:00</strong> - Klä om, packa väska</p>
    <p><strong>${start - 1}:30</strong> - Avresa till start</p>
    <p><strong>${start - 1}:00</strong> - Lämna väska, toalett</p>
    <p><strong>${start - 0.5}:00</strong> - Uppvärmning</p>
    <p><strong>${startTime}</strong> - START! 🎯</p>
  `;
}

function getPacingStrategy(goal, distance, fitness) {
  if (goal === 'finish') {
    return 'Starta konservativt, håll jämn fart, spara energi till slutet';
  } else if (goal === 'pb') {
    return 'Negativ split - något långsammare första halvan, öka andra halvan';
  }
  return 'Jämn fart enligt måltempo, lyssna på kroppen';
}

function getTargetPace(goal, distance, fitness) {
  // Simplified pace calculation
  if (distance.includes('Marathon')) {
    const paces = {
      'beginner': '6:00-6:30/km',
      'recreational': '5:00-5:30/km',
      'experienced': '4:30-5:00/km',
      'competitive': '3:30-4:30/km'
    };
    return paces[fitness] || '5:30/km';
  }
  return 'Anpassat efter din förmåga';
}

function getAidStationStrategy(distance) {
  if (distance.includes('Ultra')) {
    return 'Stanna vid varje station, ät och drick ordentligt';
  } else if (distance.includes('Marathon')) {
    return 'Drick i farten, gå eventuellt genom stationen för säkerhet';
  }
  return 'Ta vatten vid behov';
}

function generateCommonMistakesHTML(race, fitness) {
  const mistakes = [
    {
      title: '🏃 För snabb start',
      description: 'Adrenalinet får många att starta för snabbt. Håll dig till din plan!'
    },
    {
      title: '💧 Otillräcklig vätska',
      description: 'Börja dricka tidigt, vänta inte tills du är törstig'
    },
    {
      title: '👟 Nya skor/kläder',
      description: 'Använd ALDRIG oprövad utrustning på racedagen'
    },
    {
      title: '🍝 Experimentera med mat',
      description: 'Ät samma frukost som du testat på långpassen'
    },
    {
      title: '😰 Panik vid motgång',
      description: 'Ha en plan B - alla har svåra stunder i ett lopp'
    }
  ];
  
  return mistakes.map(mistake => `
    <div class="bg-white rounded p-4">
      <h5 class="font-semibold text-yellow-700 mb-1">${mistake.title}</h5>
      <p class="text-sm">${mistake.description}</p>
    </div>
  `).join('');
}

function generatePersonalizedTips(userData) {
  const tips = [];
  
  if (userData.current_fitness === 'beginner') {
    tips.push('<p>🌟 <strong>För dig som nybörjare:</strong> Fokusera på att fullfölja, inte på tiden. Detta är din första stora prestation!</p>');
  }
  
  if (userData.weekly_runs && userData.weekly_runs.includes('2-3')) {
    tips.push('<p>💪 <strong>Träningsfrekvens:</strong> Med 2-3 pass/vecka är kvalitet viktigare än kvantitet. Gör varje pass meningsfullt.</p>');
  }
  
  if (userData.race_goal === 'pb') {
    tips.push('<p>⚡ <strong>För ditt PB-mål:</strong> Disciplin med tempo är nyckeln. Motstå frestelsen att köra för hårt tidigt.</p>');
  }
  
  if (userData.recovery_priority === 'low') {
    tips.push('<p>🔄 <strong>Återhämtning:</strong> Du har angett låg prioritet på återhämtning - detta är din svaga punkt. Fokusera extra på vila!</p>');
  }
  
  tips.push('<p>❤️ <strong>Kom ihåg:</strong> Du har förberett dig väl. Lita på träningen och njut av upplevelsen!</p>');
  
  return tips.join('');
}

// Apple Health-enhanced helper functions
const generateTrainingPlanNew = (raceInfo, userAnswers, appleHealthData = null) => {
  const { race, goal, level, timeGoal, preferences, health } = userAnswers;
  
  // Adjust plan based on Apple Health data
  let adjustedLevel = level;
  let weeklyWorkouts = level === 'nybörjare' ? 3 : level === 'medel' ? 4 : 5;
  
  if (appleHealthData && appleHealthData.hasData) {
    // Adjust based on current training frequency
    if (appleHealthData.weeklyFrequency < 2) {
      adjustedLevel = 'nybörjare';
      weeklyWorkouts = 3;
    } else if (appleHealthData.weeklyFrequency >= 4) {
      adjustedLevel = 'avancerad';
      weeklyWorkouts = Math.min(5, Math.round(appleHealthData.weeklyFrequency));
    }
  }
  
  const baseOverview = `Träningsplan för ${race.name} med fokus på ${goal}`;
  const appleHealthInsight = appleHealthData && appleHealthData.hasData ? 
    ` Baserat på din Apple Health-data (${appleHealthData.totalActivities} aktiviteter, ${appleHealthData.avgDistance}km genomsnitt) har planen anpassats för din nuvarande fitnessnivå.` : '';
  
  return {
    overview: baseOverview + appleHealthInsight,
    duration: '16 veckor',
    currentFitnessAssessment: appleHealthData && appleHealthData.hasData ? {
      weeklyFrequency: appleHealthData.weeklyFrequency,
      avgDistance: appleHealthData.avgDistance,
      longestRun: appleHealthData.longestRun,
      avgPace: appleHealthData.avgPace,
      fitnessLevel: adjustedLevel
    } : null,
    phases: [
      {
        name: 'Grundfas',
        weeks: '1-4',
        focus: 'Bygga grundkondition och löpvolym',
        keyWorkouts: ['Långa lugna pass', 'Grundtempo', 'Återhämtningspass'],
        adjustment: appleHealthData && appleHealthData.weeklyFrequency < 2 ? 
          'Extra fokus på att bygga träningsvana gradvis' : null
      },
      {
        name: 'Utvecklingsfas', 
        weeks: '5-8',
        focus: 'Öka intensitet och hastighet',
        keyWorkouts: ['Intervaller', 'Tempopass', 'Progressiva pass'],
        adjustment: appleHealthData && appleHealthData.avgPace > 0 ? 
          `Tempoträning runt ${Math.floor(appleHealthData.avgPace / 60)}:${Math.round(appleHealthData.avgPace % 60).toString().padStart(2, '0')} min/km` : null
      },
      {
        name: 'Specialfas',
        weeks: '9-12', 
        focus: 'Loppspecifik träning',
        keyWorkouts: ['Loppstempo', 'Långa intervaller', 'Simulering'],
        adjustment: appleHealthData && appleHealthData.longestRun > 0 ? 
          `Långpass upp till ${Math.round(appleHealthData.longestRun * 1.3)}km` : null
      },
      {
        name: 'Nedtrappning',
        weeks: '13-16',
        focus: 'Vila och förberedelse inför lopp',
        keyWorkouts: ['Korta intervaller', 'Loppstempo', 'Vila']
      }
    ],
    weeklyStructure: {
      workouts: weeklyWorkouts,
      longRun: 'Lördagar',
      intervals: 'Tisdagar',
      tempo: 'Torsdagar',
      recovery: 'Söndagar',
      adjustment: appleHealthData && appleHealthData.hasData ? 
        `Anpassad från ${appleHealthData.weeklyFrequency} nuvarande pass/vecka` : null
    }
  };
};

const generateNutritionPlan = (raceInfo, userAnswers, appleHealthData = null) => {
  const { race, goal, level, preferences, health } = userAnswers;
  
  // Base calorie calculation
  let baseCalories = 2000;
  let adjustmentNote = '';
  
  if (appleHealthData && appleHealthData.hasData) {
    // Adjust calories based on training volume
    const weeklyCalories = appleHealthData.totalCalories / (appleHealthData.totalActivities / appleHealthData.weeklyFrequency);
    baseCalories = Math.round(2000 + (weeklyCalories * 0.3));
    adjustmentNote = `Kaloribehov justerat baserat på din genomsnittliga förbränning: ${appleHealthData.avgCaloriesPerKm || 'N/A'} kcal/km`;
  }
  
  return {
    dailyCalories: baseCalories,
    adjustmentNote,
    macros: {
      carbs: '55-60%',
      protein: '15-20%',
      fat: '25-30%'
    },
    hydration: {
      daily: '2.5-3 liter',
      training: '500-750ml per timme träning',
      raceDay: 'Sluta dricka 30 min före start'
    },
    preworkout: {
      timing: '2-3 timmar före träning',
      options: [
        'Havregrynsgröt med banan',
        'Toast med jordnötssmör',
        'Smoothie med bär och yoghurt'
      ]
    },
    postworkout: {
      timing: 'Inom 30 minuter efter träning',
      options: [
        'Proteinshake med banan',
        'Grekisk yoghurt med granola',
        'Chokladmjölk och smörgås'
      ]
    },
    raceWeek: {
      carbLoading: 'Öka kolhydrater till 70% av kalorier 3 dagar före',
      breakfast: 'Havregrynsgröt 3 timmar före start',
      during: race.distance > 15 ? 'Energigel var 45 min' : 'Vatten vid stationer'
    }
  };
};

const generateLifestylePlan = (raceInfo, userAnswers, appleHealthData = null) => {
  const { race, goal, level, preferences, health } = userAnswers;
  
  let recoveryAdjustment = '';
  if (appleHealthData && appleHealthData.hasData) {
    if (appleHealthData.weeklyFrequency > 4) {
      recoveryAdjustment = 'Med din höga träningsfrekvens behöver du extra fokus på återhämtning';
    } else if (appleHealthData.weeklyFrequency < 2) {
      recoveryAdjustment = 'Börja gradvis med återhämtningsrutiner när träningsvolymen ökar';
    }
  }
  
  return {
    sleep: {
      target: '7-9 timmar per natt',
      tips: [
        'Gå och lägg dig samma tid varje kväll',
        'Undvik skärmar 1 timme före sömn',
        'Håll sovrummet svalt (16-18°C)'
      ],
      adjustment: recoveryAdjustment
    },
    stressManagement: {
      techniques: [
        'Meditation 10 min dagligen',
        'Djupandning före träning',
        'Naturvandring på vilodagar'
      ]
    },
    crossTraining: [
      'Simning eller cykling 1-2 ggr/vecka',
      'Yoga eller stretching dagligen',
      'Styrketräning 2 ggr/vecka'
    ],
    workLifeBalance: {
      trainingTime: preferences.preferredTime || 'Morgon',
      tips: [
        'Schemalägg träning som viktiga möten',
        'Förbered träningskläder kvällen innan',
        'Ha backup-plan för dåligt väder'
      ]
    }
  };
};

const generateRecoveryPlan = (raceInfo, userAnswers, appleHealthData = null) => {
  const { race, goal, level, preferences, health } = userAnswers;
  
  let intensityAdjustment = 'normal';
  if (appleHealthData && appleHealthData.hasData) {
    if (appleHealthData.weeklyFrequency > 5) {
      intensityAdjustment = 'hög';
    } else if (appleHealthData.weeklyFrequency < 2) {
      intensityAdjustment = 'lätt';
    }
  }
  
  const recoveryProtocols = {
    'lätt': {
      stretching: '10 min efter träning',
      foamRolling: '2 ggr/vecka',
      massage: 'Varannan vecka',
      restDays: '2-3 per vecka'
    },
    'normal': {
      stretching: '15 min efter träning',
      foamRolling: '3-4 ggr/vecka',
      massage: 'Varje vecka',
      restDays: '1-2 per vecka'
    },
    'hög': {
      stretching: '20 min efter träning',
      foamRolling: 'Dagligen',
      massage: '2 ggr/vecka',
      restDays: '1 per vecka + aktiv återhämtning'
    }
  };
  
  return {
    intensity: intensityAdjustment,
    ...recoveryProtocols[intensityAdjustment],
    signs: {
      overtraining: [
        'Konstant trötthet',
        'Förhöjd vilopuls',
        'Irritabilitet',
        'Försämrad prestanda'
      ],
      action: 'Ta 2-3 extra vilodagar och minska intensiteten'
    },
    activeRecovery: [
      'Lätt promenad',
      'Yoga eller stretching',
      'Simning i lugnt tempo',
      'Cykling på låg intensitet'
    ]
  };
};

const generateProgressTracking = (raceInfo, userAnswers, appleHealthData = null) => {
  const { race, goal, level, timeGoal, preferences, health } = userAnswers;
  
  let currentBaseline = {};
  if (appleHealthData && appleHealthData.hasData) {
    currentBaseline = {
      avgPace: `${Math.floor(appleHealthData.avgPace / 60)}:${Math.round(appleHealthData.avgPace % 60).toString().padStart(2, '0')} min/km`,
      longestRun: `${appleHealthData.longestRun}km`,
      weeklyDistance: `${Math.round(appleHealthData.avgDistance * appleHealthData.weeklyFrequency)}km`,
      avgHeartRate: appleHealthData.avgHeartRate ? `${appleHealthData.avgHeartRate} bpm` : 'Ej tillgänglig'
    };
  }
  
  return {
    currentBaseline,
    weeklyMetrics: [
      'Total distans',
      'Genomsnittligt tempo',
      'Längsta pass',
      'Träningspass genomförda',
      'Vilopuls (morgon)',
      'Subjektiv återhämtning (1-10)'
    ],
    monthlyTests: [
      {
        test: '5K tidtagning',
        frequency: 'Var 4:e vecka',
        purpose: 'Mäta hastighetsförbättring'
      },
      {
        test: 'Långpass utvärdering',
        frequency: 'Var 2:a vecka',
        purpose: 'Bedöma uthållighetsframsteg'
      }
    ],
    milestones: [
      {
        week: 4,
        goal: 'Genomföra första 60-minuters långpass',
        metric: 'Distans och komfort'
      },
      {
        week: 8,
        goal: 'Förbättra 5K-tid med 30 sekunder',
        metric: 'Tid och ansträngning'
      },
      {
        week: 12,
        goal: 'Genomföra 80% av loppdistansen',
        metric: 'Uthållighet och återhämtning'
      },
      {
        week: 16,
        goal: 'Vara redo för lopp',
        metric: 'Övergripande kondition'
      }
    ],
    warningSignals: [
      'Konsekvent långsammare tider',
      'Svårigheter att genomföra planerade pass',
      'Ökad trötthet eller irritabilitet',
      'Återkommande små skador'
    ]
  };
};

// Enhanced race description with Apple Health context
const generateRaceDescriptionNew = async (raceInfo, userAnswers, appleHealthContext = '') => {
  try {
    // Always provide fallback first to prevent any errors
    const fallbackDescription = `${raceInfo.name} är ett fantastiskt lopp i ${raceInfo.location} som kommer utmana dig på bästa sätt. Med ${raceInfo.distance} av löpning genom ${raceInfo.terrain || 'varierad'} terräng blir detta en minnesvärd upplevelse.${appleHealthContext ? ' Med din nuvarande träningshistoria från Apple Health är du på god väg att nå ditt mål.' : ''}`;
    
    // Only try OpenAI if it's available and properly configured
    if (!raceInfo || !raceInfo.name || !openai) {
      return fallbackDescription;
    }
    
    const prompt = `Skriv en omfattande, inspirerande och personlig beskrivning av ${raceInfo.name} loppet i ${raceInfo.location}. 
    
    Loppdetaljer:
    - Distans: ${raceInfo.distance}
    - Terräng: ${raceInfo.terrain || 'Varierad'}
    - Svårighetsgrad: ${raceInfo.difficulty || 'Medel'}
    
    Användarens mål: ${userAnswers.goal || 'fullfölja'}
    Användarens nivå: ${userAnswers.level || 'medel'}
    ${appleHealthContext}
    
    Skapa en detaljerad beskrivning som inkluderar:
    1. Loppets historia och prestige
    2. Banprofil och specifika utmaningar
    3. Väderförhållanden och bästa tid på året
    4. Publikstöd och atmosfär
    5. Unika aspekter som gör loppet speciellt
    6. Specifika förberedelser som krävs för detta lopp
    7. Personliga råd baserat på användarens mål och nivå
    8. Motiverande aspekter och vad som gör loppet minnesvärt
    9. Praktisk information om logistik och faciliteter
    10. Tips för första gången deltagare
    
    Använd HTML-formatering med <p>, <strong>, <em> taggar för struktur.
    Skriv minst 8-12 stycken med detaljerad information.
    Var personlig, inspirerande och ge konkreta, praktiska råd på svenska.`;
    
          const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Use more reliable model
        messages: [
          {
            role: "system",
            content: "Du är en erfaren löpcoach som beskriver lopp på ett personligt och inspirerande sätt."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.7,
        timeout: 15000 // 15 second timeout for longer responses
      });
    
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating enhanced race description:', error);
    // Always return fallback to prevent 500 errors
    const healthInsight = appleHealthContext ? 
      ` Med din nuvarande träningshistoria från Apple Health är du på god väg att nå ditt mål.` : '';
    
    return `${raceInfo.name} är ett fantastiskt lopp i ${raceInfo.location} som kommer utmana dig på bästa sätt. Med ${raceInfo.distance} av löpning genom ${raceInfo.terrain || 'varierad'} terräng blir detta en minnesvärd upplevelse.${healthInsight}`;
  }
};

// Test endpoint for generating dummy race plan data
router.get('/test-race-plan', (req, res) => {
  const dummyPlan = {
    race: {
      name: 'Stockholm Marathon',
      location: 'Stockholm, Sverige',
      distance: '42.195 km',
      date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
    },
    raceDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    raceDescription: `
      <p><strong>Stockholm Marathon</strong> är ett av Nordens mest prestigefyllda marathonlopp och erbjuder en unik upplevelse genom Sveriges vackra huvudstad.</p>
      
      <p>Banan sträcker sig genom Stockholms mest ikoniska områden, inklusive Gamla Stan, Östermalm och Södermalm. Löparna får uppleva stadens rika historia medan de springer förbi kungliga slott, pittoreska broar och vackra parker.</p>
      
      <p>Med över 20 000 deltagare årligen är detta ett lopp som kombinerar utmaning med en fantastisk atmosfär. Publikstödet är enastående, särskilt genom de centrala delarna av staden.</p>
      
      <p><strong>Banprofil:</strong> Relativt platt med några utmanande backar, perfekt för både nybörjare och erfarna löpare som siktar på personbästa.</p>
      
      <p>Baserat på din nuvarande träningshistoria från Apple Health (47 aktiviteter, 8.5km genomsnitt) är du på god väg att nå ditt mål. Din konsistenta träning med 4 pass per vecka ger en stark grund för marathonförberedelsen.</p>
    `,
    training: {
      overview: 'Personlig 16-veckors träningsplan för Stockholm Marathon med fokus på att fullfölja loppet',
      duration: '16 veckor',
      currentFitnessAssessment: {
        weeklyFrequency: 4,
        avgDistance: 8.5,
        longestRun: 18,
        avgPace: 330, // 5:30 per km in seconds
        fitnessLevel: 'Medel-avancerad'
      },
      phases: [
        {
          name: 'Grundfas',
          weeks: '1-4',
          focus: 'Bygga grundkondition och löpvolym',
          weeklyDistance: '35-45 km',
          keyWorkouts: [
            'Långpass: Öka gradvis från 12km till 18km',
            'Tempopass: 20-30 min i måttligt tempo',
            'Återhämtningspass: Lugna 5-8km pass'
          ],
          tips: 'Fokusera på att bygga en stabil bas. Öka inte volymen mer än 10% per vecka.'
        },
        {
          name: 'Utvecklingsfas', 
          weeks: '5-8',
          focus: 'Öka intensitet och uthållighet',
          weeklyDistance: '45-55 km',
          keyWorkouts: [
            'Intervaller: 6x1000m i 10K-tempo',
            'Tempopass: 30-40 min kontinuerligt',
            'Långpass: Upp till 25km med progressiv hastighet'
          ],
          tips: 'Introducera kvalitetspass. Lär dig känna ditt racetempo.'
        },
        {
          name: 'Specialfas',
          weeks: '9-12', 
          focus: 'Marathonspecifik träning',
          weeklyDistance: '55-65 km',
          keyWorkouts: [
            'Marathontempo: 15-20km i måltempo',
            'Långa intervaller: 4x2000m',
            'Långpass: 28-32km med simulering av racedag'
          ],
          tips: 'Öva på energistrategi och racetempo. Testa all utrustning.'
        },
        {
          name: 'Nedtrappning',
          weeks: '13-16',
          focus: 'Vila och förberedelse inför lopp',
          weeklyDistance: '40-25 km',
          keyWorkouts: [
            'Korta intervaller: 6x400m för att hålla benen skarpa',
            'Racetempo: 10-15 min för att känna tempot',
            'Återhämtning: Korta lugna pass'
          ],
          tips: 'Minska volymen men behåll intensiteten. Fokusera på återhämtning.'
        }
      ],
      weeklySchedule: {
        monday: { 
          type: 'Vila eller cross-training', 
          duration: '30-45 min',
          description: 'Fullständig vila, lätt yoga eller simning',
          intensity: 'Mycket låg',
          benefits: 'Återhämtning och flexibilitet'
        },
        tuesday: { 
          type: 'Intervaller/Kvalitetspass', 
          duration: '45-60 min',
          description: 'Strukturerad träning med uppvärmning, intervaller och nedvarvning',
          intensity: 'Hög',
          benefits: 'Förbättrar VO2 max och löpekonomi'
        },
        wednesday: { 
          type: 'Lätt återhämtningspass', 
          duration: '30-40 min',
          description: 'Lugnt tempo där du kan prata bekvämt',
          intensity: 'Låg',
          benefits: 'Aktiv återhämtning och aerob bas'
        },
        thursday: { 
          type: 'Tempopass', 
          duration: '40-50 min',
          description: 'Kontinuerlig löpning i måttligt hårt tempo',
          intensity: 'Medel-hög',
          benefits: 'Förbättrar laktattröskel och uthållighet'
        },
        friday: { 
          type: 'Vila eller styrketräning', 
          duration: '30-45 min',
          description: 'Vila eller lätt styrketräning fokus på core och ben',
          intensity: 'Låg',
          benefits: 'Förberedelse för helgens långa pass'
        },
        saturday: { 
          type: 'Långpass', 
          duration: '90-180 min',
          description: 'Veckans längsta pass, gradvis ökning av distans',
          intensity: 'Låg-medel',
          benefits: 'Bygger uthållighet och mental styrka'
        },
        sunday: { 
          type: 'Återhämtning eller cross-training', 
          duration: '25-35 min',
          description: 'Lätt jogging eller alternativ träning',
          intensity: 'Mycket låg',
          benefits: 'Aktiv återhämtning och variation'
        }
      },
      progressionPlan: {
        week1to4: 'Grundfas - Bygga bas och träningsvana',
        week5to8: 'Utvecklingsfas - Öka intensitet och volym gradvis', 
        week9to12: 'Specialfas - Marathonspecifik träning och racesimulering',
        week13to16: 'Nedtrappning - Minska volym, bibehåll intensitet'
      }
    },
    nutrition: {
      overview: 'Omfattande nutritionsplan anpassad för marathonträning',
      dailyCalories: 2600,
      adjustmentNote: 'Kaloribehov justerat baserat på din genomsnittliga förbränning: 65 kcal/km',
      macros: {
        carbs: '55-60% (358-390g)',
        protein: '15-20% (98-130g)',
        fat: '25-30% (72-87g)'
      },
      hydration: {
        daily: '3.5-4 liter',
        training: '500-750ml per timme träning',
        raceDay: 'Sluta dricka 30 min före start',
        signs: 'Kontrollera urinfärg - ska vara ljusgul'
      },
      mealTiming: {
        breakfast: {
          timing: '1-2 timmar före morgonträning',
          options: [
            'Havregrynsgröt med banan och honung',
            'Toast med jordnötssmör och sylt',
            'Smoothie med bär, banan och havredryck'
          ]
        },
        lunch: {
          timing: 'Inom 2 timmar efter träning',
          options: [
            'Quinoasallad med kyckling och grönsaker',
            'Laxsallad med sötpotatis',
            'Pastasallad med tonfisk och oliver'
          ]
        },
        dinner: {
          timing: '3-4 timmar före sömn',
          options: [
            'Grillad fisk med ris och ångade grönsaker',
            'Kycklingwok med jasminris',
            'Vegetarisk chili med quinoa'
          ]
        }
      },
      preworkout: {
        timing: '1-3 timmar före träning',
        options: [
          'Banan med jordnötssmör (30-60 min före)',
          'Havregrynsgröt med bär (2-3 timmar före)',
          'Energibar och kaffe (45 min före)'
        ]
      },
      postworkout: {
        timing: 'Inom 30 minuter efter träning',
        options: [
          'Proteinshake med banan och havregryn',
          'Chokladmjölk och smörgås',
          'Grekisk yoghurt med granola och bär'
        ],
        ratio: '3:1 kolhydrater till protein'
      },
      supplements: [
        'Multivitamin dagligen',
        'D-vitamin 1000 IE (vinter)',
        'Omega-3 2-3g per dag',
        'Magnesium 400mg (kvällar)',
        'Elektrolyter vid längre pass'
      ],
      raceWeek: {
        carbLoading: {
          timing: '3 dagar före loppet',
          strategy: 'Öka kolhydratintaget till 70% av totala kalorier',
          foods: ['Pasta', 'Ris', 'Potatis', 'Bröd', 'Frukt', 'Sportdryck']
        },
        breakfast: 'Havregrynsgröt med banan och honung 3 timmar före start',
        during: 'Energigel var 45:e minut från km 15, vatten vid varje vätskestration',
        avoid: ['Fiber', 'Fett', 'Nya livsmedel', 'Alkohol']
      }
    },
    equipment: [
      {
        category: 'Löpskor',
        items: [
          {
            item: 'Marathonskor (insprungna)',
            reason: 'Samma skor som du tränat i - inga experiment på racedagen. Minst 100km insprungna.',
            priority: 'Kritisk',
            tips: 'Ha reservpar hemma ifall något händer'
          },
          {
            item: 'Träningsskor för vardagspass',
            reason: 'Rotera mellan olika skor för att minska skaderisk',
            priority: 'Hög',
            tips: 'Byt var 600-800km'
          }
        ]
      },
      {
        category: 'Teknik & Navigation',
        items: [
          {
            item: 'GPS-klocka med pulsmätning',
            reason: 'För att hålla rätt pace och övervaka intensitet',
            priority: 'Hög',
            tips: 'Ladda kvällen innan, testa alla funktioner'
          },
          {
            item: 'Reservbatteri/powerbank',
            reason: 'För långa pass och racedag backup',
            priority: 'Medel',
            tips: 'Testa kompatibilitet i förväg'
          }
        ]
      },
      {
        category: 'Nutrition & Hydration',
        items: [
          {
            item: 'Energigels (8-10 st)',
            reason: 'Behövs för att upprätthålla energinivåerna under marathon',
            priority: 'Kritisk',
            tips: 'Testa samma märke under träning, ta första vid km 15'
          },
          {
            item: 'Elektrolyttabletter',
            reason: 'Kompensera för saltförlust under långa pass',
            priority: 'Hög',
            tips: 'En tablett per 500ml vatten'
          },
          {
            item: 'Löpbälte eller väst',
            reason: 'Bära nutrition och vätskor under träning',
            priority: 'Medel',
            tips: 'Öva med på alla långpass'
          }
        ]
      },
      {
        category: 'Kläder',
        items: [
          {
            item: 'Löparbyxor/shorts (testade)',
            reason: 'Bekväma och testade under långa träningspass, förhindrar skav',
            priority: 'Kritisk',
            tips: 'Använd bodyglide/vaselin på långa pass'
          },
          {
            item: 'Teknisk t-shirt/linne',
            reason: 'Fukttransporterande material för komfort',
            priority: 'Kritisk',
            tips: 'Undvik bomull, välj testat material'
          },
          {
            item: 'Löpstrumpor (seamless)',
            reason: 'Förhindra blåsor och skav',
            priority: 'Hög',
            tips: 'Dubbelväggiga strumpor för extra skydd'
          },
          {
            item: 'Löpjacka/vindtålig',
            reason: 'För dåligt väder och uppvärmning',
            priority: 'Medel',
            tips: 'Lätt att knyta runt midjan'
          }
        ]
      },
      {
        category: 'Tillbehör',
        items: [
          {
            item: 'Solglasögon',
            reason: 'Skydd mot sol och vind, särskilt på öppna sträckor',
            priority: 'Medel',
            tips: 'Anti-dimma och säkert fäste'
          },
          {
            item: 'Keps/pannband',
            reason: 'Skydd mot sol och håller svett ur ögonen',
            priority: 'Medel',
            tips: 'Testa under varma träningspass'
          },
          {
            item: 'Foam roller',
            reason: 'Daglig återhämtning och förebygga skador',
            priority: 'Hög',
            tips: 'Använd 10-15 min efter varje pass'
          }
        ]
      }
    ],
    lifestyle: {
      sleep: {
        target: '7-9 timmar per natt',
        tips: [
          'Gå och lägg dig samma tid varje kväll (senast 22:30)',
          'Undvik skärmar 1 timme före sömn',
          'Håll sovrummet svalt (16-18°C) och mörkt',
          'Använd sovmask och öronproppar vid behov',
          'Undvik koffein efter 14:00'
        ],
        raceWeek: 'Sträva efter 8-9 timmar, gå till sängs 30 min tidigare',
        trackingTips: 'Använd sömnapp eller klocka för att följa sömnkvalitet'
      },
      stressManagement: {
        techniques: [
          'Meditation 10-15 min dagligen (Headspace/Calm)',
          'Djupandning före träning (4-7-8 tekniken)',
          'Naturvandring på vilodagar',
          'Journalskrivning för att bearbeta träningsstress'
        ],
        raceNerves: [
          'Visualisera loppet positivt',
          'Fokusera på processen, inte resultatet',
          'Prata med erfarna marathonlöpare',
          'Ha en plan B för racedag'
        ]
      },
      crossTraining: [
        {
          activity: 'Simning',
          frequency: '1x/vecka',
          benefits: 'Låg belastning, hela kroppen, bra återhämtning'
        },
        {
          activity: 'Cykling',
          frequency: '1x/vecka',
          benefits: 'Bygger benmuskulatur utan löpbelastning'
        },
        {
          activity: 'Yoga',
          frequency: '2x/vecka',
          benefits: 'Flexibilitet, balans och mental träning'
        },
        {
          activity: 'Styrketräning',
          frequency: '2x/vecka',
          benefits: 'Förebygger skador, förbättrar löpekonomi'
        }
      ],
      workLifeBalance: {
        trainingTime: 'Morgon (06:00-07:30)',
        tips: [
          'Schemalägg träning som viktiga möten i kalendern',
          'Förbered träningskläder kvällen innan',
          'Ha backup-plan för dåligt väder (löpband/gym)',
          'Kommunicera träningsschema med familj/partner',
          'Använd lunchtid för korta återhämtningspass'
        ],
        travelTips: [
          'Packa löpkläder först',
          'Research löpspår på destinationen',
          'Anpassa träningstider till nya tidszoner'
        ]
      }
    },
    raceStrategy: {
      overview: 'Detaljerad strategi för Stockholm Marathon baserat på ditt mål att fullfölja',
      pacing: {
        strategy: 'Konservativ start - starta 10-15 sekunder per km långsammare än målpace',
        targetPace: '5:30-5:45 min/km',
        splits: {
          km0to10: '5:45 min/km - Känn dig lätt och bekväm',
          km10to21: '5:35 min/km - Hitta din rytm',
          km21to30: '5:30 min/km - Bibehåll fokus',
          km30to42: '5:25-5:40 min/km - Lyssna på kroppen'
        },
        heartRate: 'Håll 75-85% av maxpuls första halvan, sedan efter känsla'
      },
      mentalStrategy: [
        {
          phase: 'Km 0-10',
          focus: 'Dela upp loppet i 4 delar à 10.5 km - fokusera på första delen',
          mantra: '"Jag är stark och förberedd"'
        },
        {
          phase: 'Km 10-21',
          focus: 'Använd publikens energi för att hålla motivationen uppe',
          mantra: '"Ett steg i taget, jag njuter av resan"'
        },
        {
          phase: 'Km 21-32',
          focus: 'Den mentala utmaningen börjar - fokusera på teknik',
          mantra: '"Jag har tränat för detta moment"'
        },
        {
          phase: 'Km 32-42',
          focus: 'Visualisera målgången, tänk på alla som hejar',
          mantra: '"Jag är en marathonlöpare"'
        }
      ],
      nutritionStrategy: {
        preRace: '1 energigel 15 min före start',
        during: [
          'Km 15: Första energigel + vatten',
          'Km 25: Energigel + sportdryck',
          'Km 32: Energigel + vatten',
          'Km 38: Sista energigel om nödvändigt'
        ],
        hydration: 'Drick vid varje vätskestration (var 5km), små klunkar',
        signs: 'Om magen känns dålig - hoppa över nästa gel, bara vatten'
      },
      contingencyPlan: [
        {
          problem: 'Kramper i vaderna',
          solution: 'Sakta ner tempot 20-30 sek/km, stretcha lätt under gång'
        },
        {
          problem: 'Magproblem',
          solution: 'Hoppa över nästa energigel, drick bara vatten, gå om nödvändigt'
        },
        {
          problem: 'Tempot känns för hårt efter km 20',
          solution: 'Sänk med 15-20 sek/km, fokusera på att fullfölja'
        },
        {
          problem: 'Mental kris runt km 30',
          solution: 'Tänk på alla träningspass, visualisera målgången, småprata med andra löpare'
        }
      ],
      raceDay: {
        timeline: {
          'T-3h': 'Vakna, drick vatten, ät testad frukost',
          'T-2h': 'Sista toalettbesök hemma, kolla väder',
          'T-1h': 'Ankomst till startområdet, hämta startnummer',
          'T-30min': 'Dynamisk uppvärmning, sista toalettbesök',
          'T-15min': 'Ta energigel, gå till startfålla',
          'T-5min': 'Mental förberedelse, djupandning'
        },
        checklist: [
          'Startnummer fäst på tröjan',
          'Timing chip på skon',
          'Energigels i bälte/fickor',
          'Klocka laddad och inställd',
          'Väderpassande kläder',
          'Solglasögon om soligt'
        ]
      }
    },
    recoveryProtocol: {
      overview: 'Omfattande återhämtningsplan för optimal prestanda och skadeförebyggning',
      immediate: {
        first30min: [
          'Drick 500ml vätskeersättning',
          'Ät energibar eller banan',
          'Promenera 10-15 minuter för att förhindra stelhet',
          'Stretcha lätt om möjligt'
        ],
        first2hours: [
          'Ät fullständig måltid med kolhydrater och protein (3:1 ratio)',
          'Fortsätt dricka vätskor',
          'Ta en varm dusch eller bad',
          'Höj benen 15-20 minuter'
        ]
      },
      daily: {
        stretching: '15-20 min efter varje träningspass',
        foamRolling: '10-15 min dagligen, fokus på vader, hamstrings, IT-band',
        hydration: 'Drick tills urinen är ljusgul',
        nutrition: 'Ät inom 30 min efter träning',
        sleep: 'Prioritera 8+ timmar sömn'
      },
      weekly: {
        massage: 'Professionell massage eller självmassage 1x/vecka',
        sauna: 'Bastu 15-20 min 1-2x/vecka för återhämtning',
        activeRecovery: 'Lätt cykling, simning eller yoga på vilodagar',
        assessment: 'Utvärdera energinivå, muskelvärk och motivation'
      },
      postMarathon: {
        day1: 'Vila eller 15 min lätt promenad',
        day2: '20-30 min lätt jogging om kroppen känns bra',
        day3: 'Vila eller cross-training (simning/cykling)',
        day4: '30-40 min lätt löpning',
        day5: 'Vila',
        day6: '45-60 min lugn löpning',
        day7: 'Vila eller lätt aktivitet',
        generalRule: 'En dag lätt träning per mil (6.4km) du sprang hårt'
      },
      warningSignals: [
        'Konstant trötthet trots vila',
        'Förhöjd vilopuls på morgonen (+10 slag/min)',
        'Irritabilitet och dålig humör',
        'Försämrad prestanda under träning',
        'Ihållande muskelvärk (>3 dagar)',
        'Sömnproblem',
        'Minskad aptit'
      ],
      actionPlan: 'Om 3+ varningssignaler: Ta 2-3 extra vilodagar och konsultera coach/läkare'
    },
    appleHealthIntegration: {
      hasData: true,
      summary: {
        totalActivities: 47,
        avgWeeklyDistance: 32,
        currentFitnessLevel: 'Avancerad',
        recentTrends: 'Positiv utveckling senaste månaden',
        recommendedAdjustments: [
          'Fortsätt med nuvarande frekvens',
          'Öka långpassdistansen gradvis',
          'Inkludera mer tempoträning'
        ]
      },
      tracking: {
        metrics: [
          'Veckovolym (km)',
          'Genomsnittligt tempo',
          'Hjärtfrekvens zoner',
          'Återhämtningstid',
          'Sömnkvalitet',
          'Vilopuls'
        ],
        goals: [
          'Bibehåll 4+ pass per vecka',
          'Öka veckovolym till 60km gradvis',
          'Genomför 32km långpass innan nedtrappning'
        ]
      }
    }
  };

  res.json({
    success: true,
    plan: dummyPlan,
    message: 'Comprehensive dummy race plan generated for testing',
    timestamp: new Date()
  });
});

module.exports = router;