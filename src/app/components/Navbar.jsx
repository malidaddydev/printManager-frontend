"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Navbar({ toggleSidebar }) {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const response = await fetch('https://printmanager-api.onrender.com/api/notifications/');
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      
      // Process notifications to extract orderId and remove customer name
      const processedNotifications = data.map(notification => {
        const orderMatch = notification.message.match(/ORD-\d+/);
        return {
          ...notification,
          orderId: orderMatch ? orderMatch[0] : null,
          message: orderMatch ? notification.message.replace(/by\s+\w+\s*\./, '') : notification.message
        };
      });
      
      setNotifications(processedNotifications);
    } catch (error) {
      toast.error("Failed to fetch notifications");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Calculate unread count based on isRead: false from API data
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <div className="fixed top-0 left-0 lg:left-[290px] right-0 bg-white flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-5 md:py-6 lg:py-7 border-b-[2px] border-[#e5e7eb] z-10">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-600 hover:text-[#5750f1]"
          >
            <svg
              className="w-6 h-6 sm:w-7 sm:h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#111928]">
            Dashboard
          </h2>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Notification Icon */}
          <div className="relative">
            <button
              onClick={() => router.push('/dashboard/notifications')}
              className="text-gray-600 hover:text-[#5750f1] bg-gray-100 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-[#e5e7eb] border-[1px] relative"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                ></path>
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
          {/* Avatar with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="text-gray-600 hover:text-[#5750f1] bg-gray-100 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-[#e5e7eb] border-[1px]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-user h-4 w-4 sm:h-5 sm:w-5"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-lg py-2 z-20">
                <div className="block px-4 py-2 text-gray-700 border-[#e5e7eb] border-b-[1px] mb-2 text-xs sm:text-sm">
                  {sessionStorage.getItem("email")}
                </div>
                <Link
                  href="/dashboard/user-management"
                  className="block px-4 py-2 text-gray-700 hover:bg-[rgba(87,80,241,0.07)] hover:text-[#5750f1] text-xs sm:text-sm"
                >
                  User Management
                </Link>
                <button
                  onClick={() => {
                    sessionStorage.removeItem("authToken");
                    sessionStorage.removeItem("username");
                    sessionStorage.removeItem("email")
                    window.location.href = "/auth/login";
                  }}
                  className="w-full block px-4 py-2 text-gray-700 hover:bg-[rgba(87,80,241,0.07)] hover:text-[#5750f1] text-left text-xs sm:text-sm cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}