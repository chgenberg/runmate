import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X, MapPin, Activity, Star, Loader, Heart, Trophy, TrendingUp, Send, ChevronLeft } from 'lucide-react';
import api from '../../services/api';
import { AnimatePresence, motion } from 'framer-motion';
import ProfileAvatar from '../../components/common/ProfileAvatar';
import toast from 'react-hot-toast';

const MatchesPage = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');
    const [removingUsers, setRemovingUsers] = useState(new Set());
    
    const observer = useRef();
    const lastUserRef = useCallback(node => {
        if (loadingMore) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loading) {
                setPage(prevPage => prevPage + 1);
            }
        });
        
        if (node) observer.current.observe(node);
    }, [loadingMore, hasMore, loading]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/users/discover?page=1&limit=20`);
            setUsers(response.data.users || generateMockUsers());
            setHasMore(response.data.hasMore !== false);
            setPage(1);
        } catch (error) {
            console.error('Error fetching users:', error);
            // Use mock data on error
            setUsers(generateMockUsers());
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMoreUsers = useCallback(async () => {
        if (loadingMore) return;
        setLoadingMore(true);
        try {
            const response = await api.get(`/users/discover?page=${page}&limit=20`);
            const newUsers = response.data.users || generateMockUsers(page * 20);
            setUsers(prev => [...prev, ...newUsers]);
            setHasMore(response.data.hasMore !== false);
        } catch (error) {
            console.error('Error fetching more users:', error);
            // Add more mock users
            setUsers(prev => [...prev, ...generateMockUsers(page * 20)]);
        } finally {
            setLoadingMore(false);
        }
    }, [page, loadingMore]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        if (page > 1) {
            fetchMoreUsers();
        }
    }, [fetchMoreUsers, page]);

    const generateMockUsers = (offset = 0) => {
        const cities = ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Lund', 'Linköping'];
        const motivations = [
            'Älskar att springa i soluppgången',
            'Tränar för mitt första maraton',
            'Löpning är min meditation',
            'Jagar alltid nya PB',
            'Social löpare som gillar sällskap',
            'Naturälskare som föredrar trail'
        ];
        
        return Array.from({ length: 20 }, (_, i) => ({
            _id: `mock-${offset + i}`,
            firstName: ['Emma', 'Marcus', 'Sara', 'Johan', 'Anna', 'Erik'][i % 6],
            lastName: ['Andersson', 'Berg', 'Lindqvist', 'Nilsson', 'Svensson', 'Johansson'][i % 6],
            age: 25 + (i % 20),
            location: cities[i % cities.length],
            pace: `${4 + (i % 3)}:${30 + (i % 30)}`,
            bio: motivations[i % motivations.length],
            profilePicture: null,
            rating: 4 + (i % 10) / 10,
            matchPercentage: 70 + (i % 30),
            totalDistance: 100 + i * 50,
            totalRuns: 20 + i * 5,
            weeklyKm: 20 + (i % 40),
            personalBests: {
                '5k': `${18 + i % 10}:${10 + i % 50}`,
                '10k': `${38 + i % 20}:${10 + i % 50}`,
                'halfMarathon': i % 3 === 0 ? `1:${35 + i % 20}:${10 + i % 50}` : null
            },
            runningTypes: ['Långdistans', 'Trail', 'Intervaller', 'Tempo'].slice(0, 2 + (i % 3)),
            achievements: [
                { icon: '🏃', title: 'Första 10K', date: '2023-05-15' },
                { icon: '🏆', title: 'Halvmaraton', date: '2023-09-20' },
                { icon: '⭐', title: '100 träningspass', date: '2023-11-01' }
            ].slice(0, 1 + (i % 3))
        }));
    };

    const handleRemoveUser = async (userId) => {
        setRemovingUsers(prev => new Set(prev).add(userId));
        
        // Animate removal
        setTimeout(() => {
            setUsers(prev => prev.filter(u => u._id !== userId));
            setRemovingUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
            toast.success('Användare borttagen');
        }, 300);
        
        try {
            await api.post(`/users/swipe/${userId}`, { action: 'pass' });
        } catch (error) {
            console.error('Error removing user:', error);
        }
    };

    const handleMessageUser = (user) => {
        setSelectedUser(user);
        setShowMessageModal(true);
    };

    const handleViewProfile = (user) => {
        setSelectedUser(user);
        setShowProfileModal(true);
    };

    const sendMessage = async () => {
        if (!message.trim() || !selectedUser) return;
        
        try {
            await api.post('/chat/message', {
                recipientId: selectedUser._id,
                message: message.trim()
            });
            
            toast.success('Meddelande skickat!');
            setShowMessageModal(false);
            setMessage('');
            setSelectedUser(null);
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Kunde inte skicka meddelande');
        }
    };

    const UserCard = ({ user, isLast }) => {
        const isRemoving = removingUsers.has(user._id);
        
        return (
            <motion.div
                ref={isLast ? lastUserRef : null}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                    opacity: isRemoving ? 0 : 1, 
                    y: 0,
                    scale: isRemoving ? 0.9 : 1,
                    x: isRemoving ? -300 : 0
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                onClick={() => handleViewProfile(user)}
            >
                <div className="relative h-48 bg-gradient-to-br from-orange-400 to-red-500">
                    {/* Match percentage badge */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-sm font-bold text-gray-900">{user.matchPercentage}% match</span>
                    </div>
                    
                    {/* Profile image */}
                    <div className="absolute -bottom-12 left-6">
                        <ProfileAvatar 
                            user={user} 
                            size="xl"
                            className="ring-4 ring-white"
                        />
                    </div>
                </div>
                
                <div className="pt-16 px-6 pb-6">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900">
                                {user.firstName} {user.lastName?.charAt(0)}.
                            </h3>
                            <p className="text-gray-600">{user.age} år</p>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                <span className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {user.location}
                                </span>
                                <span className="flex items-center">
                                    <Activity className="w-4 h-4 mr-1" />
                                    {user.pace} min/km
                                </span>
                            </div>
                        </div>
                        
                        {/* Rating */}
                        {user.rating && (
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm font-semibold">{user.rating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Bio */}
                    <p className="text-gray-600 mb-4 line-clamp-2">{user.bio}</p>
                    
                    {/* Running types */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {user.runningTypes?.map((type, idx) => (
                            <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                {type}
                            </span>
                        ))}
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveUser(user._id);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all font-semibold"
                        >
                            <X className="w-5 h-5" />
                            Ta bort
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleMessageUser(user);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                        >
                            <MessageSquare className="w-5 h-5" />
                            Meddelande
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm">
                <div className="px-4 py-4 flex items-center">
                    <button onClick={() => navigate(-1)} className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">Hitta löparkompisar</h1>
                        <p className="text-sm text-gray-600">Swipa för att hitta din perfekta match</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 pb-20">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                            <Activity className="w-12 h-12 text-orange-500" />
                        </motion.div>
                        <p className="text-gray-600 mt-4">Laddar löpare...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Inga fler löpare just nu</h3>
                        <p className="text-gray-600">Kom tillbaka senare för att se nya medlemmar</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {users.map((user, index) => (
                                <UserCard 
                                    key={user._id} 
                                    user={user} 
                                    isLast={index === users.length - 1}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
                
                {loadingMore && (
                    <div className="flex justify-center py-8">
                        <Loader className="w-8 h-8 animate-spin text-orange-500" />
                    </div>
                )}
            </div>

            {/* Message Modal */}
            <AnimatePresence>
                {showMessageModal && selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowMessageModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <ProfileAvatar user={selectedUser} size="lg" />
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900">
                                        Skicka meddelande till {selectedUser.firstName}
                                    </h3>
                                    <p className="text-gray-600">{selectedUser.location}</p>
                                </div>
                            </div>
                            
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Hej! Jag såg din profil och skulle gärna vilja springa tillsammans..."
                                className="w-full p-4 border-2 border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                rows={4}
                                autoFocus
                            />
                            
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowMessageModal(false)}
                                    className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                                >
                                    Avbryt
                                </button>
                                <button
                                    onClick={sendMessage}
                                    disabled={!message.trim()}
                                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Send className="w-5 h-5" />
                                    Skicka
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Profile Modal */}
            <AnimatePresence>
                {showProfileModal && selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
                        onClick={() => setShowProfileModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl my-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header with gradient */}
                            <div className="relative h-48 bg-gradient-to-br from-orange-400 to-red-500 rounded-t-3xl">
                                <button
                                    onClick={() => setShowProfileModal(false)}
                                    className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                                
                                {/* Profile image */}
                                <div className="absolute -bottom-16 left-8">
                                    <ProfileAvatar 
                                        user={selectedUser} 
                                        size="2xl"
                                        className="ring-4 ring-white"
                                    />
                                </div>
                            </div>
                            
                            <div className="pt-20 px-8 pb-8">
                                {/* Name and basic info */}
                                <div className="mb-6">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                        {selectedUser.firstName} {selectedUser.lastName}
                                    </h2>
                                    <div className="flex items-center gap-4 text-gray-600">
                                        <span className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            {selectedUser.location}
                                        </span>
                                        <span>{selectedUser.age} år</span>
                                        <span className="flex items-center">
                                            <Activity className="w-4 h-4 mr-1" />
                                            {selectedUser.pace} min/km
                                        </span>
                                        {selectedUser.rating && (
                                            <span className="flex items-center">
                                                <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                                                {selectedUser.rating.toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Bio */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Om mig</h3>
                                    <p className="text-gray-600">{selectedUser.bio}</p>
                                </div>
                                
                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="bg-orange-50 rounded-2xl p-4 text-center">
                                        <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-gray-900">{selectedUser.totalDistance}km</p>
                                        <p className="text-sm text-gray-600">Total distans</p>
                                    </div>
                                    <div className="bg-blue-50 rounded-2xl p-4 text-center">
                                        <Activity className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-gray-900">{selectedUser.totalRuns}</p>
                                        <p className="text-sm text-gray-600">Träningspass</p>
                                    </div>
                                    <div className="bg-green-50 rounded-2xl p-4 text-center">
                                        <Trophy className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-gray-900">{selectedUser.weeklyKm}km</p>
                                        <p className="text-sm text-gray-600">Per vecka</p>
                                    </div>
                                </div>
                                
                                {/* Personal bests */}
                                {selectedUser.personalBests && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-3">Personliga rekord</h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            {selectedUser.personalBests['5k'] && (
                                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                                    <p className="text-xs text-gray-600">5K</p>
                                                    <p className="font-bold text-gray-900">{selectedUser.personalBests['5k']}</p>
                                                </div>
                                            )}
                                            {selectedUser.personalBests['10k'] && (
                                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                                    <p className="text-xs text-gray-600">10K</p>
                                                    <p className="font-bold text-gray-900">{selectedUser.personalBests['10k']}</p>
                                                </div>
                                            )}
                                            {selectedUser.personalBests.halfMarathon && (
                                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                                    <p className="text-xs text-gray-600">Halvmaraton</p>
                                                    <p className="font-bold text-gray-900">{selectedUser.personalBests.halfMarathon}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Running types */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">Löpstil</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedUser.runningTypes?.map((type, idx) => (
                                            <span key={idx} className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                                {type}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Achievements */}
                                {selectedUser.achievements && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-3">Prestationer</h3>
                                        <div className="space-y-2">
                                            {selectedUser.achievements.map((achievement, idx) => (
                                                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                    <span className="text-2xl">{achievement.icon}</span>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{achievement.title}</p>
                                                        <p className="text-xs text-gray-600">{achievement.date}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Action buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowProfileModal(false);
                                            handleRemoveUser(selectedUser._id);
                                        }}
                                        className="flex-1 py-3 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all font-semibold"
                                    >
                                        Ta bort
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowProfileModal(false);
                                            handleMessageUser(selectedUser);
                                        }}
                                        className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        Skicka meddelande
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MatchesPage; 