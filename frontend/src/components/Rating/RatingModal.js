import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Star, 
  Clock, 
  Zap, 
  MessageCircle, 
  Heart, 
  Brain, 
  Users, 
  CheckCircle,
  Shield,
  AlertTriangle
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const RatingModal = ({ isOpen, onClose, participant, event }) => {
  const [rating, setRating] = useState(5);
  const [selectedCategories, setSelectedCategories] = useState({});
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');

  const categories = [
    { key: 'punctual', label: 'Kom i tid', icon: Clock, color: 'blue' },
    { key: 'fittingPace', label: 'Höll utlovad nivå', icon: Zap, color: 'green' },
    { key: 'goodCommunication', label: 'Bra kommunikation', icon: MessageCircle, color: 'purple' },
    { key: 'motivating', label: 'Motiverande', icon: Heart, color: 'red' },
    { key: 'knowledgeable', label: 'Kunnig om löpning', icon: Brain, color: 'indigo' },
    { key: 'friendly', label: 'Trevlig och social', icon: Users, color: 'pink' },
    { key: 'wellPrepared', label: 'Välförberedd', icon: CheckCircle, color: 'emerald' },
    { key: 'flexible', label: 'Flexibel', icon: Shield, color: 'orange' }
  ];

  const reportReasons = [
    { value: 'late', label: 'Kom för sent eller inte alls' },
    { value: 'inappropriate_behavior', label: 'Olämpligt beteende' },
    { value: 'safety_concern', label: 'Säkerhetsproblem' },
    { value: 'misrepresentation', label: 'Missvisande information' },
    { value: 'other', label: 'Annat' }
  ];

  const handleCategoryToggle = (categoryKey) => {
    setSelectedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };

  const handleSubmitRating = async () => {
    setIsSubmitting(true);
    
    try {
      await api.post('/ratings', {
        rateeId: participant._id,
        eventId: event._id,
        categories: selectedCategories,
        comment: comment.trim(),
        overallRating: rating
      });
      
      toast.success('Betyg skickat! Tack för din feedback 🌟');
      onClose();
      
    } catch (error) {
      console.error('Rating error:', error);
      toast.error(error.response?.data?.message || 'Kunde inte skicka betyg');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportReason) {
      toast.error('Välj en anledning för rapporten');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await api.post('/ratings/report', {
        reportedUserId: participant._id,
        eventId: event._id,
        reason: reportReason,
        details: reportDetails.trim()
      });
      
      toast.success('Rapport skickad till support');
      onClose();
      
    } catch (error) {
      console.error('Report error:', error);
      toast.error('Kunde inte skicka rapport');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getColorClasses = (color) => ({
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    pink: 'bg-pink-50 text-pink-700 border-pink-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200'
  }[color]);

  if (!isOpen || !participant || !event) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 border-b border-gray-100">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-4">
              <img
                src={participant.profilePhoto || `https://ui-avatars.com/api/?name=${participant.firstName}+${participant.lastName}&background=random`}
                alt={participant.firstName}
                className="w-16 h-16 rounded-2xl object-cover"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Betygsätt {participant.firstName}
                </h2>
                <p className="text-gray-600">{event.title}</p>
              </div>
            </div>
          </div>

          {!showReportForm ? (
            // Main Rating Form
            <div className="p-6 space-y-6">
              {/* Overall Rating */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Övergripande betyg</h3>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </motion.button>
                  ))}
                  <span className="ml-2 text-lg font-semibold text-gray-700">
                    {rating} stjärnor
                  </span>
                </div>
              </div>

              {/* Positive Categories */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Vad var bra? (välj alla som stämmer)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const isSelected = selectedCategories[category.key];
                    
                    return (
                      <motion.button
                        key={category.key}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCategoryToggle(category.key)}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? `${getColorClasses(category.color)} border-opacity-100`
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium text-sm">{category.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Comment */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Kommentar (valfritt)
                </h3>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Skriv något positivt om er löprunda tillsammans..."
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows="4"
                  maxLength="500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {comment.length}/500 tecken
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmitRating}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Skickar...' : 'Skicka betyg 🌟'}
                </motion.button>
                
                <button
                  onClick={() => setShowReportForm(true)}
                  className="w-full text-sm text-gray-500 hover:text-red-500 transition flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Rapportera problem till support
                </button>
              </div>
            </div>
          ) : (
            // Report Form
            <div className="p-6 space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-800 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-bold">Rapportera problem</h3>
                </div>
                <p className="text-red-700 text-sm">
                  Denna rapport skickas privat till support och syns inte för andra användare.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Vad var problemet?</h3>
                <div className="space-y-2">
                  {reportReasons.map((reason) => (
                    <label key={reason.value} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer">
                      <input
                        type="radio"
                        name="reportReason"
                        value={reason.value}
                        checked={reportReason === reason.value}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="text-red-500 focus:ring-red-500"
                      />
                      <span className="font-medium text-gray-800">{reason.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Detaljer</h3>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Beskriv vad som hände..."
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows="4"
                  maxLength="1000"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReportForm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition"
                >
                  Tillbaka
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmitReport}
                  disabled={isSubmitting || !reportReason}
                  className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Skickar...' : 'Skicka rapport'}
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RatingModal; 