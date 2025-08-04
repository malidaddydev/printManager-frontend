'use client';
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      {/* Overlay for mobile when sidebar is open */}
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full">
        {/* Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />
        {/* Page Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 lg:ml-[290px] pt-[80px] sm:pt-[90px] md:pt-[100px] lg:pt-[110px]">
          {children}
        </main>
      </div>
    </div>
  );
}