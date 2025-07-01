import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

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
  const center = useMemo(() => initialPosition || [59.3293, 18.0686], [initialPosition]); // Default to Stockholm

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="h-64 md:h-80 w-full rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Laddar karta...</p>
      </div>
    );
  }

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
};

export default LocationPickerMap; 