import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, MessageSquare, Plus, Settings, ChevronDown } from 'lucide-react';
import NotificationBell from './NotificationBell';
import ReactDOM from 'react-dom';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Close dropdown on outside click or scroll
    useEffect(() => {
        if (!showUserMenu) return;
        function handleClick(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        }
        function handleScroll() {
            setShowUserMenu(false);
        }
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('touchstart', handleClick);
        window.addEventListener('scroll', handleScroll, true);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('touchstart', handleClick);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [showUserMenu]);

    return (
        <nav className="glass shadow-sm border-b border-white/30 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <h1 className="text-xl font-bold text-primary-900 font-poppins">
                                Feedback System
                            </h1>
                        </Link>

                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                to="/"
                                className="border-transparent text-primary-600 hover:border-primary-300 hover:text-primary-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-inter transition-colors duration-200"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/feedback"
                                className="border-transparent text-primary-600 hover:border-primary-300 hover:text-primary-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-inter transition-colors duration-200"
                            >
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Feedback
                            </Link>
                            {user?.role === 'manager' && (
                                <Link
                                    to="/feedback/new"
                                    className="border-transparent text-primary-600 hover:border-primary-300 hover:text-primary-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-inter transition-colors duration-200"
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
                        <div className="relative overflow-visible">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-2 text-sm text-primary-700 hover:text-primary-900 focus:outline-none font-inter"
                            >
                                <div className="flex items-center space-x-2">
                                    <User className="h-4 w-4" />
                                    <span>{user?.name}</span>
                                    <span className="bg-primary-100/80 px-2 py-1 rounded-full text-xs text-primary-700 font-inter">
                                        {user?.role}
                                    </span>
                                </div>
                                <ChevronDown className="h-4 w-4" />
                            </button>

                            {showUserMenu && ReactDOM.createPortal(
                                <div ref={dropdownRef} className="fixed top-16 right-8 w-48 glass rounded-lg shadow-lg py-3 min-h-[96px] z-[99999] border border-white/30">
                                    <Link
                                        to="/profile"
                                        className="flex items-center px-4 py-2 text-sm text-primary-700 hover:bg-white/50 font-inter"
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
                                        className="flex items-center w-full px-4 py-2 text-sm text-primary-700 hover:bg-white/50 font-inter"
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Logout
                                    </button>
                                </div>,
                                document.body
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
                        className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-primary-600 hover:text-primary-800 hover:bg-white/50 hover:border-primary-300 font-inter"
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/feedback"
                        className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-primary-600 hover:text-primary-800 hover:bg-white/50 hover:border-primary-300 font-inter"
                    >
                        Feedback
                    </Link>
                    {user?.role === 'manager' && (
                        <Link
                            to="/feedback/new"
                            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-primary-600 hover:text-primary-800 hover:bg-white/50 hover:border-primary-300 font-inter"
                        >
                            New Feedback
                        </Link>
                    )}
                    <Link
                        to="/profile"
                        className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-primary-600 hover:text-primary-800 hover:bg-white/50 hover:border-primary-300 font-inter"
                    >
                        Profile
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar; 