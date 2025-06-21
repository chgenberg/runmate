import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  MapPin, 
  Activity,
  Zap,
  Save,
  X,
  Settings,
  Target,
  HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import GPSTutorial from '../../components/Activity/GPSTutorial';

const LiveTrackingPage = () => {
  const navigate = useNavigate();
  
  // Tracking state
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [pausedTime, setPausedTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  // GPS and location data
  const [, setCurrentPosition] = useState(null);
  const [route, setRoute] = useState([]);
  const [watchId, setWatchId] = useState(null);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('waiting'); // waiting, active, error
  
  // Activity data
  const [distance, setDistance] = useState(0);
  const [currentPace, setCurrentPace] = useState(0);
  const [averagePace, setAveragePace] = useState(0);
  const [elevation, setElevation] = useState(0);
  const [calories, setCalories] = useState(0);
  const [splits, setSplits] = useState([]);
  
  // Settings
  const [activityType, setActivityType] = useState('easy');
  const [targetPace, setTargetPace] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Refs for calculations
  const lastPosition = useRef(null);
  const intervalRef = useRef(null);
  const routeRef = useRef([]);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Format time display
  const formatTime = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Format pace (min/km)
  const formatPace = useCallback((secondsPerKm) => {
    if (!secondsPerKm || secondsPerKm === Infinity) return '--:--';
    const minutes = Math.floor(secondsPerKm / 60);
    const seconds = Math.round(secondsPerKm % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // GPS position update handler
  const handlePositionUpdate = useCallback((position) => {
    const { latitude, longitude, altitude, accuracy } = position.coords;
    const timestamp = new Date();

    setCurrentPosition({ latitude, longitude, altitude, accuracy });
    setGpsAccuracy(accuracy);
    setGpsStatus('active');

    if (isTracking && !isPaused) {
      const newPoint = {
        timestamp,
        coordinates: [longitude, latitude],
        elevation: altitude || 0,
        accuracy
      };

      // Calculate distance and pace if we have a previous position
      if (lastPosition.current) {
        const distanceIncrement = calculateDistance(
          lastPosition.current.latitude,
          lastPosition.current.longitude,
          latitude,
          longitude
        );

        if (distanceIncrement > 0.001 && accuracy < 20) { // Only add if moved significantly and GPS is accurate
          setDistance(prev => {
            const newDistance = prev + distanceIncrement;
            
            // Check for kilometer splits
            const currentKm = Math.floor(prev);
            const newKm = Math.floor(newDistance);
            if (newKm > currentKm && newKm > 0) {
              const splitTime = (timestamp - startTime - pausedTime) / 1000;
              const lastSplitTime = splits.length > 0 ? splits[splits.length - 1].totalTime : 0;
              const kmTime = splitTime - lastSplitTime;
              
              setSplits(prevSplits => [...prevSplits, {
                km: newKm,
                time: kmTime,
                totalTime: splitTime,
                pace: kmTime // seconds per km for this split
              }]);
              
              toast.success(`${newKm} km! Tid: ${formatTime(Math.round(kmTime))} ⚡`, {
                duration: 3000,
                position: 'top-center'
              });
            }
            
            return newDistance;
          });
          
          // Calculate current pace (last 10 seconds)
          const timeDiff = (timestamp - lastPosition.current.timestamp) / 1000; // seconds
          if (timeDiff > 0 && distanceIncrement > 0) {
            const currentPaceValue = timeDiff / distanceIncrement; // seconds per km
            setCurrentPace(currentPaceValue);
          }

          // Update route
          routeRef.current.push(newPoint);
          setRoute([...routeRef.current]);
        }
      }

      lastPosition.current = { latitude, longitude, timestamp };
    }
  }, [isTracking, isPaused, calculateDistance, startTime, pausedTime, splits, formatTime]);

  // GPS error handler
  const handlePositionError = useCallback((error) => {
    console.error('GPS Error:', error);
    setGpsStatus('error');
    
    switch(error.code) {
      case error.PERMISSION_DENIED:
        toast.error('GPS-åtkomst nekad. Aktivera platsbehörigheter i webbläsaren.');
        break;
      case error.POSITION_UNAVAILABLE:
        toast.error('GPS-position inte tillgänglig.');
        break;
      case error.TIMEOUT:
        toast.error('GPS-timeout. Försöker igen...');
        break;
      default:
        toast.error('GPS-fel uppstod.');
        break;
    }
  }, []);

  // Start GPS tracking
  const startGPS = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('GPS stöds inte av din webbläsare');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 1000
    };

    const id = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      handlePositionError,
      options
    );

    setWatchId(id);
  }, [handlePositionUpdate, handlePositionError]);

  // Stop GPS tracking
  const stopGPS = useCallback(() => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  // Timer effect
  useEffect(() => {
    if (isTracking && !isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTracking, isPaused]);

  // Calculate elapsed time
  const elapsedTime = useMemo(() => {
    if (!startTime) return 0;
    const elapsed = isTracking && !isPaused 
      ? (currentTime - startTime - pausedTime) / 1000
      : pausedTime / 1000;
    return Math.floor(elapsed);
  }, [startTime, currentTime, pausedTime, isTracking, isPaused]);

  // Calculate average pace
  useEffect(() => {
    if (distance > 0 && elapsedTime > 0) {
      setAveragePace(elapsedTime / distance);
      
      // Estimate calories (rough calculation)
      const weight = 70; // Default weight
      const hours = elapsedTime / 3600;
      const met = activityType === 'interval' ? 12 : activityType === 'tempo' ? 10 : 8;
      setCalories(Math.round(met * weight * hours));
    }
  }, [distance, elapsedTime, activityType]);

  // Start tracking
  const startTracking = () => {
    setIsTracking(true);
    setIsPaused(false);
    setStartTime(Date.now());
    setCurrentTime(Date.now());
    startGPS();
    toast.success('GPS-spårning startad! 🏃‍♂️');
  };

  // Check if first time user
  const handleStartClick = () => {
    const hasSeenTutorial = localStorage.getItem('gps-tutorial-seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    } else {
      startTracking();
    }
  };

  const handleTutorialComplete = () => {
    localStorage.setItem('gps-tutorial-seen', 'true');
    startTracking();
  };

  // Pause tracking
  const pauseTracking = () => {
    setIsPaused(true);
    const now = Date.now();
    setPausedTime(prev => prev + (now - startTime));
    setStartTime(now);
    stopGPS();
  };

  // Resume tracking
  const resumeTracking = () => {
    setIsPaused(false);
    setStartTime(Date.now());
    setCurrentTime(Date.now());
    startGPS();
  };

  // Stop and save tracking
  const stopTracking = async () => {
    try {
      if (distance < 0.1) {
        toast.error('För kort distans för att spara (minimum 0.1 km)');
        return;
      }

      setIsTracking(false);
      stopGPS();

      // Prepare activity data
      const activityData = {
        title: `${activityType.charAt(0).toUpperCase() + activityType.slice(1)} löpning`,
        description: `GPS-spårad aktivitet`,
        distance: Number(distance.toFixed(2)),
        duration: elapsedTime,
        activityType,
        startTime: new Date(startTime - pausedTime).toISOString(),
        calories,
        elevationGain: elevation,
        route: routeRef.current,
        startLocation: routeRef.current.length > 0 ? {
          type: 'Point',
          coordinates: routeRef.current[0].coordinates,
          name: 'GPS Start'
        } : null,
        source: 'app'
      };

      const response = await api.post('/activities', activityData);
      
      if (response.status === 201) {
        toast.success('Aktivitet sparad! 🎉');
        navigate('/app/activities');
      }
    } catch (error) {
      console.error('Error saving activity:', error);
      toast.error('Kunde inte spara aktivitet');
    }
  };

  // Cancel tracking
  const cancelTracking = () => {
    if (window.confirm('Är du säker på att du vill avbryta spårningen? All data går förlorad.')) {
      setIsTracking(false);
      setIsPaused(false);
      stopGPS();
      
      // Reset all state
      setDistance(0);
      setCurrentPace(0);
      setAveragePace(0);
      setElevation(0);
      setCalories(0);
      setRoute([]);
      setSplits([]);
      routeRef.current = [];
      setStartTime(null);
      setPausedTime(0);
      lastPosition.current = null;
      
      navigate('/app/activities');
    }
  };

  const StatCard = ({ icon: Icon, label, value, unit, color = "text-gray-900" }) => (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center mb-2">
        <Icon className={`w-5 h-5 mr-2 ${color}`} />
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {value}
        {unit && <span className="text-lg font-normal text-gray-500 ml-1">{unit}</span>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={cancelTracking}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <h1 className="text-lg font-bold text-gray-900">Live Spårning</h1>
              <div className="flex items-center justify-center mt-1">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  gpsStatus === 'active' ? 'bg-green-500' : 
                  gpsStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <span className="text-xs text-gray-600">
                  {gpsStatus === 'active' ? `GPS (±${gpsAccuracy?.toFixed(0)}m)` : 
                   gpsStatus === 'error' ? 'GPS Error' : 'Söker GPS...'}
                </span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setShowTutorial(true)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                title="Visa hjälp"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                title="Inställningar"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Main Timer Display */}
        <div className="text-center bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <div className="text-6xl font-mono font-bold text-gray-900 mb-2">
            {formatTime(elapsedTime)}
          </div>
          <div className="text-lg text-gray-600">
            {isPaused ? 'Pausad' : isTracking ? 'Aktiv' : 'Redo att starta'}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            icon={MapPin} 
            label="Distans" 
            value={distance.toFixed(2)} 
            unit="km"
            color="text-blue-600"
          />
          <StatCard 
            icon={Zap} 
            label="Nuvarande tempo" 
            value={formatPace(currentPace)} 
            unit="/km"
            color="text-red-600"
          />
          <StatCard 
            icon={Target} 
            label="Snitt tempo" 
            value={formatPace(averagePace)} 
            unit="/km"
            color="text-green-600"
          />
          <StatCard 
            icon={Activity} 
            label="Kalorier" 
            value={calories} 
            unit="kcal"
            color="text-orange-600"
          />
        </div>

        {/* Splits */}
        {splits.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Mellantider</h3>
              <span className="text-sm text-gray-600">{splits.length} km</span>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {splits.map((split, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-2">
                  <span className="font-medium text-gray-900">Km {split.km}</span>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{formatTime(Math.round(split.time))}</div>
                    <div className="text-xs text-gray-600">{formatPace(split.pace)}/km</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Route Info */}
        {route.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Rutt</h3>
              <span className="text-sm text-gray-600">{route.length} punkter</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-sm text-gray-600">
                GPS-noggrannhet: ±{gpsAccuracy?.toFixed(0) || '--'}m
              </div>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="space-y-3">
          {!isTracking ? (
            <button
              onClick={handleStartClick}
              disabled={gpsStatus === 'error'}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center space-x-2 transition-colors shadow-lg"
            >
              <Play className="w-6 h-6" />
              <span>Starta spårning</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={isPaused ? resumeTracking : pauseTracking}
                className={`flex items-center justify-center space-x-2 py-4 px-6 rounded-2xl font-bold transition-colors shadow-lg ${
                  isPaused 
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                <span>{isPaused ? 'Fortsätt' : 'Pausa'}</span>
              </button>
              
              <button
                onClick={stopTracking}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center space-x-2 transition-colors shadow-lg"
              >
                <Save className="w-5 h-5" />
                <span>Spara</span>
              </button>
            </div>
          )}
        </div>

        {/* Target Pace Display */}
        {targetPace && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Target className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-800">Måltempo</span>
              </div>
              <span className="font-bold text-blue-900">{formatPace(targetPace)} /km</span>
            </div>
            {averagePace > 0 && (
              <div className="mt-2 text-sm">
                <span className={`font-medium ${
                  averagePace < targetPace ? 'text-green-600' : 'text-red-600'
                }`}>
                  {averagePace < targetPace ? '🔥 Snabbare än mål!' : '⚡ Långsammare än mål'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Inställningar</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aktivitetstyp
                </label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="easy">Lugnt</option>
                  <option value="tempo">Tempo</option>
                  <option value="interval">Intervall</option>
                  <option value="long">Långkörning</option>
                  <option value="race">Tävling</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Måltempo (min/km)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => {
                      const minutes = parseInt(e.target.value) || 0;
                      const seconds = targetPace ? Math.round((targetPace % 60)) : 0;
                      setTargetPace(minutes * 60 + seconds);
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Sek"
                    max="59"
                    className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => {
                      const seconds = parseInt(e.target.value) || 0;
                      const minutes = targetPace ? Math.floor(targetPace / 60) : 0;
                      setTargetPace(minutes * 60 + seconds);
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Spara inställningar
            </button>
          </div>
        </div>
      )}

      {/* GPS Tutorial */}
      <GPSTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onStart={handleTutorialComplete}
      />
    </div>
  );
};

export default LiveTrackingPage;