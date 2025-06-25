import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, MessageSquare, Plus, Settings, ChevronDown } from 'lucide-react';
import NotificationBell from './NotificationBell';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">
                                Feedback System
                            </h1>
                        </Link>

                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                to="/"
                                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/feedback"
                                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Feedback
                            </Link>
                            {user?.role === 'manager' && (
                                <Link
                                    to="/feedback/new"
                                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    New Feedback
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <NotificationBell />
                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none"
                            >
                                <div className="flex items-center space-x-2">
                                    <User className="h-4 w-4" />
                                    <span>{user?.name}</span>
                                    <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                                        {user?.role}
                                    </span>
                                </div>
                                <ChevronDown className="h-4 w-4" />
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                    <Link
                                        to="/profile"
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <Settings className="h-4 w-4 mr-2" />
                                        Profile Settings
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            handleLogout();
                                        }}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className="sm:hidden">
                <div className="pt-2 pb-3 space-y-1">
                    <Link
                        to="/"
                        className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/feedback"
                        className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                    >
                        Feedback
                    </Link>
                    {user?.role === 'manager' && (
                        <Link
                            to="/feedback/new"
                            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                        >
                            New Feedback
                        </Link>
                    )}
                    <Link
                        to="/profile"
                        className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                    >
                        Profile
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar; 