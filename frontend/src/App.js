import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ChatProvider } from './contexts/ChatContext';

// Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { LoadingSpinnerFullScreen } from './components/Layout/LoadingSpinner';

// Auth Pages
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';

// Core App Pages (Simplified Navigation)
import DashboardPage from './pages/Dashboard/DashboardPage';
import DiscoverPage from './pages/Discover/DiscoverPage';
import ChallengesPage from './pages/Challenges/ChallengesPage';
import ChallengeDetailPage from './pages/Challenges/ChallengeDetailPage';
import StatisticsPage from './pages/Statistics/StatisticsPage';
import SuggestedRoutesPage from './pages/Routes/SuggestedRoutesPage';
import SettingsPage from './pages/Settings/SettingsPage';
import AICoachResultsPage from './pages/AICoach/AICoachResultsPage';
import ActivitiesPage from './pages/Activity/ActivitiesPage';
import LogActivityPage from './pages/Activity/LogActivityPage';
import ChatPage from './pages/Chat/ChatPage';
import ChatConversationPage from './pages/Chat/ChatConversationPage';

// Landing Page
import SuperLanding from './pages/Landing/SuperLanding';

// Legal Pages (for footer)
import PrivacyPage from './pages/Legal/PrivacyPage';
import FAQPage from './pages/Legal/FAQPage';

// Force cache refresh
console.log('App Version:', new Date().toISOString());

// Component to redirect authenticated users away from public pages
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinnerFullScreen />;
  }
  
  if (user) {
    return <Navigate to="/app" replace />;
  }
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ChatProvider>
          <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicRoute><SuperLanding /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            
            {/* Legal and Company Pages */}
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact" element={<FAQPage />} />
            <Route path="/terms" element={<PrivacyPage />} />
            <Route path="/cookies" element={<PrivacyPage />} />
            <Route path="/gdpr" element={<PrivacyPage />} />
            <Route path="/about" element={<PrivacyPage />} />
            <Route path="/help" element={<FAQPage />} />
            
            {/* Protected Routes - Simplified Navigation */}
            <Route path="/app" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              {/* Core navigation items */}
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="discover" element={<DiscoverPage />} />
              <Route path="challenges" element={<ChallengesPage />} />
              <Route path="challenges/:id" element={<ChallengeDetailPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="chat/:chatId" element={<ChatConversationPage />} />
              <Route path="statistics" element={<StatisticsPage />} />
              <Route path="routes" element={<SuggestedRoutesPage />} />
              
              {/* Activity routes */}
              <Route path="activities" element={<ActivitiesPage />} />
              <Route path="log-activity" element={<LogActivityPage />} />
              
              {/* Settings accessible via profile icon */}
              <Route path="settings" element={<SettingsPage />} />
              
              {/* AI Coach Results */}
              <Route path="ai-coach-results" element={<AICoachResultsPage />} />
            </Route>
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        </ChatProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App; 