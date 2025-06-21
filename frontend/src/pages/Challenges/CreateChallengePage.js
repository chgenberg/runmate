import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Target, Users, Globe, Lock, Info,
  Trophy, Clock, TrendingUp, Flag, CheckCircle, Plus,
  Sparkles, ChevronRight, AlertCircle
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const challengeTypes = [
  { 
    id: 'distance', 
    label: 'Distans', 
    icon: Target, 
    unit: 'km', 
    description: 'Tävla om vem som springer längst.',
    gradient: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  { 
    id: 'time', 
    label: 'Tid', 
    icon: Clock, 
    unit: 'hours', 
    description: 'Samla så många träningstimmar som möjligt.',
    gradient: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  { 
    id: 'activities', 
    label: 'Aktiviteter', 
    icon: Flag, 
    unit: 'activities', 
    description: 'Flest antal genomförda pass vinner.',
    gradient: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  { 
    id: 'elevation', 
    label: 'Höjdmeter', 
    icon: TrendingUp, 
    unit: 'meters', 
    description: 'Samla flest höjdmeter under perioden.',
    gradient: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
];

const CreateChallengePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'distance',
    goal: {
      target: 100,
      unit: 'km',
      isCollective: false,
    },
    startDate: new Date(Date.now() + 60000), // Start 1 minute from now
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    visibility: 'public',
    maxParticipants: 50,
    allowedActivityTypes: ['running', 'walking', 'cycling'] // Add default allowed activities
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGoalChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      goal: { ...prev.goal, [name]: name === 'target' ? Number(value) : value }
    }));
  };
  
  const handleTypeChange = (type) => {
    const selectedType = challengeTypes.find(t => t.id === type);
    setFormData(prev => ({
        ...prev,
        type,
        goal: { ...prev.goal, unit: selectedType.unit }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validate data
    if (!formData.title.trim()) {
      setError('Utmaningen måste ha ett namn');
      setLoading(false);
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Utmaningen måste ha en beskrivning');
      setLoading(false);
      return;
    }
    
    try {
      const challengeData = {
        ...formData,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        creator: user?._id // Add creator field
      };
      
      console.log('Sending challenge data:', challengeData); // Debug log
      
      const response = await api.post('/challenges', challengeData);
      navigate(`/app/challenges/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Ett fel uppstod. Försök igen.');
      console.error('Error creating challenge:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button 
              onClick={() => navigate('/app/challenges')} 
              className="flex items-center text-gray-600 hover:text-primary mb-8 group font-medium"
            >
              <ArrowLeft size={20} className="mr-2 transition-transform group-hover:-translate-x-2" />
              Tillbaka till utmaningar
            </button>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary/20 to-purple-500/20 backdrop-blur-sm rounded-full mb-6 border border-primary/20"
            >
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-sm font-bold text-primary">Skapa utmaning</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Skapa en Ny Utmaning
              </span>
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl leading-relaxed">
              Sätt upp mål, bjud in vänner och börja tävla tillsammans
            </p>
          </motion.div>
        </div>
      </div>

      {/* Progress Steps - Moved outside form section */}
      <div className="relative -mt-8 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-6 mb-8"
          >
            <div className="flex justify-center">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                    1
                  </div>
                  <span className="text-sm font-medium text-gray-700">Information</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                    2
                  </div>
                  <span className="text-sm font-medium text-gray-500">Typ & Mål</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                    3
                  </div>
                  <span className="text-sm font-medium text-gray-500">Inställningar</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Basic Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl" />
            <div className="relative bg-white backdrop-blur-xl rounded-3xl border border-gray-100 shadow-xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 ml-4">Grundläggande Information</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Utmaningens namn
                  </label>
                  <input 
                    type="text" 
                    name="title" 
                    placeholder="Ex: Vår-utmaningen 2024" 
                    value={formData.title} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beskrivning
                  </label>
                  <textarea 
                    name="description" 
                    placeholder="Berätta om utmaningen och vad målet är..." 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    required 
                    rows="4" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 resize-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Challenge Type */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl" />
            <div className="relative bg-white backdrop-blur-xl rounded-3xl border border-gray-100 shadow-xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 ml-4">Typ av Utmaning</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {challengeTypes.map(type => {
                  const Icon = type.icon;
                  const isSelected = formData.type === type.id;
                  
                  return (
                    <motion.div 
                      key={type.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTypeChange(type.id)}
                      className={`relative cursor-pointer p-6 rounded-2xl border-2 transition-all ${
                        isSelected 
                          ? `${type.borderColor} ${type.bgColor} shadow-lg` 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-2 -right-2">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                      
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${type.gradient} flex items-center justify-center mb-4 shadow-lg mx-auto`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      
                      <h3 className="font-bold text-gray-900 text-center mb-2">{type.label}</h3>
                      <p className="text-xs text-gray-600 text-center leading-relaxed">{type.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Goal Settings */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl" />
            <div className="relative bg-white backdrop-blur-xl rounded-3xl border border-gray-100 shadow-xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 ml-4">Målsättning</h2>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Målvärde
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        name="target" 
                        value={formData.goal.target} 
                        onChange={handleGoalChange}
                        min="1"
                        className="w-full pl-4 pr-20 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-100 px-3 py-1 rounded-lg">
                        <span className="text-sm font-semibold text-gray-700">{formData.goal.unit}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Måltyp
                    </label>
                    <div className="flex gap-3">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData(p => ({ ...p, goal: { ...p.goal, isCollective: false }}))}
                        className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                          !formData.goal.isCollective 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Individuellt
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData(p => ({ ...p, goal: { ...p.goal, isCollective: true }}))}
                        className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                          formData.goal.isCollective 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Gemensamt
                      </motion.button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-600">
                      {formData.goal.isCollective 
                        ? 'Alla deltagare bidrar tillsammans för att nå det gemensamma målet. Perfekt för teamutmaningar!' 
                        : 'Varje deltagare tävlar individuellt för att nå målet. Bäst för personliga utmaningar!'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dates & Duration */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl" />
            <div className="relative bg-white backdrop-blur-xl rounded-3xl border border-gray-100 shadow-xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 ml-4">Tidsperiod</h2>
              </div>
              
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  />
                </div>
              </div>
              
              <div className="mt-6 bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <p className="text-sm font-medium text-blue-900">
                    Utmaningen pågår i {Math.ceil((formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24))} dagar
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Settings */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-3xl blur-xl" />
            <div className="relative bg-white backdrop-blur-xl rounded-3xl border border-gray-100 shadow-xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 ml-4">Inställningar</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Synlighet
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData(p => ({...p, visibility: 'public'}))}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                        formData.visibility === 'public' 
                          ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      Publik
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData(p => ({...p, visibility: 'private'}))}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                        formData.visibility === 'private' 
                          ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Lock className="w-4 h-4" />
                      Privat
                    </motion.button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.visibility === 'public' 
                      ? 'Alla kan se och gå med i utmaningen' 
                      : 'Endast med inbjudan kan gå med'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max antal deltagare
                  </label>
                  <input 
                    type="number" 
                    name="maxParticipants" 
                    value={formData.maxParticipants} 
                    onChange={handleInputChange} 
                    min="2"
                    max="1000"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" 
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Begränsa antalet som kan delta
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.6 }}
            className="flex justify-center pt-4"
          >
            <motion.button 
              type="submit" 
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-12 py-5 rounded-3xl shadow-xl hover:shadow-2xl transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10" />
                  <span className="relative z-10 text-lg">Skapar utmaning...</span>
                </>
              ) : (
                <>
                  <Plus className="w-6 h-6 relative z-10" />
                  <span className="relative z-10 text-lg">Skapa Utmaning</span>
                  <Sparkles className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform" />
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default CreateChallengePage; 