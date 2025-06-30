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

// Chat endpoint for AI conversations
router.post('/chat', protect, async (req, res) => {
  try {
    const { message, context } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let response;
    
    // Use OpenAI if available, otherwise fallback to simple responses
    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `Du är ARIA - en professionell AI-löpcoach. Du svarar på svenska och ger konkreta, praktiska råd baserat på vetenskap och beprövad erfarenhet. Håll svaren personliga och uppmuntrande.

              Användarens profil:
              - Namn: ${user.firstName}
              - Träningsnivå: ${user.activityLevel || 'okänd'}
              - AI Coach profil: ${user.aiCoachProfile ? JSON.stringify(user.aiCoachProfile) : 'Inte konfigurerad'}
              
              Fokusera på praktiska råd för löpning, återhämtning, nutrition och skadeförebyggning. Använd emojis sparsamt och naturligt.`
            },
            {
              role: "user",
              content: message
            }
          ],
          max_tokens: 300,
          temperature: 0.7,
        });

        response = completion.choices[0].message.content;
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError);
        // Fallback to simple response if OpenAI fails
        response = generateAIAdvice(message, context, user);
      }
    } else {
      // Use fallback responses when OpenAI is not available
      response = generateAIAdvice(message, context, user);
    }

    res.json({ 
      message: response,
      timestamp: new Date(),
      enhanced: !!openai
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
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

    // Generate personalized plan based on form data
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
          goal: goalMap[primaryGoal] || 'Förbättra hälsa & kondition',
          duration: '12 veckor',
          startDate: new Date().toLocaleDateString('sv-SE'),
          primaryFocus: primaryGoal || 'health',
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
              { day: 'Måndag', type: 'Lätt löpning', duration: '30 min', pace: '6:00/km', description: 'Lugn start på veckan' },
              { day: 'Tisdag', type: 'Vila', duration: '-', pace: '-', description: 'Återhämtning' },
              { day: 'Onsdag', type: 'Intervaller', duration: '40 min', pace: '5:00-5:30/km', description: '5x3 min med 2 min vila' },
              { day: 'Torsdag', type: 'Lätt löpning', duration: '25 min', pace: '6:00/km', description: 'Återhämtningslöpning' },
              { day: 'Fredag', type: 'Vila', duration: '-', pace: '-', description: 'Förbered för helgen' },
              { day: 'Lördag', type: 'Långpass', duration: '60 min', pace: '5:45/km', description: 'Bygger uthållighet' },
              { day: 'Söndag', type: 'Styrka', duration: '30 min', pace: '-', description: 'Fokus på core och ben' }
            ],
            phases: [
              {
                name: 'Grundfas (Vecka 1-4)',
                focus: 'Bygga uthållighet och vana',
                weeklyDistance: '20-25 km',
                keyWorkouts: [
                  'Lätta löpningar 3-4 ggr/vecka',
                  'Ett långpass per vecka (45-60 min)',
                  'Styrketräning 1-2 ggr/vecka'
                ]
              },
              {
                name: 'Uppbyggnadsfas (Vecka 5-8)',
                focus: 'Öka distans och tempo',
                weeklyDistance: '25-35 km',
                keyWorkouts: [
                  'Intervallträning 1 gång/vecka',
                  'Tempolöpning 1 gång/vecka',
                  'Långpass upp till 90 min'
                ]
              },
              {
                name: 'Toppfas (Vecka 9-12)',
                focus: 'Maximera prestation',
                weeklyDistance: '35-40 km',
                keyWorkouts: [
                  'Snabbdistansträning',
                  'Tävlingstempo-pass',
                  'Tapering sista veckan'
                ]
              }
            ],
            progressionPlan: 'Öka distansen med max 10% per vecka',
            recoveryProtocol: 'Minst 2 vilodagar per vecka, stretching efter varje pass'
          },
          nutrition: {
            dailyCalories: 2400,
            macros: {
              carbs: '55%',
              protein: '20%',
              fat: '25%'
            },
            hydration: '2.5-3L per dag, extra 500ml per träningstimme',
            preworkout: {
              timing: '1-2 timmar innan',
              options: [
                'Havregrynsgröt med banan och honung',
                'Toast med jordnötssmör och sylt',
                'Smoothie med bär och yoghurt'
              ]
            },
            postworkout: {
              timing: 'Inom 30 minuter',
              options: [
                'Proteinshake med banan',
                'Grekisk yoghurt med granola',
                'Kycklingsmörgås med grönsaker'
              ]
            },
            supplements: [
              'D-vitamin: 2000 IE dagligen',
              'Omega-3: 1000mg dagligen',
              'Magnesium: 300mg före sömn'
            ],
            mealPlan: {
              breakfast: 'Havregrynsgröt med bär, nötter och proteinpulver',
              lunch: 'Kycklingsallad med quinoa och grönsaker',
              dinner: 'Lax med sötpotatis och broccoli',
              snacks: ['Äpple med mandlar', 'Grekisk yoghurt med honung']
            }
          },
          lifestyle: {
            sleep: {
              hours: '7-9 timmar per natt',
              routine: 'Lägg dig senast 22:30, vakna 06:00',
              tips: [
                'Undvik skärmar 1 timme före sömn',
                'Håll sovrummet svalt (18-20°C)',
                'Använd mörkläggningsgardiner'
              ]
            },
            stressManagement: [
              '10 min meditation dagligen',
              'Djupandning 5 min före träning',
              'Yoga 1 gång/vecka'
            ],
            crossTraining: [
              'Simning 1 gång/vecka för aktiv återhämtning',
              'Cykling som alternativ vid skador',
              'Yoga för flexibilitet'
            ],
            injuryPrevention: [
              'Dynamisk uppvärmning före alla pass',
              'Foam rolling 10 min dagligen',
              'Stärk höfter och core regelbundet'
            ]
          },
          matches: {
            score: 95,
            topMatches: [
              {
                name: 'Emma Johansson',
                matchScore: 98,
                reason: 'Samma träningsmål och tempo',
                location: 'Stockholm',
                distance: '5 km bort'
              },
              {
                name: 'Marcus Andersson',
                matchScore: 94,
                reason: 'Gillar morgonlöpning',
                location: 'Solna',
                distance: '8 km bort'
              },
              {
                name: 'Sofia Lindberg',
                matchScore: 92,
                reason: 'Tränar för samma lopp',
                location: 'Täby',
                distance: '12 km bort'
              },
              {
                name: 'Johan Nilsson',
                matchScore: 90,
                reason: 'Liknande träningsschema',
                location: 'Bromma',
                distance: '10 km bort'
              },
              {
                name: 'Lisa Eriksson',
                matchScore: 88,
                reason: 'Söker träningspartner',
                location: 'Kista',
                distance: '6 km bort'
              }
            ]
          },
          progress: {
            weeklyMetrics: [
              'Distans per vecka',
              'Genomsnittligt tempo',
              'Total träningstid',
              'Höjdmeter'
            ],
            monthlyAssessments: [
              'Cooper-test (12 min löpning)',
              '5K tidtagning',
              'Vilopuls mätning',
              'Kroppsmätningar'
            ],
            milestones: [
              { week: 4, goal: 'Klara 5K utan stopp' },
              { week: 8, goal: 'Förbättra 5K-tid med 2 minuter' },
              { week: 12, goal: 'Klara 10K under 60 minuter' }
            ]
          },
          aiEnhancements: `Baserat på din profil rekommenderar jag följande förbättringar:

1. **Progressiv belastning**: Börja med 3 löppass per vecka och öka gradvis till 4-5 pass när kroppen anpassat sig.

2. **Tempovariation**: Inkludera fartlek-träning varannan vecka för att förbättra både aerob och anaerob kapacitet.

3. **Återhämtningsfokus**: Lägg till 15 minuters stretching efter varje pass och överväg massage var tredje vecka.

4. **Näringsoptimering**: Fokusera på att äta tillräckligt med kolhydrater före längre pass och protein inom 30 minuter efter träning.

5. **Sömnkvalitet**: Prioritera 8 timmars sömn per natt för optimal återhämtning och prestation.`,
          generatedAt: new Date(),
          planId: `plan_${Date.now()}`,
          enhanced: false
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
        createdAt: new Date()
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
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `Du är en professionell löpcoach och träningsexpert. Du svarar på svenska och ger konkreta, praktiska råd baserat på vetenskap och beprövad erfarenhet. Håll svaren kortfattade men informativa (max 150 ord). 

              Användarens profil:
              - Namn: ${user.firstName}
              - Träningsnivå: ${user.activityLevel || 'okänd'}
              - AI Coach profil: ${user.aiCoachProfile ? JSON.stringify(user.aiCoachProfile) : 'Inte konfigurerad'}
              
              Fokusera på praktiska råd för löpning, återhämtning, nutrition och skadeförebyggning.`
            },
            {
              role: "user",
              content: question
            }
          ],
          max_tokens: 200,
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

