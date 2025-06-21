import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

const RouteMap = ({ route, startLocation, className = "w-full h-64" }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Simple route visualization without external map libraries
    // This would be enhanced with a proper map library like Leaflet or Mapbox
    if (!route || route.length === 0) return;

    const canvas = mapRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Set canvas size
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Calculate bounds
    const lats = route.map(point => point.coordinates[1]);
    const lngs = route.map(point => point.coordinates[0]);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    const latRange = maxLat - minLat;
    const lngRange = maxLng - minLng;
    
    // Add padding
    const padding = 20;
    const width = rect.width - 2 * padding;
    const height = rect.height - 2 * padding;
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Draw background
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // Draw route
    if (route.length > 1) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      
      route.forEach((point, index) => {
        const x = padding + ((point.coordinates[0] - minLng) / lngRange) * width;
        const y = padding + height - ((point.coordinates[1] - minLat) / latRange) * height;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
      
      // Draw start point
      if (route.length > 0) {
        const startPoint = route[0];
        const startX = padding + ((startPoint.coordinates[0] - minLng) / lngRange) * width;
        const startY = padding + height - ((startPoint.coordinates[1] - minLat) / latRange) * height;
        
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(startX, startY, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Draw end point
      if (route.length > 1) {
        const endPoint = route[route.length - 1];
        const endX = padding + ((endPoint.coordinates[0] - minLng) / lngRange) * width;
        const endY = padding + height - ((endPoint.coordinates[1] - minLat) / latRange) * height;
        
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(endX, endY, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }, [route, startLocation]);

  if (!route || route.length === 0) {
    return (
      <div className={`${className} bg-gray-100 rounded-xl flex items-center justify-center`}>
        <div className="text-center text-gray-500">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Ingen rutt tillgänglig</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative bg-gray-100 rounded-xl overflow-hidden`}>
      <canvas
        ref={mapRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
      
      {/* Legend */}
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
            <span>Start</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
            <span>Slut</span>
          </div>
        </div>
      </div>
      
      {/* Route info */}
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs">
        <div className="text-gray-600">
          {route.length} GPS-punkter
        </div>
      </div>
    </div>
  );
};

export default RouteMap; 