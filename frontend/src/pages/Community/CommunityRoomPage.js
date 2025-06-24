import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Reply, 
  ChevronLeft, 
  Users, 
  MessageCircle, 
  MapPin, 
  MoreVertical,
  Edit,
  Trash,
  Settings,
  X,
  Smile,
  Paperclip,
  Camera,
  Star,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';
import ProfileAvatar from '../../components/common/ProfileAvatar';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import toast from 'react-hot-toast';

const CommunityRoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  // Emoji collections
  const quickEmojis = ['😊', '❤️', '👍', '🔥', '🎉', '😂', '🏃‍♂️', '💪'];
  const allEmojis = [
    '😀', '😊', '😂', '🤣', '😍', '🥰', '😘', '🤗', '🤩', '🥳',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💕', '💖',
    '👍', '👎', '👏', '🙌', '🤝', '💪', '🦾', '✨', '⭐', '🌟',
    '🏃‍♂️', '🏃‍♀️', '🚴‍♂️', '🚴‍♀️', '⛰️', '🏔️', '🌄', '🌅', '🏆', '🥇'
  ];

  // Load room data
  const fetchRoomData = useCallback(async () => {
    console.log('Fetching room data for roomId:', roomId);
    try {
      const [roomResponse, messagesResponse] = await Promise.all([
        api.get(`/community/rooms/${roomId}`),
        api.get(`/community/rooms/${roomId}/messages`)
      ]);
      
      console.log('Room response:', roomResponse.data);
      console.log('Messages response:', messagesResponse.data);
      
      setRoom(roomResponse.data);
      setMessages(messagesResponse.data || []);
    } catch (error) {
      console.error('Error fetching room data:', error);
      console.error('Error details:', error.response?.data);
      
      // Use mock data as fallback
      const mockRoom = generateMockRoom(roomId);
      const mockMessages = generateMockMessages();
      
      setRoom(mockRoom);
      setMessages(mockMessages);
      
      // Show different toasts based on error type
      if (error.response?.status === 404) {
        toast.error('Rummet hittades inte - visar demo-data');
      } else if (error.response?.status === 403) {
        toast.error('Du har inte tillgång till detta rum - visar demo-data');
      } else {
        toast.error('Kunde inte ladda rummet - visar demo-data');
      }
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  // Generate mock room data
  const generateMockRoom = (id) => {
    const mockUser = {
      _id: 'mock-user-1',
      firstName: 'Demo',
      lastName: 'Användare',
      profilePicture: null
    };

    const rooms = {
      '1': {
        _id: '1',
        title: 'Stockholms Morgonlöpare',
        description: 'Vi träffas varje tisdag och torsdag kl 06:00 vid Hötorget för gemensamma löppass. Alla nivåer välkomna!',
        category: 'location',
        location: { city: 'Stockholm' },
        creator: mockUser,
        members: [
          { user: mockUser, role: 'admin', joinedAt: new Date() },
          { user: { ...mockUser, _id: 'mock-user-2', firstName: 'Anna' }, role: 'member', joinedAt: new Date() },
          { user: { ...mockUser, _id: 'mock-user-3', firstName: 'Erik' }, role: 'member', joinedAt: new Date() }
        ],
        stats: { memberCount: 156, messageCount: 892, lastActivity: new Date() },
        tags: ['morgon', '5-10km', 'nybörjarvänlig'],
        verified: true,
        settings: { isPrivate: false }
      },
      '2': {
        _id: '2',
        title: 'Trail Running Göteborg',
        description: 'För dig som älskar att springa i naturen! Vi utforskar stigar runt Göteborg varje helg.',
        category: 'training',
        location: { city: 'Göteborg' },
        creator: mockUser,
        members: [
          { user: mockUser, role: 'admin', joinedAt: new Date() }
        ],
        stats: { memberCount: 89, messageCount: 456, lastActivity: new Date() },
        tags: ['trail', 'helger', 'natur'],
        settings: { isPrivate: false }
      }
    };

    return rooms[id] || {
      _id: id,
      title: 'Demo Community Rum',
      description: 'Detta är ett demo-rum som visas när den riktiga datan inte kan laddas.',
      category: 'general',
      location: { city: 'Demo Stad' },
      creator: mockUser,
      members: [{ user: mockUser, role: 'admin', joinedAt: new Date() }],
      stats: { memberCount: 1, messageCount: 0, lastActivity: new Date() },
      tags: ['demo'],
      settings: { isPrivate: false }
    };
  };

  // Generate mock messages
  const generateMockMessages = () => {
    return [
      {
        _id: 'mock-msg-1',
        content: 'Välkommen till community! Detta är demo-data som visas när servern inte är tillgänglig.',
        sender: {
          _id: 'mock-user-1',
          firstName: 'Demo',
          lastName: 'Bot'
        },
        createdAt: new Date(Date.now() - 3600000),
        reactions: []
      },
      {
        _id: 'mock-msg-2',
        content: 'Här kan du chatta med andra löpare och dela tips och erfarenheter! 🏃‍♂️',
        sender: {
          _id: 'mock-user-1',
          firstName: 'Demo',
          lastName: 'Bot'
        },
        createdAt: new Date(),
        reactions: []
      }
    ];
  };

  const handleNewMessage = useCallback((message) => {
    setMessages(prev => [...prev, message]);
    scrollToBottom();
  }, []);

  const handleUserTyping = useCallback(({ userId, userName }) => {
    if (userId !== user?._id) {
      setTypingUsers(prev => [...prev.filter(u => u.userId !== userId), { userId, userName }]);
    }
  }, [user?._id]);

  const handleUserStoppedTyping = useCallback(({ userId }) => {
    setTypingUsers(prev => prev.filter(u => u.userId !== userId));
  }, []);

  const handleMessageDeleted = useCallback((messageId) => {
    setMessages(prev => prev.filter(m => m._id !== messageId));
  }, []);

  const handleMessageEdited = useCallback(({ messageId, newContent }) => {
    setMessages(prev => prev.map(m => 
      m._id === messageId ? { ...m, content: newContent, edited: true } : m
    ));
  }, []);

  useEffect(() => {
    fetchRoomData();
    if (socket) {
      socket.emit('join_room', roomId);
      socket.on('new_message', handleNewMessage);
      socket.on('message_deleted', handleMessageDeleted);
      socket.on('message_edited', handleMessageEdited);
      socket.on('user_typing', handleUserTyping);
      socket.on('user_stopped_typing', handleUserStoppedTyping);
      
      return () => {
        socket.emit('leave_room', roomId);
        socket.off('new_message');
        socket.off('message_deleted');
        socket.off('message_edited');
        socket.off('user_typing');
        socket.off('user_stopped_typing');
      };
    }
  }, [roomId, socket, fetchRoomData, handleNewMessage, handleMessageDeleted, handleMessageEdited, handleUserTyping, handleUserStoppedTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Typing indicator
  useEffect(() => {
    let typingTimer;
    
    if (messageText && socket && !isTyping) {
      setIsTyping(true);
      socket.emit('typing', { roomId, userName: user?.firstName });
    }
    
    if (isTyping) {
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => {
        setIsTyping(false);
        socket.emit('stopped_typing', { roomId });
      }, 1000);
    }
    
    return () => clearTimeout(typingTimer);
  }, [messageText, socket, roomId, user, isTyping]);

  const sendMessage = async () => {
    if (!messageText.trim()) return;
    
    try {
      await api.post(`/community/rooms/${roomId}/messages`, {
        content: messageText.trim(),
        type: 'text',
        replyTo: replyingTo?._id
      });
      
      setMessageText('');
      setReplyingTo(null);
      messageInputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add message locally in demo mode
      const newMessage = {
        _id: `demo-msg-${Date.now()}`,
        content: messageText.trim(),
        sender: {
          _id: user?._id || 'demo-user',
          firstName: user?.firstName || 'Demo',
          lastName: user?.lastName || 'User'
        },
        createdAt: new Date(),
        reactions: []
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
      setReplyingTo(null);
      messageInputRef.current?.focus();
      
      toast.error('Demo-läge: Meddelandet sparas endast lokalt');
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await api.delete(`/community/rooms/${roomId}/messages/${messageId}`);
      toast.success('Meddelande raderat');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Kunde inte radera meddelande');
    }
  };

  const editMessage = async () => {
    if (!messageText.trim() || !editingMessage) return;
    
    try {
      await api.put(`/community/rooms/${roomId}/messages/${editingMessage._id}`, {
        content: messageText.trim()
      });
      
      setMessageText('');
      setEditingMessage(null);
      toast.success('Meddelande uppdaterat');
    } catch (error) {
      console.error('Error editing message:', error);
      toast.error('Kunde inte uppdatera meddelande');
    }
  };

  const handleReaction = async (messageId, reaction) => {
    try {
      await api.post(`/community/rooms/${roomId}/messages/${messageId}/react`, {
        reaction
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const joinRoom = async () => {
    try {
      await api.post(`/community/rooms/${roomId}/join`);
      await fetchRoomData();
      toast.success('Du har gått med i rummet!');
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error(error.response?.data?.error || 'Kunde inte gå med i rummet');
    }
  };

  const addEmoji = (emoji) => {
    setMessageText(prev => prev + emoji);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };

  const MessageComponent = ({ message, isLast }) => {
    const isOwn = message.sender._id === user?._id;
    const [showReactions, setShowReactions] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const reactions = ['❤️', '👍', '😂', '🔥', '💪', '🎉', '👏', '🙌'];
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        ref={isLast ? messagesEndRef : null}
        className={`group relative mb-6 ${isOwn ? 'text-right' : 'text-left'}`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className={`flex items-start gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <ProfileAvatar user={message.sender} size="md" />
          </motion.div>
          
          <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
            {/* Name and time */}
            <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <span className="text-sm font-semibold text-gray-700">
                {message.sender.firstName}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(message.createdAt).toLocaleTimeString('sv-SE', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
              {message.edited && (
                <span className="text-xs text-gray-400 italic">(redigerad)</span>
              )}
            </div>
            
            {/* Reply reference */}
            {message.replyTo && (
              <motion.div 
                initial={{ opacity: 0, x: isOwn ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-2 p-3 bg-gray-100/80 backdrop-blur-sm rounded-xl text-sm text-gray-600 border-l-4 border-gray-300"
              >
                <div className="flex items-center gap-1 mb-1">
                  <Reply className="w-3 h-3" />
                  <span className="font-semibold">{message.replyTo.sender.firstName}</span>
                </div>
                <p className="line-clamp-2">{message.replyTo.content}</p>
              </motion.div>
            )}
            
            {/* Message bubble */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
              className={`relative inline-block px-5 py-3 rounded-2xl shadow-sm ${
                isOwn 
                  ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white' 
                  : 'bg-white text-gray-900 border border-gray-100'
              }`}
            >
              <p className="break-words text-[15px] leading-relaxed">{message.content}</p>
              
              {/* Floating action button */}
              <AnimatePresence>
                {showActions && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setShowReactions(!showReactions)}
                    className={`absolute -bottom-2 ${isOwn ? '-left-10' : '-right-10'} 
                      bg-white shadow-lg rounded-full p-2 hover:shadow-xl transition-all`}
                  >
                    <Smile className="w-4 h-4 text-gray-600" />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
            
            {/* Reactions display */}
            {message.reactions && message.reactions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-1 mt-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                {Object.entries(
                  message.reactions.reduce((acc, r) => {
                    acc[r.reaction] = (acc[r.reaction] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([reaction, count]) => (
                  <motion.span
                    key={reaction}
                    whileHover={{ scale: 1.1 }}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    <span className="text-base">{reaction}</span>
                    {count > 1 && <span className="text-xs font-medium">{count}</span>}
                  </motion.span>
                ))}
              </motion.div>
            )}
            
            {/* Message actions */}
            <AnimatePresence>
              {showActions && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className={`flex items-center gap-1 mt-1 ${
                    isOwn ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <button
                    onClick={() => setReplyingTo(message)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                    title="Svara"
                  >
                    <Reply className="w-4 h-4" />
                  </button>
                  {isOwn && (
                    <>
                      <button
                        onClick={() => {
                          setEditingMessage(message);
                          setMessageText(message.content);
                          messageInputRef.current?.focus();
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                        title="Redigera"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMessage(message._id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Radera"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Reaction picker */}
        <AnimatePresence>
          {showReactions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className={`absolute bottom-full mb-2 ${isOwn ? 'right-0' : 'left-12'} 
                bg-white shadow-xl rounded-2xl px-4 py-3 flex items-center gap-2 z-10 border border-gray-100`}
            >
              {reactions.map(reaction => (
                <motion.button
                  key={reaction}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    handleReaction(message._id, reaction);
                    setShowReactions(false);
                  }}
                  className="text-xl hover:bg-gray-100 p-1 rounded-lg transition-all"
                >
                  {reaction}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Sparkles className="w-16 h-16 text-orange-500" />
          </motion.div>
          <p className="mt-4 text-gray-600 font-medium">Laddar community...</p>
        </motion.div>
      </div>
    );
  }

  if (!room || (room && Object.keys(room).length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {loading ? 'Laddar rum...' : 'Rummet hittades inte eller du har inte tillgång'}
          </h2>
          <p className="text-gray-600 mb-6">
            Kontrollera att du har rätt behörigheter eller att rummet fortfarande finns.
          </p>
          <button
            onClick={() => navigate('/app/community')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all"
          >
            Tillbaka till Community
          </button>
        </motion.div>
      </div>
    );
  }

  const isMember = room.members?.some(m => m.user?._id === user?._id) || false;
  const isCreator = room.creator?._id === user?._id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100"
      >
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/app/community')}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>
              
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  {room.title}
                  {room.verified && <Star className="w-5 h-5 text-yellow-500 fill-current" />}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    {room.location?.city || 'Sverige'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-500" />
                    {room.stats?.memberCount || 0} medlemmar
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    {room.stats?.messageCount || 0} meddelanden
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMembersModal(true)}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-all relative"
              >
                <Users className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {room.stats?.memberCount || 0}
                </span>
              </motion.button>
              {isMember && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/app/community/${roomId}/settings`)}
                  className="p-2.5 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <Settings className="w-5 h-5" />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6" style={{ height: 'calc(100vh - 200px)' }}>
        {messages.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-4">
              <MessageCircle className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Inga meddelanden än</h3>
            <p className="text-gray-500">Var den första att skriva något! 🎉</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {messages.map((message, index) => (
              <MessageComponent
                key={message._id}
                message={message}
                isLast={index === messages.length - 1}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
        
        {/* Typing indicator */}
        <AnimatePresence>
          {typingUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500"
            >
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>
                {typingUsers.map(u => u.userName).join(', ')} skriver...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input area */}
      {isMember ? (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t border-gray-200 px-4 py-4"
        >
          {/* Reply indicator */}
          <AnimatePresence>
            {replyingTo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-3 p-3 bg-blue-50 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Reply className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    Svarar till <strong>{replyingTo.sender.firstName}</strong>
                  </span>
                  <span className="text-sm text-blue-600 line-clamp-1 max-w-[200px]">
                    "{replyingTo.content}"
                  </span>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-blue-600" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Edit indicator */}
          <AnimatePresence>
            {editingMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-3 p-3 bg-orange-50 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Edit className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-700 font-medium">
                    Redigerar meddelande
                  </span>
                </div>
                <button
                  onClick={() => {
                    setEditingMessage(null);
                    setMessageText('');
                  }}
                  className="p-1 hover:bg-orange-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-orange-600" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Emoji picker */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full mb-2 left-4 right-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 max-h-64 overflow-y-auto"
              >
                <div className="grid grid-cols-8 gap-2">
                  {allEmojis.map(emoji => (
                    <motion.button
                      key={emoji}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => addEmoji(emoji)}
                      className="text-2xl p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-all text-gray-600"
              >
                <Paperclip className="w-5 h-5" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-all text-gray-600"
              >
                <Camera className="w-5 h-5" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-all text-gray-600"
              >
                <Smile className="w-5 h-5" />
              </motion.button>
            </div>
            
            <div className="flex-1 relative">
              <input
                ref={messageInputRef}
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    editingMessage ? editMessage() : sendMessage();
                  }
                }}
                placeholder="Skriv ett meddelande..."
                className="w-full pl-4 pr-12 py-3 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {quickEmojis.slice(0, 3).map(emoji => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => addEmoji(emoji)}
                    className="text-xl p-1 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={editingMessage ? editMessage : sendMessage}
              disabled={!messageText.trim()}
              className="p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t border-gray-200 px-4 py-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={joinRoom}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:shadow-lg transition-all font-semibold text-lg flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            Gå med i rummet för att chatta
          </motion.button>
        </motion.div>
      )}

      {/* Members Modal */}
      <AnimatePresence>
        {showMembersModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowMembersModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-7 h-7 text-orange-500" />
                  Medlemmar ({room.stats?.memberCount || 0})
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMembersModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              
              <div className="space-y-2 overflow-y-auto max-h-[60vh] pr-2">
                {(room.members || []).map((member, index) => (
                  <motion.div 
                    key={member.user._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="relative"
                      >
                        <ProfileAvatar user={member.user} size="md" />
                        {member.role === 'admin' && (
                          <span className="absolute -bottom-1 -right-1 bg-yellow-500 text-white rounded-full p-1">
                            <Star className="w-3 h-3 fill-current" />
                          </span>
                        )}
                      </motion.div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {member.user.firstName} {member.user.lastName}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          {member.role === 'admin' ? (
                            <>
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              Administratör
                            </>
                          ) : (
                            <>
                              <Users className="w-3 h-3 text-gray-400" />
                              Medlem
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    {isCreator && member.user._id !== user._id && (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded-xl transition-all"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunityRoomPage; 