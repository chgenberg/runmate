import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Footer from './Footer';
import MobileNav from './MobileNav';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar - Mobile only */}
      <div className="lg:hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="min-h-screen flex flex-col">
            <div className="flex-1">
              <Outlet />
            </div>
            <Footer />
          </div>
        </main>
      </div>

      {/* Mobile Navigation - Bottom */}
      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  );
};

export default Layout; 