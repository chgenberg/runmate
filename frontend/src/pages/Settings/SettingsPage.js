import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Link as LinkIcon, 
  RefreshCw, 
  User, 
  Shield, 
  Bell, 
  Eye, 
  EyeOff, 
  Globe, 
  MapPin, 
  Heart, 
  Trash2, 
  LogOut,
  Camera,
  Save,
  X,
  Settings as SettingsIcon,
  Lock,
  Smartphone,
  Mail,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Zap,
  Activity,
  Clock,
  ChevronRight,
  Sparkles,
  AlertCircle,
  CheckCheck,
  Languages,
  Palette,
  BellRing,
  UserCheck,
  ShieldCheck,
  Laptop
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

// Animated Background Component
const AnimatedBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <motion.div
      animate={{ 
        scale: [1, 1.2, 1],
        x: [0, 100, 0],
        y: [0, -50, 0]
      }}
      transition={{ duration: 20, repeat: Infinity }}
      className="absolute -top-40 -right-40 w-80 h-80 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
    />
    <motion.div
      animate={{ 
        scale: [1, 1.1, 1],
        x: [0, -100, 0],
        y: [0, 50, 0]
      }}
      transition={{ duration: 15, repeat: Infinity }}
      className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
    />
  </div>
);

// Enhanced Input Field Component
const InputField = ({ label, id, type = 'text', value, onChange, icon: Icon, disabled = false, error = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
    <div className="relative group">
      {Icon && (
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
      )}
      <input 
        type={type} 
        id={id} 
        value={value} 
        onChange={onChange} 
        disabled={disabled} 
        className={`w-full px-4 py-3 ${Icon ? 'pl-12' : ''} bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/20 focus:outline-none transition-all duration-200 ${error ? 'border-red-500' : ''}`}
      />
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-xs mt-1 flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" />
          {error}
        </motion.p>
      )}
    </div>
  </motion.div>
);

// Enhanced Password Field Component
const PasswordField = ({ label, id, value, onChange, show, onToggle, error = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
    <div className="relative group">
      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
      <input 
        type={show ? 'text' : 'password'} 
        id={id} 
        value={value} 
        onChange={onChange} 
        className={`w-full px-4 py-3 pl-12 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/20 focus:outline-none transition-all duration-200 ${error ? 'border-red-500' : ''}`}
      />
      <button 
        type="button" 
        onClick={onToggle} 
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
    {error && (
      <motion.p 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-red-500 text-xs mt-1 flex items-center gap-1"
      >
        <AlertCircle className="w-3 h-3" />
        {error}
      </motion.p>
    )}
  </motion.div>
);

// Enhanced Settings Card Component
const SettingsCard = ({ title, icon: Icon, badge, children }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
  >
    <div className="relative p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Icon className="w-7 h-7 text-white" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">{title}</h2>
            {badge && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                {badge}
              </span>
            )}
          </div>
        </div>
        <Sparkles className="w-5 h-5 text-gray-300 group-hover:text-yellow-500 transition-colors" />
      </div>
    </div>
    <div className="p-6 space-y-6">{children}</div>
  </motion.div>
);

// Enhanced Settings Row Component
const SettingsRow = ({ label, description, children, icon: Icon }) => (
  <motion.div 
    whileHover={{ x: 4 }}
    className="group flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all duration-200"
  >
    <div className="flex items-center gap-4">
      {Icon && (
        <div className="w-10 h-10 bg-gray-100 group-hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
      )}
      <div>
        <h3 className="font-bold text-gray-900">{label}</h3>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {children}
      <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  </motion.div>
);

// Enhanced Toggle Button Component
const ToggleButton = ({ enabled, onChange }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onChange}
    className={`relative inline-flex items-center h-7 rounded-full w-14 transition-all duration-300 ${
      enabled ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gray-200'
    }`}
  >
    <motion.span
      layout
      className={`inline-block w-5 h-5 transform bg-white rounded-full shadow-md transition-transform ${
        enabled ? 'translate-x-8' : 'translate-x-1.5'
      }`}
    />
    {enabled && (
      <CheckCheck className="absolute right-1.5 w-3 h-3 text-white" />
    )}
  </motion.button>
);

