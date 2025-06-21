import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Calendar, MapPin, Clock, Bell } from 'lucide-react';
import api from '../../services/api';
import RatingModal from './RatingModal';
import moment from 'moment';
import 'moment/locale/sv';

const PendingRatings = () => {
  const [pendingRatings, setPendingRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  useEffect(() => {
    fetchPendingRatings();
    moment.locale('sv');
  }, []);

  const fetchPendingRatings = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/ratings/pending');
      setPendingRatings(response.data.data);
    } catch (error) {
      console.error('Error fetching pending ratings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRateUser = (pendingRating) => {
    setSelectedRating(pendingRating);
    setIsRatingModalOpen(true);
  };

  const handleModalClose = () => {
    setIsRatingModalOpen(false);
    setSelectedRating(null);
    // Refresh the list to remove completed ratings
    fetchPendingRatings();
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (pendingRatings.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-2xl">
        <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-700 mb-2">Inga väntande betyg</h3>
        <p className="text-gray-500">
          Du har betygsatt alla dina senaste löppartners! 🌟
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-orange-100 rounded-2xl">
          <Bell className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Väntande betyg</h2>
          <p className="text-gray-600">
            Betygsätt dina löppartners från senaste events
          </p>
        </div>
        {pendingRatings.length > 0 && (
          <div className="ml-auto">
            <span className="bg-orange-100 text-orange-800 text-sm font-bold px-3 py-1 rounded-full">
              {pendingRatings.length} väntande
            </span>
          </div>
        )}
      </div>

      {/* Pending ratings list */}
      <div className="space-y-3">
        {pendingRatings.map((pendingRating, index) => (
          <motion.div
            key={`${pendingRating.event._id}-${pendingRating.participant._id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Participant photo */}
                <img
                  src={
                    pendingRating.participant.profilePhoto ||
                    `https://ui-avatars.com/api/?name=${pendingRating.participant.firstName}+${pendingRating.participant.lastName}&background=random`
                  }
                  alt={pendingRating.participant.firstName}
                  className="w-14 h-14 rounded-2xl object-cover"
                />
                
                {/* Event and participant info */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    {pendingRating.participant.firstName} {pendingRating.participant.lastName}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{pendingRating.event.title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{moment(pendingRating.event.date).fromNow()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rate button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleRateUser(pendingRating)}
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Star className="w-5 h-5" />
                <span>Betygsätt</span>
              </motion.button>
            </div>

            {/* Event date highlight if recent */}
            {moment(pendingRating.event.date).isAfter(moment().subtract(3, 'days')) && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-800 text-sm font-medium">
                  ✨ Nyligen avslutat event - betygsätt nu medan det är färskt i minnet!
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Rating Modal */}
      {selectedRating && (
        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={handleModalClose}
          participant={selectedRating.participant}
          event={selectedRating.event}
        />
      )}
    </div>
  );
};

export default PendingRatings; 