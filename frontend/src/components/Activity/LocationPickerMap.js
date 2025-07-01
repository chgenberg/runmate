import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Fix for default icon issue with webpack from EventMap.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const LocationPicker = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng);
    },
    locationfound(e) {
      // This is another option, to fly to user's location
      // setPosition(e.latlng);
      // map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

const LocationPickerMap = ({ onLocationSelect, initialPosition }) => {
  const [isClient, setIsClient] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const center = useMemo(() => initialPosition || [59.3293, 18.0686], [initialPosition]); // Default to Stockholm

  useEffect(() => {
    // Ensure we're on the client side and DOM is ready
    const timer = setTimeout(() => {
      setIsClient(true);
      // Additional delay to ensure Leaflet is fully loaded
      setTimeout(() => setMapReady(true), 100);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isClient || !mapReady) {
    return (
      <div className="h-64 md:h-80 w-full rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-2"></div>
          <p className="text-gray-500">Laddar karta...</p>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="h-64 md:h-80 w-full rounded-2xl overflow-hidden border-2 border-gray-200">
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationPicker onLocationSelect={onLocationSelect} />
        </MapContainer>
      </div>
    );
  } catch (error) {
    console.error('Map rendering error:', error);
    return (
      <div className="h-64 md:h-80 w-full rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Kunde inte ladda kartan</p>
          <p className="text-sm text-gray-400 mt-1">Försök igen senare</p>
        </div>
      </div>
    );
  }
};

export default LocationPickerMap; 