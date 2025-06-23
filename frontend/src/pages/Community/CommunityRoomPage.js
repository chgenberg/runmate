import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Image, 
  Heart, 
  Reply, 
  ChevronLeft, 
  Users, 
  MessageCircle, 
  MapPin, 
  MoreVertical,
  Edit,
  Trash,
  Settings,
  Zap,
  X
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
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load room data
  const fetchRoomData = useCallback(async () => {
    try {
      const [roomResponse, messagesResponse] = await Promise.all([
        api.get(`/community/rooms/${roomId}`),
        api.get(`/community/rooms/${roomId}/messages`)
      ]);
      
      setRoom(roomResponse.data);
      setMessages(messagesResponse.data);
    } catch (error) {
      console.error('Error fetching room data:', error);
      toast.error('Kunde inte ladda rummet');
      navigate('/app/community');
    } finally {
      setLoading(false);
    }
  }, [roomId, navigate]);

  const handleNewMessage = useCallback((message) => {
    setMessages(prev => [...prev, message]);
    scrollToBottom();
  }, []);

  useEffect(() => {
    fetchRoomData();
    if (socket) {
      socket.emit('join_room', roomId);
      socket.on('new_message', handleNewMessage);
      socket.on('message_deleted', handleMessageDeleted);
      socket.on('message_edited', handleMessageEdited);
      
      return () => {
        socket.emit('leave_room', roomId);
        socket.off('new_message');
        socket.off('message_deleted');
        socket.off('message_edited');
      };
    }
  }, [roomId, socket, fetchRoomData, handleNewMessage]);

  const handleMessageDeleted = (messageId) => {
    setMessages(prev => prev.filter(m => m._id !== messageId));
  };

  const handleMessageEdited = ({ messageId, newContent }) => {
    setMessages(prev => prev.map(m => 
      m._id === messageId ? { ...m, content: newContent, edited: true } : m
    ));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      toast.error('Kunde inte skicka meddelande');
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

  // const leaveRoom = async () => {
  //   try {
  //     await api.post(`/community/rooms/${roomId}/leave`);
  //     navigate('/app/community');
  //     toast.success('Du har lämnat rummet');
  //   } catch (error) {
  //     console.error('Error leaving room:', error);
  //     toast.error('Kunde inte lämna rummet');
  //   }
  // };

  const MessageComponent = ({ message, isLast }) => {
    const isOwn = message.sender._id === user?._id;
    const [showReactions, setShowReactions] = useState(false);
    const reactions = ['❤️', '👍', '😂', '🔥', '💪'];
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        ref={isLast ? messagesEndRef : null}
        className={`group relative mb-4 ${isOwn ? 'text-right' : 'text-left'}`}
      >
        <div className={`flex items-start gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <ProfileAvatar user={message.sender} size="sm" />
          
          <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
            {/* Name and time */}
            <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <span className="text-sm font-medium text-gray-700">
                {message.sender.firstName}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(message.createdAt).toLocaleTimeString('sv-SE', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
              {message.edited && (
                <span className="text-xs text-gray-400">(redigerad)</span>
              )}
            </div>
            
            {/* Reply reference */}
            {message.replyTo && (
              <div className="mb-2 p-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                <span className="font-medium">{message.replyTo.sender.firstName}:</span> {message.replyTo.content}
              </div>
            )}
            
            {/* Message bubble */}
            <div className={`relative inline-block px-4 py-2 rounded-2xl ${
              isOwn 
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                : 'bg-gray-100 text-gray-900'
            }`}>
              <p className="break-words">{message.content}</p>
              
              {/* Quick reactions button */}
              <button
                onClick={() => setShowReactions(!showReactions)}
                className={`absolute -bottom-2 ${isOwn ? '-left-8' : '-right-8'} opacity-0 group-hover:opacity-100 transition-opacity`}
              >
                <div className="w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  <Heart className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            </div>
            
            {/* Reactions display */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex items-center gap-1 mt-1">
                {Object.entries(
                  message.reactions.reduce((acc, r) => {
                    acc[r.reaction] = (acc[r.reaction] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([reaction, count]) => (
                  <span
                    key={reaction}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {reaction} {count > 1 && count}
                  </span>
                ))}
              </div>
            )}
            
            {/* Message actions */}
            <div className={`flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
              isOwn ? 'justify-end' : 'justify-start'
            }`}>
              <button
                onClick={() => setReplyingTo(message)}
                className="text-xs text-gray-500 hover:text-gray-700"
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
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMessage(message._id)}
                    className="text-xs text-gray-500 hover:text-red-600"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Reaction picker */}
        <AnimatePresence>
          {showReactions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`absolute bottom-full mb-2 ${isOwn ? 'right-0' : 'left-12'} 
                bg-white shadow-lg rounded-full px-3 py-2 flex items-center gap-2 z-10`}
            >
              {reactions.map(reaction => (
                <button
                  key={reaction}
                  onClick={() => {
                    handleReaction(message._id, reaction);
                    setShowReactions(false);
                  }}
                  className="hover:scale-125 transition-transform"
                >
                  {reaction}
                </button>
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
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Zap className="w-12 h-12 text-orange-500" />
        </motion.div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Rummet hittades inte</h2>
          <button
            onClick={() => navigate('/app/community')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all"
          >
            Tillbaka till Community
          </button>
        </div>
      </div>
    );
  }

  const isMember = room.members.some(m => m.user._id === user?._id);
  const isCreator = room.creator._id === user?._id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/app/community')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div>
                <h1 className="text-xl font-bold text-gray-900">{room.title}</h1>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {room.location?.city || 'Sverige'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {room.stats.memberCount} medlemmar
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {room.stats.messageCount} meddelanden
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMembersModal(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Users className="w-5 h-5" />
              </button>
              {isMember && (
                <button
                  onClick={() => navigate(`/app/community/${roomId}/settings`)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6" style={{ height: 'calc(100vh - 200px)' }}>
        {messages.length === 0 ? (
          <div className="text-center py-20">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Inga meddelanden än</h3>
            <p className="text-gray-500">Var den första att skriva något!</p>
          </div>
        ) : (
          <div className="space-y-4">
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
      </div>

      {/* Input area */}
      {isMember ? (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4">
          {/* Reply indicator */}
          {replyingTo && (
            <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Reply className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Svarar till <strong>{replyingTo.sender.firstName}</strong>: {replyingTo.content}
                </span>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* Edit indicator */}
          {editingMessage && (
            <div className="mb-2 p-2 bg-orange-100 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-700">Redigerar meddelande</span>
              </div>
              <button
                onClick={() => {
                  setEditingMessage(null);
                  setMessageText('');
                }}
                className="p-1 hover:bg-orange-200 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Image className="w-5 h-5 text-gray-600" />
            </button>
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
              className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={editingMessage ? editMessage : sendMessage}
              disabled={!messageText.trim()}
              className="p-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4">
          <button
            onClick={joinRoom}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
          >
            Gå med i rummet för att chatta
          </button>
        </div>
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
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Medlemmar ({room.stats.memberCount})</h2>
                <button
                  onClick={() => setShowMembersModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                {room.members.map(member => (
                  <div key={member.user._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <ProfileAvatar user={member.user} size="md" />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {member.user.firstName} {member.user.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {member.role === 'admin' ? 'Administratör' : 'Medlem'}
                        </p>
                      </div>
                    </div>
                    {isCreator && member.user._id !== user._id && (
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    )}
                  </div>
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