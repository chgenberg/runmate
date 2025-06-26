import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Clock, Mountain, Zap, Play, Heart, Star, TrendingUp, Sparkles } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Enhanced custom marker icons with gradients
const createCustomIcon = (color = '#3B82F6', size = 'medium', type = 'default') => {
  const iconSize = size === 'small' ? [24, 24] : size === 'large' ? [48, 48] : [36, 36];
  const innerSize = size === 'small' ? 16 : size === 'large' ? 32 : 24;
  
  const gradientColors = {
    ai: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    user: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    strava: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    community: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    default: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`
  };

  const iconEmoji = {
    ai: '🤖',
    user: '📍',
    strava: '🏃',
    community: '👥',
    default: '•'
  };
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${iconSize[0]}px; 
        height: ${iconSize[1]}px; 
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 4px 12px rgba(0,0,0,0.15));
      ">
        <div style="
          width: ${innerSize}px;
          height: ${innerSize}px;
          background: ${gradientColors[type] || gradientColors.default};
          border: 3px solid rgba(255,255,255,0.9);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: ${size === 'small' ? '12px' : size === 'large' ? '20px' : '16px'};
          font-weight: bold;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
          position: relative;
        ">
          ${iconEmoji[type] || iconEmoji.default}
        </div>
        ${type === 'user' ? `
          <div style="
            position: absolute;
            width: ${innerSize * 2}px;
            height: ${innerSize * 2}px;
            border: 2px solid rgba(132, 250, 176, 0.4);
            border-radius: 50%;
            animation: pulse 2s infinite;
          "></div>
        ` : ''}
      </div>
      <style>
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      </style>
    `,
    iconSize: iconSize,
    iconAnchor: [iconSize[0] / 2, iconSize[1]],
    popupAnchor: [0, -iconSize[1]]
  });
};

// Component to handle map bounds and center
const MapController = ({ routes, userLocation, selectedRoute }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedRoute && selectedRoute.coordinates && selectedRoute.coordinates.length > 0) {
      const bounds = L.latLngBounds(selectedRoute.coordinates);
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (routes.length > 0 && userLocation) {
      const allCoords = [];
      routes.forEach(route => {
        if (route.coordinates && route.coordinates.length > 0) {
          allCoords.push(...route.coordinates);
        }
      });
      
      if (allCoords.length > 0) {
        allCoords.push([userLocation.lat, userLocation.lng]);
        const bounds = L.latLngBounds(allCoords);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    } else if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 13);
    }
  }, [map, routes, userLocation, selectedRoute]);

  return null;
};

