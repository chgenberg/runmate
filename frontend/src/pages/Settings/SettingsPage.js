import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
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
  Check
} from 'lucide-react';
import AppleHealthSync from '../../components/Settings/AppleHealthSync';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showAppleHealthSync, setShowAppleHealthSync] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    matches: true,
    messages: true,
    activities: true,
    challenges: false
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  useEffect(() => {
    // Load saved preferences
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);



  const handleToggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    // Here you would apply dark mode to the app
  };

  const handleAppleHealthConnect = async () => {
    // Simply show the Apple Health sync component
    setShowAppleHealthSync(true);
  };



  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const settingsSections = [
    {
      title: 'Profil',
      items: [
        {
          icon: User,
          label: 'Redigera profil',
          action: () => navigate('/app/profile'),
          value: user?.name || 'Namn saknas'
        }
      ]
    },
    {
      title: 'Integrationer',
      items: [
        {
          icon: Activity,
          label: 'Apple Health',
          action: handleAppleHealthConnect,
          value: showAppleHealthSync ? 'Konfigurerad' : 'Konfigurera Apple Health',
          highlight: !showAppleHealthSync,
          status: showAppleHealthSync ? 'connected' : 'disconnected'
        }
      ]
    },
    {
      title: 'Notifieringar',
      items: [
        {
          icon: Bell,
          label: 'Nya matchningar',
          toggle: true,
          value: notifications.matches,
          onChange: () => setNotifications(prev => ({ ...prev, matches: !prev.matches }))
        },
        {
          icon: Bell,
          label: 'Meddelanden',
          toggle: true,
          value: notifications.messages,
          onChange: () => setNotifications(prev => ({ ...prev, messages: !prev.messages }))
        },
        {
          icon: Bell,
          label: 'Aktiviteter',
          toggle: true,
          value: notifications.activities,
          onChange: () => setNotifications(prev => ({ ...prev, activities: !prev.activities }))
        },
        {
          icon: Bell,
          label: 'Utmaningar',
          toggle: true,
          value: notifications.challenges,
          onChange: () => setNotifications(prev => ({ ...prev, challenges: !prev.challenges }))
        }
      ]
    },
    {
      title: 'Inställningar',
      items: [
        {
          icon: darkMode ? Moon : Sun,
          label: 'Mörkt läge',
          toggle: true,
          value: darkMode,
          onChange: handleToggleDarkMode
        },
        {
          icon: soundEnabled ? Volume2 : VolumeX,
          label: 'Ljud',
          toggle: true,
          value: soundEnabled,
          onChange: () => setSoundEnabled(!soundEnabled)
        },
        {
          icon: MapPin,
          label: 'Platsåtkomst',
          toggle: true,
          value: locationEnabled,
          onChange: () => setLocationEnabled(!locationEnabled)
        }
      ]
    },
    {
      title: 'Sekretess & Säkerhet',
      items: [
        {
          icon: Shield,
          label: 'Integritetspolicy',
          action: () => navigate('/privacy')
        },
        {
          icon: Shield,
          label: 'Användarvillkor',
          action: () => navigate('/terms')
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold gradient-text">Inställningar</h1>
        </div>
      </div>

      {/* Settings Content */}
      <div className="pb-20 md:pb-8">


        {/* Settings Sections */}
        <div className="mt-6 space-y-6">
          {settingsSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="px-4">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                {section.title}
              </h2>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className={`flex items-center justify-between p-4 ${
                      itemIndex !== section.items.length - 1 ? 'border-b border-gray-100' : ''
                    } ${item.action && !item.toggle ? 'tap-highlight cursor-pointer hover:bg-gray-50' : ''}`}
                    onClick={item.action && !item.toggle ? item.action : undefined}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        item.highlight ? 'bg-gradient-to-br from-primary-500 to-secondary-500' : 'bg-gray-100'
                      }`}>
                        <item.icon className={`w-5 h-5 ${
                          item.highlight ? 'text-white' : 'text-gray-600'
                        }`} />
                      </div>
                      <span className="font-medium text-gray-900">{item.label}</span>
                    </div>
                    
                    {item.toggle ? (
                      <button
                        onClick={item.onChange}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          item.value ? 'bg-gradient-to-r from-primary-500 to-secondary-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            item.value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    ) : item.status ? (
                      <div className="flex items-center space-x-2">
                        {item.status === 'connected' ? (
                          <>
                            <span className="text-sm text-green-600 font-medium">{item.value}</span>
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                              <Check className="w-4 h-4 text-green-600" />
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-sm text-primary-600 font-medium">{item.value}</span>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        {item.value && (
                          <span className="text-sm text-gray-500">{item.value}</span>
                        )}
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Apple Health Sync Component */}
          {showAppleHealthSync && (
            <div className="px-4">
              <AppleHealthSync />
            </div>
          )}

          {/* Logout Button */}
          <div className="px-4 pt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 p-4 bg-red-50 text-red-600 font-medium rounded-2xl hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logga ut</span>
            </button>
          </div>

          {/* App Version */}
          <div className="text-center py-6 text-sm text-gray-500">
            RunMate v1.0.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 