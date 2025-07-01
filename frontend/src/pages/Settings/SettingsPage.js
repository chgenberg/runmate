import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Shield, 
  LogOut, 
  ChevronRight,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  MapPin,
  Activity,
  Smartphone,
  Lock,
  Heart,
  Zap,
  Brain,
  Camera,
  Mail,
  Key,
  HelpCircle,
  FileText,
  AlertCircle,
  Trophy,
  Calendar,
  TrendingUp
} from 'lucide-react';
import AppleHealthSync from '../../components/Settings/AppleHealthSync';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const SettingsPage = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [showAppleHealthSync, setShowAppleHealthSync] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    matches: true,
    messages: true,
    activities: true,
    challenges: false,
    reminders: true
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  const handleToggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
  };

  const handleAppleHealthConnect = async () => {
    setShowAppleHealthSync(true);
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const response = await api.put('/users/profile', profileData);
      updateUser(response.data);
      toast.success('Profil uppdaterad!');
    } catch (error) {
      toast.error('Kunde inte uppdatera profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const ToggleSwitch = ({ value, onChange, disabled = false }) => (
    <motion.button
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
        value ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        animate={{ x: value ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="inline-block h-5 w-5 transform rounded-full bg-white shadow-lg"
      />
    </motion.button>
  );

  const SettingCard = ({ icon: Icon, title, description, children, action, highlight }) => (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={action && !children ? action : undefined}
      className={`bg-white rounded-2xl p-6 shadow-lg border ${
        highlight ? 'border-orange-200' : 'border-gray-100'
      } transition-all ${action && !children ? 'cursor-pointer hover:shadow-xl' : ''}`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${
          highlight ? 'bg-gradient-to-br from-orange-400 to-red-500' : 'bg-gray-100'
        } flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${highlight ? 'text-white' : 'text-gray-600'}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600 mb-3">{description}</p>
          {children}
        </div>
        {action && !children && (
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        )}
      </div>
    </motion.div>
  );

  const PreferenceCard = ({ icon: Icon, title, description, value, onChange }) => (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onChange}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transition-all cursor-pointer hover:shadow-xl group"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
          <Icon className="w-6 h-6 text-gray-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div className="pointer-events-none">
          <ToggleSwitch value={value} onChange={() => {}} />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-20 lg:pb-0">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 opacity-50" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-orange-200 to-red-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-red-200 to-pink-200 rounded-full blur-3xl opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Inställningar
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Anpassa din RunMate-upplevelse och hantera dina preferenser
            </p>
          </motion.div>

          {/* AI Settings Recommendation Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto mt-8"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative bg-white rounded-3xl shadow-xl p-8 border border-orange-100">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        Förbered för lopp
                      </h2>
                      <p className="text-gray-600">
                        Få en personlig träningsplan för ditt nästa lopp med vår AI-coach
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/app/dashboard')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                  >
                    <Trophy className="w-5 h-5" />
                    Skapa träningsplan
                  </motion.button>
                </div>
                
                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-800">Träningskalender</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-pink-600" />
                    <span className="text-sm font-medium text-gray-800">Progressplan</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
                    <Zap className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm font-medium text-gray-800">AI-coaching</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Profil</h2>
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center gap-6 mb-8">
              <div className="relative">
                <img
                  src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h3>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Förnamn</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Efternamn</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">E-post</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveProfile}
              disabled={isLoading}
              className="mt-6 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {isLoading ? 'Sparar...' : 'Spara ändringar'}
            </motion.button>
          </div>
        </motion.div>

        {/* Integrations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Integrationer</h2>
          <div className="space-y-4">
            <SettingCard
              icon={Activity}
              title="Apple Health"
              description="Synka dina träningsdata automatiskt från Apple Health"
              highlight={!showAppleHealthSync}
              action={handleAppleHealthConnect}
            >
              {showAppleHealthSync && (
                <div className="mt-4">
                  <AppleHealthSync />
                </div>
              )}
            </SettingCard>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Notifieringar</h2>
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100 space-y-6">
            {[
              { key: 'matches', icon: Heart, title: 'Nya matchningar', desc: 'När någon vill springa med dig' },
              { key: 'messages', icon: Mail, title: 'Meddelanden', desc: 'När du får nya meddelanden' },
              { key: 'activities', icon: Activity, title: 'Aktiviteter', desc: 'Påminnelser om träningspass' },
              { key: 'challenges', icon: Zap, title: 'Utmaningar', desc: 'Uppdateringar om dina utmaningar' },
              { key: 'reminders', icon: Bell, title: 'Påminnelser', desc: 'Dagliga träningspåminnelser' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
                <ToggleSwitch
                  value={notifications[item.key]}
                  onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Preferenser</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PreferenceCard
              icon={darkMode ? Moon : Sun}
              title="Mörkt läge"
              description="Växla mellan ljust och mörkt tema"
              value={darkMode}
              onChange={handleToggleDarkMode}
            />

            <PreferenceCard
              icon={soundEnabled ? Volume2 : VolumeX}
              title="Ljud"
              description="Aktivera eller inaktivera ljudeffekter"
              value={soundEnabled}
              onChange={() => setSoundEnabled(!soundEnabled)}
            />

            <PreferenceCard
              icon={MapPin}
              title="Platsåtkomst"
              description="Tillåt appen att använda din plats"
              value={locationEnabled}
              onChange={() => setLocationEnabled(!locationEnabled)}
            />

            <PreferenceCard
              icon={Smartphone}
              title="Push-notiser"
              description="Ta emot notiser på din enhet"
              value={true}
              onChange={() => {}}
            />
          </div>
        </motion.div>

        {/* Security & Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Säkerhet & Integritet</h2>
          <div className="space-y-4">
            <SettingCard
              icon={Key}
              title="Ändra lösenord"
              description="Uppdatera ditt kontolösenord"
              action={() => navigate('/app/settings/password')}
            />

            <SettingCard
              icon={Shield}
              title="Integritetspolicy"
              description="Läs om hur vi hanterar dina data"
              action={() => navigate('/privacy')}
            />

            <SettingCard
              icon={FileText}
              title="Användarvillkor"
              description="Läs våra användarvillkor"
              action={() => navigate('/terms')}
            />

            <SettingCard
              icon={Lock}
              title="Tvåfaktorsautentisering"
              description="Lägg till ett extra säkerhetslager"
              action={() => navigate('/app/settings/2fa')}
            />
          </div>
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Support</h2>
          <div className="space-y-4">
            <SettingCard
              icon={HelpCircle}
              title="Hjälpcenter"
              description="Få svar på vanliga frågor"
              action={() => navigate('/faq')}
            />

            <SettingCard
              icon={Mail}
              title="Kontakta oss"
              description="Skicka oss ett meddelande"
              action={() => window.location.href = 'mailto:support@runmate.se'}
            />
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Kontohantering</h2>
          <div className="bg-red-50 rounded-3xl p-8 border border-red-200">
            <div className="flex items-start gap-4 mb-6">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-red-900 mb-2">Farlig zon</h3>
                <p className="text-red-700 text-sm">
                  Dessa åtgärder är permanenta och kan inte ångras. Var försiktig.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-red-600 font-medium rounded-xl border border-red-200 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logga ut
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
              >
                <AlertCircle className="w-5 h-5" />
                Radera konto
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* App Version */}
        <div className="text-center py-8 text-sm text-gray-500">
          RunMate v2.0.0 • Made with ❤️ in Sweden
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 