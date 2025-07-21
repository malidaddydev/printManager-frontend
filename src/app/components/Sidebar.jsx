'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaPrint } from "react-icons/fa6";

export default function Sidebar({ isSidebarOpen, toggleSidebar }) {
  const pathname = usePathname();
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleDropdown = (id) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const mainMenuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: (
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h7a1 1 0 011 1v7a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zm11 0h7a1 1 0 011 1v7a1 1 0 01-1 1h-7a1 1 0 01-1-1V5a1 1 0 011-1zm-11 9h7a1 1 0 011 1v7a1 1 0 01-1 1H3a1 1 0 01-1-1v-7a1 1 0 011-1zm11 0h7a1 1 0 011 1v7a1 1 0 01-1 1h-7a1 1 0 01-1-1v-7a1 1 0 011-1z"></path>
        </svg>
      ),
      href: '/dashboard',
    },
    {
      id: 'customers',
      title: 'Customers',
      icon: (
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4a4 4 0 110 8 4 4 0 010-8zm-7 14a3 3 0 013-3h8a3 3 0 013 3v2H5v-2z"></path>
        </svg>
      ),
      dropdown: [
        { title: 'Create Customer', href: '/dashboard/customer/create' },
        { title: 'Customer List', href: '/dashboard/customer/list' },
      ],
    },
    {
      id: 'orders',
      title: 'Orders',
      icon: (
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm2 6h10m-10 4h10"></path>
        </svg>
      ),
      dropdown: [
        { title: 'Create Order', href: '/dashboard/order/create' },
        { title: 'Order List', href: '/dashboard/order/list' },
      ],
    },
    {
      id: 'services',
      title: 'Services',
      icon: (
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8a4 4 0 100 8 4 4 0 000-8zm-7 7a7 7 0 0114 0"></path>
        </svg>
      ),
      href: '/dashboard/services',
    },
    {
      id: 'files',
      title: 'Files',
      icon: (
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm-2 6h14m-14 4h14"></path>
        </svg>
      ),
      href: '/dashboard/files',
    },
    {
      id: 'comments',
      title: 'Comments',
      icon: (
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h18v10a2 2 0 01-2 2h-4l-4 4v-4H5a2 2 0 01-2-2V5z"></path>
        </svg>
      ),
      href: '/dashboard/comments',
    },
  ];

  const teamDashboardsItems = [
    {
      id: 'design',
      title: 'Design Team',
      icon: (
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5l7 7-7 7m7-7h10"></path>
        </svg>
      ),
      href: '/dashboard/team/design',
    },
    {
      id: 'embroidery',
      title: 'Embroidery Team',
      icon: (
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v10m0 0l-3-3m3 3l3-3m-6 3a3 3 0 006 0"></path>
        </svg>
      ),
      href: '/dashboard/team/embroidery',
    },
    {
      id: 'dtf',
      title: 'DTF Team',
      icon: (
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16v12H4V6zm4 3h8m-8 3h8"></path>
        </svg>
      ),
      href: '/dashboard/team/dtf',
    },
    {
      id: 'sublimation',
      title: 'Sublimation Team',
      icon: (
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 7h14v10H5V7zm2 2v6m10-6v6"></path>
        </svg>
      ),
      href: '/dashboard/team/sublimation',
    },
    {
      id: 'production',
      title: 'Production Team',
      icon: (
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18v2l-3 3h-3l-3-3h-6l-3 3v2h18"></path>
        </svg>
      ),
      href: '/dashboard/team/production',
    },
  ];

  const otherMenuItems = [
    {
      id: 'bigscreen',
      title: 'BigScreen',
      icon: (
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h18v14H3V5zm2 2v10h14V7H5z"></path>
        </svg>
      ),
      href: '/dashboard/bigscreen',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: (
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M7 21h10a2 2 0 002-2V9a6 6 0 10-12 0v10a2 2 0 002 2z"></path>
        </svg>
      ),
      href: '/dashboard/notifications',
    },
    {
      id: 'user-management',
      title: 'User Management',
      icon: (
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4a4 4 0 110 8 4 4 0 010-8zm-7 14a3 3 0 013-3h8a3 3 0 013 3v2H5v-2z"></path>
        </svg>
      ),
      href: '/dashboard/user-management',
    },
  ];

  const isDropdownActive = (dropdownItems) => {
    return dropdownItems.some((subItem) => pathname === subItem.href);
  };

  const renderMenuItems = (items) => {
    return items.map((item) => (
      <div key={item.id}>
        {item.dropdown ? (
          <div>
            <button
              onClick={() => toggleDropdown(item.id)}
              className={`flex items-center justify-between w-full px-3.5 py-3 rounded-lg text-[16px] cursor-pointer ${
                isDropdownActive(item.dropdown)
                  ? 'bg-[rgba(87,80,241,0.07)] text-[#5750f1]'
                  : 'text-[#4b5563] hover:bg-gray-100 hover:text-black'
              }`}
            >
              <div className="flex items-center">
                {item.icon}
                {item.title}
              </div>
              <svg
                className={`w-4 h-4 transform ${openDropdowns[item.id] ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            {openDropdowns[item.id] && (
              <div className="pl-8 space-y-2 mt-2">
                {item.dropdown.map((subItem, index) => (
                  <Link
                    key={index}
                    href={subItem.href}
                    className={`block px-3.5 py-3 rounded-lg text-[16px] ${
                      pathname === subItem.href
                        ? 'bg-[rgba(87,80,241,0.07)] text-[#5750f1]'
                        : 'text-[#4b5563] hover:bg-gray-100 hover:text-black'
                    }`}
                    onClick={() => toggleSidebar()}
                  >
                    {subItem.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Link
            href={item.href}
            className={`flex items-center px-3.5 py-3 rounded-lg text-[16px] ${
              pathname === item.href
                ? 'bg-[rgba(87,80,241,0.07)] text-[#5750f1]'
                : 'text-[#4b5563] hover:bg-gray-100 hover:text-black'
            }`}
            onClick={() => toggleSidebar()}
          >
            {item.icon}
            {item.title}
          </Link>
        )}
      </div>
    ));
  };

  return (
    <div
      className={`fixed top-0 left-0 w-[290px] h-full bg-white border-r-[1px] border-[#e5e7eb] transform lg:transform-none transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 z-20 flex flex-col`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between py-[30px] bg-white text-black px-4 shrink-0">
        <h1 className="text-[28px] font-bold text-[#111928] flex items-center gap-2">
          <FaPrint color='#5750f1' />
          Print Shop
        </h1>
        <button onClick={toggleSidebar} className="lg:hidden text-black">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      {/* Sidebar Menu with Custom Scrollbar */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-[#5750f1] scrollbar-track-gray-100 scrollbar-thumb-rounded-full">
        <nav className="space-y-2">
          <h2 className="text-[14px] text-[#4b5563] mb-4 uppercase">Main Menu</h2>
          {renderMenuItems(mainMenuItems)}
          <h2 className="text-[14px] text-[#4b5563] mb-4 uppercase mt-4">Team Dashboards</h2>
          {renderMenuItems(teamDashboardsItems)}
          <h2 className="text-[14px] text-[#4b5563] mb-4 uppercase mt-4">Other</h2>
          {renderMenuItems(otherMenuItems)}
        </nav>
      </div>
    </div>
  );
}