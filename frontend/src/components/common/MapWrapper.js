import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

const MapWrapper = ({ 
  children, 
  fallbackHeight = '300px', 
  loadingText = 'Laddar karta...',
  errorText = 'Kunde inte ladda kartan',
  className = ''
}) => {
  const [isClient, setIsClient] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Ensure we're on the client side and DOM is ready
    const timer = setTimeout(() => {
      setIsClient(true);
      // Additional delay to ensure Leaflet is fully loaded
      setTimeout(() => setMapReady(true), 100);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (hasError) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center rounded-2xl ${className}`}
        style={{ height: fallbackHeight }}
      >
        <div className="text-center">
          <p className="text-gray-500">{errorText}</p>
          <p className="text-sm text-gray-400 mt-1">Försök igen senare</p>
        </div>
      </div>
    );
  }

  if (!isClient || !mapReady) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center rounded-2xl ${className}`}
        style={{ height: fallbackHeight }}
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-2"></div>
          <p className="text-gray-500">{loadingText}</p>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className={className}>
        {children}
      </div>
    );
  } catch (error) {
    console.error('Map rendering error:', error);
    setHasError(true);
    return null; // Will re-render with error state
  }
};

export default MapWrapper; 