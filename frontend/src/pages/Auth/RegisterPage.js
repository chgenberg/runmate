import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BoltIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
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
    sportTypes: [],
    activityLevel: '',
    location: '',
    bio: ''
  });
  const [showPassword, setShowPassword] = useState(false);
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

  const handleSportToggle = (sport) => {
    setFormData(prev => ({
      ...prev,
      sportTypes: prev.sportTypes.includes(sport)
        ? prev.sportTypes.filter(s => s !== sport)
        : [...prev.sportTypes, sport]
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
    
    if (formData.sportTypes.length === 0) {
      toast.error('Välj minst en träningstyp');
      return;
    }
    
    if (!formData.activityLevel) {
      toast.error('Välj din träningsnivå');
      return;
    }

    setIsLoading(true);

    try {
      await register(formData);
      toast.success('Välkommen till RunMate! 🎉');
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
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo */}
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <BoltIcon className="w-8 h-8 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-2xl font-bold text-gray-900">RunMate</h1>
              <p className="text-sm text-gray-500">Social träning</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Steg {step} av 3</span>
              <span>{Math.round((step / 3) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {step === 1 && 'Skapa ditt konto'}
              {step === 2 && 'Berätta om dig'}
              {step === 3 && 'Din träning'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Eller{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                logga in på ditt befintliga konto
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Förnamn *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Efternamn *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    E-postadress *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Lösenord *
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bekräfta lösenord *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Personal Info */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Födelsedatum *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                  {formData.dateOfBirth && (
                    <p className="mt-1 text-sm text-gray-500">
                      Ålder: {calculateAge(formData.dateOfBirth)} år
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Kön *
                  </label>
                  <select
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Välj kön</option>
                    <option value="male">Man</option>
                    <option value="female">Kvinna</option>
                    <option value="other">Annat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Plats *
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Stockholm, Sverige"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Berätta lite om dig
                  </label>
                  <textarea
                    name="bio"
                    rows="3"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Vad motiverar dig att träna? Vad letar du efter i en träningspartner?"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Training Preferences */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Vilka träningstyper gillar du? *
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'running', label: 'Löpning', emoji: '🏃‍♀️' },
                      { id: 'cycling', label: 'Cykling', emoji: '🚴‍♀️' }
                    ].map((sport) => (
                      <label
                        key={sport.id}
                        className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={formData.sportTypes.includes(sport.id)}
                          onChange={() => handleSportToggle(sport.id)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 border-2 rounded mr-3 flex items-center justify-center ${
                          formData.sportTypes.includes(sport.id)
                            ? 'bg-primary-500 border-primary-500'
                            : 'border-gray-300'
                        }`}>
                          {formData.sportTypes.includes(sport.id) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className="text-lg mr-2">{sport.emoji}</span>
                        <span className="font-medium">{sport.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Vilken är din träningsnivå? *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'beginner', label: 'Nybörjare', desc: 'Tränar sporadiskt' },
                      { id: 'recreational', label: 'Mellannivå', desc: '2-3 ggr/vecka' },
                      { id: 'serious', label: 'Seriös', desc: '4-5 ggr/vecka' },
                      { id: 'competitive', label: 'Tävling', desc: '6+ ggr/vecka' },
                      { id: 'elite', label: 'Elite', desc: 'Daglig träning' }
                    ].map((level) => (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, activityLevel: level.id }))}
                        className={`p-3 border rounded-lg text-left transition-colors ${
                          formData.activityLevel === level.id
                            ? 'bg-primary-500 text-white border-primary-500'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium">{level.label}</div>
                        <div className="text-sm opacity-75">{level.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex space-x-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Tillbaka
                </button>
              )}
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Nästa
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {isLoading ? 'Skapar konto...' : 'Skapa konto'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Hero Image */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-500 to-primary-500">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative h-full flex items-center justify-center p-12">
            <div className="text-center text-white max-w-md">
              <h3 className="text-3xl font-bold mb-4">
                Bli en del av träningscommunityn
              </h3>
              <p className="text-lg opacity-90 mb-8">
                Anslut dig till tusentals löpare och cyklister som redan hittat 
                sina träningspartners genom RunMate.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">🏃‍♀️</div>
                  <div className="font-medium">Löpning</div>
                  <div className="text-sm opacity-75">Hitta löpkompisar</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🚴‍♀️</div>
                  <div className="font-medium">Cykling</div>
                  <div className="text-sm opacity-75">Cykelpartners</div>
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