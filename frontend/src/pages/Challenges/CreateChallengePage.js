import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Target, Globe, Lock, Trophy, Clock,
  Sparkles, ChevronRight, Users, Zap, TrendingUp, Timer,
  Mountain, Flame, Heart, Star, MapPin, Activity
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const challengeTypes = [
  { 
    id: 'distance', 
    label: 'Total distans', 
    icon: Target, 
    unit: 'km', 
    description: 'Spring längst totalt under perioden',
    gradient: 'from-blue-400 to-blue-600',
    emoji: '🏃‍♂️'
  },
  { 
    id: 'time', 
    label: 'Träningstid', 
    icon: Clock, 
    unit: 'timmar', 
    description: 'Samla flest träningstimmar',
    gradient: 'from-purple-400 to-purple-600',
    emoji: '⏱️'
  },
  { 
    id: 'elevation', 
    label: 'Höjdmeter', 
    icon: Mountain, 
    unit: 'meter', 
    description: 'Klättra högst sammanlagt',
    gradient: 'from-green-400 to-green-600',
    emoji: '⛰️'
  },
  { 
    id: 'activities', 
    label: 'Antal pass', 
    icon: Flame, 
    unit: 'aktiviteter', 
    description: 'Genomför flest träningspass',
    gradient: 'from-orange-400 to-orange-600',
    emoji: '🔥'
  },
  { 
    id: 'streak', 
    label: 'Streak', 
    icon: Zap, 
    unit: 'dagar', 
    description: 'Längsta träningssviten',
    gradient: 'from-yellow-400 to-yellow-600',
    emoji: '⚡'
  }
];

const presetGoals = {
  distance: [10, 25, 50, 100, 200],
  time: [5, 10, 20, 30, 50],
  elevation: [500, 1000, 2000, 5000, 10000],
  activities: [5, 10, 15, 20, 30],
  streak: [7, 14, 21, 30, 60]
};

const CreateChallengePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'distance',
    goal: {
      target: 50,
      unit: 'km',
      isCollective: false,
    },
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    visibility: 'public',
    maxParticipants: 50,
    allowedActivityTypes: ['running']
  });

  const [errors, setErrors] = useState({});

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.type) newErrors.type = 'Välj en utmaningstyp';
    }
    
    if (step === 2) {
      if (!formData.title.trim()) newErrors.title = 'Ange ett namn för utmaningen';
      if (!formData.description.trim()) newErrors.description = 'Ange en beskrivning';
      if (formData.goal.target <= 0) newErrors.target = 'Målet måste vara större än 0';
    }
    
    if (step === 3) {
      if (formData.startDate >= formData.endDate) {
        newErrors.dates = 'Slutdatum måste vara efter startdatum';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleTypeChange = (type) => {
    const selectedType = challengeTypes.find(t => t.id === type);
    setFormData(prev => ({
      ...prev,
      type,
      goal: { 
        ...prev.goal, 
        unit: selectedType.unit,
        target: presetGoals[type][2] // Middle preset value
      }
    }));
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;
    
    setLoading(true);
    
    try {
      const challengeData = {
        ...formData,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        creator: user?._id
      };
      
      const response = await api.post('/challenges', challengeData);
      toast.success('Utmaning skapad! 🎉');
      navigate(`/app/challenges/${response.data._id}`);
    } catch (err) {
      console.error('Error creating challenge:', err);
      const errorMessage = err.response?.data?.message || 'Kunde inte skapa utmaning';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const progress = (currentStep / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 opacity-50" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-orange-200 to-red-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-red-200 to-pink-200 rounded-full blur-3xl opacity-30" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 md:pt-8 md:pb-16">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/app/challenges')}
              className="flex items-center gap-1 md:gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              <span className="font-medium text-sm md:text-base">Tillbaka</span>
            </motion.button>
            
            {/* Progress bar */}
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm text-gray-600">Steg {currentStep} av 3</span>
              <div className="w-24 md:w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl md:rounded-3xl shadow-2xl mb-4 md:mb-6">
              <Trophy className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-3 md:mb-4">
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Skapa utmaning
              </span>
            </h1>
            <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              {currentStep === 1 && 'Välj vilken typ av utmaning du vill skapa'}
              {currentStep === 2 && 'Ge din utmaning ett namn och beskriv den'}
              {currentStep === 3 && 'Ställ in datum och synlighet'}
            </p>
          </motion.div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <AnimatePresence mode="wait">
          {/* Step 1: Challenge Type */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 md:space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {challengeTypes.map((type, index) => {
                  const Icon = type.icon;
                  const isSelected = formData.type === type.id;
                  
                  return (
                    <motion.button
                      key={type.id}
                      type="button"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleTypeChange(type.id)}
                      className={`relative overflow-hidden p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all ${
                        isSelected 
                          ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg' 
                          : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 md:top-3 md:right-3 w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center"
                        >
                          <Star className="w-3 h-3 md:w-4 md:h-4 text-white" />
                        </motion.div>
                      )}
                      
                      <div className="text-2xl md:text-4xl mb-2 md:mb-4">{type.emoji}</div>
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br ${type.gradient} flex items-center justify-center mb-3 md:mb-4 mx-auto shadow-lg`}>
                        <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                      </div>
                      <h3 className="font-bold text-base md:text-lg text-gray-900 mb-1 md:mb-2">{type.label}</h3>
                      <p className="text-xs md:text-sm text-gray-600">{type.description}</p>
                    </motion.button>
                  );
                })}
              </div>

              {errors.type && (
                <p className="text-red-500 text-sm text-center">{errors.type}</p>
              )}

              <div className="flex justify-end pt-2">
                <motion.button
                  type="button"
                  onClick={nextStep}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-6 md:px-8 py-3 md:py-4 rounded-xl text-sm md:text-base shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  Nästa steg
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 md:space-y-6"
            >
              {/* Challenge Info */}
              <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg p-6 md:p-8 border border-gray-100">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Information om utmaningen</h2>
                
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                      Namn på utmaningen *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Ex: Vårens stora löputmaning"
                      className={`w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base rounded-xl border ${
                        errors.title ? 'border-red-300' : 'border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                      required
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs md:text-sm mt-1">{errors.title}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                      Beskrivning *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Beskriv vad utmaningen går ut på och vad som motiverar deltagarna..."
                      rows="4"
                      className={`w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base rounded-xl border ${
                        errors.description ? 'border-red-300' : 'border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none`}
                      required
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs md:text-sm mt-1">{errors.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Goal Settings */}
              <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg p-6 md:p-8 border border-gray-100">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Mål för utmaningen</h2>
                
                <div className="space-y-4 md:space-y-6">
                  {/* Goal Type Toggle */}
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 md:mb-3">
                      Typ av mål
                    </label>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData(p => ({ ...p, goal: { ...p.goal, isCollective: false }}))}
                        className={`p-3 md:p-4 rounded-xl border-2 transition-all ${
                          !formData.goal.isCollective 
                            ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-red-50' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <Users className="w-5 h-5 md:w-6 md:h-6 mb-1.5 md:mb-2 mx-auto text-gray-700" />
                        <div className="font-medium text-sm md:text-base">Individuellt</div>
                        <div className="text-xs text-gray-500 mt-0.5 md:mt-1">Var och en har sitt eget mål</div>
                      </motion.button>
                      
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData(p => ({ ...p, goal: { ...p.goal, isCollective: true }}))}
                        className={`p-3 md:p-4 rounded-xl border-2 transition-all ${
                          formData.goal.isCollective 
                            ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-red-50' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <Heart className="w-5 h-5 md:w-6 md:h-6 mb-1.5 md:mb-2 mx-auto text-gray-700" />
                        <div className="font-medium text-sm md:text-base">Gemensamt</div>
                        <div className="text-xs text-gray-500 mt-0.5 md:mt-1">Alla bidrar till samma mål</div>
                      </motion.button>
                    </div>
                  </div>

                  {/* Goal Value */}
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 md:mb-3">
                      Målvärde ({formData.goal.unit})
                    </label>
                    
                    {/* Preset buttons */}
                    <div className="grid grid-cols-5 gap-1.5 md:gap-2 mb-3 md:mb-4">
                      {presetGoals[formData.type].map((value) => (
                        <motion.button
                          key={value}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setFormData(p => ({ ...p, goal: { ...p.goal, target: value }}))}
                          className={`py-1.5 md:py-2 px-2 md:px-3 rounded-lg font-medium text-xs md:text-sm transition-all ${
                            formData.goal.target === value
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {value}
                        </motion.button>
                      ))}
                    </div>
                    
                    {/* Custom input */}
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.goal.target}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          goal: { ...prev.goal, target: Number(e.target.value) }
                        }))}
                        min="1"
                        className={`w-full px-3 md:px-4 py-2.5 md:py-3 pr-16 md:pr-20 text-sm md:text-base rounded-xl border ${
                          errors.target ? 'border-red-300' : 'border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                      />
                      <div className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 bg-gray-100 px-2 md:px-3 py-0.5 md:py-1 rounded-lg">
                        <span className="text-xs md:text-sm font-semibold text-gray-700">{formData.goal.unit}</span>
                      </div>
                    </div>
                    {errors.target && (
                      <p className="text-red-500 text-xs md:text-sm mt-1">{errors.target}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 md:gap-4">
                <motion.button
                  type="button"
                  onClick={prevStep}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-white text-gray-700 font-bold px-6 md:px-8 py-3 md:py-4 rounded-xl text-sm md:text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 border border-gray-200"
                >
                  <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                  Tillbaka
                </motion.button>
                
                <motion.button
                  type="button"
                  onClick={nextStep}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-6 md:px-8 py-3 md:py-4 rounded-xl text-sm md:text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  Nästa steg
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Settings */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Date Settings */}
              <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Tidsperiod</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Startdatum
                    </label>
                    <DatePicker
                      selected={formData.startDate}
                      onChange={date => setFormData(p => ({...p, startDate: date}))}
                      minDate={new Date()}
                      dateFormat="yyyy-MM-dd"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slutdatum
                    </label>
                    <DatePicker
                      selected={formData.endDate}
                      onChange={date => setFormData(p => ({...p, endDate: date}))}
                      minDate={formData.startDate}
                      dateFormat="yyyy-MM-dd"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                
                {errors.dates && (
                  <p className="text-red-500 text-sm mt-2">{errors.dates}</p>
                )}
                
                <div className="mt-6 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-orange-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {Math.ceil((formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24))} dagar
                      </p>
                      <p className="text-sm text-gray-600">
                        {formData.startDate.toLocaleDateString('sv-SE')} - {formData.endDate.toLocaleDateString('sv-SE')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visibility Settings */}
              <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Synlighet</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData(p => ({...p, visibility: 'public'}))}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      formData.visibility === 'public'
                        ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-red-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <Globe className="w-8 h-8 mb-3 mx-auto text-gray-700" />
                    <div className="font-medium text-lg">Publik</div>
                    <div className="text-sm text-gray-500 mt-1">Alla kan se och gå med</div>
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData(p => ({...p, visibility: 'private'}))}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      formData.visibility === 'private'
                        ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-red-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <Lock className="w-8 h-8 mb-3 mx-auto text-gray-700" />
                    <div className="font-medium text-lg">Privat</div>
                    <div className="text-sm text-gray-500 mt-1">Endast inbjudna</div>
                  </motion.button>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-8 text-white shadow-xl">
                <h3 className="text-2xl font-bold mb-6">Sammanfattning</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5" />
                    <span className="font-medium">Namn:</span>
                    <span>{formData.title || 'Ingen titel'}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5" />
                    <span className="font-medium">Mål:</span>
                    <span>{formData.goal.target} {formData.goal.unit}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">Period:</span>
                    <span>{Math.ceil((formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24))} dagar</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Typ:</span>
                    <span>{formData.goal.isCollective ? 'Gemensamt mål' : 'Individuellt mål'}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <motion.button
                  type="button"
                  onClick={prevStep}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-white text-gray-700 font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 border border-gray-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Tillbaka
                </motion.button>
                
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Skapar...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Skapa utmaning
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};

export default CreateChallengePage; 