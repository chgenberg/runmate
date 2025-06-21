import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { 
  Users, 
  Calendar, 
  Target, 
  ArrowLeft, 
  Share2, 
  BarChart2, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Clock,
  Zap,
  Flag,
  Trophy,
  Crown,
  Award,
  Copy,
  ChevronDown
} from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
    <div className="relative">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="absolute inset-0 w-20 h-20 border-4 border-purple-200 border-b-purple-600 rounded-full"
      />
    </div>
  </div>
);

const ShareMenu = ({ 
  isOpen, 
  onClose, 
  onFacebook, 
  onTwitter, 
  onLinkedIn, 
  onWhatsApp, 
  onCopy, 
  onNative,
  buttonRef
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right - 256 + window.scrollX // 256px is menu width
      });
    }
  }, [isOpen, buttonRef]);

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
        style={{ zIndex: 9998 }}
        onClick={onClose}
      />
      
      {/* Menu */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="fixed w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        style={{ 
          zIndex: 9999,
          top: position.top,
          left: position.left
        }}
      >
        <div className="p-2">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Dela utmaning</h3>
            <p className="text-sm text-gray-600">Välj hur du vill dela</p>
          </div>
          
          <div className="py-2 space-y-1">
            {/* Native Share (if supported) */}
            {navigator.share && (
              <motion.button
                whileHover={{ backgroundColor: '#f3f4f6' }}
                whileTap={{ scale: 0.98 }}
                onClick={onNative}
                className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-gray-700">Dela via system</span>
              </motion.button>
            )}
            
            {/* Facebook */}
            <motion.button
              whileHover={{ backgroundColor: '#f3f4f6' }}
              whileTap={{ scale: 0.98 }}
              onClick={onFacebook}
              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <span className="font-medium text-gray-700">Facebook</span>
            </motion.button>
            
            {/* Twitter */}
            <motion.button
              whileHover={{ backgroundColor: '#f3f4f6' }}
              whileTap={{ scale: 0.98 }}
              onClick={onTwitter}
              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </div>
              <span className="font-medium text-gray-700">Twitter</span>
            </motion.button>
            
            {/* LinkedIn */}
            <motion.button
              whileHover={{ backgroundColor: '#f3f4f6' }}
              whileTap={{ scale: 0.98 }}
              onClick={onLinkedIn}
              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <span className="font-medium text-gray-700">LinkedIn</span>
            </motion.button>
            
            {/* WhatsApp */}
            <motion.button
              whileHover={{ backgroundColor: '#f3f4f6' }}
              whileTap={{ scale: 0.98 }}
              onClick={onWhatsApp}
              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </div>
              <span className="font-medium text-gray-700">WhatsApp</span>
            </motion.button>
            
            {/* Copy Link */}
            <motion.button
              whileHover={{ backgroundColor: '#f3f4f6' }}
              whileTap={{ scale: 0.98 }}
              onClick={onCopy}
              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                <Copy className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-gray-700">Kopiera länk</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>,
    document.body
  );
};

const ChallengeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [challenge, setChallenge] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareButtonRef = useRef(null);

  const isParticipant = challenge?.participants.some(p => p.user?._id === user?._id && p.isActive);

  const fetchChallengeData = useCallback(async () => {
    setLoading(true);
    try {
      const [challengeRes, leaderboardRes] = await Promise.all([
        api.get(`/challenges/${id}`),
        api.get(`/challenges/${id}/leaderboard`)
      ]);
      setChallenge(challengeRes.data);
      setLeaderboard(leaderboardRes.data);
      setError(null);
    } catch (err) {
      setError('Kunde inte ladda utmaningsdetaljer.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchChallengeData();
  }, [fetchChallengeData]);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showShareMenu && !event.target.closest('.relative')) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareMenu]);

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      let joinCode = '';
      if (challenge.visibility === 'private') {
        joinCode = prompt('Ange inbjudningskod för att gå med:');
        if (joinCode === null) {
            setIsJoining(false);
            return;
        }
      }
      await api.post(`/challenges/${id}/join`, { joinCode });
      fetchChallengeData();
    } catch (err) {
      alert(err.response?.data?.message || 'Kunde inte gå med i utmaningen.');
    } finally {
      setIsJoining(false);
    }
  };
  
  const handleLeave = async () => {
    if (window.confirm('Är du säker på att du vill lämna utmaningen?')) {
        setIsJoining(true);
        try {
          await api.post(`/challenges/${id}/leave`);
          navigate('/app/challenges');
        } catch (err) {
          alert(err.response?.data?.message || 'Kunde inte lämna utmaningen.');
        } finally {
          setIsJoining(false);
        }
    }
  };

  // Sharing functions
  const getChallengeUrl = () => {
    return `${window.location.origin}/app/challenges/${challenge._id}`;
  };

  const getShareText = () => {
    return `Kolla in denna utmaning: "${challenge.title}" - ${challenge.description} 🏃‍♂️💪`;
  };

  const shareToFacebook = () => {
    const url = getChallengeUrl();
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  const shareToTwitter = () => {
    const url = getChallengeUrl();
    const text = getShareText();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  const shareToLinkedIn = () => {
    const url = getChallengeUrl();
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  const shareToWhatsApp = () => {
    const url = getChallengeUrl();
    const text = getShareText();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
    window.open(whatsappUrl, '_blank');
    setShowShareMenu(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getChallengeUrl());
      alert('Länk kopierad till urklipp!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = getChallengeUrl();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Länk kopierad till urklipp!');
    }
    setShowShareMenu(false);
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: challenge.title,
          text: getShareText(),
          url: getChallengeUrl(),
        });
        setShowShareMenu(false);
      } catch (err) {
        console.log('Native sharing cancelled');
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg m-4">{error}</div>;
  if (!challenge) return null;

  const getIcon = (type) => {
    const icons = {
      'distance': Target,
      'time': Clock,
      'elevation': TrendingUp,
      'activities': Flag,
      'custom': Zap
    };
    return icons[type] || Trophy;
  };

  const ChallengeIcon = getIcon(challenge.type);

  const daysRemaining = Math.max(0, Math.ceil((new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24)));
  
  const myProgress = () => {
    if (!isParticipant) return { value: 0, percentage: 0 };
    
    // Check if myProgress is already calculated from backend
    if (challenge.myProgress) {
      return challenge.myProgress;
    }
    
    const participant = challenge.participants.find(p => p.user._id === user._id);
    if (!participant) return { value: 0, percentage: 0 };

    const metric = challenge.goal.unit.replace('km', 'distance').replace('meters', 'elevation').replace('hours', 'time');
    const value = participant.progress[metric] || 0;
    const percentage = Math.min((value / challenge.goal.target) * 100, 100);

    return { value, percentage };
  };
  
  const { value: myProgressValue, percentage: myProgressPercentage } = myProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        
        <div className="relative max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="px-4 sm:px-6 lg:px-8 pt-8 pb-16"
          >
            <button 
              onClick={() => navigate('/app/challenges')} 
              className="flex items-center text-gray-600 hover:text-primary mb-8 group font-medium"
            >
              <ArrowLeft size={20} className="mr-2 transition-transform group-hover:-translate-x-2" />
              Tillbaka till utmaningar
            </button>
            
            <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
              <div className="flex-1">
                <div className="flex items-start gap-6 mb-6">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className="relative"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                      <ChallengeIcon className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </motion.div>
                  
                  <div className="flex-1">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
                      {challenge.title}
                    </h1>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      {challenge.description}
                    </p>
                    
                    {/* Quick Stats */}
                    <div className="flex flex-wrap gap-4 mt-6">
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-gray-900">{challenge.participants.filter(p => p.isActive).length}</span>
                        <span className="text-gray-500">deltagare</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-gray-900">{daysRemaining}</span>
                        <span className="text-gray-500">dagar kvar</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
                        <Target className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-gray-900">{challenge.goal.target}</span>
                        <span className="text-gray-500">{challenge.goal.unit}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <motion.button 
                    ref={shareButtonRef}
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 px-5 py-3 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                  >
                    <Share2 size={20} />
                    <span className="font-medium">Dela</span>
                    <ChevronDown size={16} className={`transition-transform ${showShareMenu ? 'rotate-180' : ''}`} />
                  </motion.button>
                  
                  <ShareMenu
                    isOpen={showShareMenu}
                    onClose={() => setShowShareMenu(false)}
                    onFacebook={shareToFacebook}
                    onTwitter={shareToTwitter}
                    onLinkedIn={shareToLinkedIn}
                    onWhatsApp={shareToWhatsApp}
                    onCopy={copyToClipboard}
                    onNative={shareNative}
                    buttonRef={shareButtonRef}
                  />
                </div>
                
                {isParticipant ? (
                  <motion.button 
                    onClick={handleLeave} 
                    disabled={isJoining}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 bg-red-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:bg-red-600 transition-all"
                  >
                    <XCircle size={20} />
                    {isJoining ? 'Lämnar...' : 'Lämna utmaning'}
                  </motion.button>
                ) : (
                  <motion.button 
                    onClick={handleJoin} 
                    disabled={isJoining}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    <CheckCircle size={20} />
                    {isJoining ? 'Går med...' : 'Gå med i utmaning'}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 sm:p-6 lg:p-8">
            {/* Left Column - Stats & Progress */}
            <div className="lg:col-span-1 space-y-6">
                {/* Progress Card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl blur-xl" />
                  <div className="relative bg-white backdrop-blur-xl rounded-3xl border border-gray-100 shadow-xl p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Din Framsteg</h3>
                    {isParticipant ? (
                      <div>
                        <div className="flex justify-center mb-6">
                          <div className="relative w-40 h-40">
                            <CircularProgressbar 
                              value={myProgressPercentage} 
                              text={`${Math.round(myProgressPercentage)}%`} 
                              styles={buildStyles({
                                  rotation: 0.25,
                                  strokeLinecap: 'round',
                                  textSize: '24px',
                                  pathTransitionDuration: 1,
                                  pathColor: `url(#gradient)`,
                                  textColor: '#111827',
                                  trailColor: '#f3f4f6',
                              })}
                            />
                            <svg style={{ height: 0 }}>
                              <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#4F46E5" />
                                  <stop offset="100%" stopColor="#9333EA" />
                                </linearGradient>
                              </defs>
                            </svg>
                          </div>
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-4xl font-black text-gray-900">{myProgressValue.toFixed(1)}</p>
                          <p className="text-lg text-gray-500">av {challenge.goal.target} {challenge.goal.unit}</p>
                          <div className="pt-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full">
                              <TrendingUp className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-semibold text-purple-600">
                                {challenge.goal.isCollective ? "Gemensamt mål" : "Individuellt mål"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trophy className="w-10 h-10 text-gray-400" />
                          </div>
                          <p className="text-gray-600 font-medium mb-4">Gå med för att börja tävla!</p>
                          <motion.button 
                            onClick={handleJoin} 
                            disabled={isJoining} 
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50" 
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }}
                          >
                            <CheckCircle size={20} className="inline-block mr-2"/>
                            {isJoining ? 'Går med...' : 'Gå med nu'}
                          </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
                
                {/* Stats Grid */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-2 gap-4"
                >
                  <StatItem
                    icon={Target}
                    label="Mål"
                    value={challenge.goal.target}
                    unit={challenge.goal.unit}
                    color="blue"
                  />
                  <StatItem
                    icon={Calendar}
                    label="Tid kvar"
                    value={daysRemaining}
                    unit="dagar"
                    color="green"
                  />
                  <StatItem
                    icon={Users}
                    label="Deltagare"
                    value={challenge.participants.filter(p=>p.isActive).length}
                    unit={`av ${challenge.maxParticipants || '∞'}`}
                    color="purple"
                  />
                  <StatItem
                    icon={BarChart2}
                    label="Status"
                    value={challenge.status}
                    color="orange"
                    capitalize
                  />
                </motion.div>
                
                {/* Participants */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Aktiva deltagare ({challenge.participants.filter(p=>p.isActive).length})
                  </h3>
                  <div className="flex flex-wrap gap-3">
                      {challenge.participants.filter(p=>p.isActive).map(p => (
                        <Link to={`/app/profile/${p.user?._id}`} key={p.user?._id}>
                          <motion.div
                            whileHover={{ scale: 1.1, y: -4 }}
                            className="relative"
                          >
                            <img 
                              src={p.user?.profileImage || `https://ui-avatars.com/api/?name=${p.user?.firstName}+${p.user?.lastName}&background=random&color=fff`} 
                              alt={p.user?.firstName} 
                              className="w-14 h-14 rounded-full border-3 border-white shadow-lg"
                              title={`${p.user?.firstName} ${p.user?.lastName}`}
                            />
                            {/* Show rank badge for top 3 */}
                            {leaderboard.findIndex(l => l.user._id === p.user._id) < 3 && leaderboard.findIndex(l => l.user._id === p.user._id) >= 0 && (
                              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md ${
                                leaderboard.findIndex(l => l.user._id === p.user._id) === 0 ? 'bg-yellow-500' :
                                leaderboard.findIndex(l => l.user._id === p.user._id) === 1 ? 'bg-gray-400' :
                                'bg-yellow-700'
                              }`}>
                                {leaderboard.findIndex(l => l.user._id === p.user._id) + 1}
                              </div>
                            )}
                          </motion.div>
                        </Link>
                      ))}
                  </div>
                </motion.div>
            </div>
            
            {/* Right Column - Leaderboard */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white backdrop-blur-xl rounded-3xl border border-gray-100 shadow-xl p-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">Topplista</h3>
                  <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full">
                    <Trophy className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-semibold text-purple-600">
                      {leaderboard.length} deltagare rankas
                    </span>
                  </div>
                </div>
                
                {leaderboard.length > 0 ? (
                  <>
                    {/* Chart */}
                    <div className="h-[350px] mb-8 bg-gray-50 rounded-2xl p-4" style={{ minWidth: '300px', minHeight: '350px' }}>
                      {leaderboard.length > 0 && (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart 
                            data={leaderboard.slice(0, 10)} 
                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                          >
                          <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#9333EA" stopOpacity={0.6}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="user.firstName" 
                            stroke="#6b7280" 
                            fontSize={12}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis 
                            stroke="#6b7280" 
                            fontSize={12}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            cursor={{fill: 'rgba(79, 70, 229, 0.08)'}}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-100">
                                    <p className="font-bold text-gray-900">{data.user.firstName} {data.user.lastName}</p>
                                    <p className="text-2xl font-black text-primary mt-1">
                                      {data.progress.toFixed(1)} {challenge.goal.unit}
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar 
                            dataKey="progress" 
                            fill="url(#colorGradient)" 
                            radius={[8, 8, 0, 0]}
                            maxBarSize={50}
                          >
                            {leaderboard.slice(0, 10).map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={
                                  index === 0 ? '#FFC107' : 
                                  index === 1 ? '#9CA3AF' : 
                                  index === 2 ? '#CD7F32' : 
                                  'url(#colorGradient)'
                                } 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                    
                    {/* Leaderboard List */}
                    <div className="space-y-3">
                      {leaderboard.map((p, index) => (
                        <LeaderboardItem 
                          key={p.user._id} 
                          rank={index + 1} 
                          user={p.user} 
                          progress={p.progress} 
                          unit={challenge.goal.unit} 
                          isCurrentUser={user?._id === p.user._id}
                          goal={challenge.goal.target}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <BarChart2 className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-xl font-semibold text-gray-900 mb-2">Ingen data ännu</p>
                    <p className="text-gray-600">Bli den första att rapportera framsteg!</p>
                  </div>
                )}
              </motion.div>
            </div>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ icon: Icon, label, value, unit, color = 'gray', capitalize = false }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500 text-blue-600 bg-blue-50',
    green: 'from-green-500 to-emerald-500 text-green-600 bg-green-50',
    purple: 'from-purple-500 to-pink-500 text-purple-600 bg-purple-50',
    orange: 'from-orange-500 to-red-500 text-orange-600 bg-orange-50',
    gray: 'from-gray-500 to-gray-600 text-gray-600 bg-gray-50'
  };

  const [gradientFrom, gradientTo, textColor, bgColor] = colorClasses[color].split(' ');

  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className={`relative overflow-hidden ${bgColor} p-5 rounded-2xl border border-${color}-100`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-full blur-3xl opacity-20`} />
      <div className="relative">
        <Icon className={`w-6 h-6 ${textColor} mb-2`} />
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className={`text-2xl font-bold text-gray-900 ${capitalize ? 'capitalize' : ''}`}>
          {value}
          {unit && <span className="text-base font-normal text-gray-500 ml-1">{unit}</span>}
        </p>
      </div>
    </motion.div>
  );
};

const LeaderboardItem = ({ rank, user: participantUser, progress, unit, isCurrentUser, goal }) => {
  const rankIcon = () => {
    if (rank === 1) return <Crown className="w-8 h-8 text-yellow-500" />;
    if (rank === 2) return <Award className="w-8 h-8 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-8 h-8 text-yellow-700" />;
    return <span className="text-2xl font-black text-gray-400">{rank}</span>;
  };

  const progressPercentage = Math.min((progress / goal) * 100, 100);

  return (
    <motion.div 
      className={`relative flex items-center p-4 rounded-2xl transition-all duration-300 ${
        isCurrentUser 
          ? 'bg-gradient-to-r from-primary/10 to-purple-500/10 border-2 border-primary/30' 
          : rank <= 3 
            ? 'bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200' 
            : 'bg-gray-50/50 hover:bg-gray-100/50 border border-gray-100'
      }`}
      whileHover={{ scale: 1.02, x: 4 }}
    >
      {/* Rank */}
      <div className="w-16 text-center mr-4 flex items-center justify-center">
        {rankIcon()}
      </div>
      
      {/* User Info */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative">
          <img 
            src={participantUser?.profileImage || `https://ui-avatars.com/api/?name=${participantUser?.firstName}+${participantUser?.lastName}&background=random&color=fff`} 
            alt={participantUser?.firstName} 
            className="w-14 h-14 rounded-full border-3 border-white shadow-lg" 
          />
          {isCurrentUser && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-bold text-gray-900 text-lg">{participantUser?.firstName} {participantUser?.lastName}</p>
            {isCurrentUser && (
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                DU
              </span>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500">Framsteg</span>
              <span className="font-semibold text-gray-700">{progressPercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 relative overflow-hidden">
              <motion.div 
                className={`h-full rounded-full ${
                  rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                  rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                  rank === 3 ? 'bg-gradient-to-r from-yellow-600 to-yellow-800' :
                  'bg-gradient-to-r from-primary to-purple-600'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: rank * 0.1 }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress Value */}
      <div className="text-right ml-6">
        <p className="text-3xl font-black text-gray-900">{progress.toFixed(1)}</p>
        <p className="text-sm font-medium text-gray-500">{unit}</p>
      </div>
    </motion.div>
  );
};

export default ChallengeDetailPage; 