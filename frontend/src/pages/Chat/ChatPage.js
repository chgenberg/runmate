import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Send, 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical,
  Smile,
  Paperclip,
  Check,
  CheckCheck
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
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [otherUser, setOtherUser] = useState(null);

  // Load chat data
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const response = await api.get(`/chat/${chatId}/messages`);
        if (response.data.success) {
          setChat(response.data.chat);
          setMessages(response.data.messages);
          
          // Find the other user
          const other = response.data.chat.participants.find(p => p._id !== user?._id);
          setOtherUser(other);
        }
      } catch (error) {
        console.error('Error fetching chat:', error);
        toast.error('Kunde inte ladda chatten');
        navigate('/app/messages');
      } finally {
        setLoading(false);
      }
    };

    const handleNewMessage = (message) => {
      if (message.chatId === chatId) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    };

    fetchChatData();
    
    if (socket) {
      socket.on('new_message', handleNewMessage);
      
      return () => {
        socket.off('new_message');
      };
    }
  }, [chatId, socket, user, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!messageText.trim()) return;
    
    const tempMessage = {
      _id: Date.now().toString(),
      content: messageText.trim(),
      sender: user,
      timestamp: new Date(),
      status: 'sending'
    };
    
    setMessages(prev => [...prev, tempMessage]);
    const currentMessage = messageText.trim();
    setMessageText('');
    messageInputRef.current?.focus();
    
    try {
      await api.post(`/chat/${chatId}/messages`, {
        content: currentMessage
      });
      // Update the temp message status
      setMessages(prev => prev.map(m => 
        m._id === tempMessage._id ? { ...m, status: 'sent' } : m
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Kunde inte skicka meddelande');
      // Remove the temp message
      setMessages(prev => prev.filter(m => m._id !== tempMessage._id));
    }
  };

  const MessageComponent = ({ message, isLast }) => {
    const isOwn = message.sender._id === user?._id;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        ref={isLast ? messagesEndRef : null}
        className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}
      >
        <div className={`flex items-end gap-2 max-w-[80%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          {!isOwn && <ProfileAvatar user={message.sender} size="sm" />}
          
          <div className={`px-4 py-2 rounded-2xl ${
            isOwn 
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
              : 'bg-gray-100 text-gray-900'
          }`}>
            <p className="break-words">{message.content}</p>
            <div className={`flex items-center justify-end gap-1 mt-1 ${
              isOwn ? 'text-white/70' : 'text-gray-500'
            }`}>
              <span className="text-xs">
                {new Date(message.timestamp || message.createdAt).toLocaleTimeString('sv-SE', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
              {isOwn && (
                <div className="text-xs">
                  {message.status === 'sending' ? (
                    <div className="w-3 h-3 border border-white/50 border-t-white rounded-full animate-spin" />
                  ) : message.read ? (
                    <CheckCheck className="w-3 h-3" />
                  ) : (
                    <Check className="w-3 h-3" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!chat || !otherUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Chatten hittades inte</h2>
          <button
            onClick={() => navigate('/app/messages')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all"
          >
            Tillbaka till meddelanden
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/app/messages')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              
              <ProfileAvatar user={otherUser} size="md" />
              
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {otherUser.firstName} {otherUser.lastName}
                </h1>
                <p className="text-sm text-gray-500">Aktiv nyligen</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Phone className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Video className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="text-center py-20">
            <ProfileAvatar user={otherUser} size="xl" className="mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Säg hej till {otherUser.firstName}!
            </h3>
            <p className="text-gray-500">Detta är början på er konversation</p>
          </div>
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
      </div>

      {/* Input area */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex-1 relative">
            <input
              ref={messageInputRef}
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={`Skriv till ${otherUser.firstName}...`}
              className="w-full px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 pr-12"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-full transition-colors">
              <Smile className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <button
            onClick={sendMessage}
            disabled={!messageText.trim()}
            className="p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 