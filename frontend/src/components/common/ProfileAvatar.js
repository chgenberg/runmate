import React, { useState } from 'react';
import { User } from 'lucide-react';

const ProfileAvatar = ({ 
  user,
  src, 
  alt = 'Profile', 
  size = 'medium', 
  className = '',
  fallbackColor = 'bg-gray-200'
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Handle user prop
  const profileSrc = src || user?.profilePicture;
  const displayName = alt !== 'Profile' ? alt : (user ? `${user.firstName} ${user.lastName}` : 'Profile');

  // Size mappings
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    md: 'w-12 h-12',
    large: 'w-16 h-16',
    xl: 'w-24 h-24',
    xlarge: 'w-24 h-24',
    xxlarge: 'w-32 h-32'
  };

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    md: 'w-6 h-6',
    large: 'w-8 h-8',
    xl: 'w-12 h-12',
    xlarge: 'w-12 h-12',
    xxlarge: 'w-16 h-16'
  };

  const baseClasses = `${sizeClasses[size]} rounded-full flex items-center justify-center ${className}`;

  // Show fallback if no image, image failed, or still loading
  const showFallback = !profileSrc || imageError || !imageLoaded;

  return (
    <div className={`relative ${baseClasses}`}>
      {/* Fallback avatar - always rendered */}
      <div 
        className={`${baseClasses} ${fallbackColor} ${showFallback ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
        style={{ position: showFallback ? 'relative' : 'absolute', inset: showFallback ? 'auto' : '0' }}
      >
        <User className={`${iconSizes[size]} text-gray-500`} />
      </div>
      
      {/* Real image - only render if we have a source */}
      {profileSrc && !profileSrc.includes('ui-avatars.com') && (
        <img 
          src={profileSrc} 
          alt={displayName}
          className={`${sizeClasses[size]} rounded-full object-cover ${className} ${imageLoaded && !imageError ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
          style={{ position: imageLoaded && !imageError ? 'relative' : 'absolute', inset: imageLoaded && !imageError ? 'auto' : '0' }}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
};

export default ProfileAvatar; 