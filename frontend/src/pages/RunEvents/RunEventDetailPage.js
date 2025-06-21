import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Zap, Check, X, Edit, Trash2, Send, LogOut, Loader2, MessageSquare, Download, Sparkles, Activity, Shield, UserPlus } from 'lucide-react';
import { createEvent } from 'ics';
import EventMap from '../../components/Activity/EventMap';
import { EventLoader } from '../../components/Layout/LoadingSpinner';

// Helper functions (could be moved to a utils file)
const formatPace = (secondsPerKm) => {
  if (!secondsPerKm || secondsPerKm === 0) return 'N/A';
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
};

const formatDate = (dateString) => {
  const options = { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('sv-SE', options);
};


const RunEventDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [event, setEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchEvent = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get(`/runevents/${id}`);
            if (data.success) {
                setEvent(data.data);
            } else {
                setError('Kunde inte hitta eventet.');
            }
        } catch (err) {
            setError('Ett fel uppstod vid hämtning av eventet.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchEvent();
    }, [fetchEvent]);

    const handleJoinRequest = async () => {
        setActionLoading(true);
        try {
            await api.post(`/runevents/${id}/join`);
            toast.success('Din förfrågan har skickats!');
            fetchEvent(); // Refresh data
        } catch (error) {
            toast.error(error.response?.data?.message || 'Kunde inte skicka förfrågan.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleLeaveEvent = async () => {
        setActionLoading(true);
        if (window.confirm('Är du säker på att du vill lämna detta löppass?')) {
            try {
                await api.post(`/runevents/${id}/leave`);
                toast.success('Du har lämnat löppasset.');
                fetchEvent(); // Refresh data
            } catch (error) {
                toast.error(error.response?.data?.message || 'Kunde inte lämna passet.');
            } finally {
                setActionLoading(false);
            }
        } else {
            setActionLoading(false);
        }
    };

    const handleManageRequest = async (applicantId, action) => {
        setActionLoading(applicantId); // Set loading state for specific user
        try {
            await api.put(`/runevents/${id}/requests`, { applicantId, action });
            toast.success(`Förfrågan har blivit ${action === 'approve' ? 'godkänd' : 'nekad'}.`);
            fetchEvent();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Kunde inte hantera förfrågan.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCalendarExport = () => {
        if (!event) return;

        const eventDate = new Date(event.date);
        const durationInHours = (event.distance * (event.pace / 60)) / 60; // A rough estimate

        const icsEvent = {
            title: event.title,
            description: event.description,
            start: [
                eventDate.getUTCFullYear(),
                eventDate.getUTCMonth() + 1,
                eventDate.getUTCDate(),
                eventDate.getUTCHours(),
                eventDate.getUTCMinutes()
            ],
            duration: { hours: Math.floor(durationInHours), minutes: Math.round((durationInHours % 1) * 60) },
            location: event.location.name,
            url: window.location.href,
            status: 'CONFIRMED',
            organizer: { name: `${event.host.firstName} ${event.host.lastName}`, email: event.host.email },
            attendees: event.participants.map(p => ({
                name: `${p.firstName} ${p.lastName}`,
                email: p.email,
                role: 'REQ-PARTICIPANT'
            }))
        };

        createEvent(icsEvent, (error, value) => {
            if (error) {
                console.log(error);
                toast.error('Kunde inte skapa kalenderfil.');
                return;
            }
            const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${event.title.replace(/ /g,"_")}.ics`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };

    const isHost = user && event && user.id === event.host._id;
    const isParticipant = user && event && event.participants.some(p => p._id === user.id);
    const hasPendingRequest = user && event && event.pendingRequests.some(p => p._id === user.id);


    const renderActionButtons = () => {
        if (actionLoading) return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin w-8 h-8 text-red-500" />
            </div>
        );
        
        if (isHost) {
            return (
                <div className="space-y-4">
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-bold px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                    >
                        <Edit className="w-5 h-5" />
                        <span>Redigera event</span>
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-red-200 text-red-600 font-bold px-6 py-4 rounded-2xl hover:bg-red-50 transition-all"
                    >
                        <Trash2 className="w-5 h-5" />
                        <span>Avbryt event</span>
                    </motion.button>
                </div>
            )
        }
        if (isParticipant && user.id !== event.host._id) {
             return (
                <div className="space-y-4">
                    {event.chatId && (
                        <Link to={`/app/chat/${event.chatId}`}>
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                            >
                                <MessageSquare className="w-5 h-5" />
                                <span>Öppna gruppchatt</span>
                            </motion.button>
                        </Link>
                    )}
                    <motion.button 
                        onClick={handleCalendarExport}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                    >
                        <Download className="w-5 h-5" />
                        <span>Lägg till i kalender</span>
                    </motion.button>
                    <button 
                        onClick={handleLeaveEvent} 
                        disabled={actionLoading} 
                        className="w-full text-sm text-gray-500 hover:text-red-500 transition flex items-center justify-center gap-2 mt-4"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Lämna löppass</span>
                    </button>
                </div>
             )
        }
        if (hasPendingRequest) {
            return (
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="font-bold text-blue-900 text-lg">Förfrågan skickad!</p>
                    <p className="text-blue-700 mt-2">Väntar på värdens godkännande.</p>
                </div>
            )
        }
        if (event && event.status === 'open') {
            return (
                <motion.button 
                    onClick={handleJoinRequest}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                >
                    <UserPlus className="w-5 h-5" />
                    <span>Begär att få gå med</span>
                </motion.button>
            )
        }
        if (event && event.status === 'full') {
            return (
                <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-200">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-orange-600" />
                    </div>
                    <p className="font-bold text-orange-900 text-lg">Fullbokat!</p>
                    <p className="text-orange-700 mt-2">Detta löppass har inga lediga platser.</p>
                </div>
            )
        }
        return null;
    }

    if (isLoading) return <EventLoader />;
    
    if (error) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
            <div className="text-center p-8 bg-white rounded-3xl shadow-lg max-w-md">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-xl font-bold text-gray-900 mb-2">Något gick fel</p>
                <p className="text-gray-600">{error}</p>
                <button onClick={() => navigate(-1)} className="mt-6 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition">
                    Gå tillbaka
                </button>
            </div>
        </div>
    );
    
    if (!event) return null;

    // GeoJSON is [longitude, latitude], Leaflet is [latitude, longitude]
    const mapPosition = event.location.point?.coordinates ? [event.location.point.coordinates[1], event.location.point.coordinates[0]] : null;
    const spotsLeft = event.maxParticipants - event.participants.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {/* Back button - now floating over the page */}
            <div className="fixed top-6 left-6 z-50">
                <motion.button 
                    onClick={() => navigate(-1)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-900 font-bold px-4 py-2 rounded-xl shadow-lg hover:bg-white transition"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Tillbaka</span>
                </motion.button>
            </div>

            {/* Main content container */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="bg-white rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header section with map */}
                    <div className="relative p-8 pb-6">
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
                        
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="inline-flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50 px-4 py-2 rounded-full">
                                    <Activity className="w-4 h-4" />
                                    {event.distance} km löpning
                                </span>
                                {event.participants.length >= event.maxParticipants && (
                                    <span className="inline-flex items-center gap-2 text-sm font-bold text-orange-600 bg-orange-50 px-4 py-2 rounded-full">
                                        <Users className="w-4 h-4" />
                                        Fullbokat
                                    </span>
                                )}
                            </div>
                            
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                {event.title}
                            </h1>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <motion.div 
                                    whileHover={{ scale: 1.02 }}
                                    className="flex items-center gap-4 bg-blue-50 p-4 rounded-2xl"
                                >
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Datum & tid</p>
                                        <p className="font-bold text-gray-900">{formatDate(event.date)}</p>
                                    </div>
                                </motion.div>
                                
                                <motion.div 
                                    whileHover={{ scale: 1.02 }}
                                    className="flex items-center gap-4 bg-green-50 p-4 rounded-2xl"
                                >
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                        <Zap className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Tempo</p>
                                        <p className="font-bold text-gray-900">{formatPace(event.pace)}</p>
                                    </div>
                                </motion.div>
                                
                                <motion.div 
                                    whileHover={{ scale: 1.02 }}
                                    className="flex items-center gap-4 bg-purple-50 p-4 rounded-2xl"
                                >
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <MapPin className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Plats</p>
                                        <p className="font-bold text-gray-900">{event.location.name}</p>
                                    </div>
                                </motion.div>
                            </div>
                            
                            {/* Map section - now integrated within content */}
                            <motion.div 
                                whileHover={{ scale: 1.01 }}
                                className="w-full h-64 bg-gray-100 rounded-2xl overflow-hidden shadow-lg"
                            >
                                <EventMap position={mapPosition} locationName={event.location.name} />
                            </motion.div>
                        </div>
                    </div>
                    
                    {/* Description */}
                    <div className="px-8 py-6 border-t border-gray-100 content-above-map">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-yellow-500" />
                            Om löppasset
                        </h3>
                        <p className="text-gray-700 text-lg leading-relaxed">{event.description}</p>
                    </div>
                    
                    {/* Main content grid */}
                    <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 content-above-map">
                        {/* Left column - Participants */}
                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                            <Users className="w-5 h-5 text-white" />
                                        </div>
                                        Deltagare
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-3xl font-black text-gray-900">{event.participants.length}</span>
                                        <span className="text-lg text-gray-500">/ {event.maxParticipants}</span>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <AnimatePresence>
                                        {event.participants.map((p, index) => (
                                            <motion.div
                                                key={p._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <Link to={`/app/profile/${p._id}`}>
                                                    <motion.div 
                                                        whileHover={{ scale: 1.02 }}
                                                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all group"
                                                    >
                                                        <div className="relative">
                                                            <img 
                                                                src={p.profilePhoto || `https://ui-avatars.com/api/?name=${p.firstName}+${p.lastName}&background=random`} 
                                                                alt={`${p.firstName} ${p.lastName}`} 
                                                                className="w-14 h-14 rounded-xl object-cover shadow-md group-hover:shadow-lg transition-shadow"
                                                            />
                                                            {p._id === event.host._id && (
                                                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                                                    <Shield className="w-3 h-3 text-white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                                                                {p.firstName} {p.lastName}
                                                            </p>
                                                            {p._id === event.host._id && (
                                                                <span className="text-xs font-bold text-orange-600">Event värd</span>
                                                            )}
                                                        </div>
                                                        <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-red-500 rotate-180 transition-all" />
                                                    </motion.div>
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                                
                                {spotsLeft > 0 && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200"
                                    >
                                        <p className="text-green-800 font-semibold text-center">
                                            🎉 {spotsLeft} {spotsLeft === 1 ? 'plats' : 'platser'} kvar!
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                            
                            {/* Host section - Pending requests */}
                            {isHost && event.pendingRequests.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-3xl border border-yellow-200"
                                >
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <UserPlus className="w-5 h-5 text-orange-600" />
                                        Väntande förfrågningar ({event.pendingRequests.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {event.pendingRequests.map(applicant => (
                                            <motion.div 
                                                key={applicant._id} 
                                                whileHover={{ scale: 1.01 }}
                                                className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm"
                                            >
                                                <Link to={`/app/profile/${applicant._id}`} className="flex items-center gap-3 group">
                                                    <img 
                                                        src={applicant.profilePhoto || `https://ui-avatars.com/api/?name=${applicant.firstName}+${applicant.lastName}&background=random`} 
                                                        alt={`${applicant.firstName} ${applicant.lastName}`} 
                                                        className="w-12 h-12 rounded-xl object-cover"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-gray-800 group-hover:text-red-500 transition">
                                                            {applicant.firstName} {applicant.lastName}
                                                        </p>
                                                        <p className="text-sm text-gray-500">Vill gå med</p>
                                                    </div>
                                                </Link>
                                                <div className="flex gap-2">
                                                    <motion.button 
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleManageRequest(applicant._id, 'approve')} 
                                                        disabled={actionLoading === applicant._id} 
                                                        className="p-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors"
                                                    >
                                                        <Check className="w-5 h-5"/>
                                                    </motion.button>
                                                    <motion.button 
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleManageRequest(applicant._id, 'reject')} 
                                                        disabled={actionLoading === applicant._id} 
                                                        className="p-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                                                    >
                                                        <X className="w-5 h-5"/>
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                        
                        {/* Right column - Actions */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-6 space-y-6">
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-3xl border border-gray-200">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                                        {isHost ? 'Hantera event' : 'Delta i löppasset'}
                                    </h3>
                                    {renderActionButtons()}
                                </div>
                                
                                {/* Host info card */}
                                <motion.div 
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100"
                                >
                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Arrangör</h4>
                                    <Link to={`/app/profile/${event.host._id}`} className="flex items-center gap-4 group">
                                        <img 
                                            src={event.host.profilePhoto || `https://ui-avatars.com/api/?name=${event.host.firstName}+${event.host.lastName}&background=random`} 
                                            alt={event.host.firstName} 
                                            className="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:shadow-lg transition-shadow"
                                        />
                                        <div className="flex-1">
                                            <p className="font-bold text-lg text-gray-900 group-hover:text-red-600 transition-colors">
                                                {event.host.firstName} {event.host.lastName}
                                            </p>
                                            <p className="text-sm text-gray-500">Klicka för att visa profil</p>
                                        </div>
                                        <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-red-500 rotate-180 transition-all" />
                                    </Link>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default RunEventDetailPage; 