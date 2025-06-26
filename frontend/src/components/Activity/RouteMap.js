import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Clock, Mountain, Zap, Play, Heart } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom marker icons
const createCustomIcon = (color = '#3B82F6', size = 'medium') => {
  const iconSize = size === 'small' ? [20, 20] : size === 'large' ? [40, 40] : [30, 30];
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${iconSize[0]}px; 
        height: ${iconSize[1]}px; 
        background: ${color}; 
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${size === 'small' ? '10px' : size === 'large' ? '16px' : '12px'};
      ">
        ${size === 'large' ? '📍' : '•'}
      </div>
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
      // Focus on selected route
      const bounds = L.latLngBounds(selectedRoute.coordinates);
      map.fitBounds(bounds, { padding: [20, 20] });
    } else if (routes.length > 0 && userLocation) {
      // Show all routes around user location
      const allCoords = [];
      routes.forEach(route => {
        if (route.coordinates && route.coordinates.length > 0) {
          allCoords.push(...route.coordinates);
        }
      });
      
      if (allCoords.length > 0) {
        allCoords.push([userLocation.lat, userLocation.lng]);
        const bounds = L.latLngBounds(allCoords);
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    } else if (userLocation) {
      // Center on user location
      map.setView([userLocation.lat, userLocation.lng], 12);
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
  height = '400px'
}) => {
  const mapRef = useRef();
  const [mapCenter, setMapCenter] = useState([59.3293, 18.0686]); // Default to Stockholm
  const [mapZoom, setMapZoom] = useState(6);

  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
      setMapZoom(12);
    } else {
      // Default to Sweden overview
      setMapCenter([62.0, 15.0]);
      setMapZoom(5);
    }
  }, [userLocation]);

  // Route colors based on difficulty
  const getRouteColor = (route) => {
    if (route.source === 'AI Coach') return '#10B981'; // Green for AI
    if (route.difficulty === 'Lätt') return '#3B82F6'; // Blue for easy
    if (route.difficulty === 'Medel') return '#F59E0B'; // Orange for medium
    if (route.difficulty === 'Svår') return '#EF4444'; // Red for hard
    return '#6B7280'; // Gray default
  };

  const getRouteWeight = (route) => {
    return selectedRoute && selectedRoute.id === route.id ? 6 : 4;
  };

  const getRouteOpacity = (route) => {
    return selectedRoute && selectedRoute.id === route.id ? 1 : 0.7;
  };

  return (
    <div className="relative">
      <MapContainer
        ref={mapRef}
        center={mapCenter}
        zoom={mapZoom}
        style={{ height, width: '100%' }}
        className="rounded-xl shadow-lg z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController 
          routes={routes} 
          userLocation={userLocation} 
          selectedRoute={selectedRoute}
        />

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createCustomIcon('#10B981', 'large')}
          >
            <Popup>
              <div className="text-center p-2">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="font-semibold">Din position</span>
                </div>
                <p className="text-sm text-gray-600">
                  Här befinner du dig just nu
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route polylines and markers */}
        {routes.map((route) => {
          if (!route.coordinates || route.coordinates.length === 0) return null;

          const startPoint = route.coordinates[0];
          const color = getRouteColor(route);
          const weight = getRouteWeight(route);
          const opacity = getRouteOpacity(route);

          return (
            <React.Fragment key={route.id}>
              {/* Route polyline */}
              <Polyline
                positions={route.coordinates}
                color={color}
                weight={weight}
                opacity={opacity}
                eventHandlers={{
                  click: () => onRouteSelect(route),
                  mouseover: (e) => {
                    e.target.setStyle({ weight: weight + 2 });
                  },
                  mouseout: (e) => {
                    e.target.setStyle({ weight: weight });
                  }
                }}
              />

              {/* Start point marker */}
              <Marker
                position={startPoint}
                icon={createCustomIcon(color, 'medium')}
                eventHandlers={{
                  click: () => onRouteSelect(route)
                }}
              >
                <Popup>
                  <div className="p-3 min-w-[250px]">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {route.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                            {route.source}
                          </span>
                          {route.matchScore && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              {route.matchScore}% match
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRouteFavorite(route.id);
                        }}
                        className="p-1 hover:bg-gray-100 rounded-full"
                      >
                        <Heart 
                          className={`h-4 w-4 ${
                            favorites.includes(route.id) 
                              ? 'text-red-500 fill-current' 
                              : 'text-gray-400'
                          }`} 
                        />
                      </button>
                    </div>

                    {/* Route stats */}
                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Navigation className="h-3 w-3 text-blue-600" />
                        <span>{route.distance} km</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-blue-600" />
                        <span>{route.duration} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mountain className="h-3 w-3 text-blue-600" />
                        <span>{route.elevation} m</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-blue-600" />
                        <span>{route.calories} kcal</span>
                      </div>
                    </div>

                    {route.description && (
                      <p className="text-sm text-gray-600 mb-3">
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
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <Play className="h-3 w-3" />
                        Starta
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRouteSelect(route);
                        }}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        Detaljer
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Map legend */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-20">
        <h4 className="font-semibold text-sm mb-2">Rutttyper</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-green-500 rounded"></div>
            <span>AI Coach</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-blue-500 rounded"></div>
            <span>Lätt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-orange-500 rounded"></div>
            <span>Medel</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-red-500 rounded"></div>
            <span>Svår</span>
          </div>
        </div>
      </div>

      {/* Route count indicator */}
      {routes.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg z-20">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="font-medium">{routes.length} rutter hittade</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteMap; 