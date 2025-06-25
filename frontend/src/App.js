import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import ManagerDashboard from './components/ManagerDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import FeedbackForm from './components/FeedbackForm';
import FeedbackList from './components/FeedbackList';
import Profile from './components/Profile';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';

function PrivateRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div />;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/" />;
    }

    return children;
}

function AppRoutes() {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gray-50">
            {user && <Navbar />}
            <div className="container mx-auto px-4 py-8">
                <Routes>
                    <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
                    <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                {user?.role === 'manager' ? <ManagerDashboard /> : <EmployeeDashboard />}
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/feedback/new"
                        element={
                            <PrivateRoute allowedRoles={['manager']}>
                                <FeedbackForm />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/feedback"
                        element={
                            <PrivateRoute>
                                <FeedbackList />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <Toaster position="top-right" />
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}

export default App; 