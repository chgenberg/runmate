import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  ArrowLeft, 
  MoreVertical, 
  Phone, 
  Video, 
  Check,
  CheckCheck,
  MapPin,
  MessageCircle
} from 'lucide-react';
import api from '../../services/api';
import ProfileAvatar from '../../components/common/ProfileAvatar';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import toast from 'react-hot-toast';

const ChatPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatData = useCallback(async () => {
    try {
      const response = await api.get(`/chat/${chatId}/messages`);
      if (response.data.success) {
        setMessages(response.data.messages);
        // Extract the other user from participants
        const currentUserId = user._id || user.id;
        const other = response.data.chat.participants.find(p => p._id !== currentUserId);
        setOtherUser(other);
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
      toast.error('Kunde inte ladda meddelanden', {
        id: 'chat-load-error'
      });
    } finally {
      setLoading(false);
    }
  }, [chatId, user]);

  useEffect(() => {
    fetchChatData();
  }, [fetchChatData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewMessage = useCallback((data) => {
    if (data.chatId === chatId) {
      setMessages(prev => [...prev, data.message]);
      scrollToBottom();
    }
  }, [chatId]);

  const handleUserTyping = useCallback(({ userId, userName, chatId: typingChatId }) => {
    if (typingChatId === chatId && userId !== user?._id) {
      setTypingUsers(prev => [...prev.filter(u => u !== userName), userName]);
    }
  }, [chatId, user?._id]);

  const handleUserStoppedTyping = useCallback(({ userId, userName, chatId: typingChatId }) => {
    if (typingChatId === chatId && userId !== user?._id) {
      setTypingUsers(prev => prev.filter(u => u !== userName));
    }
  }, [chatId, user?._id]);

  useEffect(() => {
    if (socket) {
      socket.emit('join_chat', chatId);
      socket.on('new_message', handleNewMessage);
      socket.on('user_typing', handleUserTyping);
      socket.on('user_stopped_typing', handleUserStoppedTyping);

      return () => {
        socket.emit('leave_chat', chatId);
        socket.off('new_message', handleNewMessage);
        socket.off('user_typing', handleUserTyping);
        socket.off('user_stopped_typing', handleUserStoppedTyping);
      };
    }
  }, [socket, chatId, handleNewMessage, handleUserTyping, handleUserStoppedTyping]);

  const handleTyping = () => {
    if (socket) {
      socket.emit('typing', { chatId, userId: user._id || user.id, userName: user.firstName });
      
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stopped_typing', { chatId, userId: user._id || user.id, userName: user.firstName });
      }, 1000);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await api.post(`/chat/${chatId}/messages`, {
        content: newMessage.trim()
      });

      if (response.data.success) {
        setNewMessage('');
        inputRef.current?.focus();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Kunde inte skicka meddelande');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 flex items-center justify-between shadow-sm"
      >
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/app/messages')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          
          {otherUser && (
            <>
              <ProfileAvatar 
                user={otherUser} 
                size="md"
                showOnlineStatus={true}
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {otherUser.firstName} {otherUser.lastName}
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <MapPin className="h-3 w-3" />
                  <span>{otherUser.location?.city || 'Okänd plats'}</span>
                  {otherUser.isOnline && (
                    <>
                      <span>•</span>
                      <span className="text-green-500">Aktiv nu</span>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Phone className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Video className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesEndRef}>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center p-8"
          >
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full p-6 mb-4">
              <MessageCircle className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Starta konversationen!
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm">
              Säg hej till {otherUser?.firstName} och börja chatta om era löprundor!
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['👋 Hej!', '🏃‍♂️ Vill du springa?', '📍 Var brukar du springa?'].map((suggestion, index) => (
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
              const isOwnMessage = message.sender._id === (user._id || user.id);
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
                    {showAvatar && !isOwnMessage && (
                      <div className="text-xs text-gray-500 mb-1 ml-1">
                        {message.sender.firstName}
                      </div>
                    )}
                    
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-md'
                          : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      
                      <div className={`flex items-center justify-between mt-1 text-xs ${
                        isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        <span>
                          {new Date(message.createdAt).toLocaleTimeString('sv-SE', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        
                        {isOwnMessage && (
                          <div className="flex items-center space-x-1">
                            {message.readBy?.includes(otherUser?._id) ? (
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
      </div>

      {/* Input */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4"
      >
        <div className="flex items-end space-x-3">
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
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm max-h-32"
              rows={1}
              style={{ minHeight: '44px' }}
            />
            
            {/* Quick emoji buttons */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
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
            className={`p-3 rounded-full transition-all duration-200 ${
              newMessage.trim() && !sending
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
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

export default ChatPage; 