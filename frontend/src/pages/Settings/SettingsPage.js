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

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stravaConnected, setStravaConnected] = useState(false);
  const [appleHealthConnected, setAppleHealthConnected] = useState(false);
  const [garminConnected] = useState(false);
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
    // Check for Strava success/error in URL
    const urlParams = new URLSearchParams(window.location.search);
    const stravaStatus = urlParams.get('strava');
    
    if (stravaStatus === 'success') {
      alert('🎉 Strava har anslutits framgångsrikt!');
      setStravaConnected(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (stravaStatus === 'error') {
      alert('❌ Ett fel uppstod vid anslutning till Strava. Försök igen.');
    }
    
    // Check if Strava is connected by making API call
    const checkStravaStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch('https://staging-runmate-backend-production.up.railway.app/api/users/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            if (userData.user?.stravaId) {
              setStravaConnected(true);
            }
          }
        }
      } catch (error) {
        console.error('Error checking Strava status:', error);
      }
    };
    
    checkStravaStatus();
    
    // Load saved preferences
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, [user]);

  const handleStravaConnect = async () => {
    setLoading(true);
    
    if (!user?.id) {
      console.error('No user ID found');
      alert('Du måste vara inloggad för att ansluta till Strava.');
      setLoading(false);
      return;
    }
    
    try {
      // Use the alternative endpoint that bypasses JWT token issues
      const stravaAuthUrl = `https://staging-runmate-backend-production.up.railway.app/api/auth/strava/${user.id}`;
      console.log('Redirecting to Strava auth with user ID:', user.id);
      
      // Create a temporary anchor element and click it
      const link = document.createElement('a');
      link.href = stravaAuthUrl;
      link.target = '_self'; // Same tab
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error connecting to Strava:', error);
      alert('Ett fel uppstod vid anslutning till Strava.');
      setLoading(false);
    }
  };

  const handleToggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    // Here you would apply dark mode to the app
  };

  const handleAppleHealthConnect = async () => {
    if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
      // iOS 13+ permission request
      const permission = await DeviceMotionEvent.requestPermission();
      if (permission === 'granted') {
        // Connect to Apple Health
        setAppleHealthConnected(true);
        alert('🍎 Apple Health ansluten! (Demo)');
      }
    } else {
      // Fallback for web/Android
      alert('🍎 Apple Health är endast tillgänglig på iOS-enheter');
    }
  };

  const handleGarminConnect = () => {
    setLoading(true);
    
    if (!user?.id) {
      console.error('No user ID found');
      alert('Du måste vara inloggad för att ansluta till Garmin.');
      setLoading(false);
      return;
    }
    
    try {
      // Redirect to Garmin OAuth
      const garminAuthUrl = `https://staging-runmate-backend-production.up.railway.app/api/integrations/garmin/auth`;
      window.location.href = garminAuthUrl;
    } catch (error) {
      console.error('Error connecting to Garmin:', error);
      alert('Ett fel uppstod vid anslutning till Garmin.');
      setLoading(false);
    }
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
          action: () => navigate('/profile'),
          value: user?.name || 'Namn saknas'
        }
      ]
    },
    {
      title: 'Integrationer',
      items: [
        {
          icon: Activity,
          label: 'Strava',
          action: handleStravaConnect,
          value: stravaConnected ? 'Ansluten' : 'Koppla till Strava',
          highlight: !stravaConnected,
          status: stravaConnected ? 'connected' : 'disconnected'
        },
        {
          icon: Activity,
          label: 'Apple Watch',
          action: handleAppleHealthConnect,
          value: appleHealthConnected ? 'Ansluten' : 'Koppla till Apple Health',
          highlight: !appleHealthConnected,
          status: appleHealthConnected ? 'connected' : 'disconnected'
        },
        {
          icon: Activity,
          label: 'Garmin',
          action: handleGarminConnect,
          value: garminConnected ? 'Ansluten' : 'Koppla till Garmin',
          highlight: !garminConnected,
          status: garminConnected ? 'connected' : 'disconnected'
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
        {/* Strava Connect CTA - Only show if not connected */}
        {!stravaConnected && (
          <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl shadow-lg animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Activity className="w-5 h-5 text-white" />
                  <h3 className="font-semibold text-white">Koppla till Strava</h3>
                </div>
                <p className="text-sm text-white/80">
                  Synka dina löppass automatiskt
                </p>
              </div>
              <button
                onClick={handleStravaConnect}
                disabled={loading}
                className="px-4 py-2 bg-white text-primary-600 font-medium rounded-xl hover:bg-gray-50 transition-all transform hover:scale-105 disabled:opacity-50"
              >
                {loading ? 'Ansluter...' : 'Anslut'}
              </button>
            </div>
          </div>
        )}

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