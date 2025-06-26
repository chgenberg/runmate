import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Play, MapPin, Navigation, 
  Activity, CheckCircle, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const StartRouteModal = ({ 
  route, 
  isOpen, 
  onClose, 
  onStartTracking,
  userLocation 
}) => {
  const [trackingMode, setTrackingMode] = useState('guided'); // 'guided', 'free', 'offline'
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  if (!route) return null;

  const checkLocationPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setHasLocationPermission(permission.state === 'granted');
      return permission.state === 'granted';
    } catch (error) {
      return false;
    }
  };

  const requestLocationPermission = () => {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          setHasLocationPermission(true);
          resolve(true);
        },
        () => {
          setHasLocationPermission(false);
          resolve(false);
        }
      );
    });
  };

  const handleStartRoute = async () => {
    if (trackingMode === 'guided' || trackingMode === 'free') {
      const hasPermission = await checkLocationPermission() || await requestLocationPermission();
      
      if (!hasPermission) {
        toast.error('GPS-åtkomst krävs för live-spårning');
        return;
      }
    }

    // Start the route tracking
    onStartTracking({
      route,
      mode: trackingMode,
      startTime: new Date(),
      hasGPS: hasLocationPermission
    });

    toast.success(`Rutt startad i ${trackingMode === 'guided' ? 'guidad' : trackingMode === 'free' ? 'fri' : 'offline'} läge`);
    onClose();
  };

  const trackingModes = [
    {
      id: 'guided',
      title: 'Guidad spårning',
      description: 'Följ rutten med GPS-navigering och få riktningar i realtid',
      features: ['GPS-navigering', 'Röstvägledning', 'Avvikelseaviseringar', 'Live-statistik'],
      icon: Navigation,
      color: 'blue',
      recommended: true
    },
    {
      id: 'free',
      title: 'Fri spårning',
      description: 'Spåra din aktivitet utan att följa den exakta rutten',
      features: ['GPS-spårning', 'Live-statistik', 'Flexibel rutt', 'Egen pace'],
      icon: Activity,
      color: 'green'
    },
    {
      id: 'offline',
      title: 'Offline-läge',
      description: 'Använd rutten som referens utan GPS-spårning',
      features: ['Ruttöversikt', 'Manuell loggning', 'Ingen GPS', 'Batterisparande'],
      icon: MapPin,
      color: 'gray'
    }
  ];

  const selectedMode = trackingModes.find(mode => mode.id === trackingMode);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-500 to-green-500 p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Play className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-2">Starta löpning</h1>
                  <p className="text-blue-100">
                    Välj hur du vill spåra din löpning på <strong>{route.name}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Route summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">{route.name}</h3>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{route.distance} km</div>
                    <div className="text-gray-500">Distans</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{route.duration} min</div>
                    <div className="text-gray-500">Uppskattat</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{route.elevation} m</div>
                    <div className="text-gray-500">Höjdmeter</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{route.difficulty}</div>
                    <div className="text-gray-500">Svårighet</div>
                  </div>
                </div>
              </div>

              {/* Tracking mode selection */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Välj spårningsläge</h3>
                <div className="space-y-3">
                  {trackingModes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setTrackingMode(mode.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        trackingMode === mode.id
                          ? `border-${mode.color}-500 bg-${mode.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                          trackingMode === mode.id
                            ? `bg-${mode.color}-500 text-white`
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <mode.icon className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{mode.title}</h4>
                            {mode.recommended && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                Rekommenderad
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{mode.description}</p>
                          
                          <div className="flex flex-wrap gap-2">
                            {mode.features.map((feature, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          trackingMode === mode.id
                            ? `border-${mode.color}-500 bg-${mode.color}-500`
                            : 'border-gray-300'
                        }`}>
                          {trackingMode === mode.id && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* GPS status */}
              {(trackingMode === 'guided' || trackingMode === 'free') && (
                <div className="mb-6">
                  <div className={`flex items-center gap-3 p-4 rounded-xl ${
                    hasLocationPermission 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    {hasLocationPermission ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    )}
                    <div>
                      <div className={`font-medium ${
                        hasLocationPermission ? 'text-green-900' : 'text-yellow-900'
                      }`}>
                        {hasLocationPermission ? 'GPS aktiverat' : 'GPS-åtkomst krävs'}
                      </div>
                      <div className={`text-sm ${
                        hasLocationPermission ? 'text-green-700' : 'text-yellow-700'
                      }`}>
                        {hasLocationPermission 
                          ? 'Din position spåras för navigering och statistik'
                          : 'Tillåt platsåtkomst för att använda detta läge'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* What happens when you start */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">Vad händer när du startar?</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  {selectedMode?.id === 'guided' && (
                    <>
                      <li>• GPS-navigering startar med röstvägledning</li>
                      <li>• Live-spårning av tid, distans och pace</li>
                      <li>• Varningar om du avviker från rutten</li>
                      <li>• Automatisk aktivitetsloggning</li>
                    </>
                  )}
                  {selectedMode?.id === 'free' && (
                    <>
                      <li>• GPS-spårning av din position</li>
                      <li>• Live-statistik under löpningen</li>
                      <li>• Flexibilitet att anpassa rutten</li>
                      <li>• Automatisk aktivitetsloggning</li>
                    </>
                  )}
                  {selectedMode?.id === 'offline' && (
                    <>
                      <li>• Ruttöversikt visas som referens</li>
                      <li>• Ingen GPS-spårning (batterisparande)</li>
                      <li>• Manuell tidstagning</li>
                      <li>• Loggning av aktivitet efteråt</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {selectedMode?.title} • {route.distance} km • {route.duration} min
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Avbryt
                  </button>
                  <button
                    onClick={handleStartRoute}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Starta löpning
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StartRouteModal; 