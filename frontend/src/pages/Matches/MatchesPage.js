import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, MessageSquare, ArrowLeft, Users, Search, MoreVertical, Phone, Video, Smile, Heart, X, MapPin, Activity, Star, ChevronLeft, Loader } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import { ChatLoader } from '../../components/Layout/LoadingSpinner';

const ChatListItem = ({ chat, selectedChat, setSelectedChat, user }) => {
    const otherParticipant = chat.participants.find(p => p._id !== user.id);
    const chatName = chat.chatType === 'group' ? chat.name : `${otherParticipant?.firstName} ${otherParticipant?.lastName}`;
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(chatName)}&background=random&color=fff`;
    const chatAvatar = chat.chatType === 'group' ? defaultAvatar : otherParticipant?.profilePhoto || defaultAvatar;
    
    // Generate last active time
    const lastActive = chat.lastMessage ? new Date(chat.lastMessage.timestamp) : new Date();
    const now = new Date();
    const diffMinutes = Math.floor((now - lastActive) / 60000);
    let timeAgo = 'Nu';
    if (diffMinutes > 60) timeAgo = `${Math.floor(diffMinutes / 60)}h`;
    else if (diffMinutes > 0) timeAgo = `${diffMinutes}m`;

    return (
        <motion.div
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedChat(chat)}
            className={`group relative flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                selectedChat?._id === chat._id 
                    ? 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200' 
                    : 'hover:bg-gray-50 border-2 border-transparent'
            }`}
        >
            <div className="relative">
                <motion.img 
                    whileHover={{ scale: 1.1 }}
                    src={chatAvatar} 
                    alt={chatName} 
                    className={`w-16 h-16 rounded-2xl object-cover shadow-lg ${
                        selectedChat?._id === chat._id ? 'ring-4 ring-red-300' : 'ring-2 ring-gray-100'
                    }`} 
                />
                {chat.chatType === 'group' && (
                    <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-3 border-white flex items-center justify-center shadow-md">
                        <Users className="w-4 h-4 text-white" />
                    </div>
                )}
                {!chat.chatType && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
            </div>
            <div className="flex-1 overflow-hidden ml-4">
                <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-bold truncate ${selectedChat?._id === chat._id ? 'text-red-700' : 'text-gray-900'}`}>
                        {chatName}
                    </h3>
                    <span className={`text-xs ${selectedChat?._id === chat._id ? 'text-red-600' : 'text-gray-400'}`}>
                        {timeAgo}
                    </span>
                </div>
                <p className={`text-sm truncate ${
                    selectedChat?._id === chat._id ? 'text-red-600' : 'text-gray-600'
                }`}>
                    {chat.lastMessage?.content || (
                        <span className="italic">Starta en konversation...</span>
                    )}
                </p>
            </div>
            {chat.unreadCount > 0 && (
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 min-w-[24px] h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5 shadow-lg"
                >
                    {chat.unreadCount}
                </motion.div>
            )}
        </motion.div>
    );
};

