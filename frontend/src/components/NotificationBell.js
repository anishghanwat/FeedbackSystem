import React, { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data);
            setUnreadCount(response.data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleNotificationClick = async (notification) => {
        try {
            await api.post(`/notifications/${notification.id}/read`);
            fetchNotifications(); // Refresh list
            setIsOpen(false);
        } catch (error) {
            toast.error('Failed to mark notification as read.');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.post('/notifications/read-all');
            fetchNotifications(); // Refresh list
        } catch (error) {
            toast.error('Failed to mark all as read.');
        }
    };

    const formatDate = (dateString) => {
        // Simple time ago formatter
        const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    };

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="relative">
                <Bell className="h-6 w-6 text-gray-500 hover:text-gray-700" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-20">
                    <div className="py-2 px-4 flex justify-between items-center border-b">
                        <h3 className="font-medium text-gray-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllAsRead} className="text-xs text-blue-500 hover:text-blue-700 font-medium inline-flex items-center">
                                <CheckCheck className="h-3 w-3 mr-1" />
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div className="divide-y max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <Link
                                    key={n.id}
                                    to={n.link || '#'}
                                    onClick={() => handleNotificationClick(n)}
                                    className={`block p-4 hover:bg-gray-50 ${!n.read ? 'bg-blue-50' : ''}`}
                                >
                                    <p className="text-sm text-gray-700">{n.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">{formatDate(n.created_at)}</p>
                                </Link>
                            ))
                        ) : (
                            <div className="p-6 text-center">
                                <p className="text-sm text-gray-500">You have no notifications.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationBell; 