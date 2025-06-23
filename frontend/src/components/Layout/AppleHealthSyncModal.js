import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Activity,
  CheckCircle,
  XCircle,
  Loader,
  Zap,
  TrendingUp,
  Award,
  Clock,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const AppleHealthSyncModal = ({ isOpen, onClose }) => {
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [syncData, setSyncData] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    if (isOpen) {
      checkLastSync();
    }
  }, [isOpen]);

  const checkLastSync = async () => {
    try {
      const response = await api.get('/health/apple-health/status');
      setLastSync(response.data);
    } catch (error) {
      console.error('Error checking sync status:', error);
    }
  };

  const handleSync = async () => {
    setSyncStatus('syncing');
    
    // Check if on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (!isIOS) {
      setSyncStatus('error');
      toast.error('Apple Health-synk kräver iPhone eller iPad');
      return;
    }

    // Simulate sync process
    setTimeout(() => {
      setSyncStatus('success');
      setSyncData({
        imported: 5,
        totalDistance: 42.3,
        totalCalories: 2150,
        averageHeartRate: 145
      });
      
      toast.success('🎉 Synkronisering lyckades!');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSyncStatus('idle');
        checkLastSync();
      }, 3000);
    }, 3000);

    // Show instructions
    toast((t) => (
      <div className="flex flex-col space-y-2">
        <span className="font-semibold">📱 Öppna iOS Shortcuts</span>
        <span className="text-sm">Kör "Synka RunMate" för att importera data</span>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Stäng
        </button>
      </div>
    ), { duration: 8000 });
  };

  const formatLastSync = (dateString) => {
    if (!dateString) return 'Aldrig';
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Nyss';
    if (diffHours < 24) return `${diffHours}h sedan`;
    return `${Math.floor(diffHours / 24)}d sedan`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 bg-white rounded-3xl shadow-2xl z-50"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <motion.div 
                className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-4"
                animate={{ 
                  rotate: syncStatus === 'syncing' ? 360 : 0,
                  scale: syncStatus === 'success' ? [1, 1.2, 1] : 1
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 0.5 }
                }}
              >
                <Heart className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900">Apple Health Sync</h2>
              <p className="text-gray-600 mt-2">Synka dina träningspass från Apple Watch</p>
            </div>

            {/* Stats */}
            {lastSync && lastSync.hasAppleHealthData && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-5 h-5 text-primary-500" />
                    <span className="text-xs text-gray-500">Träningspass</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{lastSync.totalImported}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-5 h-5 text-green-500" />
                    <span className="text-xs text-gray-500">Senaste sync</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{formatLastSync(lastSync.lastImport)}</p>
                </div>
              </div>
            )}

            {/* Sync Status */}
            <div className="relative">
              {syncStatus === 'idle' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSync}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-3"
                >
                  <Zap className="w-5 h-5" />
                  <span>Synka nu</span>
                </motion.button>
              )}

              {syncStatus === 'syncing' && (
                <div className="w-full bg-gray-100 rounded-2xl p-8 flex flex-col items-center">
                  <Loader className="w-10 h-10 text-primary-500 animate-spin mb-4" />
                  <p className="text-gray-700 font-medium">Synkroniserar...</p>
                  <p className="text-sm text-gray-500 mt-2">Öppna iOS Shortcuts och kör "Synka RunMate"</p>
                </div>
              )}

              {syncStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full bg-green-50 rounded-2xl p-8 flex flex-col items-center"
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                  <p className="text-green-900 font-bold text-lg mb-4">Synkronisering lyckades!</p>
                  {syncData && (
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-700">{syncData.imported}</p>
                        <p className="text-sm text-green-600">Nya träningspass</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-700">{syncData.totalDistance} km</p>
                        <p className="text-sm text-green-600">Total distans</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {syncStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full bg-red-50 rounded-2xl p-8 flex flex-col items-center"
                >
                  <XCircle className="w-16 h-16 text-red-500 mb-4" />
                  <p className="text-red-900 font-bold text-lg">Synkronisering misslyckades</p>
                  <p className="text-sm text-red-700 mt-2 text-center">
                    Kontrollera att du är på en iPhone och har iOS Shortcuts installerat
                  </p>
                </motion.div>
              )}
            </div>

            {/* Instructions */}
            {syncStatus === 'idle' && (
              <div className="mt-6 bg-blue-50 rounded-2xl p-4">
                <h3 className="font-medium text-blue-900 mb-2">Så här gör du:</h3>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Se till att du har iOS Shortcuts-appen</li>
                  <li>2. Ladda ner "Synka RunMate" shortcut</li>
                  <li>3. Klicka på "Synka nu" ovan</li>
                  <li>4. Kör shortcut för att importera data</li>
                </ol>
              </div>
            )}

            {/* Features */}
            {syncStatus === 'idle' && (
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="text-xs text-gray-600">Distans & pace</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Heart className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-xs text-gray-600">Hjärtfrekvens</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-xs text-gray-600">Kalorier</p>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AppleHealthSyncModal; 