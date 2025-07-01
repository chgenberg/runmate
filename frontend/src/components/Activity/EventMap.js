import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Import CSS safely
try {
  require('leaflet/dist/leaflet.css');
} catch (e) {
  console.warn('Leaflet CSS could not be loaded:', e);
}

// Fix for default icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const EventMap = ({ position, locationName }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!position || position.length !== 2) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">Kartposition saknas.</p>
      </div>
    );
  }

  if (!isClient) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Laddar karta...</p>
      </div>
    );
  }

  // Leaflet expects [latitude, longitude], but GeoJSON is [longitude, latitude].
  // We will assume the parent component passes it in the correct [lat, lng] order.
  const mapPosition = [position[0], position[1]];

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
};

export default EventMap; 