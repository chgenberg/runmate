import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  Mountain,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Activity,
  Heart,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';
import AILoadingScreen from './AILoadingScreen';

const RaceCoachOnboarding = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [races, setRaces] = useState([]);
  const [filteredRaces, setFilteredRaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRace, setSelectedRace] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingRaces, setLoadingRaces] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const navigate = useNavigate();

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load races on mount
  useEffect(() => {
    const loadRaces = async () => {
      try {
        console.log('Loading races from API...');
        const response = await api.get('/races');
        console.log('API response:', response.data);
        
        if (response.data.success && response.data.races) {
          setRaces(response.data.races);
          setFilteredRaces(response.data.races);
          console.log(`Loaded ${response.data.races.length} races`);
        } else {
          console.error('API response missing success or races:', response.data);
        }
      } catch (error) {
        console.error('Error loading races:', error);
        console.error('Error details:', error.response?.data || error.message);
        
        // Fallback data if API fails
        const fallbackRaces = [
          {
            id: 'boston-marathon',
            name: 'Boston Marathon',
            location: 'Boston, USA',
            distance: '42.195 km',
            difficulty: 'Advanced',
            ranking: 1
          },
          {
            id: 'stockholm-marathon',
            name: 'Stockholm Marathon',
            location: 'Stockholm, Sweden',
            distance: '42.195 km',
            difficulty: 'Intermediate',
            ranking: 2
          }
        ];
        setRaces(fallbackRaces);
        setFilteredRaces(fallbackRaces);
      } finally {
        setLoadingRaces(false);
      }
    };
    
    if (isOpen && isClient) {
      loadRaces();
    }
  }, [isOpen, isClient]);

  // Filter races based on search
  useEffect(() => {
    const filtered = races.filter(race => {
      const name = race.name || '';
      const location = race.location || '';
      const searchLower = searchTerm.toLowerCase();
      
      return name.toLowerCase().includes(searchLower) ||
             location.toLowerCase().includes(searchLower);
    });
    setFilteredRaces(filtered);
  }, [searchTerm, races]);

  // Count races by type
  const countRacesByType = (type) => {
    return races.filter(race => {
      const raceType = race.type?.toLowerCase() || '';
      const distance = race.distance?.toLowerCase() || '';
      const terrain = race.terrain?.toLowerCase() || '';
      
      switch(type) {
        case 'marathon':
          return raceType.includes('marathon') && !raceType.includes('ultra') && !raceType.includes('halv');
        case 'halvmarathon':
          return raceType.includes('halvmarathon') || distance.includes('21');
        case 'ultra':
          return raceType.includes('ultra') || (distance.includes('km') && parseInt(distance) > 50);
        case 'trail':
          return raceType.includes('trail') || terrain.includes('trail') || terrain.includes('berg');
        default:
          return true;
      }
    }).length;
  };

  // Count races by location
  const countRacesByLocation = (location) => {
    return races.filter(race => {
      const raceLocation = race.location?.toLowerCase() || '';
      const tags = race.searchTags?.map(t => t.toLowerCase()) || [];
      
      switch(location) {
        case 'sverige':
          return raceLocation.includes('sverige') || tags.includes('sverige');
        case 'usa':
          return raceLocation.includes('usa') || tags.includes('usa') || tags.includes('amerika');
        case 'europa':
          return ['england', 'frankrike', 'tyskland', 'schweiz', 'italien', 'spanien', 'norge'].some(country => 
            raceLocation.includes(country) || tags.includes(country)
          );
        case 'asien':
          return ['japan', 'kina', 'nepal', 'indien'].some(country => 
            raceLocation.includes(country) || tags.includes(country)
          );
        default:
          return true;
      }
    }).length;
  };

  const questions = [
    // 1. Loppet du satsar på
    {
      id: 'race_picker',
      type: 'race_picker',
      category: 'race_info',
      question: 'Vilket lopp tränar du inför?',
      description: '🔍 Sök eller välj bland topp 50-loppen'
    },
    {
      id: 'race_location_type',
      type: 'single',
      category: 'race_info',
      question: 'Var hålls loppet?',
      options: [
        { value: 'city', label: '🏙️ Stad', icon: '🏙️' },
        { value: 'trail', label: '🌳 Skog/Trail', icon: '🌳' },
        { value: 'altitude', label: '🏔️ Höjd (>1 500 m)', icon: '🏔️' }
      ]
    },
    {
      id: 'race_date',
      type: 'date_picker',
      category: 'race_info',
      question: 'När går startskottet?',
      description: '📅 Ange exakt datum → appen visar automatiskt X veckor kvar'
    },

    // 2. Mål & motivation
    {
      id: 'main_goal',
      type: 'single',
      category: 'goals',
      question: 'Vad är ditt huvudmål?',
      options: [
        { value: 'finish', label: '🎯 Bara gå i mål', icon: '🎯' },
        { value: 'enjoy', label: '😊 Njuta', icon: '😊' },
        { value: 'pb', label: '⚡️ Personbästa', icon: '⚡' },
        { value: 'qualify', label: '🚀 Kvala till större lopp', icon: '🚀' }
      ]
    },
    {
      id: 'motivation',
      type: 'single',
      category: 'goals',
      question: 'Vad motiverar dig mest?',
      options: [
        { value: 'times', label: '🏅 Tider & medaljer', icon: '🏅' },
        { value: 'community', label: '👯‍♀️ Gemenskap', icon: '👯‍♀️' },
        { value: 'mental', label: '🧠 Mental hälsa', icon: '🧠' },
        { value: 'experience', label: '🌍 Upplevelsen', icon: '🌍' }
      ]
    },
    {
      id: 'coaching_style',
      type: 'single',
      category: 'goals',
      question: 'Hur vill du att coachen peppar dig?',
      options: [
        { value: 'data', label: '📈 Datadrivet', icon: '📈' },
        { value: 'positive', label: '🤗 Positiv boost', icon: '🤗' },
        { value: 'gamification', label: '🎮 Gamification', icon: '🎮' },
        { value: 'mindful', label: '🧘‍♂️ Mindful ton', icon: '🧘‍♂️' }
      ]
    },

    // 3. Din nuvarande kondition
    {
      id: 'current_fitness',
      type: 'single',
      category: 'fitness',
      question: 'Hur skulle du beskriva din form just nu?',
      options: [
        { value: 'beginner', label: '🌱 Nybörjare (kan springa 5 km)', icon: '🌱' },
        { value: 'recreational', label: '🏃 Motionär', icon: '🏃' },
        { value: 'experienced', label: '💪 Erfaren', icon: '💪' },
        { value: 'elite', label: '🐐 Elitnära', icon: '🐐' }
      ]
    },
    {
      id: 'longest_recent_run',
      type: 'single',
      category: 'fitness',
      question: 'Din längsta löptur senaste månaden?',
      options: [
        { value: '<5', label: '🏁 <5 km', icon: '🏁' },
        { value: '5-10', label: '5–10 km', icon: '🏃‍♂️' },
        { value: '10-15', label: '10–15 km', icon: '🏃‍♀️' },
        { value: '15-21', label: '15–21 km', icon: '🏅' },
        { value: '>21', label: '🏆 >21 km', icon: '🏆' }
      ]
    },
    {
      id: 'average_pace',
      type: 'single',
      category: 'fitness',
      question: 'Snittfart på distanspass (min/km)?',
      options: [
        { value: '>7:00', label: '🐢 >7:00', icon: '🐢' },
        { value: '6:00-7:00', label: '🙂 6:00–7:00', icon: '🙂' },
        { value: '5:00-6:00', label: '😎 5:00–6:00', icon: '😎' },
        { value: '<5:00', label: '⚡ <5:00', icon: '⚡' }
      ]
    },

    // 4. Tillgänglig träningstid
    {
      id: 'weekly_runs',
      type: 'single',
      category: 'training_time',
      question: 'Hur många löppass kan du lägga per vecka?',
      options: [
        { value: '3', label: '📅 3', icon: '📅' },
        { value: '4', label: '📆 4', icon: '📆' },
        { value: '5', label: '🗓️ 5', icon: '🗓️' },
        { value: '6+', label: '🚀 6+', icon: '🚀' }
      ]
    },
    {
      id: 'long_run_duration',
      type: 'single',
      category: 'training_time',
      question: 'Hur långa får långpassen bli?',
      options: [
        { value: '<60', label: '⌛ <60 min', icon: '⌛' },
        { value: '60-90', label: '60–90 min', icon: '⏰' },
        { value: '90-120', label: '90–120 min', icon: '⏱️' },
        { value: '>120', label: '🕒 >120 min', icon: '🕒' }
      ]
    },
    {
      id: 'preferred_time',
      type: 'multiple',
      category: 'training_time',
      question: 'Vilka tider på dygnet föredrar du att träna?',
      options: [
        { value: 'morning', label: '🌅 Morgon', icon: '🌅' },
        { value: 'lunch', label: '🕛 Lunch', icon: '🕛' },
        { value: 'afternoon', label: '🌆 Eftermiddag', icon: '🌆' },
        { value: 'evening', label: '🌙 Kväll', icon: '🌙' },
        { value: 'flexible', label: '🎲 Flexibelt', icon: '🎲' }
      ]
    },

    // 5. Tränings- & skadehistoria
    {
      id: 'running_experience',
      type: 'single',
      category: 'history',
      question: 'Hur länge har du löptränat regelbundet?',
      options: [
        { value: '<6m', label: '⏳ <6 mån', icon: '⏳' },
        { value: '6-12m', label: '6–12 mån', icon: '📅' },
        { value: '1-3y', label: '1–3 år', icon: '📆' },
        { value: '3y+', label: '3+ år', icon: '🏆' }
      ]
    },
    {
      id: 'injury_count',
      type: 'single',
      category: 'history',
      question: 'Antal skador senaste året?',
      options: [
        { value: '0', label: '🌟 0', icon: '🌟' },
        { value: '1', label: '😅 1', icon: '😅' },
        { value: '2-3', label: '😬 2–3', icon: '😬' },
        { value: '4+', label: '😖 4+', icon: '😖' }
      ]
    },
    {
      id: 'current_injuries',
      type: 'multiple',
      category: 'history',
      question: 'Aktuella skador eller besvär?',
      options: [
        { value: 'none', label: '🚫 Inga', icon: '🚫' },
        { value: 'knee', label: '🤕 Knä', icon: '🤕' },
        { value: 'foot', label: '🦶 Fot/ankel', icon: '🦶' },
        { value: 'muscle', label: '🦵 Muskel', icon: '🦵' },
        { value: 'other', label: 'Annat', icon: '🩹' }
      ]
    },

    // 6. Hälsa & återhämtning
    {
      id: 'sleep_hours',
      type: 'single',
      category: 'health',
      question: 'Sömn per natt i snitt?',
      options: [
        { value: '<6', label: '💤 <6 h', icon: '💤' },
        { value: '6-7', label: '😌 6–7 h', icon: '😌' },
        { value: '7-8', label: '😴 7–8 h', icon: '😴' },
        { value: '>8', label: '😇 >8 h', icon: '😇' }
      ]
    },
    {
      id: 'stress_level',
      type: 'single',
      category: 'health',
      question: 'Stressnivå i vardagen?',
      options: [
        { value: 'low', label: '🧘 Låg', icon: '🧘' },
        { value: 'medium', label: '🙂 Medel', icon: '🙂' },
        { value: 'high', label: '😰 Hög', icon: '😰' },
        { value: 'extreme', label: '😱 Extrem', icon: '😱' }
      ]
    },
    {
      id: 'medical_clearance',
      type: 'single',
      category: 'health',
      question: 'Har läkare godkänt hård träning?',
      options: [
        { value: 'yes', label: '✅ Ja', icon: '✅' },
        { value: 'pending', label: '❓ Under utredning', icon: '❓' },
        { value: 'no', label: '🚫 Nej', icon: '🚫' }
      ]
    },

    // 7. Crossträning & styrka
    {
      id: 'strength_training',
      type: 'single',
      category: 'cross_training',
      question: 'Styrkepass per vecka?',
      options: [
        { value: '0', label: '🏋️ 0', icon: '🏋️' },
        { value: '1', label: '1', icon: '💪' },
        { value: '2', label: '2', icon: '💪' },
        { value: '3+', label: '3+', icon: '🦾' }
      ]
    },
    {
      id: 'flexibility_yoga',
      type: 'single',
      category: 'cross_training',
      question: 'Rörlighet/yoga?',
      options: [
        { value: 'never', label: '🧘 Aldrig', icon: '🧘' },
        { value: 'sometimes', label: 'Ibland', icon: '🤸' },
        { value: '1x', label: '1×/vecka', icon: '🧘‍♀️' },
        { value: '2x+', label: '2+×/vecka', icon: '🧘‍♂️' }
      ]
    },
    {
      id: 'other_cardio',
      type: 'multiple',
      category: 'cross_training',
      question: 'Övrig uthållighetsträning?',
      options: [
        { value: 'cycling', label: '🚴 Cykel', icon: '🚴' },
        { value: 'swimming', label: '🏊‍♂️ Simning', icon: '🏊‍♂️' },
        { value: 'skiing', label: '⛷️ Längdskidor', icon: '⛷️' },
        { value: 'none', label: '🚫 Inget', icon: '🚫' }
      ]
    },

    // 8. Miljö & underlag
    {
      id: 'training_surface',
      type: 'single',
      category: 'environment',
      question: 'Vanligaste underlaget i träning?',
      options: [
        { value: 'asphalt', label: '🏙️ Asfalt', icon: '🏙️' },
        { value: 'gravel', label: '🌳 Grus/skog', icon: '🌳' },
        { value: 'mountain', label: '🏔️ Berg', icon: '🏔️' },
        { value: 'mix', label: '⚖️ Mix', icon: '⚖️' }
      ]
    },
    {
      id: 'climate',
      type: 'single',
      category: 'environment',
      question: 'Klimat där du tränar mest?',
      options: [
        { value: '<5', label: '❄️ <5 °C', icon: '❄️' },
        { value: '5-15', label: '🌤️ 5–15 °C', icon: '🌤️' },
        { value: '15-25', label: '☀️ 15–25 °C', icon: '☀️' },
        { value: '>25', label: '🔥 >25 °C', icon: '🔥' }
      ]
    },
    {
      id: 'terrain_hilliness',
      type: 'single',
      category: 'environment',
      question: 'Hur kuperad är din standardrunda?',
      options: [
        { value: 'flat', label: '🏖️ Platt', icon: '🏖️' },
        { value: 'rolling', label: '🚶‍♂️ Lätt backigt', icon: '🚶‍♂️' },
        { value: 'hilly', label: '⛰️ Backigt', icon: '⛰️' }
      ]
    },

    // 9. Utrustning
    {
      id: 'shoe_type',
      type: 'single',
      category: 'equipment',
      question: 'Vilka skor springer du oftast i?',
      options: [
        { value: 'cushioned', label: '👟 Vägdämpade', icon: '👟' },
        { value: 'racing', label: '🏃‍♀️ Lätta tävlingsskor', icon: '🏃‍♀️' },
        { value: 'trail', label: '⛰️ Trailsko', icon: '⛰️' },
        { value: 'unknown', label: '❓ Vet ej', icon: '❓' }
      ]
    },
    {
      id: 'shoe_budget',
      type: 'single',
      category: 'equipment',
      question: 'Budget för nya skor?',
      options: [
        { value: '<1000', label: '💸 <1 000 kr', icon: '💸' },
        { value: '1000-1500', label: '💶 1 000–1 500 kr', icon: '💶' },
        { value: '1500-2500', label: '💰 1 500–2 500 kr', icon: '💰' },
        { value: '>2500', label: '💎 >2 500 kr', icon: '💎' }
      ]
    },
    {
      id: 'tracking_device',
      type: 'single',
      category: 'equipment',
      question: 'Använder du löparklocka/GPS?',
      options: [
        { value: 'watch_hr', label: '⌚ Klocka + pulsband', icon: '⌚' },
        { value: 'watch', label: '⌚ Klocka (handledpuls)', icon: '⌚' },
        { value: 'phone', label: '📱 Mobil-app', icon: '📱' },
        { value: 'none', label: '🚫 Nej', icon: '🚫' }
      ]
    },

    // 10. Kost & nutrition
    {
      id: 'diet_type',
      type: 'single',
      category: 'nutrition',
      question: 'Kosthållning/restriktioner?',
      options: [
        { value: 'omnivore', label: '🥩 Omnivor', icon: '🥩' },
        { value: 'vegetarian', label: '🌱 Veggie', icon: '🌱' },
        { value: 'vegan', label: '🌿 Vegan', icon: '🌿' },
        { value: 'pescatarian', label: '🐟 Pesc', icon: '🐟' },
        { value: 'allergies', label: '🚫 Allergier', icon: '🚫' }
      ]
    },
    {
      id: 'sports_nutrition',
      type: 'single',
      category: 'nutrition',
      question: 'Hur ofta använder du sportdryck/gels?',
      options: [
        { value: 'never', label: '💧 Aldrig', icon: '💧' },
        { value: 'long_runs', label: '🥤 På långpass', icon: '🥤' },
        { value: 'every_run', label: '⚡ Varje pass', icon: '⚡' }
      ]
    },
    {
      id: 'meals_per_day',
      type: 'single',
      category: 'nutrition',
      question: 'Antal måltider per dag?',
      options: [
        { value: '2', label: '🍽️ 2', icon: '🍽️' },
        { value: '3', label: '3', icon: '🍽️' },
        { value: '4', label: '4', icon: '🍽️' },
        { value: '>4', label: '>4', icon: '🍽️' }
      ]
    },

    // 11. Resa & tävlingslogistik
    {
      id: 'travel_required',
      type: 'single',
      category: 'logistics',
      question: 'Behöver du resa till loppet?',
      options: [
        { value: 'local', label: '🚶‍♂️ Lokal', icon: '🚶‍♂️' },
        { value: 'domestic', label: '🚆 Inrikes', icon: '🚆' },
        { value: 'international', label: '✈️ Internationellt', icon: '✈️' }
      ]
    },
    {
      id: 'arrival_days',
      type: 'single',
      category: 'logistics',
      question: 'Hur många dagar före start anländer du?',
      options: [
        { value: '0', label: '📅 Samma dag', icon: '📅' },
        { value: '1', label: '1 dag', icon: '📅' },
        { value: '2-3', label: '2–3 dagar', icon: '📅' },
        { value: '4+', label: '4+ dagar', icon: '📅' }
      ]
    },
    {
      id: 'heat_altitude_experience',
      type: 'single',
      category: 'logistics',
      question: 'Erfarenhet av tävling i värme/höjd?',
      options: [
        { value: 'none', label: '🔴 Ingen', icon: '🔴' },
        { value: 'some', label: '🟡 Lite', icon: '🟡' },
        { value: 'experienced', label: '🟢 Ja, flera gånger', icon: '🟢' }
      ]
    },

    // 12. Teknik & löpform
    {
      id: 'technique_analysis',
      type: 'single',
      category: 'technique',
      question: 'Har du gjort löpteknik-analys?',
      options: [
        { value: 'video', label: '🎥 Video', icon: '🎥' },
        { value: 'coach', label: '👁️ Coach live', icon: '👁️' },
        { value: 'no', label: '❌ Nej', icon: '❌' }
      ]
    },
    {
      id: 'cadence',
      type: 'single',
      category: 'technique',
      question: 'Känner du din kadens (steg/min)?',
      options: [
        { value: '<160', label: '👟 <160', icon: '👟' },
        { value: '160-170', label: '160–170', icon: '👟' },
        { value: '170-180', label: '170–180', icon: '👟' },
        { value: '>180', label: '>180', icon: '👟' },
        { value: 'unknown', label: '❓ Vet ej', icon: '❓' }
      ]
    },
    {
      id: 'pronation',
      type: 'single',
      category: 'technique',
      question: 'Över- eller underpronation?',
      options: [
        { value: 'yes', label: '✅ Ja', icon: '✅' },
        { value: 'no', label: '❌ Nej', icon: '❌' },
        { value: 'unknown', label: '❓ Vet ej', icon: '❓' }
      ]
    },

    // 13. Coachning-preferenser & feedback
    {
      id: 'delivery_method',
      type: 'single',
      category: 'preferences',
      question: 'Hur vill du få träningspassen levererade?',
      options: [
        { value: 'push', label: '📲 Push-notiser', icon: '📲' },
        { value: 'email', label: '📧 Mail', icon: '📧' },
        { value: 'calendar', label: '🗓️ Kalender-sync', icon: '🗓️' }
      ]
    },
    {
      id: 'report_frequency',
      type: 'single',
      category: 'preferences',
      question: 'Hur ofta vill du ha statistikrapporter?',
      options: [
        { value: 'per_session', label: '🕑 Varje pass', icon: '🕑' },
        { value: 'weekly', label: '📅 Veckovis', icon: '📅' },
        { value: 'monthly', label: '🗓️ Månadsvis', icon: '🗓️' },
        { value: 'never', label: '🚫 Aldrig', icon: '🚫' }
      ]
    },
    {
      id: 'auto_adjust',
      type: 'single',
      category: 'preferences',
      question: 'Vill du ha automatiska justeringar vid missade pass?',
      options: [
        { value: 'yes', label: '🤖 Ja, anpassa', icon: '🤖' },
        { value: 'no', label: '✋ Nej, jag planerar själv', icon: '✋' }
      ]
    },

    // Apple Health Integration Check (last question)
    {
      id: 'apple_health_check',
      type: 'apple_health',
      category: 'integration',
      question: 'Vill du synka din träningsdata?',
      description: 'Få personliga insikter baserat på din faktiska träningshistorik'
    }
  ];

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const getCategoryName = (category) => {
    const categoryNames = {
      race_info: 'Loppet du satsar på',
      goals: 'Mål & motivation',
      fitness: 'Din nuvarande kondition',
      training_time: 'Tillgänglig träningstid',
      history: 'Tränings- & skadehistoria',
      health: 'Hälsa & återhämtning',
      cross_training: 'Crossträning & styrka',
      environment: 'Miljö & underlag',
      equipment: 'Utrustning',
      nutrition: 'Kost & nutrition',
      logistics: 'Resa & tävlingslogistik',
      technique: 'Teknik & löpform',
      preferences: 'Coachning-preferenser',
      integration: 'Integration'
    };
    return categoryNames[category] || category;
  };

  const handleRaceSelect = (race) => {
    setSelectedRace(race);
    setAnswers({ ...answers, selectedRace: race });
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setAnswers({ ...answers, raceDate: date });
  };

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Calculate weeks until race
      const raceDate = new Date(answers.raceDate);
      const today = new Date();
      const weeksUntilRace = Math.floor((raceDate - today) / (1000 * 60 * 60 * 24 * 7));
      
      // Format data correctly for backend API with all comprehensive questions
      const planData = {
        raceId: selectedRace?.id,
        answers: {
          ...answers,
          weeksUntilRace,
          raceDetails: selectedRace,
          // Include all category data
          raceInfo: {
            race: selectedRace,
            locationType: answers.race_location_type,
            date: answers.raceDate
          },
          goals: {
            main: answers.main_goal,
            motivation: answers.motivation,
            coachingStyle: answers.coaching_style
          },
          fitness: {
            current: answers.current_fitness,
            longestRun: answers.longest_recent_run,
            pace: answers.average_pace
          },
          trainingTime: {
            weeklyRuns: answers.weekly_runs,
            longRunDuration: answers.long_run_duration,
            preferredTimes: answers.preferred_time
          },
          history: {
            experience: answers.running_experience,
            injuries: answers.injury_count,
            currentInjuries: answers.current_injuries
          },
          health: {
            sleep: answers.sleep_hours,
            stress: answers.stress_level,
            medical: answers.medical_clearance
          },
          crossTraining: {
            strength: answers.strength_training,
            flexibility: answers.flexibility_yoga,
            otherCardio: answers.other_cardio
          },
          environment: {
            surface: answers.training_surface,
            climate: answers.climate,
            terrain: answers.terrain_hilliness
          },
          equipment: {
            shoes: answers.shoe_type,
            budget: answers.shoe_budget,
            tracking: answers.tracking_device
          },
          nutrition: {
            diet: answers.diet_type,
            sportsNutrition: answers.sports_nutrition,
            meals: answers.meals_per_day
          },
          logistics: {
            travel: answers.travel_required,
            arrival: answers.arrival_days,
            experience: answers.heat_altitude_experience
          },
          technique: {
            analysis: answers.technique_analysis,
            cadence: answers.cadence,
            pronation: answers.pronation
          },
          preferences: {
            delivery: answers.delivery_method,
            reports: answers.report_frequency,
            autoAdjust: answers.auto_adjust
          },
          appleHealth: answers.apple_health_check
        }
      };

      const response = await api.post('/aicoach/race-plan', planData);
      
      if (response.data.success) {
        navigate('/app/race-coach-calendar', {
          state: { plan: response.data.plan },
          replace: true
        });
        onClose();
      }
    } catch (error) {
      console.error('Error creating race plan:', error);
      // Create fallback plan
      const fallbackPlan = generateFallbackPlan(answers, selectedRace);
      navigate('/app/race-coach-calendar', {
        state: { plan: fallbackPlan },
        replace: true
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackPlan = (answers, race) => {
    // Generate a comprehensive training plan based on the answers
    const raceDate = new Date(answers.raceDate);
    const today = new Date();
    const weeksUntilRace = Math.floor((raceDate - today) / (1000 * 60 * 60 * 24 * 7));
    
    return {
      race: race,
      raceDate: answers.raceDate,
      weeksUntilRace,
      trainingPhases: generateTrainingPhases(weeksUntilRace, answers),
      weeklySchedule: generateWeeklySchedule(answers),
      nutritionPlan: generateNutritionPlan(answers),
      recoveryProtocol: generateRecoveryProtocol(answers)
    };
  };

  const generateTrainingPhases = (weeks, answers) => {
    // Logic to generate training phases based on weeks until race
    const phases = [];
    
    if (weeks > 16) {
      phases.push({
        name: 'Basbyggande',
        weeks: Math.floor(weeks * 0.3),
        focus: 'Bygga aerob kapacitet'
      });
    }
    
    phases.push({
      name: 'Uppbyggnad',
      weeks: Math.floor(weeks * 0.4),
      focus: 'Öka volym och intensitet'
    });
    
    phases.push({
      name: 'Toppning',
      weeks: Math.floor(weeks * 0.2),
      focus: 'Racefart och specifik träning'
    });
    
    phases.push({
      name: 'Nedtrappning',
      weeks: 2,
      focus: 'Vila och förberedelse'
    });
    
    return phases;
  };

  const generateWeeklySchedule = (answers) => {
    // Generate weekly schedule based on training frequency
    const frequency = answers.weekly_runs;
    const schedule = {};
    
    // Logic to create schedule based on frequency
    console.log('Generating schedule for frequency:', frequency);
    return schedule;
  };

  const generateNutritionPlan = (answers) => {
    // Generate nutrition plan based on goals and habits
    return {
      dailyCalories: calculateDailyCalories(answers),
      macros: { carbs: '50%', protein: '25%', fat: '25%' },
      preworkout: 'Banan och vatten 1-2h före',
      postworkout: 'Protein och kolhydrater inom 30 min'
    };
  };

  const generateRecoveryProtocol = (answers) => {
    // Generate recovery protocol based on priority
    return {
      stretching: '10-15 min efter varje pass',
      foamRolling: answers.recovery_priority === 'high' ? 'Dagligen' : '2-3 ggr/vecka',
      restDays: '1-2 per vecka',
      sleep: `Sikta på ${answers.sleep_hours} timmar per natt`
    };
  };

  const calculateDailyCalories = (answers) => {
    // Simple calorie calculation
    const baseCalories = 2000;
    const trainingMultiplier = {
      '2-3': 1.2,
      '3-4': 1.3,
      '4-5': 1.4,
      '5-6': 1.5,
      '6+': 1.6
    };
    
    return Math.round(baseCalories * (trainingMultiplier[answers.weekly_runs] || 1.3));
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'race_picker':
        return (
          <div className="space-y-4">
            {/* Filter buttons */}
            <div className="space-y-3">
              {/* Type filters */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Filtrera efter typ:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSearchTerm('')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      searchTerm === '' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🌍 Alla lopp ({races.length})
                  </button>
                  <button
                    onClick={() => setSearchTerm('Marathon')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      searchTerm.toLowerCase() === 'marathon' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    🏃‍♂️ Marathon ({countRacesByType('marathon')})
                  </button>
                  <button
                    onClick={() => setSearchTerm('Halvmarathon')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      searchTerm.toLowerCase() === 'halvmarathon' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    🏃 Halvmarathon ({countRacesByType('halvmarathon')})
                  </button>
                  <button
                    onClick={() => setSearchTerm('Ultra')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      searchTerm.toLowerCase() === 'ultra' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    🏔️ Ultramarathon ({countRacesByType('ultra')})
                  </button>
                  <button
                    onClick={() => setSearchTerm('Trail')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      searchTerm.toLowerCase() === 'trail' 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    }`}
                  >
                    🌲 Trail ({countRacesByType('trail')})
                  </button>
                </div>
              </div>

              {/* Location filters */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Populära platser:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSearchTerm('Sverige')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      searchTerm.toLowerCase() === 'sverige' 
                        ? 'bg-yellow-600 text-white' 
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                  >
                    🇸🇪 Sverige ({countRacesByLocation('sverige')})
                  </button>
                  <button
                    onClick={() => setSearchTerm('USA')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      searchTerm.toLowerCase() === 'usa' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    🇺🇸 USA ({countRacesByLocation('usa')})
                  </button>
                  <button
                    onClick={() => setSearchTerm('Europa')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      searchTerm.toLowerCase() === 'europa' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    🇪🇺 Europa ({countRacesByLocation('europa')})
                  </button>
                  <button
                    onClick={() => setSearchTerm('Asien')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      searchTerm.toLowerCase() === 'asien' 
                        ? 'bg-pink-600 text-white' 
                        : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                    }`}
                  >
                    🌏 Asien ({countRacesByLocation('asien')})
                  </button>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Sök lopp, plats eller distans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-700 placeholder-gray-400"
              />
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
              {loadingRaces ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Laddar lopp...</p>
                </div>
              ) : filteredRaces.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Inga lopp hittades</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-purple-600 hover:text-purple-700 text-sm mt-2"
                  >
                    Rensa sökning
                  </button>
                </div>
              ) : (
                filteredRaces.map((race) => {
                  const distanceStr = String(race.distance || '');
                  const terrainStr = String(race.terrain || '');
                  
                  const isMarathon = distanceStr.includes('42') || distanceStr.includes('Marathon');
                  const isUltra = distanceStr.includes('km') && parseInt(distanceStr) > 50;
                  const isTrail = terrainStr.toLowerCase().includes('trail') || terrainStr.toLowerCase().includes('berg');
                  
                  return (
                    <motion.div
                      key={race.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRaceSelect(race)}
                      className={`p-4 rounded-xl cursor-pointer transition-all ${
                        selectedRace?.id === race.id
                          ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-500 shadow-lg'
                          : 'bg-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              #{race.ranking}
                            </span>
                            <h3 className="font-bold text-gray-900 text-lg">{race.name}</h3>
                            {isMarathon && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                Marathon
                              </span>
                            )}
                            {isUltra && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                                Ultra
                              </span>
                            )}
                            {isTrail && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                Trail
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                            <span className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="truncate">{race.location}</span>
                            </span>
                            <span className="flex items-center gap-1 text-sm text-gray-600">
                              <Activity className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{race.distance}</span>
                            </span>
                            {race.terrain && (
                              <span className="flex items-center gap-1 text-sm text-gray-600">
                                <Mountain className="w-4 h-4 text-gray-400" />
                                <span className="truncate">{race.terrain}</span>
                              </span>
                            )}
                          </div>

                        </div>
                        {selectedRace?.id === race.id && (
                          <div className="flex-shrink-0 ml-3">
                            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        );

      case 'date_picker':
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 rounded-xl p-4">
              <h3 className="font-semibold text-purple-900 mb-2">Valt lopp:</h3>
              <p className="text-purple-700">{selectedRace?.name}</p>
              <p className="text-sm text-purple-600">{selectedRace?.location} • {selectedRace?.distance}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Välj datum för loppet
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateSelect(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-700"
              />
              {selectedDate && (
                <p className="mt-2 text-sm text-gray-600">
                  {Math.floor((new Date(selectedDate) - new Date()) / (1000 * 60 * 60 * 24 * 7))} veckor till loppet
                </p>
              )}
            </div>
          </div>
        );

      case 'single':
        return (
          <div className="grid gap-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = answers[currentQuestion.id] === option.value;
              return (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(option.value)}
                  className={`relative group w-full p-4 rounded-2xl text-left transition-all overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 border-2 border-purple-500 shadow-lg'
                      : 'bg-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-md hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50/30'
                  }`}
                >
                  {/* Background decoration */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 transition-opacity ${
                    isSelected ? 'opacity-5' : 'group-hover:opacity-3'
                  }`} />
                  
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <motion.div
                        animate={{ rotate: isSelected ? [0, 10, -10, 0] : 0 }}
                        transition={{ duration: 0.5 }}
                        className={`text-3xl flex-shrink-0 ${isSelected ? 'filter drop-shadow-md' : ''}`}
                      >
                        {option.icon}
                      </motion.div>
                      <span className={`font-medium text-lg ${
                        isSelected
                          ? 'text-purple-900'
                          : 'text-gray-700 group-hover:text-purple-700'
                      }`}>
                        {option.label}
                      </span>
                    </div>
                    
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        className="flex-shrink-0"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-md">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Hover effect line */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600"
                    initial={{ width: 0 }}
                    animate={{ width: isSelected ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              );
            })}
          </div>
        );

      case 'multiple':
        return (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-2">Välj alla som gäller</p>
            <div className="grid gap-3">
              {currentQuestion.options.map((option, index) => {
                const selected = (answers[currentQuestion.id] || []).includes(option.value);
                return (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const current = answers[currentQuestion.id] || [];
                      const updated = selected
                        ? current.filter(v => v !== option.value)
                        : [...current, option.value];
                      handleAnswer(updated);
                    }}
                    className={`relative group w-full p-4 rounded-2xl text-left transition-all overflow-hidden ${
                      selected
                        ? 'bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 border-2 border-purple-500 shadow-lg'
                        : 'bg-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-md hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50/30'
                    }`}
                  >
                    {/* Checkbox indicator */}
                    <div className="absolute top-4 right-4">
                      <motion.div
                        animate={selected ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                        className={`w-6 h-6 rounded-md border-2 transition-all ${
                          selected
                            ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-purple-600'
                            : 'bg-white border-gray-300 group-hover:border-purple-400'
                        }`}
                      >
                        {selected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                            className="w-full h-full flex items-center justify-center"
                          >
                            <Check className="w-4 h-4 text-white" />
                          </motion.div>
                        )}
                      </motion.div>
                    </div>
                    
                    <div className="flex items-center gap-4 pr-12">
                      <motion.div
                        animate={{ rotate: selected ? [0, 10, -10, 0] : 0 }}
                        transition={{ duration: 0.5 }}
                        className={`text-3xl flex-shrink-0 ${selected ? 'filter drop-shadow-md' : ''}`}
                      >
                        {option.icon}
                      </motion.div>
                      <span className={`font-medium text-lg ${
                        selected
                          ? 'text-purple-900'
                          : 'text-gray-700 group-hover:text-purple-700'
                      }`}>
                        {option.label}
                      </span>
                    </div>
                    
                    {/* Hover effect line */}
                    <motion.div
                      className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600"
                      initial={{ width: 0 }}
                      animate={{ width: selected ? '100%' : '0%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>
                );
              })}
            </div>
          </div>
        );

      case 'text':
        return (
          <div>
            <input
              type="text"
              placeholder={currentQuestion.placeholder}
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-700 placeholder-gray-400"
            />
          </div>
        );

      case 'apple_health':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
              <div className="flex items-center justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <Heart className="w-10 h-10 text-white" />
                </div>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Apple Health Integration
              </h4>
              <p className="text-sm text-gray-600 text-center mb-4">
                Synka din träningshistorik för att få en mer personlig träningsplan baserad på din faktiska träningsdata
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Analysera din träningsfrekvens</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Se dina faktiska löpdistanser</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Få insikter om din utveckling</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  handleAnswer('sync');
                  // Here you would trigger Apple Health sync
                  window.location.href = '/app/settings#apple-health';
                }}
                className="w-full p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-center gap-3">
                  <Heart className="w-5 h-5" />
                  <span>Synka med Apple Health</span>
                </div>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswer('skip')}
                className="w-full p-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-center gap-3">
                  <X className="w-5 h-5" />
                  <span>Hoppa över</span>
                </div>
              </motion.button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepComplete = () => {
    switch (currentQuestion.type) {
      case 'race_picker':
        return !!selectedRace;
      case 'date_picker':
        return !!selectedDate;
      case 'text':
        return currentQuestion.validation ? 
          currentQuestion.validation(answers[currentQuestion.id]) : 
          !!answers[currentQuestion.id];
      case 'multiple':
        return (answers[currentQuestion.id] || []).length > 0;
      case 'apple_health':
        return !!answers[currentQuestion.id];
      default:
        return !!answers[currentQuestion.id];
    }
  };

  if (!isOpen || !isClient) return null;

  if (isLoading) {
    return <AILoadingScreen onComplete={() => {}} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-black/60 via-purple-900/20 to-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative gradient orbs */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-500 rounded-full blur-3xl opacity-20" />
        
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 animate-gradient-x" />
          <div className="relative bg-gradient-to-b from-transparent to-black/10 p-6 text-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold">AI Race Coach</h2>
                  <p className="text-sm opacity-90">Din personliga träningsassistent</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>
            
            {/* Enhanced Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  Steg {currentStep + 1} av {questions.length}
                </span>
                <span className="text-white/80">
                  {getCategoryName(currentQuestion.category)}
                </span>
              </div>
              <div className="relative w-full bg-white/20 backdrop-blur-sm rounded-full h-3 overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white via-yellow-200 to-white rounded-full h-3"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
              </div>
              <div className="flex items-center justify-between">
                {[...Array(Math.min(5, questions.length))].map((_, i) => {
                  const stepIndex = Math.floor((i / 4) * (questions.length - 1));
                  const isCompleted = currentStep > stepIndex;
                  const isCurrent = currentStep === stepIndex;
                  
                  return (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        isCompleted ? 'bg-white' : isCurrent ? 'bg-white/60 animate-pulse' : 'bg-white/30'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Content with better styling */}
        <div className="relative p-6 md:p-8 overflow-y-auto max-h-[55vh] custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <motion.h3 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-900 via-pink-900 to-orange-900 bg-clip-text text-transparent mb-3"
              >
                {currentQuestion.question}
              </motion.h3>
              {currentQuestion.description && (
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-600 mb-6 text-lg leading-relaxed"
                >
                  {currentQuestion.description}
                </motion.p>
              )}
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {renderQuestion()}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Enhanced Footer */}
        <div className="relative border-t border-gray-100 p-6 bg-gradient-to-t from-gray-50 to-transparent">
          <div className="flex items-center justify-between gap-4">
            <motion.button
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                currentStep === 0
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  : 'text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md border border-gray-200'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Tillbaka</span>
            </motion.button>
            
            <div className="flex items-center gap-2">
              {currentStep > 0 && currentStep < questions.length - 1 && (
                <span className="text-sm text-gray-500 hidden sm:inline">
                  {Math.round(((currentStep + 1) / questions.length) * 100)}% klart
                </span>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                disabled={!isStepComplete()}
                className={`relative flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all overflow-hidden ${
                  isStepComplete()
                    ? 'text-white shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isStepComplete() && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 animate-gradient-x" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </>
                )}
                <span className="relative">
                  {currentStep === questions.length - 1 ? 'Skapa träningsplan' : 'Nästa'}
                </span>
                <ChevronRight className="w-5 h-5 relative" />
              </motion.button>
            </div>
          </div>
          
          {/* Motivational text */}
          {currentStep > 0 && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center text-sm text-gray-500 mt-4"
            >
              {currentStep < 5 && "🎯 Bra start! Fortsätt så..."}
              {currentStep >= 5 && currentStep < 10 && "💪 Halvvägs där! Du klarar det..."}
              {currentStep >= 10 && currentStep < questions.length - 1 && "🔥 Snart klar! Bara några frågor till..."}
              {currentStep === questions.length - 1 && "🎉 Sista frågan! Din plan är nästan redo..."}
            </motion.p>
          )}
        </div>
      </motion.div>
      
      
    </motion.div>
  );
};

export default RaceCoachOnboarding; 