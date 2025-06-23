import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Target, Globe, Lock, Trophy, Clock,
  Sparkles, ChevronRight
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinnerFullScreen } from '../../components/Layout/LoadingSpinner';
import { toast } from 'react-hot-toast';

// Popular cities with their coordinates for route generation
const popularCities = [
  { id: 'stockholm', name: 'Stockholm', lat: 59.3293, lng: 18.0686, emoji: '🏛️' },
  { id: 'gothenburg', name: 'Göteborg', lat: 57.7089, lng: 11.9746, emoji: '⚓' },
  { id: 'malmo', name: 'Malmö', lat: 55.6050, lng: 13.0038, emoji: '🌉' },
  { id: 'uppsala', name: 'Uppsala', lat: 59.8586, lng: 17.6389, emoji: '🎓' },
  { id: 'linkoping', name: 'Linköping', lat: 58.4108, lng: 15.6214, emoji: '✈️' },
  { id: 'orebro', name: 'Örebro', lat: 59.2753, lng: 15.2134, emoji: '🏰' },
  { id: 'vasteras', name: 'Västerås', lat: 59.6099, lng: 16.5448, emoji: '⚡' },
  { id: 'helsingborg', name: 'Helsingborg', lat: 56.0465, lng: 12.6945, emoji: '🚢' },
  { id: 'norrkoping', name: 'Norrköping', lat: 58.5877, lng: 16.1924, emoji: '🏭' },
  { id: 'jonkoping', name: 'Jönköping', lat: 57.7826, lng: 14.1618, emoji: '🏞️' }
];

