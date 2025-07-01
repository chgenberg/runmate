import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Heart, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft,
  Zap,
  Star,
  Activity,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    sportTypes: ['running'], // Default to running
    activityLevel: '',
    location: '',
    bio: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    if (step === 1) {
      // Validate step 1
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        toast.error('Vänligen fyll i alla obligatoriska fält');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Lösenorden matchar inte');
        return;
      }
      if (formData.password.length < 8) {
        toast.error('Lösenordet måste vara minst 8 tecken');
        return;
      }
    }
    setStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevious = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.activityLevel) {
      toast.error('Välj din träningsnivå');
      return;
    }

    setIsLoading(true);

    try {
      await register(formData);
      navigate('/app/discover');
    } catch (error) {
      toast.error(error.message || 'Något gick fel vid registrering');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    return today.getFullYear() - birth.getFullYear();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial opacity-30 animate-gradient"></div>
      <div className="absolute top-20 -left-20 w-96 h-96 bg-primary-200 rounded-full filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-secondary-200 rounded-full filter blur-3xl opacity-20 animate-float animation-delay-2000"></div>
      
      <div className="min-h-screen flex relative z-10">
        {/* Mobile header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 z-50">
          <div className="flex items-center justify-between p-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">RunMate</span>
            </Link>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center px-4 py-6 sm:px-6 lg:px-20 xl:px-24 mt-14 lg:mt-0">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            {/* Desktop Logo */}
            <div className="hidden lg:flex items-center space-x-3 mb-8 animate-slide-up">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow animate-pulse-slow">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">RunMate</h1>
                <p className="text-sm text-gray-500">Din sociala träningsapp</p>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-6 animate-slide-up animation-delay-200">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span className="font-medium">Steg {step} av 3</span>
                <span className="font-medium">{Math.round((step / 3) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200/50 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-primary rounded-full transition-all duration-500 ease-out shadow-glow"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Step content */}
            <div className="animate-slide-up animation-delay-300">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {step === 1 && 'Skapa ditt konto'}
                {step === 2 && 'Berätta om dig'}
                {step === 3 && 'Din träningsprofil'}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                {step === 1 && 'Kom igång på bara några minuter'}
                {step === 2 && 'Hjälp oss matcha dig med rätt personer'}
                {step === 3 && 'Anpassa din träningsupplevelse'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up animation-delay-400">
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-700">Förnamn</label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        style={{ color: '#111827', backgroundColor: '#ffffff', fontSize: '16px' }}
                        placeholder="Anna"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-700">Efternamn</label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        style={{ color: '#111827', backgroundColor: '#ffffff', fontSize: '16px' }}
                        placeholder="Svensson"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">E-postadress</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      style={{ color: '#111827', backgroundColor: '#ffffff', fontSize: '16px' }}
                      placeholder="anna@exempel.se"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">Lösenord</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-3 pr-10 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        style={{ color: '#111827', backgroundColor: '#ffffff', fontSize: '16px' }}
                        placeholder="Minst 8 tecken"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">Bekräfta lösenord</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-3 pr-10 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        style={{ color: '#111827', backgroundColor: '#ffffff', fontSize: '16px' }}
                        placeholder="Upprepa lösenordet"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Personal Info */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">Födelsedatum</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      required
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      className="w-full px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      style={{ color: '#111827', backgroundColor: '#ffffff', fontSize: '16px' }}
                    />
                    {formData.dateOfBirth && (
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Star className="w-3 h-3 mr-1 text-yellow-500" />
                        Du är {calculateAge(formData.dateOfBirth)} år
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">Kön</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'male', label: 'Man', emoji: '👨' },
                        { value: 'female', label: 'Kvinna', emoji: '👩' },
                        { value: 'other', label: 'Annat', emoji: '🌟' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, gender: option.value }))}
                          className={`p-2.5 rounded-xl border-2 transition-all transform hover:scale-105 ${
                            formData.gender === option.value
                              ? 'border-primary-500 bg-primary-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="text-xl mb-0.5">{option.emoji}</div>
                          <div className="text-xs font-medium text-gray-900">{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">Var tränar du?</label>
                    <input
                      type="text"
                      name="location"
                      required
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      style={{ color: '#111827', backgroundColor: '#ffffff', fontSize: '16px' }}
                      placeholder="Stockholm, Sverige"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">Berätta om dig (valfritt)</label>
                    <textarea
                      name="bio"
                      rows="3"
                      value={formData.bio}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                      style={{ color: '#111827', backgroundColor: '#ffffff', fontSize: '16px' }}
                      placeholder="Vad motiverar dig? Vilka mål har du?"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Training Preferences */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">Din träningsnivå</label>
                    <div className="space-y-2">
                      {[
                        { 
                          id: 'beginner', 
                          label: 'Nybörjare', 
                          desc: 'Just börjat eller tränar sporadiskt',
                          icon: '🌱'
                        },
                        { 
                          id: 'recreational', 
                          label: 'Motionär', 
                          desc: 'Tränar regelbundet 2-3 ggr/vecka',
                          icon: '🏃‍♀️'
                        },
                        { 
                          id: 'serious', 
                          label: 'Seriös', 
                          desc: 'Tränar 4-5 ggr/vecka med struktur',
                          icon: '💪'
                        },
                        { 
                          id: 'competitive', 
                          label: 'Tävlande', 
                          desc: 'Tränar för tävlingar och resultat',
                          icon: '🏆'
                        }
                      ].map((level) => (
                        <button
                          key={level.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, activityLevel: level.id }))}
                          className={`w-full p-3 rounded-xl border-2 text-left transition-all transform hover:scale-[1.02] ${
                            formData.activityLevel === level.id
                              ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-secondary-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            <span className="text-lg">{level.icon}</span>
                            <div className="flex-1">
                              <div className="font-semibold text-sm text-gray-900">{level.label}</div>
                              <div className="text-xs text-gray-600 mt-0.5">{level.desc}</div>
                            </div>
                            {formData.activityLevel === level.id && (
                              <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Strava Connect Preview */}
                  <div className="p-3 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-200">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-6 h-6 text-primary-600" />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">Koppla Strava efter registrering</p>
                        <p className="text-xs text-gray-600">Synka dina aktiviteter automatiskt</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-2 pt-2">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="flex-1 btn btn-glass group text-sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1.5 transform group-hover:-translate-x-1 transition-transform" />
                    Tillbaka
                  </button>
                )}
                
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 btn btn-primary group text-sm"
                  >
                    Nästa
                    <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        <span>Skapar konto...</span>
                      </div>
                    ) : (
                      <>
                        Kom igång
                        <Zap className="w-4 h-4 ml-1.5" />
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Login link */}
              <p className="text-center text-sm text-gray-600">
                Har du redan ett konto?{' '}
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                  Logga in här
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Right side - Desktop only */}
        <div className="hidden lg:block relative w-0 flex-1">
          <div className="absolute inset-0 bg-gradient-primary">
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40"></div>
            <div className="relative h-full flex items-center justify-center p-12">
              <div className="text-center text-white max-w-md space-y-8 animate-fade-in">
                <div className="space-y-4">
                  <h3 className="text-4xl font-bold">
                    Hitta din löparkompis
                  </h3>
                  <p className="text-xl opacity-90 leading-relaxed">
                    Matcha med löpare i din närhet och nå nya mål tillsammans
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-8 pt-8">
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">Smart matchning</div>
                      <div className="text-sm opacity-80">Hitta löpare på din nivå</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">Lokala träningspass</div>
                      <div className="text-sm opacity-80">Upptäck nya löprundor</div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 space-y-4">
                  <div className="flex items-center justify-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-lg italic opacity-90">
                    "RunMate hjälpte mig hitta den perfekta löpargruppen. 
                    Nu springer jag 4 gånger i veckan!"
                  </p>
                  <div className="flex items-center justify-center space-x-3">
                    <img 
                      src="https://ui-avatars.com/api/?name=Emma+Johansson&background=fff&color=6366f1&size=40"
                      alt="Emma"
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="text-left">
                      <div className="font-medium">Emma Johansson</div>
                      <div className="text-sm opacity-80">Stockholm</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 