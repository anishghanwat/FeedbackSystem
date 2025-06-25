import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, CheckCircle, Clock, TrendingUp } from 'lucide-react';

function EmployeeDashboard() {
    const [feedback, setFeedback] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [feedbackResponse, statsResponse] = await Promise.all([
                axios.get('http://localhost:8000/feedback/'),
                axios.get('http://localhost:8000/feedback/dashboard/stats')
            ]);

            setFeedback(feedbackResponse.data);
            setStats(statsResponse.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcknowledge = async (feedbackId) => {
        try {
            await axios.post(`http://localhost:8000/feedback/${feedbackId}/acknowledge`);
            fetchDashboardData(); // Refresh data
        } catch (error) {
            console.error('Error acknowledging feedback:', error);
        }
    };

    const getSentimentColor = (sentiment) => {
        switch (sentiment) {
            case 'positive': return 'text-green-600 bg-green-100';
            case 'negative': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <MessageSquare className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total Feedback
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats?.total_feedback || 0}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Acknowledged
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats?.acknowledged_feedback || 0}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Clock className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Pending
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {(stats?.total_feedback || 0) - (stats?.acknowledged_feedback || 0)}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <TrendingUp className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Positive Rate
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats?.total_feedback ? Math.round((stats.positive_feedback / stats.total_feedback) * 100) : 0}%
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedback Timeline */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Recent Feedback</h3>
                </div>

                {feedback.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No feedback yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            You haven't received any feedback from your manager yet.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {feedback.map((item) => (
                            <div key={item.id} className="px-6 py-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h4 className="text-sm font-medium text-gray-900">
                                                Feedback from {item.manager.name}
                                            </h4>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(item.sentiment)}`}>
                                                {item.sentiment}
                                            </span>
                                            {item.acknowledged && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-green-800 bg-green-100">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Acknowledged
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <h5 className="text-sm font-medium text-gray-700 mb-1">Strengths</h5>
                                                <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-md">
                                                    {item.strengths}
                                                </p>
                                            </div>

                                            <div>
                                                <h5 className="text-sm font-medium text-gray-700 mb-1">Areas to Improve</h5>
                                                <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-md">
                                                    {item.improvements}
                                                </p>
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-500 mt-3">
                                            Received on {formatDate(item.created_at)}
                                        </p>
                                    </div>

                                    {!item.acknowledged && (
                                        <button
                                            onClick={() => handleAcknowledge(item.id)}
                                            className="ml-4 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                                        >
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Acknowledge
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default EmployeeDashboard; 