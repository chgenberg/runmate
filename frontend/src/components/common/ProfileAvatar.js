import React from 'react';
import { User } from 'lucide-react';

const ProfileAvatar = ({ 
  user, 
  src, 
  size = 'md', 
  className = '', 
  showEditIcon = false, 
  onEdit = null,
  EditIcon = null 
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
    xl: 'w-48 h-48'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-16 h-16', 
    lg: 'w-20 h-20',
    xl: 'w-24 h-24'
  };

  const editIconSizes = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-6 h-6', 
    xl: 'w-7 h-7'
  };

  const editButtonSizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14'
  };

  // Funktion för att generera initialer från namn
  const getInitials = (user) => {
    if (!user) return '';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  // Funktion för att generera en färg baserat på användarens namn
  const getAvatarColor = (user) => {
    if (!user || (!user.firstName && !user.lastName)) {
      return 'from-gray-400 to-gray-500';
    }
    
    const name = (user.firstName || '') + (user.lastName || '');
    const colors = [
      'from-blue-400 to-blue-500',
      'from-green-400 to-green-500', 
      'from-purple-400 to-purple-500',
      'from-pink-400 to-pink-500',
      'from-indigo-400 to-indigo-500',
      'from-red-400 to-red-500',
      'from-yellow-400 to-yellow-500',
      'from-teal-400 to-teal-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const hasProfileImage = src && src !== '';
  const initials = getInitials(user);
  const avatarColor = getAvatarColor(user);

  return (
    <div className={`relative inline-block ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 border-white shadow-xl bg-white`}>
        {hasProfileImage ? (
          <img
            src={src}
            alt="Profilbild"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`w-full h-full bg-gradient-to-br ${avatarColor} flex items-center justify-center ${hasProfileImage ? 'hidden' : ''}`}
          style={hasProfileImage ? { display: 'none' } : {}}
        >
          {initials ? (
            <span className={`text-white font-bold ${
              size === 'sm' ? 'text-xs' : 
              size === 'md' ? 'text-2xl' : 
              size === 'lg' ? 'text-3xl' : 'text-4xl'
            }`}>
              {initials}
            </span>
          ) : (
            <User className={`${iconSizes[size]} text-white`} />
          )}
        </div>
      </div>
      
      {showEditIcon && onEdit && EditIcon && (
        <button
          onClick={onEdit}
          className={`absolute bottom-0 right-0 ${editButtonSizes[size]} bg-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-all shadow-lg`}
        >
          <EditIcon className={`${editIconSizes[size]} text-white`} />
        </button>
      )}
    </div>
  );
};

export default ProfileAvatar; 