// Enhanced Tab Button Component
const TabButton = ({ active, onClick, icon: Icon, children, badge }) => (
  <motion.button
    whileHover={{ x: 4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`relative flex items-center justify-between px-5 py-4 rounded-2xl font-semibold text-sm w-full transition-all duration-300 ${
      active
        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400'}`} />
      <span>{children}</span>
    </div>
    {badge && (
      <span className={`text-xs px-2 py-1 rounded-full ${
        active ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
      }`}>
        {badge}
      </span>
    )}
  </motion.button>
);

const SettingsPage = () => {
  const { user, logout, updateUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  
  const [isStravaConnected, setIsStravaConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showLocation: true,
    showActivities: true,
    showStats: true
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    matchNotifications: true,
    activityNotifications: true,
    challengeNotifications: true,
    soundEnabled: true
  });
  
  const [appSettings, setAppSettings] = useState({
    darkMode: false,
    language: 'sv',
    units: 'metric',
    autoSync: true
  });
  
  const [profileSettings, setProfileSettings] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    loadSettings();
    
    if (user && user.stravaId) {
      setIsStravaConnected(true);
    }

    const query = new URLSearchParams(location.search);
    if (query.get('strava') === 'success') {
      toast.success('Ditt Strava-konto har anslutits!');
      setIsStravaConnected(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (query.get('strava') === 'error') {
      toast.error('Kunde inte ansluta till Strava. Försök igen.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.search, user]);

  const loadSettings = async () => {
    try {
      const response = await api.get('/user/settings');
      if (response.data.success) {
        const settings = response.data.settings;
        setPrivacySettings(prev => ({ ...prev, ...settings.privacy }));
        setNotificationSettings(prev => ({ ...prev, ...settings.notifications }));
        setAppSettings(prev => ({ ...prev, ...settings.app }));
      }
    } catch (error) {
      console.log('Settings not found, using defaults');
    }
  };

  const saveSettings = async (category, settings) => {
    setIsLoading(true);
    try {
      await api.put('/user/settings', {
        category,
        settings
      });
      toast.success('Inställningar sparade!');
    } catch (error) {
      toast.error('Kunde inte spara inställningar');
      console.error('Settings save error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await api.put('/user/profile', profileSettings);
      if (response.data.success) {
        updateUser(response.data.user);
        toast.success('Profil uppdaterad!');
      }
    } catch (error) {
      toast.error('Kunde inte uppdatera profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Lösenorden matchar inte');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error('Lösenordet måste vara minst 8 tecken');
      return;
    }
    
    setIsLoading(true);
    try {
      await api.put('/user/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Lösenord ändrat!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Kunde inte ändra lösenord');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Är du säker på att du vill radera ditt konto? Detta kan inte ångras.')) {
      if (window.confirm('Detta kommer permanent radera all din data. Är du verkligen säker?')) {
        try {
          await api.delete('/user/account');
          toast.success('Kontot har raderats');
          logout();
          navigate('/');
        } catch (error) {
          toast.error('Kunde inte radera konto');
        }
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm('Är du säker på att du vill logga ut?')) {
      logout();
      navigate('/');
      toast.success('Du har loggats ut');
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    toast.loading('Startar synkronisering med Strava...');
    
    try {
      const response = await api.post('/strava/sync');
      if (response.data.success) {
        toast.dismiss();
        toast.success(`${response.data.synced} nya aktiviteter har synkroniserats!`);
      } else {
        toast.dismiss();
        toast.error(response.data.message || 'Ett fel uppstod vid synkronisering.');
      }
    } catch (error) {
      toast.dismiss();
      console.error("Sync error:", error);
      toast.error('Nätverksfel vid synkronisering.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <AnimatedBackground />
      
      {/* Header */}
      <div className="relative bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Inställningar
              </h1>
              <p className="text-lg text-gray-600 mt-2 flex items-center gap-2">
                <SettingsIcon className="w-4 h-4" />
                Hantera dina kontoinställningar och preferenser
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="hidden md:flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-full"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-700">Alla system fungerar</span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-lg border border-gray-100 p-2"
            >
              <div className="p-4 mb-2">
                <div className="flex items-center gap-4">
                  <img 
                    src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-2xl object-cover shadow-md"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900">{user?.firstName} {user?.lastName}</h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1 p-2">
                <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={UserCheck}>
                  Profil
                </TabButton>
                <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={ShieldCheck}>
                  Säkerhet
                </TabButton>
                <TabButton active={activeTab === 'connections'} onClick={() => setActiveTab('connections')} icon={LinkIcon} badge={isStravaConnected ? '1' : null}>
                  Anslutningar
                </TabButton>
                <TabButton active={activeTab === 'privacy'} onClick={() => setActiveTab('privacy')} icon={Lock}>
                  Integritet
                </TabButton>
                <TabButton active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon={BellRing}>
                  Notiser
                </TabButton>
                <TabButton active={activeTab === 'app'} onClick={() => setActiveTab('app')} icon={Laptop}>
                  App
                </TabButton>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-red-500 to-red-600 rounded-3xl shadow-lg p-6 text-white"
            >
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-8 h-8" />
                <h3 className="font-bold text-lg">Premium</h3>
              </div>
              <p className="text-sm text-white/90 mb-4">Få tillgång till alla funktioner och obegränsade matchningar!</p>
              <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur text-white font-bold py-2 px-4 rounded-xl transition-all">
                Uppgradera nu
              </button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-lg border border-gray-100 p-2"
            >
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout} 
                className="flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm w-full text-left text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Logga ut</span>
              </motion.button>
            </motion.div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-6">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <SettingsCard key="profile" title="Profilinformation" icon={User} badge="Uppdaterad">
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-6 p-6 bg-gray-50 rounded-2xl"
                    >
                      <div className="relative group">
                        <img 
                          src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`} 
                          alt="Profile" 
                          className="w-32 h-32 rounded-3xl object-cover shadow-xl transition-transform group-hover:scale-105"
                        />
                        <motion.button 
                          type="button" 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="absolute bottom-0 right-0 bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                        >
                          <Camera className="w-5 h-5" />
                        </motion.button>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Din profilbild</h3>
                        <p className="text-sm text-gray-600 mb-4">Klicka på kameran för att ladda upp en ny bild</p>
                        <p className="text-xs text-gray-500">JPG, GIF eller PNG. Max 5MB.</p>
                      </div>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField 
                        label="Förnamn" 
                        id="firstName" 
                        value={profileSettings.firstName} 
                        onChange={e => setProfileSettings({...profileSettings, firstName: e.target.value})} 
                        icon={User}
                      />
                      <InputField 
                        label="Efternamn" 
                        id="lastName" 
                        value={profileSettings.lastName} 
                        onChange={e => setProfileSettings({...profileSettings, lastName: e.target.value})}
                        icon={User}
                      />
                    </div>
                    
                    <InputField 
                      label="E-postadress" 
                      id="email" 
                      type="email" 
                      value={profileSettings.email} 
                      onChange={e => setProfileSettings({...profileSettings, email: e.target.value})} 
                      icon={Mail} 
                    />
                    
                    <InputField 
                      label="Plats" 
                      id="location" 
                      value={profileSettings.location} 
                      onChange={e => setProfileSettings({...profileSettings, location: e.target.value})} 
                      icon={MapPin} 
                    />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 mb-2">Om mig</label>
                      <textarea 
                        id="bio" 
                        rows="4" 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/20 focus:outline-none transition-all duration-200 resize-none" 
                        value={profileSettings.bio} 
                        onChange={e => setProfileSettings({...profileSettings, bio: e.target.value})} 
                        placeholder="Berätta lite om dig själv..."
                      />
                      <p className="text-xs text-gray-500 mt-2">{profileSettings.bio.length}/500 tecken</p>
                    </motion.div>
                    
                    <motion.div 
                      className="flex justify-end gap-4 pt-6 border-t border-gray-100"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.button 
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-3 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all"
                        onClick={() => {
                          setProfileSettings({
                            firstName: user?.firstName || '',
                            lastName: user?.lastName || '',
                            email: user?.email || '',
                            bio: user?.bio || '',
                            location: user?.location || ''
                          });
                        }}
                      >
                        Avbryt
                      </motion.button>
                      <motion.button 
                        type="submit" 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Sparar...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Spara ändringar
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  </form>
                </SettingsCard>
              )}

              {activeTab === 'security' && (
               <SettingsCard title="Säkerhet" icon={Shield}>
                 <form onSubmit={handlePasswordChange} className="space-y-6">
                   <h3 className="font-semibold text-lg text-gray-800 border-b pb-3">Ändra lösenord</h3>
                   <PasswordField label="Nuvarande lösenord" id="currentPassword" value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} show={showPasswords.current} onToggle={() => setShowPasswords(p => ({...p, current: !p.current}))} />
                   <PasswordField label="Nytt lösenord" id="newPassword" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} show={showPasswords.new} onToggle={() => setShowPasswords(p => ({...p, new: !p.new}))} />
                   <PasswordField label="Bekräfta nytt lösenord" id="confirmPassword" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} show={showPasswords.confirm} onToggle={() => setShowPasswords(p => ({...p, confirm: !p.confirm}))} />
                   
                   <motion.div 
                    className="flex justify-end pt-6 border-t border-gray-100"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.button 
                      type="submit" 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 whitespace-nowrap" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Sparar...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Spara lösenord
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                 </form>

                 <div className="border-t pt-6 space-y-4">
                    <h3 className="font-semibold text-lg text-red-600">Farlig zon</h3>
                     <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex justify-between items-center">
                       <div>
                         <h4 className="font-bold text-red-800">Radera konto</h4>
                         <p className="text-sm text-red-700">All din data kommer raderas permanent. Detta kan inte ångras.</p>
                       </div>
                       <motion.button 
                         onClick={handleDeleteAccount} 
                         whileHover={{ scale: 1.02 }}
                         whileTap={{ scale: 0.98 }}
                         className="px-4 py-2 bg-white text-red-600 border-2 border-red-600 font-semibold rounded-xl hover:bg-red-50 transition-all flex items-center gap-2 whitespace-nowrap"
                       >
                         <Trash2 className="w-4 h-4"/>
                         Radera konto
                       </motion.button>
                     </div>
                 </div>
               </SettingsCard>
            )}

            {activeTab === 'connections' && (
              <SettingsCard title="Anslutningar" icon={LinkIcon}>
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <img src="/strava-logo.png" alt="Strava" className="w-10 h-10"/>
                    <div>
                      <h3 className="font-semibold text-gray-700">Strava</h3>
                      <p className="text-sm text-gray-500">
                        {isStravaConnected 
                          ? "Synkronisera dina löprundor automatiskt."
                          : "Anslut ditt Strava-konto för att synka."
                        }
                      </p>
                    </div>
                  </div>
                  {isStravaConnected ? (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                            <CheckCircle className="w-5 h-5" />
                            <span>Ansluten</span>
                        </div>
                        <motion.button 
                            onClick={handleSync} 
                            disabled={syncing} 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                            {syncing ? 'Synkar...' : 'Synka nu'}
                        </motion.button>
                    </div>
                  ) : (
                    <motion.a 
                      href={`${process.env.REACT_APP_SERVER_URL || 'http://localhost:8000'}/api/auth/strava`} 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 whitespace-nowrap inline-block"
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span>Anslut till Strava</span>
                    </motion.a>
                  )}
                </div>
              </SettingsCard>
            )}
            
            {activeTab === 'privacy' && (
              <SettingsCard title="Integritet" icon={Lock}>
                <SettingsRow label="Profilsynlighet" description="Vem kan se din profil?">
                  <select className="input-sm" value={privacySettings.profileVisibility} onChange={e => setPrivacySettings({...privacySettings, profileVisibility: e.target.value})}>
                    <option value="public">Alla</option>
                    <option value="friends">Bara vänner</option>
                    <option value="private">Bara jag</option>
                  </select>
                </SettingsRow>
                <SettingsRow label="Visa min plats" description="Visa din stad på din profil">
                  <ToggleButton enabled={privacySettings.showLocation} onChange={() => setPrivacySettings(p => ({...p, showLocation: !p.showLocation}))} />
                </SettingsRow>
                 <SettingsRow label="Visa mina aktiviteter" description="Låt andra se dina träningspass">
                  <ToggleButton enabled={privacySettings.showActivities} onChange={() => setPrivacySettings(p => ({...p, showActivities: !p.showActivities}))} />
                </SettingsRow>
                 <SettingsRow label="Visa min statistik" description="Låt andra se din träningsstatistik">
                  <ToggleButton enabled={privacySettings.showStats} onChange={() => setPrivacySettings(p => ({...p, showStats: !p.showStats}))} />
                </SettingsRow>
                <motion.div 
                  className="flex justify-end pt-6 border-t border-gray-100"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.button 
                    onClick={() => saveSettings('privacy', privacySettings)} 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 whitespace-nowrap" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Sparar...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Spara ändringar
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </SettingsCard>
            )}

             {activeTab === 'notifications' && (
              <SettingsCard title="Notiser" icon={Bell}>
                <SettingsRow label="E-postnotiser" description="Få notiser om viktiga händelser via mail">
                  <ToggleButton enabled={notificationSettings.emailNotifications} onChange={() => setNotificationSettings(p => ({...p, emailNotifications: !p.emailNotifications}))} />
                </SettingsRow>
                 <SettingsRow label="Push-notiser" description="Få notiser direkt till din enhet">
                  <ToggleButton enabled={notificationSettings.pushNotifications} onChange={() => setNotificationSettings(p => ({...p, pushNotifications: !p.pushNotifications}))} />
                </SettingsRow>
                 <SettingsRow label="Nya matchningar" description="Få notis när du får en ny matchning">
                  <ToggleButton enabled={notificationSettings.matchNotifications} onChange={() => setNotificationSettings(p => ({...p, matchNotifications: !p.matchNotifications}))} />
                </SettingsRow>
                <SettingsRow label="Aktivitetsuppdateringar" description="Notiser om kudos och kommentarer">
                  <ToggleButton enabled={notificationSettings.activityNotifications} onChange={() => setNotificationSettings(p => ({...p, activityNotifications: !p.activityNotifications}))} />
                </SettingsRow>
                 <SettingsRow label="Utmaningar" description="Uppdateringar om utmaningar du deltar i">
                  <ToggleButton enabled={notificationSettings.challengeNotifications} onChange={() => setNotificationSettings(p => ({...p, challengeNotifications: !p.challengeNotifications}))} />
                </SettingsRow>
                <SettingsRow label="Ljud i appen" description="Aktivera/inaktivera ljudeffekter">
                  <ToggleButton enabled={notificationSettings.soundEnabled} onChange={() => setNotificationSettings(p => ({...p, soundEnabled: !p.soundEnabled}))} />
                </SettingsRow>
                <motion.div 
                  className="flex justify-end pt-6 border-t border-gray-100"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.button 
                    onClick={() => saveSettings('notifications', notificationSettings)} 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 whitespace-nowrap" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Sparar...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Spara ändringar
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </SettingsCard>
            )}

            {activeTab === 'app' && (
              <SettingsCard title="App-inställningar" icon={SettingsIcon}>
                <SettingsRow label="Mörkt läge" description="Byt mellan ljust och mörkt tema">
                  <ToggleButton enabled={appSettings.darkMode} onChange={() => setAppSettings(p => ({...p, darkMode: !p.darkMode}))} />
                </SettingsRow>
                <SettingsRow label="Språk" description="Välj språk för appen">
                   <select className="input-sm" value={appSettings.language} onChange={e => setAppSettings({...appSettings, language: e.target.value})}>
                    <option value="sv">Svenska</option>
                    <option value="en">Engelska</option>
                  </select>
                </SettingsRow>
                <SettingsRow label="Enheter" description="Välj mellan metriska och imperialistiska enheter">
                   <select className="input-sm" value={appSettings.units} onChange={e => setAppSettings({...appSettings, units: e.target.value})}>
                    <option value="metric">Kilometer</option>
                    <option value="imperial">Miles</option>
                  </select>
                </SettingsRow>
                <SettingsRow label="Automatisk synkronisering" description="Synka med Strava automatiskt i bakgrunden">
                  <ToggleButton enabled={appSettings.autoSync} onChange={() => setAppSettings(p => ({...p, autoSync: !p.autoSync}))} />
                </SettingsRow>
                <motion.div 
                  className="flex justify-end pt-6 border-t border-gray-100"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.button 
                    onClick={() => saveSettings('app', appSettings)} 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 whitespace-nowrap" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Sparar...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Spara ändringar
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </SettingsCard>
            )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 