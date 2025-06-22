import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Temporarily hardcode the URL to fix the immediate issue
      const socketUrl = 'https://runmate-production.up.railway.app';
      const newSocket = io(socketUrl);
      
      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to socket server');
        
        // Join user's personal room
        newSocket.emit('join', user.id);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from socket server');
      });

      // Listen for match notifications
      newSocket.on('match_notification', (data) => {
        toast.success(`🔥 Det är en match! Du och ${data.user.firstName} gillade varandra!`, {
          duration: 6000,
        });
      });

      // Listen for new messages
      newSocket.on('new_message', (data) => {
        toast(`💬 Nytt meddelande från ${data.senderName}`, {
          duration: 4000,
        });
      });

      // Listen for kudos notifications
      newSocket.on('kudos_notification', (data) => {
        toast.success(`👏 ${data.fromUser.firstName} gav dig kudos!`, {
          duration: 3000,
        });
      });

      // Listen for challenge notifications
      newSocket.on('challenge_notification', (data) => {
        toast(`🏆 ${data.message}`, {
          duration: 4000,
        });
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  // Socket helper functions
  const emitMatch = (matchData) => {
    if (socket) {
      socket.emit('new_match', matchData);
    }
  };

  const emitMessage = (messageData) => {
    if (socket) {
      socket.emit('send_message', messageData);
    }
  };

  const emitKudos = (kudosData) => {
    if (socket) {
      socket.emit('give_kudos', kudosData);
    }
  };

  const emitTyping = (typingData) => {
    if (socket) {
      socket.emit('typing', typingData);
    }
  };

  const value = {
    socket,
    isConnected,
    emitMatch,
    emitMessage,
    emitKudos,
    emitTyping
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export default SocketContext; 