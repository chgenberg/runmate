import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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

// Main App Pages
import DashboardPage from './pages/Dashboard/DashboardPage';
import DiscoverPage from './pages/Discover/DiscoverPage';
import ProfilePage from './pages/Profile/ProfilePage';
import MatchesPage from './pages/Matches/MatchesPage';
import ActivityPage from './pages/Activity/ActivityPage';
import ActivitiesPage from './pages/Activity/ActivitiesPage';
import LogActivityPage from './pages/Activity/LogActivityPage';
// import LiveTrackingPage from './pages/Activity/LiveTrackingPage';
import SettingsPage from './pages/Settings/SettingsPage';
import ChallengesPage from './pages/Challenges/ChallengesPage';
import CreateChallengePage from './pages/Challenges/CreateChallengePage';
import ChallengeDetailPage from './pages/Challenges/ChallengeDetailPage';
import CreateRunEventPage from './pages/RunEvents/CreateRunEventPage';
import RunEventDetailPage from './pages/RunEvents/RunEventDetailPage';
import RatingsPage from './pages/Rating/RatingsPage';
import LeaderboardPage from './pages/Leaderboard/LeaderboardPage';

// Landing Page
import InteractiveLanding from './pages/Landing/InteractiveLanding';
import PublicProfilePage from './pages/Profile/PublicProfilePage';

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
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicRoute><InteractiveLanding /></PublicRoute>} />
            <Route path="/profile/:userId" element={<PublicRoute><PublicProfilePage /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            
            {/* Protected Routes with Socket */}
            <Route path="/app" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              {/* Nested routes within the app layout */}
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="discover" element={<DiscoverPage />} />
              <Route path="matches" element={<MatchesPage />} />
              <Route path="chat" element={<MatchesPage />} />
              <Route path="chat/:chatId" element={<MatchesPage />} />
              <Route path="activities" element={<ActivitiesPage />} />
              <Route path="log-activity" element={<LogActivityPage />} />
              <Route path="activity/:id" element={<ActivityPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="challenges" element={<ChallengesPage />} />
              <Route path="challenges/create" element={<CreateChallengePage />} />
              <Route path="challenges/:id" element={<ChallengeDetailPage />} />
              <Route path="runevents/create" element={<CreateRunEventPage />} />
              <Route path="runevents/:id" element={<RunEventDetailPage />} />
              <Route path="ratings" element={<RatingsPage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="community" element={<div className="p-6"><h1 className="text-2xl font-bold">Community - Kommer snart!</h1></div>} />
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