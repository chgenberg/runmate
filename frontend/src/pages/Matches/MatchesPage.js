import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, MessageSquare, ArrowLeft, Users, Search, MoreVertical, Phone, Video, Smile } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
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

    return (
        <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
           <div className="max-w-screen-2xl mx-auto h-full flex gap-0">
                <aside className={`w-full md:w-96 h-full bg-white flex flex-col transition-transform duration-300 ease-in-out ${selectedChat ? '-translate-x-full md:translate-x-0' : 'translate-x-0'} border-r border-gray-200`}>
                    <div className="p-6 bg-gradient-to-br from-white to-gray-50 border-b border-gray-100">
                        <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl">
                                <MessageSquare className="w-7 h-7 text-white" />
                            </div>
                            Meddelanden
                        </h1>
                        <p className="text-gray-600">Dina konversationer med löparvänner</p>
                        
                        {/* Search bar */}
                        <div className="relative mt-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Sök konversationer..."
                                className="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-red-200 transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-b from-gray-50 to-white">
                        {isLoading ? (
                            <ChatLoader />
                        ) : chats.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-12 px-6"
                            >
                                <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MessageSquare className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg mb-2">Inga chattar än</h3>
                                <p className="text-gray-600">Gå med i löpevent för att börja chatta med andra löpare!</p>
                            </motion.div>
                        ) : (
                            chats.map(chat => <ChatListItem key={chat._id} chat={chat} selectedChat={selectedChat} setSelectedChat={setSelectedChat} user={user} />)
                        )}
                    </div>
                </aside>

                <main className="flex-1 h-full overflow-hidden">
                    <ChatWindow 
                        selectedChat={selectedChat}
                        setSelectedChat={setSelectedChat}
                        messages={messages}
                        setMessages={setMessages}
                        user={user}
                        socket={socket}
                        totalChats={chats.length}
                    />
                </main>
            </div>
        </div>
    );
};

export default MatchesPage; 