import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import api from '../services/api';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [loading, setLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Load user's chats
  const loadChats = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await api.get('/chat');
      if (response.data.success) {
        setChats(response.data.chats);
        
        // Initialize unread counts
        const counts = {};
        response.data.chats.forEach(chat => {
          counts[chat._id] = chat.unreadCount || 0;
        });
        setUnreadCounts(counts);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load messages for a specific chat
  const loadMessages = useCallback(async (chatId, page = 1) => {
    try {
      const response = await api.get(`/chat/${chatId}/messages?page=${page}`);
      if (response.data.success) {
        const { messages: newMessages, chat } = response.data;
        
        setMessages(prev => ({
          ...prev,
          [chatId]: page === 1 ? newMessages : [...(prev[chatId] || []), ...newMessages]
        }));
        
        // Update active chat info
        if (activeChat && activeChat._id === chatId) {
          setActiveChat(prev => ({ ...prev, ...chat }));
        }
        
        return response.data;
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      throw error;
    }
  }, [activeChat]);

  // Send a message
  const sendMessage = useCallback(async (chatId, content, messageType = 'text') => {
    try {
      const response = await api.post(`/chat/${chatId}/messages`, {
        content,
        messageType
      });
      
      if (response.data.success) {
        const { message, chat } = response.data;
        
        // Add message to local state
        setMessages(prev => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), message]
        }));
        
        // Update chat's last message
        setChats(prev => prev.map(c => 
          c._id === chatId 
            ? { ...c, lastMessage: chat.lastMessage, lastActivity: chat.lastActivity }
            : c
        ));
        
        return message;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, []);

  // Create or get direct chat with another user
  const createDirectChat = useCallback(async (otherUserId) => {
    try {
      const response = await api.post(`/chat/direct/${otherUserId}`);
      if (response.data.success) {
        const newChat = response.data.chat;
        
        // Add to chats list if not already there
        setChats(prev => {
          const exists = prev.find(c => c._id === newChat._id);
          return exists ? prev : [newChat, ...prev];
        });
        
        return newChat;
      }
    } catch (error) {
      console.error('Error creating direct chat:', error);
      throw error;
    }
  }, []);

  // Mark messages as read
  const markAsRead = useCallback(async (chatId, messageId = null) => {
    try {
      await api.put(`/chat/${chatId}/read`, { messageId });
      
      // Update local unread count
      setUnreadCounts(prev => ({
        ...prev,
        [chatId]: 0
      }));
      
      // Update messages as read
      if (messages[chatId]) {
        setMessages(prev => ({
          ...prev,
          [chatId]: prev[chatId].map(msg => ({
            ...msg,
            readBy: msg.readBy?.some(r => r.user === user._id) ? msg.readBy : [
              ...(msg.readBy || []),
              { user: user._id, readAt: new Date() }
            ]
          }))
        }));
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [messages, user]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((chatId, isTyping) => {
    if (socket) {
      socket.emit('typing', { chatId, isTyping });
    }
  }, [socket]);

  // Join chat room
  const joinChatRoom = useCallback((chatId) => {
    if (socket) {
      socket.emit('join_chat', chatId);
    }
  }, [socket]);

  // Leave chat room
  const leaveChatRoom = useCallback((chatId) => {
    if (socket) {
      socket.emit('leave_chat', chatId);
    }
  }, [socket]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !user) return;

    // Handle new messages
    const handleNewMessage = (data) => {
      const { chatId, message, chat } = data;
      
      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), message]
      }));
      
      // Update chat's last message and increment unread count
      setChats(prev => prev.map(c => 
        c._id === chatId 
          ? { ...c, lastMessage: chat.lastMessage, lastActivity: chat.lastActivity }
          : c
      ));
      
      // Increment unread count if not the active chat
      if (!activeChat || activeChat._id !== chatId) {
        setUnreadCounts(prev => ({
          ...prev,
          [chatId]: (prev[chatId] || 0) + 1
        }));
      }
    };

    // Handle typing indicators
    const handleUserTyping = (data) => {
      const { userId, isTyping } = data;
      if (activeChat) {
        setTypingUsers(prev => ({
          ...prev,
          [activeChat._id]: isTyping 
            ? [...(prev[activeChat._id] || []), userId].filter((id, index, arr) => arr.indexOf(id) === index)
            : (prev[activeChat._id] || []).filter(id => id !== userId)
        }));
      }
    };

    // Handle message read receipts
    const handleMessageRead = (data) => {
      const { chatId, userId, messageId } = data;
      
      if (messages[chatId]) {
        setMessages(prev => ({
          ...prev,
          [chatId]: prev[chatId].map(msg => {
            if (messageId === 'all' || msg._id === messageId) {
              return {
                ...msg,
                readBy: msg.readBy?.some(r => r.user === userId) ? msg.readBy : [
                  ...(msg.readBy || []),
                  { user: userId, readAt: new Date() }
                ]
              };
            }
            return msg;
          })
        }));
      }
    };

    // Handle user online status
    const handleUserStatusChange = (data) => {
      const { userId, isOnline } = data;
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (isOnline) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('message_read', handleMessageRead);
    socket.on('user_status_change', handleUserStatusChange);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('message_read', handleMessageRead);
      socket.off('user_status_change', handleUserStatusChange);
    };
  }, [socket, user, activeChat, messages]);

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Auto-mark messages as read when viewing a chat
  useEffect(() => {
    if (activeChat && unreadCounts[activeChat._id] > 0) {
      markAsRead(activeChat._id);
    }
  }, [activeChat, unreadCounts, markAsRead]);

  const value = {
    chats,
    activeChat,
    setActiveChat,
    messages,
    unreadCounts,
    typingUsers,
    onlineUsers,
    loading,
    loadChats,
    loadMessages,
    sendMessage,
    createDirectChat,
    markAsRead,
    sendTypingIndicator,
    joinChatRoom,
    leaveChatRoom
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}; 