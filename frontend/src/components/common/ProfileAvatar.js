import React from 'react';
import { User } from 'lucide-react';

const ProfileAvatar = ({ 
  src, 
  alt = 'Profile', 
  size = 'medium', 
  className = '',
  fallbackColor = 'bg-gray-200'
}) => {
  // Size mappings
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-16 h-16',
    xlarge: 'w-24 h-24',
    xxlarge: 'w-32 h-32'
  };

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-8 h-8',
    xlarge: 'w-12 h-12',
    xxlarge: 'w-16 h-16'
  };

  const baseClasses = `${sizeClasses[size]} rounded-full flex items-center justify-center ${className}`;

  if (src && !src.includes('ui-avatars.com')) {
    return (
      <img 
        src={src} 
        alt={alt}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
    );
  }

  return (
    <div className={`${baseClasses} ${fallbackColor}`}>
      <User className={`${iconSizes[size]} text-gray-500`} />
    </div>
  );
};

export default ProfileAvatar; 