// Smart training plan generation
function generateTrainingPlan(profile, recentActivities) {
  const { 
    targetDistance, 
    targetTime, 
    deadline, 
    currentLevel, 
    weeklyVolume, 
    restDays, 
    priorities 
  } = profile;

  const weeksToGoal = Math.ceil((new Date(deadline) - new Date()) / (7 * 24 * 60 * 60 * 1000));
  const baseWeeklyVolume = Math.min(weeklyVolume || 30, 50); // Cap at 50km/week
  
  // Calculate current fitness level from recent activities
  const avgDistance = recentActivities.length > 0 
    ? recentActivities.reduce((sum, act) => sum + (act.distance || 0), 0) / recentActivities.length 
    : 5;
  
  const avgPace = recentActivities.length > 0
    ? recentActivities.reduce((sum, act) => sum + (act.averagePace || 360), 0) / recentActivities.length
    : 360; // 6:00 min/km default

  // Generate 12-week progressive plan
  const weeks = [];
  for (let week = 1; week <= Math.min(weeksToGoal, 12); week++) {
    const weeklyDistance = calculateWeeklyDistance(baseWeeklyVolume, week, weeksToGoal);
    const workouts = generateWeeklyWorkouts(weeklyDistance, avgPace, priorities, restDays);
    
    weeks.push({
      week,
      weeklyDistance,
      workouts,
      focus: getWeeklyFocus(week, priorities),
      recoveryEmphasis: week % 4 === 0 ? 'high' : 'normal'
    });
  }

  return {
    totalWeeks: weeks.length,
    targetGoal: `${targetDistance} på ${formatTime(targetTime)}`,
    currentFitness: {
      avgDistance: Math.round(avgDistance * 10) / 10,
      avgPace: formatPace(avgPace)
    },
    weeks,
    keyPrinciples: [
      '80/20 regel - 80% lätt, 20% hårt',
      'Progressiv överbelastning',
      'Individuell återhämtning',
      'Skadeförebyggande styrketräning'
    ]
  };
}

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

function generateStructuredPlan(formData, user) {
  // Fallback structured plan when OpenAI is not available
  const {
    // Basic profile
    age,
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

module.exports = router;