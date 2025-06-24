import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Download, 
  CheckCircle, 
  Clock, 
  Activity,
  BarChart3,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const AppleHealthSync = () => {
  const [syncStatus, setSyncStatus] = useState({
    hasData: false,
    totalImported: 0,
    lastImport: null,
    isLoading: false
  });
  const [isSyncing] = useState(false);

  useEffect(() => {
    checkSyncStatus();
  }, []);

  const checkSyncStatus = async () => {
    try {
      setSyncStatus(prev => ({ ...prev, isLoading: true }));
      const response = await api.get('/health/apple-health/status');
      setSyncStatus({
        hasData: response.data.hasAppleHealthData,
        totalImported: response.data.totalImported,
        lastImport: response.data.lastImport,
        isLoading: false
      });
    } catch (error) {
      console.error('Error checking Apple Health status:', error);
      setSyncStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  const refreshStats = async () => {
    try {
      setSyncStatus(prev => ({ ...prev, isLoading: true }));
      
      // Anropa refresh stats endpoint
      const response = await api.post('/health/refresh-stats');
      
      if (response.data.success) {
        toast.success(`🎉 Statistik uppdaterad! ${response.data.stats.totalActivities} träningspass, ${response.data.stats.totalDistance}km`, {
          duration: 4000
        });
        
        // Uppdatera status också
        await checkSyncStatus();
        
        // Trigga profiluppdatering om det finns en callback
        if (typeof refreshStats === 'function') {
          refreshStats();
        }
      }
    } catch (error) {
      console.error('Error refreshing stats:', error);
      toast.error('Kunde inte uppdatera statistik');
    } finally {
      setSyncStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleManualSync = async () => {
    // Check if user is on iOS device
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (isIOS) {
      // For now, show instructions since we need to manually create the shortcut
      if (window.confirm(
        '🍎 Ladda ner iOS Shortcut för Apple Health-synk:\n\n' +
        '1. Klicka OK för att kopiera Shortcut-länk\n' +
        '2. Öppna länken i Safari på iPhone\n' +
        '3. Godkänn behörigheter\n' +
        '4. Kör shortcut för att synka\n\n' +
        'Vill du fortsätta?'
      )) {
        // Copy shortcut URL to clipboard
        const shortcutUrl = 'https://www.icloud.com/shortcuts/runmate-health-sync';
        navigator.clipboard.writeText(shortcutUrl).then(() => {
          toast.success('📱 Shortcut-länk kopierad! Öppna i Safari på iPhone', {
            duration: 6000
          });
        }).catch(() => {
          toast('📱 Shortcut-länk: https://www.icloud.com/shortcuts/runmate-health-sync\n\nKopiera denna länk och öppna i Safari på iPhone', {
            duration: 8000,
            icon: '🔗'
          });
        });
      }
    } else {
      toast('🍎 Apple Health kräver iPhone/iPad. Besök sidan på din iPhone!', {
        duration: 5000,
        icon: '📱'
      });
    }
  };

  const formatLastImport = (dateString) => {
    if (!dateString) return 'Aldrig';
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Nyss';
    if (diffHours < 24) return `${diffHours} timmar sedan`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} dagar sedan`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-pink-500 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">Apple Health</h3>
            <p className="text-white/80 text-sm">
              Synka träningspass från Apple Watch
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Status */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-sm text-gray-500">Importerade</div>
            <div className="font-semibold text-gray-900">
              {syncStatus.isLoading ? '...' : syncStatus.totalImported}
            </div>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-sm text-gray-500">Senaste sync</div>
            <div className="font-semibold text-gray-900 text-xs">
              {syncStatus.isLoading ? '...' : formatLastImport(syncStatus.lastImport)}
            </div>
          </div>
          
          <div className="text-center">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 ${
              syncStatus.hasData ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {syncStatus.hasData ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div className="text-sm text-gray-500">Status</div>
            <div className={`font-semibold text-xs ${
              syncStatus.hasData ? 'text-green-600' : 'text-gray-400'
            }`}>
              {syncStatus.isLoading ? '...' : (syncStatus.hasData ? 'Aktiv' : 'Ingen data')}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Så här synkar du Apple Health-data:
          </h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Ladda ner iOS Shortcut (länk nedan)</li>
            <li>2. Godkänn behörigheter för Apple Health</li>
            <li>3. Kör shortcut för att synka träningspass</li>
            <li>4. Uppdatera status här för att se resultatet</li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium py-3 px-4 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
          >
            <Activity className="w-5 h-5" />
            <span>{isSyncing ? 'Synkar...' : 'Ladda ner iOS Shortcut'}</span>
          </button>

          <button
            onClick={checkSyncStatus}
            disabled={syncStatus.isLoading}
            className="w-full bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncStatus.isLoading ? 'animate-spin' : ''}`} />
            <span>Uppdatera status</span>
          </button>
          
          <button
            onClick={refreshStats}
            disabled={syncStatus.isLoading}
            className="w-full bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-xl hover:bg-blue-200 transition-all flex items-center justify-center space-x-2"
          >
            <Activity className={`w-4 h-4 ${syncStatus.isLoading ? 'animate-spin' : ''}`} />
            <span>Uppdatera statistik</span>
          </button>
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500 text-center">
          💡 Tips: Du kan automatisera synkroniseringen genom att ställa in en automation i Shortcuts-appen
        </div>
      </div>
    </div>
  );
};

export default AppleHealthSync; 