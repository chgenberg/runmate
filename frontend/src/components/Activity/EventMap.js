import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Fix for default icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const EventMap = ({ position, locationName }) => {
  const [isClient, setIsClient] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Ensure we're on the client side and DOM is ready
    const timer = setTimeout(() => {
      setIsClient(true);
      // Additional delay to ensure Leaflet is fully loaded
      setTimeout(() => setMapReady(true), 100);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!position || position.length !== 2) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">Kartposition saknas.</p>
      </div>
    );
  }

  if (!isClient || !mapReady) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-2"></div>
          <p className="text-gray-500">Laddar karta...</p>
        </div>
      </div>
    );
  }

  // Leaflet expects [latitude, longitude], but GeoJSON is [longitude, latitude].
  // We will assume the parent component passes it in the correct [lat, lng] order.
  const mapPosition = [position[0], position[1]];

  try {
    return (
      <div style={{ height: '100%', width: '100%', position: 'relative', zIndex: 1 }}>
        <MapContainer 
          center={mapPosition} 
          zoom={14} 
          scrollWheelZoom={false} 
          style={{ 
            height: '100%', 
            width: '100%', 
            borderRadius: '1.5rem',
            position: 'relative',
            zIndex: 1
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={mapPosition}>
            <Popup>
              {locationName || 'Event Location'}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    );
  } catch (error) {
    console.error('Map rendering error:', error);
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Kunde inte ladda kartan</p>
          <p className="text-sm text-gray-400 mt-1">Försök igen senare</p>
        </div>
      </div>
    );
  }
};

export default EventMap; 