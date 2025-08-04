"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const getNotificationIcon = (type) => {
  switch (type) {
    case "warning": return "⏰";
    case "success": return "✅";
    case "info": return "🔔";
    default: return "🔔";
  }
};

const getNotificationColor = (type) => {
  switch (type) {
    case "warning": return "border-orange-200 bg-orange-50";
    case "success": return "border-green-200 bg-green-50";
    case "info": return "border-blue-200 bg-blue-50";
    default: return "border-gray-200 bg-gray-50";
  }
};

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://printmanager-api.onrender.com/api/notifications/');
      const data = await response.json();
      
      // Process notifications to extract orderId and remove customer name
      const processedNotifications = data.map(notification => {
        const orderMatch = notification.message.match(/ORD-\d+/);
        return {
          ...notification,
          orderNumber: orderMatch ? orderMatch[0] : null,
          message: orderMatch ? notification.message.replace(/by\s+\w+\s*\./, '') : notification.message
        };
      });
      
      setNotifications(processedNotifications);
    } catch (error) {
      toast.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await fetch(`https://printmanager-api.onrender.com/api/notifications/${id}/read`, {
        method: 'PUT'
      });
      setNotifications(notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ));
      toast.success("Notification marked as read");
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      for (const notification of unreadNotifications) {
        await fetch(`https://printmanager-api.onrender.com/api/notifications/${notification.id}/read`, {
          method: 'PUT'
        });
      }
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all notifications as read");
    }
  };

  const handleViewOrder = (orderId) => {
    router.push(`/dashboard/order/view/${orderId}`);
    setMenuOpen(null);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.isRead;
    return false;
  });

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 mb-6 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg border border-[#e5e7eb]">
          <div className="mb-2">
            <h3 className="text-sm font-medium text-[#111928]">Total Notifications</h3>
          </div>
          <div className="text-lg sm:text-xl font-medium text-[#111928]">{notifications.length}</div>
          <p className="text-xs text-[#9ca3af]">All notifications</p>
        </div>

        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg border border-[#e5e7eb]">
          <div className="mb-2">
            <h3 className="text-sm font-medium text-[#111928]">Unread</h3>
          </div>
          <div className="text-lg sm:text-xl font-medium text-[#111928]">{unreadCount}</div>
          <p className="text-xs text-[#9ca3af]">Need attention</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:space-x-4 mb-4 bg-white p-4 sm:p-6 lg:p-8 rounded-lg w-full border border-[#e5e7eb]">
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-2 rounded-lg text-sm sm:text-base ${filter === "all" ? "bg-[#5750f1] text-white" : "bg-gray-200 text-gray-700"} hover:bg-blue-700 hover:text-white transition w-full sm:w-auto`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-2 rounded-lg text-sm sm:text-base ${filter === "unread" ? "bg-[#5750f1] text-white" : "bg-gray-200 text-gray-700"} hover:bg-blue-700 hover:text-white transition w-full sm:w-auto`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={markAllAsRead}
              className="px-3 py-2 rounded-lg text-sm sm:text-base bg-gray-200 text-gray-700 hover:bg-blue-700 hover:text-white transition w-full sm:w-auto"
            >
              Mark All Read
            </button>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg w-full border border-[#e5e7eb]">
          <div className="mb-2">
            <h3 className="text-base sm:text-lg font-medium text-[#111928]">Notifications</h3>
            <p className="text-xs sm:text-sm text-[#9ca3af]">
              {filter === "all" && "All notifications"}
              {filter === "unread" && "Unread notifications"}
            </p>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4">
                <p className="text-sm text-[#9ca3af]">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-4">
                <span className="text-xl sm:text-2xl">🔔</span>
                <p className="text-xs sm:text-sm text-[#9ca3af]">No notifications found</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border-l-4 ${getNotificationColor(notification.type)} ${
                    !notification.isRead ? "border-l-4" : "opacity-75"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start">
                    <div className="flex items-start space-x-3 flex-1 mb-3 sm:mb-0">
                      <span className="text-base sm:text-lg">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-sm sm:text-base text-[#111928]">{notification.title}</h4>
                          {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                        </div>
                        <p className="text-xs sm:text-sm text-[#9ca3af] mb-2">{notification.message}</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-[#9ca3af]">
                          <span>{new Date(notification.createdAt).toLocaleString()}</span>
                          {notification.orderId && (
                            <span className="border border-[#e5e7eb] px-2 py-1 rounded-lg">Order: {notification.orderNumber}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="px-2 py-1 bg-[#5750f1] text-white rounded-lg text-xs hover:bg-blue-700 transition w-full sm:w-auto"
                        >
                          Mark Read
                        </button>
                      )}
                      {notification.orderId && (
                        <button
                          onClick={() => handleViewOrder(notification.orderId)}
                          className="px-2 py-1 border border-[#e5e7eb] rounded-lg text-xs text-[#2563eb] hover:text-blue-700 w-full sm:w-auto"
                        >
                          View Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}
