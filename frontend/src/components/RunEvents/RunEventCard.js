import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import UserRatingProfile from '../Rating/UserRatingProfile';

const formatPace = (secondsPerKm) => {
  if (!secondsPerKm || secondsPerKm === 0) return 'N/A';
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const dateStr = date.toLocaleDateString('sv-SE', options);
    const timeStr = date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
    return { dateStr, timeStr };
};

const RunEventCard = ({ event }) => {
  const { _id, title, location, date, distance, pace, host, participants, maxParticipants } = event;

  const profilePicture = host.profilePhoto || `https://ui-avatars.com/api/?name=${host.firstName}+${host.lastName}`;
  const hostName = `${host.firstName} ${host.lastName}`;
  const spotsLeft = maxParticipants - participants.length;
  const isFull = spotsLeft === 0;
  const participationPercentage = (participants.length / maxParticipants) * 100;
  const { dateStr, timeStr } = formatDate(date);

  return (
    <motion.div 
        className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
        whileHover={{ y: -8 }}
        whileTap={{ scale: 0.98 }}
    >
      {/* Top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-pink-500 to-purple-600"></div>
      
      {/* Background decoration */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-red-400/10 to-pink-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
      
      <div className="relative p-8">
        {/* Header with host info */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h3 className="text-2xl font-black text-gray-900 mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-pink-600 transition-all duration-300">
              {title}
            </h3>
            <div className="flex items-center gap-3">
              <Link to={`/app/profile/${host._id}`} className="flex items-center gap-2 group/host">
                <img 
                  src={profilePicture}
                  alt={hostName} 
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-gray-100 group-hover/host:ring-red-200 transition-all"
                />
                <div>
                  <p className="text-sm font-bold text-gray-700 group-hover/host:text-red-600 transition-colors">
                    {hostName}
                  </p>
                  <UserRatingProfile userId={host._id} compact={true} />
                </div>
              </Link>
            </div>
          </div>
          
          {/* Distance badge */}
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="flex flex-col items-center justify-center bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-2xl p-4 shadow-lg"
          >
            <span className="text-2xl font-black">{distance}</span>
            <span className="text-xs font-bold uppercase">km</span>
          </motion.div>
        </div>
        
        {/* Date and time section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 capitalize">{dateStr}</p>
                <p className="text-xs text-gray-600">kl. {timeStr}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-sm font-bold text-gray-700">{formatPace(pace)}</span>
            </div>
          </div>
        </div>
        
        {/* Location */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <MapPin className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800">{location.name}</p>
          </div>
        </div>

        {/* Participants section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <span className="font-bold text-gray-900">
                {participants.length}/{maxParticipants} deltagare
              </span>
            </div>
            {!isFull && (
              <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                {spotsLeft} {spotsLeft === 1 ? 'plats' : 'platser'} kvar
              </span>
            )}
            {isFull && (
              <span className="text-sm font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                Fullbokat
              </span>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${participationPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          
          {/* Participant avatars */}
          {participants.length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <div className="flex -space-x-3">
                {participants.slice(0, 5).map((participant, i) => (
                  <img
                    key={participant._id}
                    src={participant.profilePhoto || `https://ui-avatars.com/api/?name=${participant.firstName}+${participant.lastName}`}
                    alt={participant.firstName}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                    style={{ zIndex: 5 - i }}
                  />
                ))}
                {participants.length > 5 && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-600 shadow-sm">
                    +{participants.length - 5}
                  </div>
                )}
              </div>
              {participants.length > 0 && (
                <p className="text-xs text-gray-500 ml-2">
                  {participants.length === 1 ? 'går redan' : 'går redan'}
                </p>
              )}
            </div>
          )}
        </div>

        {/* CTA Button */}
        <Link to={`/app/runevents/${_id}`}>
          <motion.button 
            className="w-full group/btn flex items-center justify-center gap-3 bg-gradient-to-r from-gray-900 to-gray-700 text-white font-bold px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-lg">Visa detaljer</span>
            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
};

export default RunEventCard; 