const RouteMap = ({ 
  routes = [], 
  userLocation = null, 
  selectedRoute = null,
  onRouteSelect = () => {},
  onRouteStart = () => {},
  onRouteFavorite = () => {},
  favorites = [],
  height = '400px',
  className = ''
}) => {
  const mapRef = useRef();
  const [mapCenter, setMapCenter] = useState([59.3293, 18.0686]);
  const [mapZoom, setMapZoom] = useState(6);
  const [hoveredRoute, setHoveredRoute] = useState(null);

  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
      setMapZoom(13);
    } else {
      setMapCenter([62.0, 15.0]);
      setMapZoom(5);
    }
  }, [userLocation]);

  // Enhanced route colors with gradients
  const getRouteColor = (route) => {
    if (route.source === 'AI Coach') return '#8B5CF6'; // Purple for AI
    if (route.source === 'Strava') return '#FC4C02'; // Strava orange
    if (route.source === 'Community') return '#10B981'; // Green for community
    if (route.difficulty === 'Lätt') return '#3B82F6'; // Blue for easy
    if (route.difficulty === 'Medel') return '#F59E0B'; // Orange for medium
    if (route.difficulty === 'Svår') return '#EF4444'; // Red for hard
    if (route.difficulty === 'Expert') return '#7C3AED'; // Purple for expert
    return '#6B7280'; // Gray default
  };

  const getRouteWeight = (route) => {
    if (selectedRoute && selectedRoute.id === route.id) return 8;
    if (hoveredRoute && hoveredRoute.id === route.id) return 6;
    return 4;
  };

  const getRouteOpacity = (route) => {
    if (selectedRoute && selectedRoute.id === route.id) return 1;
    if (hoveredRoute && hoveredRoute.id === route.id) return 0.9;
    return 0.7;
  };

  const getMarkerType = (source) => {
    switch (source) {
      case 'AI Coach': return 'ai';
      case 'Strava': return 'strava';
      case 'Community': return 'community';
      default: return 'default';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        ref={mapRef}
        center={mapCenter}
        zoom={mapZoom}
        style={{ height, width: '100%' }}
        className="rounded-2xl shadow-2xl z-10 overflow-hidden"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="saturate-90"
        />

        <MapController 
          routes={routes} 
          userLocation={userLocation} 
          selectedRoute={selectedRoute}
        />

        {/* User location marker with pulse effect */}
        {userLocation && (
          <>
            <CircleMarker
              center={[userLocation.lat, userLocation.lng]}
              radius={100}
              fillColor="#84fab0"
              fillOpacity={0.1}
              stroke={false}
            />
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={createCustomIcon('#10B981', 'large', 'user')}
            >
              <Popup className="custom-popup">
                <div className="text-center p-3">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="p-2 bg-gradient-to-br from-green-400 to-blue-500 rounded-full">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-lg">Din position</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Här befinner du dig just nu
                  </p>
                  <div className="mt-3 p-2 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-700">
                      📍 Aktiv GPS-position
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Route polylines with enhanced styling */}
        {routes.map((route) => {
          if (!route.coordinates || route.coordinates.length === 0) return null;

          const startPoint = route.coordinates[0];
          const endPoint = route.coordinates[route.coordinates.length - 1];
          const color = getRouteColor(route);
          const weight = getRouteWeight(route);
          const opacity = getRouteOpacity(route);

          return (
            <React.Fragment key={route.id}>
              {/* Route polyline with gradient effect */}
              <Polyline
                positions={route.coordinates}
                color={color}
                weight={weight}
                opacity={opacity}
                dashArray={route.source === 'AI Coach' ? '10, 5' : null}
                eventHandlers={{
                  click: () => onRouteSelect(route),
                  mouseover: (e) => {
                    setHoveredRoute(route);
                    e.target.setStyle({ weight: weight + 2 });
                  },
                  mouseout: (e) => {
                    setHoveredRoute(null);
                    e.target.setStyle({ weight: weight });
                  }
                }}
              />

              {/* Start point marker */}
              <Marker
                position={startPoint}
                icon={createCustomIcon(color, 'medium', getMarkerType(route.source))}
                eventHandlers={{
                  click: () => onRouteSelect(route)
                }}
              >
                <Popup className="custom-popup" maxWidth={300}>
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
                          {route.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full text-xs font-medium">
                            {route.source}
                          </span>
                          {route.matchScore && (
                            <span className="px-2 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {route.matchScore}%
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            route.difficulty === 'Lätt' ? 'bg-blue-100 text-blue-700' :
                            route.difficulty === 'Medel' ? 'bg-yellow-100 text-yellow-700' :
                            route.difficulty === 'Svår' ? 'bg-red-100 text-red-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {route.difficulty}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRouteFavorite(route.id);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full transition-all transform hover:scale-110"
                      >
                        <Heart 
                          className={`h-5 w-5 transition-colors ${
                            favorites.includes(route.id) 
                              ? 'text-red-500 fill-current' 
                              : 'text-gray-400'
                          }`} 
                        />
                      </button>
                    </div>

                    {/* AI Reason */}
                    {route.aiReason && (
                      <div className="mb-3 p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                        <div className="flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-purple-700 line-clamp-2">{route.aiReason}</p>
                        </div>
                      </div>
                    )}

                    {/* Route stats grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Navigation className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-500">Distans</p>
                          <p className="text-sm font-semibold">{route.distance} km</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Clock className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-xs text-gray-500">Tid</p>
                          <p className="text-sm font-semibold">{route.duration} min</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Mountain className="h-4 w-4 text-orange-600" />
                        <div>
                          <p className="text-xs text-gray-500">Höjd</p>
                          <p className="text-sm font-semibold">{route.elevation} m</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Zap className="h-4 w-4 text-purple-600" />
                        <div>
                          <p className="text-xs text-gray-500">Kalorier</p>
                          <p className="text-sm font-semibold">{route.calories} kcal</p>
                        </div>
                      </div>
                    </div>

                    {/* Strava stats if available */}
                    {route.stravaStats && (
                      <div className="mb-3 p-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-orange-600" />
                          <span className="text-xs font-semibold text-orange-800">Strava Stats</span>
                        </div>
                        <div className="flex justify-between text-xs text-orange-700">
                          <span>{route.stravaStats.attempts} försök</span>
                          <span>KOM: {route.stravaStats.kom}</span>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {route.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {route.description}
                      </p>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRouteStart(route);
                        }}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Play className="h-4 w-4" />
                        Starta rutt
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRouteSelect(route);
                        }}
                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-all transform hover:scale-105"
                      >
                        Detaljer
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* End point marker for longer routes */}
              {route.distance > 5 && (
                <CircleMarker
                  center={endPoint}
                  radius={8}
                  fillColor={color}
                  fillOpacity={0.8}
                  color="white"
                  weight={2}
                />
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Enhanced map controls and overlays */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20 pointer-events-none">
        {/* Route statistics */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl pointer-events-auto">
          <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            Ruttstatistik
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">Totalt:</span>
              <span className="font-semibold">{routes.length} rutter</span>
            </div>
            {routes.filter(r => r.source === 'AI Coach').length > 0 && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-600">AI-matchningar:</span>
                <span className="font-semibold text-purple-600">
                  {routes.filter(r => r.source === 'AI Coach').length}
                </span>
              </div>
            )}
            {favorites.length > 0 && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-600">Favoriter:</span>
                <span className="font-semibold text-red-600">{favorites.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced legend */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl pointer-events-auto">
          <h4 className="font-bold text-sm mb-3">Förklaring</h4>
          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                <span>AI Coach</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                <span>Strava</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-full"></div>
                <span>Community</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-blue-500 rounded"></div>
                <span>Lätt</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-orange-500 rounded"></div>
                <span>Medel</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-red-500 rounded"></div>
                <span>Svår</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom info bar */}
      {routes.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-md text-white rounded-2xl px-4 py-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Navigation className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{routes.length} rutter hittade</p>
                  <p className="text-xs text-white/80">
                    {selectedRoute ? `Vald: ${selectedRoute.name}` : 'Klicka på en rutt för detaljer'}
                  </p>
                </div>
              </div>
              {hoveredRoute && (
                <div className="text-right">
                  <p className="text-sm font-semibold">{hoveredRoute.distance} km</p>
                  <p className="text-xs text-white/80">{hoveredRoute.duration} min</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom styles for popups */}
      <style jsx global>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          padding: 0;
          overflow: hidden;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
          padding: 0;
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default RouteMap; 