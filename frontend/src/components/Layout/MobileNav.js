import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home,
  Users,
  Compass,
  PlusSquare,
  Award,
  Trophy,
  Calendar,
  MessageCircle,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Star,
  X,
  Menu,
  Activity,
  Sparkles,
  ArrowRight,
  Brain
} from 'lucide-react';
import ProfileAvatar from '../common/ProfileAvatar';
import { getProfilePictureUrl } from '../../services/api';

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
      icon: PlusSquare,
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

  // All menu items for the expanded view
  const allMenuItems = [
    {
      name: 'Hem',
      href: '/app/dashboard',
      icon: Home,
      description: 'Din personliga hubb',
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Statistik',
      href: '/app/statistics',
      icon: BarChart3,
      description: 'Avancerad analys',
      badge: 'NY',
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'AI-Coach',
      href: '/app/ai-coach',
      icon: Brain,
      description: 'Personlig träningsplan',
      badge: 'AI',
      color: 'from-blue-500 to-purple-600'
    },
    {
      name: 'Träningspass',
      href: '/app/activities',
      icon: PlusSquare,
      description: 'Dina löprundor',
      color: 'from-orange-500 to-orange-600'
    },
    {
      name: 'Löpvänner',
      href: '/app/matches',
      icon: Users,
      description: 'Hitta löpare',
      badge: activeNotifications > 0 ? activeNotifications : null,
      color: 'from-pink-500 to-pink-600'
    },
    {
      name: 'Meddelanden',
      href: '/app/messages',
      icon: MessageCircle,
      description: 'Chatta med löpare',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      name: 'Upptäck',
      href: '/app/discover',
      icon: Compass,
      description: 'Gå med i löprundor',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      name: 'Utmaningar',
      href: '/app/challenges',
      icon: Award,
      description: 'Tävlingar',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      name: 'Event',
      href: '/app/events',
      icon: Calendar,
      description: 'Maraton & race',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      name: 'Topplista',
      href: '/app/leaderboard',
      icon: Trophy,
      description: 'Rankning',
      color: 'from-amber-500 to-amber-600'
    },
    {
      name: 'Betyg',
      href: '/app/ratings',
      icon: Star,
      description: 'Recensioner',
      color: 'from-red-500 to-red-600'
    },
    {
      name: 'Community',
      href: '/app/community',
      icon: Users,
      description: 'Forum',
      color: 'from-teal-500 to-teal-600'
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
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' 
                  : isActive(item.href) 
                    ? 'bg-orange-50 text-orange-600' 
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
                <item.icon 
                  className={`h-6 w-6 mb-1 ${
                    item.isSpecial ? 'text-white' : isActive(item.href) ? 'text-orange-600' : 'text-gray-500'
                  }`} 
                />
              </motion.div>
              <span className={`text-xs font-medium ${
                item.isSpecial ? 'text-white' : isActive(item.href) ? 'text-orange-600 font-semibold' : 'text-gray-500'
              }`}>
                {item.name}
              </span>
              
              {/* Active indicator */}
              {isActive(item.href) && !item.isSpecial && (
                <motion.div
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full"
                  layoutId="bottomActiveIndicator"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
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

      {/* Full Screen Menu Overlay */}
      <AnimatePresence>
        {showFullMenu && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFullMenu(false)}
          >
            <motion.div
              className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">RunMate</h2>
                      <p className="text-sm text-gray-500">Löpning tillsammans</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setShowFullMenu(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto pb-safe">
                {/* User Profile Section */}
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100">
                  <motion.button
                    onClick={() => {
                      navigate('/app/profile');
                      setShowFullMenu(false);
                    }}
                    className="flex items-center w-full p-3 rounded-xl bg-white shadow-sm hover:shadow-md transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ProfileAvatar
                      user={user}
                      src={getProfilePictureUrl(user)}
                      size="md"
                    />
                    <div className="ml-3 flex-1 text-left">
                      <p className="font-semibold text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">Nivå {user?.level || 1}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </motion.button>
                </div>

                {/* Pro Upgrade Banner */}
                <div className="px-6 py-4">
                  <motion.button 
                    onClick={() => setShowProModal(true)}
                    className="w-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 text-white relative overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Sparkles className="w-8 h-8 mb-2" />
                    <h3 className="font-bold mb-1">Uppgradera till Pro</h3>
                    <p className="text-sm text-white/80 mb-3">Få tillgång till avancerad statistik</p>
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-medium w-fit">
                      Läs mer
                    </div>
                    <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
                  </motion.button>
                </div>

                {/* Menu Items Grid */}
                <div className="px-6 py-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Alla funktioner</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {allMenuItems.map((item, index) => (
                      <motion.button
                        key={item.name}
                        onClick={() => {
                          navigate(item.href);
                          setShowFullMenu(false);
                        }}
                        className={`relative p-4 rounded-xl transition-all text-left ${
                          isActive(item.href)
                            ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center mb-2">
                          <item.icon className={`h-6 w-6 ${isActive(item.href) ? 'text-white' : 'text-gray-700'}`} />
                          {item.badge && (
                            <span className={`ml-2 px-2 py-0.5 text-xs font-bold rounded-full ${
                              isActive(item.href) ? 'bg-white/20 text-white' : 'bg-orange-500 text-white'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <h4 className={`font-semibold text-sm ${isActive(item.href) ? 'text-white' : 'text-gray-900'}`}>
                          {item.name}
                        </h4>
                        <p className={`text-xs mt-1 ${isActive(item.href) ? 'text-white/80' : 'text-gray-500'}`}>
                          {item.description}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="grid grid-cols-3 gap-3">
                    <motion.button
                      onClick={() => {
                        navigate('/app/notifications');
                        setShowFullMenu(false);
                      }}
                      className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all relative"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Bell className="w-6 h-6 text-gray-600 mb-1" />
                      <span className="text-xs font-medium text-gray-900">Notiser</span>
                      {activeNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {activeNotifications}
                        </span>
                      )}
                    </motion.button>
                    
                    <motion.button
                      onClick={() => {
                        navigate('/app/settings');
                        setShowFullMenu(false);
                      }}
                      className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Settings className="w-6 h-6 text-gray-600 mb-1" />
                      <span className="text-xs font-medium text-gray-900">Inställningar</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={handleLogout}
                      className="flex flex-col items-center p-3 bg-red-50 rounded-xl shadow-sm hover:shadow-md transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <LogOut className="w-6 h-6 text-red-600 mb-1" />
                      <span className="text-xs font-medium text-red-600">Logga ut</span>
                    </motion.button>
                  </div>
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