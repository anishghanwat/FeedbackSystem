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

function PrivateRoute({ children, allowedRoles }) {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/" />;
    }

    return children;
}

function AppRoutes() {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        // Optionally show a spinner or blank screen while checking auth
        return <div />;
    }

    return (
        <Router>
            <div className="min-h-screen bg-gray-50">
                {isAuthenticated && user && <Navbar />}
                <div className="container mx-auto px-4 py-8">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
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
        </Router>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App; 