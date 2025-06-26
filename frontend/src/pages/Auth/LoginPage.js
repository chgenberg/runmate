import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Heart, Eye, EyeOff, ArrowRight, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login({ email: formData.email, password: formData.password });
      navigate('/app/dashboard');
    } catch (error) {
      toast.error(error.message || 'Något gick fel vid inloggning');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    toast.info(`${provider} inloggning kommer snart!`);
  };

  const quotes = [
    {
      text: "Löpning är det närmaste vi kan komma till att flyga.",
      author: "Oprah Winfrey"
    },
    {
      text: "Det finns inga gränser. Inte för tankar, inte för känslor. Det är rädslan som sätter gränserna.",
      author: "Chrissie Wellington"
    },
    {
      text: "Smärtan är tillfällig. Att ge upp varar för alltid.",
      author: "Lance Armstrong"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-orange-200 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-red-200 rounded-full filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-orange-100 to-red-100 rounded-full filter blur-3xl opacity-10"></div>
      </div>

      {/* Floating quotes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {quotes.map((quote, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            animate={{ 
              opacity: [0, 0.15, 0.15, 0],
              y: [50, 0, 0, -50]
            }}
            transition={{
              duration: 20,
              delay: index * 7,
              repeat: Infinity,
              repeatDelay: 1
            }}
            className={`absolute ${
              index === 0 ? 'top-20 left-10 md:left-20' : 
              index === 1 ? 'top-40 right-10 md:right-20' : 
              'bottom-20 left-10 md:left-40'
            } max-w-xs md:max-w-sm`}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <Quote className="w-8 h-8 text-orange-400 mb-3" />
              <p className="text-gray-700 italic mb-2">{quote.text}</p>
              <p className="text-sm text-gray-500">— {quote.author}</p>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center mb-8 group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl"
            >
              <Heart className="w-9 h-9 text-white" />
            </motion.div>
            <div className="ml-4">
              <h1 className="text-3xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                RunMate
              </h1>
              <p className="text-sm text-gray-500">Social träning</p>
            </div>
          </Link>

          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Välkommen tillbaka
              </h2>
              <p className="text-gray-600">
                Eller{' '}
                <Link
                  to="/register"
                  className="font-medium text-orange-600 hover:text-orange-500 transition-colors"
                >
                  skapa ett nytt konto
                </Link>
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-postadress
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900"
                  placeholder="din@email.se"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Lösenord
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded transition-colors"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Kom ihåg mig
                  </label>
                </div>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-orange-600 hover:text-orange-500 transition-colors"
                >
                  Glömt lösenord?
                </Link>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                    <span>Loggar in...</span>
                  </div>
                ) : (
                  <>
                    <span>Logga in</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Social Login */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Eller fortsätt med</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSocialLogin('Google')}
                  className="flex items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="ml-2 text-gray-700 font-medium">Google</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSocialLogin('Facebook')}
                  className="flex items-center justify-center px-4 py-3 bg-[#1877F2] text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="ml-2 font-medium">Facebook</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-8">
            Genom att logga in godkänner du våra{' '}
            <Link to="/terms" className="text-orange-600 hover:text-orange-500">
              användarvillkor
            </Link>{' '}
            och{' '}
            <Link to="/privacy" className="text-orange-600 hover:text-orange-500">
              integritetspolicy
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage; 