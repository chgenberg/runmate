import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Heart, X, MapPin, Activity, Star, ChevronLeft, Loader } from 'lucide-react';
import api from '../../services/api';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';

const MatchesPage = () => {
    const navigate = useNavigate();
    

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'matches', 'unmatched'
    
    const observer = useRef();
    const lastUserRef = useCallback(node => {
        if (loadingMore) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        
        if (node) observer.current.observe(node);
    }, [loadingMore, hasMore]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const endpoint = filter === 'matches' 
                ? '/users/matches' 
                : filter === 'unmatched'
                ? '/users/discover'
                : '/users/all-potential-matches';
            
            const response = await api.get(`${endpoint}?page=1&limit=20`);
            setUsers(response.data.users || []);
            setHasMore(response.data.hasMore);
            setPage(1);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    const fetchMoreUsers = useCallback(async () => {
        setLoadingMore(true);
        try {
            const endpoint = filter === 'matches' 
                ? '/users/matches' 
                : filter === 'unmatched'
                ? '/users/discover'
                : '/users/all-potential-matches';
            
            const response = await api.get(`${endpoint}?page=${page}&limit=20`);
            setUsers(prev => [...prev, ...(response.data.users || [])]);
            setHasMore(response.data.hasMore);
        } catch (error) {
            console.error('Error fetching more users:', error);
        } finally {
            setLoadingMore(false);
        }
    }, [filter, page]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        if (page > 1) {
            fetchMoreUsers();
        }
    }, [fetchMoreUsers, page]);

    const handleSwipe = async (userId, action) => {
        try {
            if (action === 'like') {
                await api.post(`/users/swipe/${userId}`, { action: 'like' });
                setShowMessageModal(true);
                setSelectedUser(users.find(u => u._id === userId));
            } else {
                await api.post(`/users/swipe/${userId}`, { action: 'pass' });
            }
            
            // Remove user from list with animation
            setUsers(prev => prev.filter(u => u._id !== userId));
        } catch (error) {
            console.error('Error swiping:', error);
        }
    };

    const sendMessage = async () => {
        if (!message.trim() || !selectedUser) return;
        
        try {
            await api.post('/chat/message', {
                recipientId: selectedUser._id,
                message: message.trim()
            });
            
            setShowMessageModal(false);
            setMessage('');
            setSelectedUser(null);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const UserCard = ({ user, isLast }) => {
        const controls = useAnimation();
        const [startX, setStartX] = useState(0);
        const [isDragging, setIsDragging] = useState(false);

        const handleDragStart = (e) => {
            setStartX(e.clientX || e.touches[0].clientX);
            setIsDragging(true);
        };

        const handleDragEnd = async (e) => {
            if (!isDragging) return;
            
            const endX = e.clientX || e.changedTouches[0].clientX;
            const diffX = endX - startX;
            
            if (Math.abs(diffX) > 100) {
                // Swipe threshold reached
                if (diffX > 0) {
                    // Swipe right - Like
                    await controls.start({ x: 300, opacity: 0, rotate: 20 });
                    handleSwipe(user._id, 'like');
                } else {
                    // Swipe left - Pass
                    await controls.start({ x: -300, opacity: 0, rotate: -20 });
                    handleSwipe(user._id, 'pass');
                }
            } else {
                // Return to center
                controls.start({ x: 0, rotate: 0 });
            }
            
            setIsDragging(false);
        };

        return (
            <motion.div
                ref={isLast ? lastUserRef : null}
                animate={controls}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                whileDrag={{ scale: 1.02 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden mb-4"
            >
                <div className="relative">
                    <img 
                        src={user.profilePicture || '/default-avatar.png'} 
                        alt={user.name}
                        className="w-full h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h2 className="text-2xl font-bold mb-1">{user.firstName} {user.lastName?.charAt(0)}.</h2>
                        <p className="text-lg opacity-90">{user.age} år</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                            <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {user.location || 'Stockholm'}
                            </span>
                            <span className="flex items-center">
                                <Activity className="w-4 h-4 mr-1" />
                                {user.pace || '5:30'} min/km
                            </span>
                        </div>
                    </div>
                    
                    {/* Match percentage badge */}
                    {user.matchPercentage && (
                        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            {user.matchPercentage}% match
                        </div>
                    )}
                </div>
                
                <div className="p-6">
                    <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Om mig</h3>
                        <p className="text-gray-600">{user.bio || 'Älskar att springa och träffa nya löparkompisar!'}</p>
                    </div>
                    
                    <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Löpstil</h3>
                        <div className="flex flex-wrap gap-2">
                            {(user.runningTypes || ['Långdistans', 'Trail', 'Intervaller']).map((type, idx) => (
                                <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm">
                                    {type}
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    {user.rating && (
                        <div className="flex items-center space-x-2">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        className={`w-4 h-4 ${i < Math.floor(user.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-gray-600">{user.rating.toFixed(1)}</span>
                        </div>
                    )}
                    
                    {/* Action buttons */}
                    <div className="flex space-x-3 mt-6">
                        <button
                            onClick={() => handleSwipe(user._id, 'pass')}
                            className="flex-1 flex items-center justify-center space-x-2 py-3 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all"
                        >
                            <X className="w-5 h-5" />
                            <span className="font-semibold">Hoppa över</span>
                        </button>
                        <button
                            onClick={() => handleSwipe(user._id, 'like')}
                            className="flex-1 flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:opacity-90 transition-all"
                        >
                            <Heart className="w-5 h-5" />
                            <span className="font-semibold">Gilla</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white shadow-sm">
                <div className="px-4 py-4 flex items-center">
                    <button onClick={() => navigate(-1)} className="mr-3">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold">Hitta löparkompisar</h1>
                </div>
                
                {/* Filter tabs */}
                <div className="flex border-t">
                    <button
                        onClick={() => setFilter('all')}
                        className={`flex-1 py-3 text-sm font-medium transition-all ${
                            filter === 'all' 
                                ? 'text-orange-600 border-b-2 border-orange-600' 
                                : 'text-gray-600'
                        }`}
                    >
                        Alla
                    </button>
                    <button
                        onClick={() => setFilter('matches')}
                        className={`flex-1 py-3 text-sm font-medium transition-all ${
                            filter === 'matches' 
                                ? 'text-orange-600 border-b-2 border-orange-600' 
                                : 'text-gray-600'
                        }`}
                    >
                        Matchningar
                    </button>
                    <button
                        onClick={() => setFilter('unmatched')}
                        className={`flex-1 py-3 text-sm font-medium transition-all ${
                            filter === 'unmatched' 
                                ? 'text-orange-600 border-b-2 border-orange-600' 
                                : 'text-gray-600'
                        }`}
                    >
                        Nya
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 pb-20">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader className="w-8 h-8 animate-spin text-orange-500" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Inga användare att visa</p>
                    </div>
                ) : (
                    <div>
                        {users.map((user, index) => (
                            <UserCard 
                                key={user._id} 
                                user={user} 
                                isLast={index === users.length - 1}
                            />
                        ))}
                        
                        {loadingMore && (
                            <div className="flex justify-center py-4">
                                <Loader className="w-6 h-6 animate-spin text-orange-500" />
                            </div>
                        )}
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
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowMessageModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center mb-4">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Heart className="w-10 h-10 text-green-600" />
                                </div>
                                <h3 className="font-bold text-xl">Det är en match! 🎉</h3>
                                <p className="text-gray-600 mt-1">Du och {selectedUser.firstName} gillar varandra</p>
                            </div>
                            
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Säg hej till din nya löparkompis..."
                                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                rows={4}
                                autoFocus
                            />
                            
                            <div className="flex space-x-3 mt-4">
                                <button
                                    onClick={() => setShowMessageModal(false)}
                                    className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Hoppa över
                                </button>
                                <button
                                    onClick={sendMessage}
                                    disabled={!message.trim()}
                                    className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                                >
                                    <MessageSquare className="w-4 h-4 inline mr-2" />
                                    Skicka
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MatchesPage; 