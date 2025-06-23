import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Search, 
  Plus,
  Check,
  CheckCheck
} from 'lucide-react';
import api from '../../services/api';
import ProfileAvatar from '../../components/common/ProfileAvatar';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const MessagesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await api.get('/chat');
      if (response.data.success) {
        setChats(response.data.chats);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Kunde inte ladda meddelanden');
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = (chat) => {
    return chat.participants.find(p => p._id !== user?._id);
  };

  const getLastMessage = (chat) => {
    if (chat.lastMessage) {
      return chat.lastMessage;
    }
    return null;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Igår';
    } else {
      return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
    }
  };

  const filteredChats = chats.filter(chat => {
    const otherUser = getOtherUser(chat);
    return otherUser?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           otherUser?.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const ChatItem = ({ chat }) => {
    const otherUser = getOtherUser(chat);
    const lastMessage = getLastMessage(chat);
    
    if (!otherUser) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100"
        onClick={() => navigate(`/app/messages/${chat._id}`)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ProfileAvatar user={otherUser} size="lg" />
            {/* Online indicator - could be dynamic */}
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {otherUser.firstName} {otherUser.lastName}
              </h3>
              {lastMessage && (
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {formatTime(lastMessage.timestamp)}
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {lastMessage ? (
                  <p className="text-sm text-gray-600 truncate">
                    {lastMessage.sender._id === user?._id && 'Du: '}
                    {lastMessage.content}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic">Ingen konversation än</p>
                )}
              </div>
              
              <div className="flex items-center gap-2 ml-2">
                {lastMessage?.sender._id === user?._id && (
                  <div className="text-gray-400">
                    {lastMessage.read ? (
                      <CheckCheck className="w-4 h-4" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </div>
                )}
                {chat.unreadCount > 0 && (
                  <div className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar meddelanden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Meddelanden</h1>
            <button className="p-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sök konversationer..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="bg-white">
        {filteredChats.length === 0 ? (
          <div className="text-center py-20">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {searchQuery ? 'Inga resultat' : 'Inga meddelanden än'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery 
                ? 'Prova att söka efter något annat' 
                : 'Börja chatta med andra löpare för att se dina konversationer här'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate('/app/discover')}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Upptäck löpare
              </button>
            )}
          </div>
        ) : (
          <div>
            {filteredChats.map((chat) => (
              <ChatItem key={chat._id} chat={chat} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage; 