import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Navigation, Clock, Mountain, Zap, Play, Heart, Share, 
  Download, MapPin, TrendingUp, Users, Star, Route as RouteIcon,
  Target, Activity
} from 'lucide-react';
import RouteMap from './RouteMap';
import { toast } from 'react-hot-toast';

const RouteDetailModal = ({ 
  route, 
  isOpen, 
  onClose, 
  onRouteStart,
  onRouteFavorite,
  favorites = [],
  userLocation 
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!route) return null;

  const isFavorite = favorites.includes(route.id);

  const handleStart = () => {
    onRouteStart(route);
    onClose();
  };

  const handleFavorite = () => {
    onRouteFavorite(route.id);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: route.name,
        text: route.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Länk kopierad till urklipp');
    }
  };

  const handleDownload = () => {
    // Create GPX file content
    const gpxContent = generateGPX(route);
    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${route.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('GPX-fil nedladdad');
  };

  const generateGPX = (route) => {
    const header = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="RunMate" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${route.name}</name>
    <desc>${route.description}</desc>
  </metadata>
  <trk>
    <name>${route.name}</name>
    <trkseg>`;

    const points = route.coordinates.map(coord => 
      `      <trkpt lat="${coord[0]}" lon="${coord[1]}"></trkpt>`
    ).join('\n');

    const footer = `    </trkseg>
  </trk>
</gpx>`;

    return header + '\n' + points + '\n' + footer;
  };

  const tabs = [
    { id: 'overview', label: 'Översikt', icon: RouteIcon },
    { id: 'map', label: 'Karta', icon: MapPin },
    { id: 'details', label: 'Detaljer', icon: Activity }
  ];

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
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="relative">
              {/* Hero image/gradient */}
              <div className="h-48 bg-gradient-to-br from-blue-500 via-purple-500 to-green-500 relative overflow-hidden">
                {route.image && (
                  <img
                    src={route.image}
                    alt={route.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/30" />
                
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>

                {/* Route info overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-start justify-between">
                    <div className="text-white">
                      <h1 className="text-2xl font-bold mb-2">{route.name}</h1>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                          {route.source}
                        </span>
                        {route.matchScore && (
                          <span className="px-3 py-1 bg-green-500/80 backdrop-blur-sm rounded-full font-medium">
                            {route.matchScore}% match
                          </span>
                        )}
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                          {route.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleFavorite}
                        className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                      >
                        <Heart 
                          className={`h-5 w-5 ${
                            isFavorite ? 'text-red-400 fill-current' : 'text-white'
                          }`} 
                        />
                      </button>
                      <button
                        onClick={handleShare}
                        className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                      >
                        <Share className="h-5 w-5 text-white" />
                      </button>
                      <button
                        onClick={handleDownload}
                        className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                      >
                        <Download className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="absolute -bottom-8 left-4 right-4">
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mx-auto mb-2">
                        <Navigation className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="font-semibold text-gray-900">{route.distance} km</div>
                      <div className="text-xs text-gray-500">Distans</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mx-auto mb-2">
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="font-semibold text-gray-900">{route.duration} min</div>
                      <div className="text-xs text-gray-500">Tid</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full mx-auto mb-2">
                        <Mountain className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="font-semibold text-gray-900">{route.elevation} m</div>
                      <div className="text-xs text-gray-500">Höjdmeter</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full mx-auto mb-2">
                        <Zap className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="font-semibold text-gray-900">{route.calories} kcal</div>
                      <div className="text-xs text-gray-500">Kalorier</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="pt-12 pb-6">
              {/* Tabs */}
              <div className="px-6 mb-6">
                <div className="flex border-b border-gray-200">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab content */}
              <div className="px-6 max-h-96 overflow-y-auto">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Description */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Beskrivning</h3>
                      <p className="text-gray-600">{route.description}</p>
                    </div>

                    {/* AI Reason */}
                    {route.aiReason && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Target className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-blue-900 mb-1">AI-rekommendation</h4>
                            <p className="text-blue-800 text-sm">{route.aiReason}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Highlights */}
                    {route.highlights && route.highlights.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Höjdpunkter</h3>
                        <div className="flex flex-wrap gap-2">
                          {route.highlights.map((highlight, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                            >
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Strava Stats */}
                    {route.stravaStats && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="h-5 w-5 text-orange-600" />
                          <h4 className="font-medium text-orange-900">Strava-statistik</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-orange-700 font-medium">{route.stravaStats.attempts}</div>
                            <div className="text-orange-600">Totala försök</div>
                          </div>
                          <div>
                            <div className="text-orange-700 font-medium">{route.stravaStats.kom}</div>
                            <div className="text-orange-600">KOM-tid</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Community Stats */}
                    {(route.popularity || route.completions) && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="h-5 w-5 text-green-600" />
                          <h4 className="font-medium text-green-900">Community-statistik</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {route.popularity && (
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-green-700 font-medium">{route.popularity}/5</span>
                              <span className="text-green-600">betyg</span>
                            </div>
                          )}
                          {route.completions && (
                            <div>
                              <div className="text-green-700 font-medium">{route.completions}</div>
                              <div className="text-green-600">genomföranden</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'map' && (
                  <div className="space-y-4">
                    <div className="h-80">
                      <RouteMap
                        routes={[route]}
                        userLocation={userLocation}
                        selectedRoute={route}
                        height="320px"
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Klicka och dra för att panorera kartan. Använd mushjulet för att zooma.</p>
                    </div>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="space-y-6">
                    {/* Technical details */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Tekniska detaljer</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Terräng:</span>
                            <span className="font-medium">{route.terrain}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Svårighetsgrad:</span>
                            <span className="font-medium">{route.difficulty}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Genomsnittlig pace:</span>
                            <span className="font-medium">{Math.round(route.duration / route.distance * 10) / 10} min/km</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Källa:</span>
                            <span className="font-medium">{route.source}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">GPS-punkter:</span>
                            <span className="font-medium">{route.coordinates?.length || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Höjdmeter/km:</span>
                            <span className="font-medium">{Math.round(route.elevation / route.distance)} m/km</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* OSM Tags */}
                    {route.osmTags && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">OpenStreetMap-information</h3>
                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                          {Object.entries(route.osmTags).map(([key, value]) => (
                            <div key={key} className="flex justify-between py-1">
                              <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                              <span className="font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Rekommenderat för {route.difficulty.toLowerCase()} nivå
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Stäng
                  </button>
                  <button
                    onClick={handleStart}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Starta rutt
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

export default RouteDetailModal; 