import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  Phone,
  Video,
  MoreVertical,
  MapPin,
  Check,
  CheckCheck,
  Trophy,
  Users,
  Paperclip
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import api from '../../services/api';
import ProfileAvatar from '../../components/common/ProfileAvatar';
import toast from 'react-hot-toast';

const ChatConversationPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatInfo, setChatInfo] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const loadChatInfo = useCallback(async () => {
    try {
      const response = await api.get(`/chat/conversations/${chatId}`);
      console.log('Chat info loaded:', response.data.conversation);
      console.log('Current user:', user);
      console.log('User ID:', user?._id || user?.id);
      console.log('Participants:', response.data.conversation.participants);
      response.data.conversation.participants.forEach((p, i) => {
        console.log(`Participant ${i}:`, p._id || p.id, p.firstName, p.lastName);
      });
      setChatInfo(response.data.conversation);
    } catch (error) {
      console.error('Error loading chat info:', error);
      // No demo data - show error and redirect back
      toast.error('Kunde inte ladda chattinformation');
      navigate('/app/chat');
    }
  }, [chatId, navigate]);

  const loadMessages = useCallback(async () => {
    try {
      const response = await api.get(`/chat/conversations/${chatId}/messages`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      // For all chats, start with empty message list - no dummy data
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleUserTyping = useCallback((data) => {
    if (data.userId !== user._id) {
      setTypingUsers(prev => [...prev.filter(id => id !== data.userId), data.userName]);
    }
  }, [user._id]);

  const handleUserStoppedTyping = (data) => {
    setTypingUsers(prev => prev.filter(name => name !== data.userName));
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      await api.post(`/chat/conversations/${chatId}/messages`, {
        content: messageContent
      });

      const newMsg = {
        _id: Date.now().toString(),
        content: messageContent,
        sender: { _id: user._id, firstName: user.firstName },
        createdAt: new Date(),
        readBy: []
      };

      setMessages(prev => [...prev, newMsg]);

      if (socket) {
        socket.emit('send-message', {
          chatId,
          message: newMsg
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Kunde inte skicka meddelandet');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (!isTyping && socket) {
      setIsTyping(true);
      socket.emit('typing', { chatId, userName: user.firstName });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (socket) {
        socket.emit('stop-typing', { chatId, userName: user.firstName });
      }
    }, 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadChatInfo();
    loadMessages();
    
    if (socket) {
      socket.emit('join-chat', chatId);
      
      socket.on('new-message', handleNewMessage);
      socket.on('user-typing', handleUserTyping);
      socket.on('user-stopped-typing', handleUserStoppedTyping);
      
      return () => {
        socket.emit('leave-chat', chatId);
        socket.off('new-message', handleNewMessage);
        socket.off('user-typing', handleUserTyping);
        socket.off('user-stopped-typing', handleUserStoppedTyping);
      };
    }
  }, [chatId, socket, handleUserTyping, loadChatInfo, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getChatTitle = () => {
    if (!chatInfo) return 'Chatt';
    
    if (chatInfo.type === 'challenge') {
      return chatInfo.name;
    } else {
      // More robust comparison - check all possible ID combinations
      const userId = user?._id || user?.id;
      const otherParticipant = chatInfo.participants.find(p => {
        const participantId = p._id || p.id;
        return participantId !== userId && participantId !== undefined;
      });
      
      if (!otherParticipant) {
        console.error('Could not find other participant. User:', user, 'Participants:', chatInfo.participants);
        return 'Okänd användare';
      }
      
      return `${otherParticipant?.firstName || ''} ${otherParticipant?.lastName || ''}`.trim() || 'Anonym';
    }
  };

  const getChatSubtitle = () => {
    if (!chatInfo) return '';
    
    if (chatInfo.type === 'challenge') {
      return `${chatInfo.participants.length} deltagare`;
    } else {
      // More robust comparison - check all possible ID combinations
      const userId = user?._id || user?.id;
      const otherParticipant = chatInfo.participants.find(p => {
        const participantId = p._id || p.id;
        return participantId !== userId && participantId !== undefined;
      });
      return otherParticipant?.isOnline ? 'Aktiv nu' : 'Senast aktiv för en stund sedan';
    }
  };

  const getChatAvatar = () => {
    if (!chatInfo) return null;
    
    if (chatInfo.type === 'challenge') {
      return (
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Trophy className="w-5 h-5 text-white" />
        </div>
      );
    } else {
      // More robust comparison - check all possible ID combinations
      const userId = user?._id || user?.id;
      const otherParticipant = chatInfo.participants.find(p => {
        const participantId = p._id || p.id;
        return participantId !== userId && participantId !== undefined;
      });
      return (
        <ProfileAvatar 
          user={otherParticipant} 
          size="md"
          showOnlineStatus={true}
        />
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 overflow-hidden">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/90 backdrop-blur-sm border-b border-gray-200 p-3 md:p-4 flex items-center justify-between shadow-sm flex-shrink-0"
      >
        <div className="flex items-center space-x-2 md:space-x-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/app/chat')}
            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </motion.button>
          
          {/* Clickable profile wrapper */}
          <div
            className="flex items-center space-x-2 md:space-x-3 cursor-pointer group"
            onClick={() => {
              const userId = user?._id || user?.id;
              const other = chatInfo?.participants?.find(p => {
                const participantId = p._id || p.id;
                return participantId !== userId && participantId !== undefined;
              });
              if (other?._id || other?.id) {
                navigate(`/profile/${other._id || other.id}`);
              }
            }}
          >
            <div className="relative">
              {getChatAvatar()}
              {chatInfo?.type === 'match' && (
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  chatInfo.participants.find(p => p._id !== user?._id)?.isOnline 
                    ? 'bg-green-500' 
                    : 'bg-gray-400'
                }`} />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-base md:text-lg font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                {getChatTitle()}
              </h1>
              <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-500">
                {chatInfo?.type === 'match' && <MapPin className="h-3 w-3" />}
                {chatInfo?.type === 'challenge' && <Users className="h-3 w-3" />}
                <span>{getChatSubtitle()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {chatInfo?.type === 'match' && (
            <>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Phone className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Video className="h-5 w-5 text-gray-600" />
              </button>
            </>
          )}
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 pb-4">
        {messages.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center p-8"
          >
            <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-full p-6 mb-4">
              {chatInfo?.type === 'challenge' ? (
                <Trophy className="h-12 w-12 text-orange-500" />
              ) : (
                <Users className="h-12 w-12 text-orange-500" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Starta konversationen!
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm">
              {chatInfo?.type === 'challenge' 
                ? 'Välkommen till gruppchatt! Diskutera träning och motivera varandra.'
                : `Säg hej till ${getChatTitle().split(' ')[0]} och börja chatta om era löprundor!`
              }
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {chatInfo?.type === 'challenge' ? [
                '👋 Hej alla!',
                '🏃‍♂️ Vem vill träna?',
                '📅 Träningsschema?'
              ] : [
                '👋 Hej!',
                '🏃‍♂️ Vill du springa?',
                '📍 Var brukar du springa?'
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setNewMessage(suggestion)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => {
              const userId = user?._id || user?.id;
              const senderId = message.sender._id || message.sender.id;
              const isOwnMessage = senderId === userId;
              const showAvatar = index === 0 || messages[index - 1].sender._id !== message.sender._id;
              
              return (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-4' : 'mt-1'}`}
                >
                  {!isOwnMessage && showAvatar && (
                    <ProfileAvatar 
                      user={message.sender} 
                      size="sm" 
                      className="mr-2 mt-auto"
                    />
                  )}
                  
                  <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-1' : 'order-2'}`}>
                    {showAvatar && !isOwnMessage && chatInfo?.type === 'challenge' && (
                      <div className="text-xs text-gray-500 mb-1 ml-1">
                        {message.sender.firstName}
                      </div>
                    )}
                    
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-br-md'
                          : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md shadow-sm'
                      }`}
                    >
                      <div 
                        className="text-sm whitespace-pre-wrap break-words"
                        dangerouslySetInnerHTML={{ __html: message.content }}
                      />
                      
                      <div className={`flex items-center justify-between mt-1 text-xs ${
                        isOwnMessage ? 'text-orange-100' : 'text-gray-500'
                      }`}>
                        <span>
                          {new Date(message.createdAt).toLocaleTimeString('sv-SE', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        
                        {isOwnMessage && (
                          <div className="flex items-center space-x-1">
                            {message.readBy?.length > 0 ? (
                              <CheckCheck className="h-3 w-3" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {isOwnMessage && showAvatar && (
                    <ProfileAvatar 
                      user={message.sender} 
                      size="sm" 
                      className="ml-2 mt-auto order-2"
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        
        {typingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2 text-sm text-gray-500"
          >
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>{typingUsers[0]} skriver...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/90 backdrop-blur-sm border-t border-gray-200 p-3 md:p-4 pb-safe flex-shrink-0"
      >
        <div className="flex items-end space-x-2 md:space-x-3">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden md:block">
            <Paperclip className="h-5 w-5 text-gray-600" />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Skriv ett meddelande..."
              className="w-full px-3 md:px-4 py-2 md:py-3 pr-20 md:pr-12 border border-gray-200 rounded-xl md:rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm max-h-32"
              rows={1}
              style={{ minHeight: '40px' }}
            />
            
            {/* Quick emoji buttons - Hidden on mobile */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 hidden md:flex items-center space-x-1">
              {['🏃‍♂️', '👍', '❤️', '😊'].map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => setNewMessage(prev => prev + emoji)}
                  className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors text-sm"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className={`p-2 md:p-3 rounded-full transition-all duration-200 ${
              newMessage.trim() && !sending
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatConversationPage; 