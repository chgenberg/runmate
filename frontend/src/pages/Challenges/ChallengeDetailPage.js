import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { 
  Users, 
  Calendar, 
  Target, 
  ArrowLeft, 
  Share2, 
  Trophy,
  Crown,
  Copy,
  ChevronRight,
  MapPin,
  Plus,
  Sparkles
} from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinnerFullScreen } from '../../components/Layout/LoadingSpinner';
import toast from 'react-hot-toast';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Popular cities route data (simplified for demo)
const cityRoutes = {
  stockholm: {
    center: [59.3293, 18.0686],
    zoom: 12,
    getRoute: (distance) => {
      // Generate a simple circular route based on distance
      const baseCoords = [59.3293, 18.0686];
      const points = [];
      const numPoints = Math.max(20, distance * 2);
      const radius = distance / (2 * Math.PI * 111); // Convert km to degrees
      
      for (let i = 0; i <= numPoints; i++) {
        const angle = (i / numPoints) * 2 * Math.PI;
        points.push([
          baseCoords[0] + radius * Math.cos(angle),
          baseCoords[1] + radius * Math.sin(angle) * 1.5
        ]);
      }
      return points;
    }
  },
  gothenburg: {
    center: [57.7089, 11.9746],
    zoom: 12,
    getRoute: (distance) => {
      const baseCoords = [57.7089, 11.9746];
      const points = [];
      const numPoints = Math.max(20, distance * 2);
      const radius = distance / (2 * Math.PI * 111);
      
      for (let i = 0; i <= numPoints; i++) {
        const angle = (i / numPoints) * 2 * Math.PI;
        points.push([
          baseCoords[0] + radius * Math.cos(angle),
          baseCoords[1] + radius * Math.sin(angle) * 1.5
        ]);
      }
      return points;
    }
  },
  // Add more cities as needed
};

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
  const [showAllParticipants, setShowAllParticipants] = useState(false);

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
      toast.error('Kunde inte ladda utmaning');
      navigate('/app/challenges');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

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
      await api.post(`/challenges/${id}/join`);
      toast.success('Du har gått med i utmaningen!');
      fetchChallengeData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kunde inte gå med');
    } finally {
      setIsJoining(false);
    }
  };
  
  const handleLeave = async () => {
    if (window.confirm('Är du säker på att du vill lämna utmaningen?')) {
      setIsJoining(true);
      try {
        await api.post(`/challenges/${id}/leave`);
        toast.success('Du har lämnat utmaningen');
        navigate('/app/challenges');
      } catch (err) {
        toast.error('Kunde inte lämna utmaningen');
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
      toast.success('Länk kopierad!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = getChallengeUrl();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Länk kopierad!');
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

  if (loading) {
    return <LoadingSpinnerFullScreen message="Laddar utmaning..." />;
  }

  if (error) return <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg m-4">{error}</div>;
  if (!challenge) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <p className="text-gray-600">Utmaningen kunde inte hittas</p>
      <button onClick={() => navigate('/app/challenges')} className="mt-4 text-orange-600 hover:text-orange-700">
        Tillbaka till utmaningar
      </button>
    </div>
  </div>;

  const daysRemaining = Math.max(0, Math.ceil((new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24)));

  const isRouteChallenge = challenge.type === 'route_race' && challenge.route;

  // Get route data if it's a route challenge
  const routeData = isRouteChallenge && cityRoutes[challenge.route.cityId];
  const routeCoordinates = routeData?.getRoute(challenge.route.distance) || [];

  // Calculate participant positions on route based on their progress
  const getParticipantPosition = (participant) => {
    if (!isRouteChallenge || !routeCoordinates.length) return null;
    
    const progress = participant.progress.distance || 0;
    const totalDistance = challenge.route.distance;
    const progressPercentage = Math.min(progress / totalDistance, 1);
    
    const pointIndex = Math.floor(progressPercentage * (routeCoordinates.length - 1));
    return routeCoordinates[pointIndex];
  };

  // Create custom icon for participants
  const createParticipantIcon = (participant, rank) => {
    const isMe = participant.user._id === user._id;
    const color = isMe ? '#ef4444' : rank === 1 ? '#fbbf24' : rank === 2 ? '#9ca3af' : rank === 3 ? '#f97316' : '#6366f1';
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="relative">
          <div class="absolute -top-2 -left-2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2" style="border-color: ${color}">
            <img src="https://ui-avatars.com/api/?name=${participant.user.name}&background=${color.substring(1)}&color=fff&size=40" 
                 class="w-10 h-10 rounded-full" />
          </div>
          ${rank <= 3 ? `
            <div class="absolute -top-3 -right-3 w-6 h-6 bg-${rank === 1 ? 'yellow' : rank === 2 ? 'gray' : 'orange'}-400 rounded-full flex items-center justify-center shadow-md">
              <span class="text-xs font-bold text-white">${rank}</span>
            </div>
          ` : ''}
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 48],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/app/challenges')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium hidden sm:inline">Tillbaka</span>
            </button>
            
            <button
              onClick={() => setShowShareMenu(true)}
              className="btn btn-glass btn-sm"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Dela
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-4 pt-6 pb-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 animate-slide-up">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow animate-pulse-slow">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{challenge.title}</h1>
              <p className="text-gray-600 mb-4">{challenge.description}</p>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{challenge.participants.filter(p => p.isActive).length}</span>
                  <span className="text-gray-500">deltagare</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{daysRemaining}</span>
                  <span className="text-gray-500">dagar kvar</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Target className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{challenge.goal.target}</span>
                  <span className="text-gray-500">{challenge.goal.unit}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Join/Leave Button */}
          <div className="mt-6">
            {isParticipant ? (
              <button
                onClick={handleLeave}
                disabled={isJoining}
                className="w-full btn btn-glass"
              >
                Lämna utmaning
              </button>
            ) : (
              <button
                onClick={handleJoin}
                disabled={isJoining}
                className="w-full btn btn-primary"
              >
                {isJoining ? 'Går med...' : 'Gå med i utmaning'}
                <Plus className="w-5 h-5 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Map View for Route Challenges */}
      {isRouteChallenge && routeData && (
        <div className="px-4 pb-4">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-slide-up animation-delay-200">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary-500" />
                Rutt i {challenge.route.city} - {challenge.route.distance} km
              </h2>
            </div>
            
            <div className="h-96">
              <MapContainer
                center={routeData.center}
                zoom={routeData.zoom}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                
                {/* Draw the route */}
                <Polyline
                  positions={routeCoordinates}
                  color="#ef4444"
                  weight={4}
                  opacity={0.8}
                />
                
                {/* Place participant markers */}
                {leaderboard.slice(0, 10).map((participant, index) => {
                  const position = getParticipantPosition(participant);
                  if (!position) return null;
                  
                  return (
                    <Marker
                      key={participant.user._id}
                      position={position}
                      icon={createParticipantIcon(participant, index + 1)}
                    >
                      <Popup>
                        <div className="text-sm">
                          <div className="font-semibold">{participant.user.name}</div>
                          <div className="text-gray-600">
                            {participant.progress.distance || 0} / {challenge.route.distance} km
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
                
                {/* Start/Finish markers */}
                <Marker position={routeCoordinates[0]}>
                  <Popup>Start</Popup>
                </Marker>
                <Marker position={routeCoordinates[routeCoordinates.length - 1]}>
                  <Popup>Mål</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="px-4 pb-20">
        <div className="bg-white rounded-2xl shadow-sm p-6 animate-slide-up animation-delay-300">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
            Topplista
          </h2>
          
          <div className="space-y-3">
            {leaderboard.slice(0, showAllParticipants ? undefined : 5).map((participant, index) => {
              const rank = index + 1;
              const isMe = participant.user._id === user._id;
              const progress = participant.progress.distance || participant.progress.time || participant.progress.activities || 0;
              const percentage = (progress / challenge.goal.target) * 100;
              
              return (
                <div
                  key={participant.user._id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isMe ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Rank */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                        rank === 2 ? 'bg-gray-100 text-gray-700' :
                        rank === 3 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        {rank === 1 ? <Crown className="w-5 h-5" /> : rank}
                      </div>
                      
                      {/* User info */}
                      <img
                        src={`https://ui-avatars.com/api/?name=${participant.user.name}&background=6366f1&color=fff`}
                        alt={participant.user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {participant.user.name}
                          {isMe && <span className="text-primary-600 ml-1">(Du)</span>}
                        </p>
                        <p className="text-sm text-gray-600">
                          {progress} / {challenge.goal.target} {challenge.goal.unit}
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress */}
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900">{percentage.toFixed(0)}%</p>
                      {percentage >= 100 && (
                        <div className="flex items-center text-green-600 text-sm">
                          <Sparkles className="w-4 h-4 mr-1" />
                          Klart!
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isMe ? 'bg-gradient-primary' : 'bg-gradient-to-r from-blue-500 to-purple-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          {leaderboard.length > 5 && (
            <button
              onClick={() => setShowAllParticipants(!showAllParticipants)}
              className="w-full mt-4 py-2 text-center text-primary-600 font-medium hover:text-primary-700 transition-colors"
            >
              {showAllParticipants ? 'Visa färre' : `Visa alla ${leaderboard.length} deltagare`}
              <ChevronRight className={`w-4 h-4 inline-block ml-1 transition-transform ${showAllParticipants ? 'rotate-90' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Share Menu */}
      {showShareMenu && (
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
      )}
    </div>
  );
};

export default ChallengeDetailPage; 