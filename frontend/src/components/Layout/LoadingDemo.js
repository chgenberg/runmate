import React from 'react';
import LoadingSpinner, { 
  DashboardLoader, 
  ChatLoader, 
  EventLoader, 
  ActivitiesLoader, 
  ChallengesLoader,
  PageLoader 
} from './LoadingSpinner';

const LoadingDemo = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-gray-900 mb-8 text-center">Loading Components Demo</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Default variants */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-center">Default</h3>
            <LoadingSpinner variant="default" />
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-center">Pulse</h3>
            <LoadingSpinner variant="pulse" />
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-center">Bounce</h3>
            <LoadingSpinner variant="bounce" />
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-center">Orbit</h3>
            <LoadingSpinner variant="orbit" />
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-center">Dots</h3>
            <LoadingSpinner variant="dots" />
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-center">Heart</h3>
            <LoadingSpinner variant="heart" />
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-center">Activity</h3>
            <LoadingSpinner variant="activity" />
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-center">Gradient</h3>
            <LoadingSpinner variant="gradient" />
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-center">Stars</h3>
            <LoadingSpinner variant="stars" />
          </div>
        </div>
        
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Specialized Loading Components</h2>
          
          <div className="grid grid-cols-1 gap-8">
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <h3 className="text-lg font-bold mb-4 text-center">Chat Loader</h3>
              <ChatLoader />
            </div>
            
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <h3 className="text-lg font-bold mb-4 text-center">Event Loader</h3>
              <EventLoader />
            </div>
            
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <h3 className="text-lg font-bold mb-4 text-center">Activities Loader</h3>
              <ActivitiesLoader />
            </div>
            
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <h3 className="text-lg font-bold mb-4 text-center">Challenges Loader</h3>
              <ChallengesLoader />
            </div>
          </div>
        </div>
        
        <div className="mt-12 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Full Page Loaders Preview</h2>
          <p className="text-gray-600 text-center">These would normally take up the full screen</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-100 rounded-2xl p-4 h-64 overflow-hidden">
              <h3 className="text-lg font-bold mb-4 text-center">Dashboard Loader</h3>
              <div className="transform scale-50 origin-top">
                <DashboardLoader />
              </div>
            </div>
            
            <div className="bg-gray-100 rounded-2xl p-4 h-64 overflow-hidden">
              <h3 className="text-lg font-bold mb-4 text-center">Page Loader</h3>
              <div className="transform scale-50 origin-top">
                <PageLoader text="Laddar sida..." />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingDemo; 