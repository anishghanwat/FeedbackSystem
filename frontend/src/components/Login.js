import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(username, password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="glass p-8 rounded-xl border border-white/30 shadow-lg">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-bold text-primary-900 font-poppins tracking-tight">
                            Lightweight Feedback System
                        </h2>
                        <p className="mt-2 text-center text-sm text-primary-600 font-inter">
                            Sign in to your account
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-primary-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    autoComplete="username"
                                    className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-inter"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-primary-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    autoComplete="current-password"
                                    className="appearance-none relative block w-full px-3 py-3 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-inter"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-primary-400 hover:text-primary-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-primary-400 hover:text-primary-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center space-x-2 text-red-600 text-sm font-inter">
                                <AlertCircle className="h-4 w-4" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 font-inter transition-colors duration-200"
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-primary-600 font-inter">
                                Don't have an account?{' '}
                                <Link to="/register" className="font-medium text-primary-700 hover:text-primary-800 font-inter">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login; 