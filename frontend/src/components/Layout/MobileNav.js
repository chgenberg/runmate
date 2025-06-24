import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home,
  Users,
  PlusSquare,
  Trophy,
  Calendar,
  MessageCircle,
  BarChart3,
  Settings,
  LogOut,
  Star,
  X,
  Menu,
  Activity,
  Sparkles,
  Brain,
  Heart,
  Search,
  ChevronRight,
  Zap
} from 'lucide-react';

const MobileNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showFullMenu, setShowFullMenu] = useState(false);
  const [activeNotifications] = useState(3);
  const [showProModal, setShowProModal] = useState(false);

  // Main bottom navigation items
  const bottomNavItems = [
    {
      name: 'Hem',
      href: '/app/dashboard',
      icon: Home,
    },
    {
      name: 'Träning',
      href: '/app/activities',
      icon: Activity,
    },
    {
      name: 'Meddelanden',
      href: '/app/messages',
      icon: MessageCircle,
    },
    {
      name: 'Mer',
      action: () => setShowFullMenu(true),
      icon: Menu,
      isSpecial: true
    }
  ];

  // Organized menu structure
  const menuCategories = [
    {
      title: 'Träning',
      color: 'from-sport-yellow-400 to-sport-yellow-500',
      items: [
        {
          name: 'Mina aktiviteter',
          href: '/app/activities',
          icon: Zap,
          description: 'Dina löprundor'
        },
        {
          name: 'Statistik',
          href: '/app/statistics',
          icon: BarChart3,
          description: 'Avancerad analys',
          badge: 'NY'
        },
        {
          name: 'AI Coach',
          href: '/app/ai-coach',
          icon: Brain,
          description: 'Personlig träning',
          badge: 'AI'
        },
        {
          name: 'Utmaningar',
          href: '/app/challenges',
          icon: Star,
          description: 'Tävlingar'
        }
      ]
    },
    {
      title: 'Socialt',
      color: 'from-sport-lime-400 to-sport-lime-500',
      items: [
        {
          name: 'Upptäck löpare',
          href: '/app/discover',
          icon: Search,
          description: 'Hitta nya vänner'
        },
        {
          name: 'Matcha',
          href: '/app/matches',
          icon: Heart,
          description: 'Löppartners',
          badge: activeNotifications > 0 ? activeNotifications : null
        },
        {
          name: 'Meddelanden',
          href: '/app/messages',
          icon: MessageCircle,
          description: 'Chatta'
        },
        {
          name: 'Community',
          href: '/app/community',
          icon: Users,
          description: 'Forum'
        }
      ]
    },
    {
      title: 'Tävla',
      color: 'from-orange-400 to-orange-500',
      items: [
        {
          name: 'Topplista',
          href: '/app/leaderboard',
          icon: Trophy,
          description: 'Rankning'
        },
        {
          name: 'Event',
          href: '/app/events',
          icon: Calendar,
          description: 'Maraton & race'
        }
      ]
    }
  ];

  const isActive = (href) => location.pathname === href;

  const handleMenuItemClick = (item) => {
    if (item.action) {
      item.action();
    } else {
      navigate(item.href);
      setShowFullMenu(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowFullMenu(false);
  };

  return (
    <>
      {/* Bottom Navigation */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 z-50 md:hidden"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-around py-2 px-4 safe-area-bottom">
          {bottomNavItems.map((item, index) => (
            <motion.button
              key={item.name}
              onClick={() => handleMenuItemClick(item)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all relative ${
                item.isSpecial 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg' 
                  : isActive(item.href) 
                    ? 'bg-orange-50 text-orange-700' 
                    : 'text-gray-500'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                className={`${isActive(item.href) && !item.isSpecial ? 'scale-110' : ''}`}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <item.icon className="w-5 h-5" />
              </motion.div>
              <span className={`text-xs mt-1 ${item.isSpecial ? 'font-medium' : ''}`}>
                {item.name}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Floating Action Button */}
      <motion.button
        onClick={() => navigate('/app/activities/log')}
        className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-lg z-50 flex items-center justify-center md:hidden"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, delay: 0.5 }}
      >
        <PlusSquare className="w-6 h-6" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ zIndex: -1 }}
        />
      </motion.button>

      {/* Full Menu Modal */}
      <AnimatePresence>
        {showFullMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] md:hidden"
            onClick={() => setShowFullMenu(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Meny</h2>
                  <button
                    onClick={() => setShowFullMenu(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto pb-20">
                {/* User Section */}
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=ffee00&color=000`}
                      alt={user?.firstName}
                      className="w-16 h-16 rounded-full"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">@{user?.username}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigate('/app/profile');
                        setShowFullMenu(false);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Menu Categories */}
                {menuCategories.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="px-6 py-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      {category.title}
                    </h3>
                    <div className="space-y-2">
                      {category.items.map((item, index) => (
                        <motion.button
                          key={item.href}
                          onClick={() => handleMenuItemClick(item)}
                          className={`w-full flex items-center space-x-3 p-3 rounded-2xl transition-all ${
                            isActive(item.href)
                              ? 'bg-gradient-to-r ' + category.color + ' text-white shadow-lg'
                              : 'hover:bg-gray-50'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: categoryIndex * 0.1 + index * 0.05 }}
                        >
                          <div className={`p-2 rounded-xl ${
                            isActive(item.href) 
                              ? 'bg-white/20' 
                              : 'bg-gradient-to-r ' + category.color
                          }`}>
                            <item.icon className={`w-5 h-5 ${
                              isActive(item.href) ? 'text-white' : 'text-white'
                            }`} />
                          </div>
                          <div className="flex-1 text-left">
                            <p className={`font-medium ${
                              isActive(item.href) ? 'text-white' : 'text-gray-900'
                            }`}>
                              {item.name}
                            </p>
                            <p className={`text-xs ${
                              isActive(item.href) ? 'text-white/80' : 'text-gray-500'
                            }`}>
                              {item.description}
                            </p>
                          </div>
                          {item.badge && (
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              isActive(item.href)
                                ? 'bg-white/20 text-white'
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight className={`w-4 h-4 ${
                            isActive(item.href) ? 'text-white' : 'text-gray-400'
                          }`} />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Bottom Actions */}
                <div className="px-6 py-4 space-y-2 border-t border-gray-100">
                  <button
                    onClick={() => {
                      navigate('/app/settings');
                      setShowFullMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-2xl transition-colors"
                  >
                    <div className="p-2 bg-gray-100 rounded-xl">
                      <Settings className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="flex-1 text-left font-medium text-gray-900">
                      Inställningar
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-red-50 rounded-2xl transition-colors text-red-600"
                  >
                    <div className="p-2 bg-red-100 rounded-xl">
                      <LogOut className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-left font-medium">
                      Logga ut
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pro Upgrade Modal */}
      <AnimatePresence>
        {showProModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4"
            onClick={() => setShowProModal(false)}
            style={{ zIndex: 9999 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 relative z-[10000]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowProModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">RunMate Pro</h2>
                <p className="text-gray-600">AI-baserad träningsagent</p>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Activity className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Personlig AI-coach</h3>
                    <p className="text-sm text-gray-600">Få skräddarsydda träningsplaner baserade på dina mål och livsstil</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BarChart3 className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Avancerad analys</h3>
                    <p className="text-sm text-gray-600">Djupgående insights och realtidscoaching för att nå dina mål</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Calendar className="w-3 h-3 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Smart planering</h3>
                    <p className="text-sm text-gray-600">Automatisk anpassning av träning baserat på din återhämtning</p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
                <div className="text-center">
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-3xl font-bold text-gray-900">99 kr</span>
                    <span className="text-gray-600 ml-1">/månad</span>
                  </div>
                  <p className="text-sm text-gray-600">Avsluta när som helst</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                >
                  Starta 7 dagars gratis provperiod
                </motion.button>
                
                <button
                  onClick={() => setShowProModal(false)}
                  className="w-full text-gray-600 font-medium py-2 hover:text-gray-800 transition-colors"
                >
                  Kanske senare
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNav; 