const ChatWindow = ({ selectedChat, setSelectedChat, messages, setMessages, user, socket, totalChats = 0 }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, selectedChat, scrollToBottom]);
    
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !selectedChat || !socket) return;

        const messageData = { chatId: selectedChat._id, content: newMessage };
        
        const tempId = Date.now().toString();
        const optimisticMessage = {
            _id: tempId,
            sender: { ...user, _id: user.id },
            content: newMessage.trim(),
            createdAt: new Date().toISOString(),
        };

        setMessages(prev => ({
            ...prev,
            [selectedChat._id]: [...(prev[selectedChat._id] || []), optimisticMessage],
        }));
        setNewMessage('');
        
        socket.emit('sendMessage', messageData, (ack) => {
            if (ack.success) {
                 setMessages(prev => ({
                    ...prev,
                    [selectedChat._id]: prev[selectedChat._id].map(m => m._id === tempId ? ack.message : m),
                }));
            } else {
                toast.error("Meddelandet kunde inte skickas.");
                setMessages(prev => ({
                    ...prev,
                    [selectedChat._id]: prev[selectedChat._id].filter(m => m._id !== tempId),
                }));
            }
        });
    };
    
    if (!selectedChat) {
        return (
            <div className="hidden md:flex flex-col items-center justify-center h-full text-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
                <div className="max-w-md mx-auto px-8">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-pink-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                        <div className="relative bg-white p-8 rounded-3xl shadow-2xl">
                            <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MessageSquare className="w-16 h-16 text-red-500" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-3">Välj en konversation</h2>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                Välj en chatt från listan för att börja prata med dina löparvänner
                            </p>
                            <div className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-500">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span>{totalChats} aktiva konversationer</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }
    
    const chatMessages = messages[selectedChat._id] || [];
    const otherParticipant = selectedChat.participants.find(p => p._id !== user.id);
    const chatName = selectedChat.chatType === 'group' ? selectedChat.name : `${otherParticipant?.firstName} ${otherParticipant?.lastName}`;

    return (
        <motion.div 
            key={selectedChat._id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-white rounded-3xl overflow-hidden shadow-2xl"
        >
            <header className="relative bg-white border-b border-gray-100 p-6">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5"></div>
                <div className="relative flex items-center">
                    <button onClick={() => setSelectedChat(null)} className="md:hidden mr-4 p-2 rounded-xl hover:bg-gray-100 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    
                    <img 
                        src={selectedChat.chatType === 'group' 
                            ? `https://ui-avatars.com/api/?name=${encodeURIComponent(chatName)}&background=random`
                            : otherParticipant?.profilePhoto || `https://ui-avatars.com/api/?name=${otherParticipant?.firstName}+${otherParticipant?.lastName}`
                        }
                        alt={chatName}
                        className="w-12 h-12 rounded-xl object-cover shadow-md mr-4"
                    />
                    
                    <div className="flex-1">
                        <h2 className="font-black text-xl text-gray-900">{chatName}</h2>
                        <div className="flex items-center gap-4 text-sm">
                            {selectedChat.chatType === 'group' ? (
                                <span className="text-gray-600 flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {selectedChat.participants.length} deltagare
                                </span>
                            ) : (
                                <span className="text-green-600 flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    Online
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-3 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <Phone className="w-5 h-5 text-gray-600" />
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-3 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <Video className="w-5 h-5 text-gray-600" />
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-3 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <MoreVertical className="w-5 h-5 text-gray-600" />
                        </motion.button>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50/50 to-white/50">
                <AnimatePresence initial={false}>
                    {chatMessages.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center h-full text-center"
                        >
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare className="w-12 h-12 text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-lg">Inga meddelanden än</p>
                            <p className="text-gray-400 text-sm mt-2">Säg hej och starta konversationen! 👋</p>
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            {chatMessages.map((msg, index) => {
                                const showDate = index === 0 || 
                                    new Date(msg.createdAt).toDateString() !== new Date(chatMessages[index - 1].createdAt).toDateString();
                                
                                return (
                                    <React.Fragment key={msg._id}>
                                        {showDate && (
                                            <div className="flex items-center justify-center my-4">
                                                <div className="bg-gray-200 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
                                                    {new Date(msg.createdAt).toLocaleDateString('sv-SE', { 
                                                        weekday: 'long', 
                                                        day: 'numeric', 
                                                        month: 'long' 
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.2 }}
                                            className={`flex items-end gap-3 ${msg.sender._id === user.id ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {msg.sender._id !== user.id && (
                                                <motion.img 
                                                    whileHover={{ scale: 1.1 }}
                                                    src={msg.sender.profilePhoto || `https://ui-avatars.com/api/?name=${msg.sender.firstName}+${msg.sender.lastName}`} 
                                                    alt={msg.sender.firstName} 
                                                    className="w-10 h-10 rounded-xl object-cover shadow-md self-end mb-1"
                                                />
                                            )}
                                            <div className={`group relative max-w-[70%] ${msg.sender._id === user.id ? 'items-end' : 'items-start'}`}>
                                                <div className={`px-5 py-3 rounded-3xl ${
                                                    msg.sender._id === user.id 
                                                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-br-xl shadow-lg' 
                                                        : 'bg-white text-gray-800 rounded-bl-xl shadow-md border border-gray-100'
                                                }`}>
                                                    {selectedChat.chatType === 'group' && msg.sender._id !== user.id && (
                                                        <p className="text-xs font-bold mb-1 text-red-500">{msg.sender.firstName}</p>
                                                    )}
                                                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                                </div>
                                                <p className={`text-xs mt-1 px-2 ${
                                                    msg.sender._id === user.id 
                                                        ? 'text-right text-gray-500' 
                                                        : 'text-left text-gray-400'
                                                }`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </motion.div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            <div className="bg-white border-t border-gray-100 p-6">
                <form onSubmit={handleSendMessage} className="relative flex items-end gap-3">
                    <div className="flex gap-2 absolute left-3 bottom-3">
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <Smile className="w-5 h-5" />
                        </motion.button>
                    </div>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Skriv ett meddelande..."
                            className="w-full bg-gray-50 border-2 border-gray-200 rounded-3xl pl-12 pr-6 py-4 text-lg focus:outline-none focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50 transition-all"
                        />
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit" 
                        className={`p-4 rounded-2xl transition-all flex items-center justify-center ${
                            newMessage.trim() 
                                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg hover:shadow-xl' 
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!newMessage.trim()}
                    >
                        <Send className="w-6 h-6" />
                    </motion.button>
                </form>
            </div>
        </motion.div>
    );
};

const MatchesPage = () => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const { chatId } = useParams();
    const navigate = useNavigate();

    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [messages, setMessages] = useState({});
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

    const fetchChats = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const { data } = await api.get('/chat');
            const sortedChats = (data.chats || []).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
            setChats(sortedChats);
            
            if (chatId) {
                const chatFromUrl = sortedChats.find(c => c._id === chatId);
                if (chatFromUrl) {
                    setSelectedChat(chatFromUrl);
                } else {
                    toast.error("Kunde inte hitta den valda chatten.");
                    navigate('/app/matches');
                }
            }
        } catch (error) {
            toast.error('Kunde inte ladda dina chattar.');
        } finally {
            setIsLoading(false);
        }
    }, [user, chatId, navigate]);

    useEffect(() => {
        fetchChats();
    }, [fetchChats]);

    useEffect(() => {
        if (selectedChat && !messages[selectedChat._id]) {
            const fetchMessages = async () => {
                try {
                    const { data } = await api.get(`/chat/${selectedChat._id}/messages`);
                    setMessages(prev => ({
                        ...prev,
                        [selectedChat._id]: data.messages
                    }));
                } catch (error) {
                    toast.error(`Kunde inte ladda meddelanden för ${selectedChat.name}.`);
                }
            };
            fetchMessages();
        }
    }, [selectedChat, messages]);

    useEffect(() => {
        if (socket) {
            const handleNewMessage = (message) => {
                 setMessages(prev => {
                    const chatMessages = prev[message.chatId] || [];
                    if (chatMessages.some(m => m._id === message._id)) return prev;
                    return { ...prev, [message.chatId]: [...chatMessages, message] };
                });
                setChats(prevChats => prevChats.map(chat =>
                    chat._id === message.chatId
                        ? { ...chat, lastMessage: { content: message.content, timestamp: message.createdAt }, lastActivity: message.createdAt }
                        : chat
                ).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity)));
            };

            socket.on('newMessage', handleNewMessage);
            return () => socket.off('newMessage', handleNewMessage);
        }
    }, [socket]);

    useEffect(() => {
        fetchUsers();
    }, [filter]);

    useEffect(() => {
        if (page > 1) {
            fetchMoreUsers();
        }
    }, [page]);

    const fetchUsers = async () => {
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
    };

    const fetchMoreUsers = async () => {
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
    };

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