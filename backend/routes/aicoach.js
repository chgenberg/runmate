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
      primaryGoal,
      currentLevel,
      weeklyHours,
      currentDiet,
      sleepHours,
      injuries,
      motivation,
      equipment,
      lifestyle,
      specificTarget
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create comprehensive AI coach profile
    const comprehensiveProfile = {
      ...req.body,
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    user.aiCoachProfile = comprehensiveProfile;
    await user.save();

    let comprehensivePlan = {};

    // Generate comprehensive plan with OpenAI if available
    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `Du är världens bästa personliga tränare och nutritionist med 20+ års erfarenhet. Du har coachat olympiska atleter, hjälpt tusentals människor nå sina mål, och har djup kunskap inom:

- Träningsfysiologi och periodisering
- Näringslära och metabolisme  
- Psykologi och beteendeförändring
- Skadeförebyggning och rehabilitering
- Livsstilsoptimering och stresshantering

Din filosofi: Varje person är unik och förtjänar en helt personlig plan som passar deras liv, mål och förutsättningar. Du skapar holistiska program som är hållbara på lång sikt.

Skapa en KOMPLETT, DETALJERAD och PERSONLIG tränings- och kostplan på svenska. Planen ska vara praktisk, specifik och inspirerande. Inkludera:

1. TRÄNINGSSCHEMA (4 veckor framåt, dag för dag)
2. KOSTPLAN (veckomeny med recept och makron)
3. LIVSSTILSRÅD (sömn, stress, återhämtning)
4. UPPFÖLJNING (mål, mätningar, milstolpar)

Anpassa allt efter användarens specifika situation och mål.`
            },
            {
              role: "user", 
              content: `Skapa min personliga plan baserat på:

MINA MÅL: ${primaryGoal}
NUVARANDE NIVÅ: ${currentLevel}
TRÄNING PER VECKA: ${weeklyHours} timmar
NUVARANDE KOST: ${currentDiet}
SÖMN: ${sleepHours} timmar/natt
SKADOR/BEGRÄNSNINGAR: ${Array.isArray(injuries) ? injuries.join(', ') : injuries}
MOTIVATION: ${motivation}
TILLGÄNGLIG UTRUSTNING: ${Array.isArray(equipment) ? equipment.join(', ') : equipment}
LIVSSTIL: ${lifestyle}
SPECIFIKT MÅL: ${specificTarget || 'Inget specifikt mål angivet'}

Namn: ${user.firstName}

Skapa en detaljerad plan som hjälper mig nå mina mål på det mest effektiva sättet!`
            }
          ],
          max_tokens: 4000,
          temperature: 0.7,
        });

        const aiResponse = completion.choices[0].message.content;
        
        // Parse and structure the AI response
        comprehensivePlan = {
          aiGenerated: true,
          rawPlan: aiResponse,
          summary: {
            primaryFocus: primaryGoal,
            weeklyCommitment: `${weeklyHours} timmar/vecka`,
            keyStrategies: extractKeyStrategies(aiResponse),
            expectedResults: extractExpectedResults(aiResponse)
          },
          trainingPlan: extractTrainingPlan(aiResponse),
          nutritionPlan: extractNutritionPlan(aiResponse),
          lifestylePlan: extractLifestylePlan(aiResponse),
          progressTracking: extractProgressTracking(aiResponse)
        };

      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError);
        // Fallback to structured plan
        comprehensivePlan = generateStructuredPlan(req.body, user);
      }
    } else {
      // Generate structured plan without OpenAI
      comprehensivePlan = generateStructuredPlan(req.body, user);
    }

    res.json({
      success: true,
      plan: comprehensivePlan,
      profile: comprehensiveProfile,
      createdAt: new Date()
    });

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
    primaryGoal,
    currentLevel,
    weeklyHours,
    currentDiet,
    sleepHours,
    injuries,
    motivation,
    equipment,
    lifestyle,
    specificTarget
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
    trainingPlan: generateBasicTrainingPlan(primaryGoal, currentLevel, weeklyHours, equipment),
    nutritionPlan: generateBasicNutritionPlan(primaryGoal, currentDiet),
    lifestylePlan: generateBasicLifestylePlan(sleepHours, lifestyle),
    progressTracking: generateBasicProgressTracking(primaryGoal),
    rawPlan: `Personlig tränings- och kostplan för ${user.firstName}

TRÄNINGSSCHEMA:
${generateBasicTrainingPlan(primaryGoal, currentLevel, weeklyHours, equipment)}

KOSTPLAN:
${generateBasicNutritionPlan(primaryGoal, currentDiet)}

LIVSSTILSRÅD:
${generateBasicLifestylePlan(sleepHours, lifestyle)}

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

module.exports = router;