const challengeTypes = [
  { 
    id: 'distance', 
    label: 'Total distans', 
    icon: Target, 
    unit: 'km', 
    description: 'Vem springer längst totalt',
    gradient: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  { 
    id: 'time', 
    label: 'Träningstid', 
    icon: Clock, 
    unit: 'timmar', 
    description: 'Samla träningstimmar',
    gradient: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  }
];

const CreateChallengePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'distance',
    selectedCity: 'stockholm',
    routeDistance: 5,
    goal: {
      target: 5,
      unit: 'km',
      isCollective: false,
    },
    startDate: new Date(Date.now() + 60000),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    visibility: 'public',
    maxParticipants: 50,
    allowedActivityTypes: ['running']
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type) => {
    const selectedType = challengeTypes.find(t => t.id === type);
    setFormData(prev => ({
      ...prev,
      type,
      goal: { 
        ...prev.goal, 
        unit: selectedType.unit,
        target: type === 'route_race' ? prev.routeDistance : prev.goal.target
      }
    }));
  };

  const handleCityChange = (cityId) => {
    setFormData(prev => ({ ...prev, selectedCity: cityId }));
  };

  const handleDistanceChange = (distance) => {
    setFormData(prev => ({
      ...prev,
      routeDistance: distance,
      goal: {
        ...prev.goal,
        target: distance
      }
    }));
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const selectedCityData = popularCities.find(c => c.id === formData.selectedCity);
      
      const challengeData = {
        ...formData,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        creator: user?._id,
        // Add route data if it's a route race
        ...(formData.type === 'route_race' && {
          route: {
            city: selectedCityData.name,
            cityId: selectedCityData.id,
            coordinates: {
              lat: selectedCityData.lat,
              lng: selectedCityData.lng
            },
            distance: formData.routeDistance
          }
        })
      };
      
      console.log('Creating challenge with data:', challengeData);
      const response = await api.post('/challenges', challengeData);
      toast.success('Utmaning skapad!');
      navigate(`/app/challenges/${response.data._id}`);
    } catch (err) {
      console.error('Error creating challenge:', err);
      const errorMessage = err.response?.data?.message || 'Kunde inte skapa utmaning';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinnerFullScreen message="Skapar utmaning..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/app/challenges')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Tillbaka</span>
            </button>
            
            {/* Step indicator */}
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-all ${
                    step === currentStep 
                      ? 'w-8 bg-gradient-primary' 
                      : step < currentStep 
                      ? 'bg-primary-500' 
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="px-4 pt-6 pb-4">
        <div className="text-center animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl shadow-glow mb-4 animate-pulse-slow">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Skapa utmaning</h1>
          <p className="text-gray-600">
            {currentStep === 1 && 'Välj typ och plats'}
            {currentStep === 2 && 'Ställ in detaljer'}
            {currentStep === 3 && 'Slutför utmaningen'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pb-20">
        {/* Step 1: Type and Location */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-slide-up">
            {/* Challenge Type */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Välj utmaningstyp</h2>
              <div className="space-y-3">
                {challengeTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.type === type.id;
                  
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleTypeChange(type.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all ${
                        isSelected 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.gradient} flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="font-semibold text-gray-900">{type.label}</h3>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* City Selection (only for route race) */}
            {formData.type === 'route_race' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Välj stad för rutten</h2>
                <div className="grid grid-cols-2 gap-3">
                  {popularCities.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleCityChange(city.id)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        formData.selectedCity === city.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{city.emoji}</div>
                      <div className="text-sm font-medium">{city.name}</div>
                    </button>
                  ))}
                </div>

                {/* Distance slider */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ruttens längd: {formData.routeDistance} km
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="42"
                    value={formData.routeDistance}
                    onChange={(e) => handleDistanceChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 km</span>
                    <span>21 km</span>
                    <span>42 km</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={nextStep}
              className="w-full btn btn-primary"
            >
              Nästa steg
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        )}

        {/* Step 2: Details */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-slide-up">
            {/* Basic Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Namn på utmaningen
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ex: Vårens löputmaning"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beskrivning
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Berätta om utmaningen..."
                    rows="3"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Goal (only for non-route challenges) */}
            {formData.type !== 'route_race' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Mål</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Målvärde
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.goal.target}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          goal: { ...prev.goal, target: Number(e.target.value) }
                        }))}
                        min="1"
                        className="w-full pl-4 pr-20 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-100 px-3 py-1 rounded-lg">
                        <span className="text-sm font-semibold text-gray-700">{formData.goal.unit}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, goal: { ...p.goal, isCollective: false }}))}
                      className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                        !formData.goal.isCollective 
                          ? 'bg-gradient-primary text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      Individuellt
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, goal: { ...p.goal, isCollective: true }}))}
                      className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                        formData.goal.isCollective 
                          ? 'bg-gradient-primary text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      Gemensamt
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 btn btn-glass"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Tillbaka
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 btn btn-primary"
              >
                Nästa
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Settings */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-slide-up">
            {/* Dates */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Tidsperiod</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Startdatum
                  </label>
                  <DatePicker
                    selected={formData.startDate}
                    onChange={date => setFormData(p => ({...p, startDate: date}))}
                    minDate={new Date()}
                    dateFormat="yyyy-MM-dd"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-primary-50 rounded-xl">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <p className="text-sm font-medium text-primary-900">
                    {Math.ceil((formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24))} dagar
                  </p>
                </div>
              </div>
            </div>

            {/* Visibility */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Synlighet</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({...p, visibility: 'public'}))}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.visibility === 'public'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200'
                  }`}
                >
                  <Globe className="w-6 h-6 mb-2 mx-auto text-gray-700" />
                  <div className="text-sm font-medium">Publik</div>
                  <div className="text-xs text-gray-500">Alla kan se</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({...p, visibility: 'private'}))}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.visibility === 'private'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200'
                  }`}
                >
                  <Lock className="w-6 h-6 mb-2 mx-auto text-gray-700" />
                  <div className="text-sm font-medium">Privat</div>
                  <div className="text-xs text-gray-500">Endast inbjudna</div>
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-primary rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-3">Sammanfattning</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/80">Typ:</span>
                  <span className="font-medium">{challengeTypes.find(t => t.id === formData.type)?.label}</span>
                </div>
                {formData.type === 'route_race' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-white/80">Stad:</span>
                      <span className="font-medium">{popularCities.find(c => c.id === formData.selectedCity)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Distans:</span>
                      <span className="font-medium">{formData.routeDistance} km</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-white/80">Period:</span>
                  <span className="font-medium">{Math.ceil((formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24))} dagar</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 btn btn-glass"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Tillbaka
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn btn-primary"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Skapar...
                  </>
                ) : (
                  <>
                    Skapa utmaning
                    <Sparkles className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateChallengePage; 