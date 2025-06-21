import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileNav from './MobileNav';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Layout */}
      <div className="hidden lg:flex">
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
          <Sidebar />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          <TopBar />
          <main className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <TopBar />
        <main className="pb-20 pt-16">
          <div className="px-4 sm:px-6">
            <Outlet />
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
};

export default Layout; 