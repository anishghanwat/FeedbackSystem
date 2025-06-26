import React, { useState, useEffect } from 'react';
import api from '../api';
import { MessageSquare, CheckCircle, Clock, TrendingUp, Plus, Tag, UserCheck, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import FeedbackItem from './FeedbackItem';

function EmployeeDashboard() {
    const [feedback, setFeedback] = useState([]);
    const [stats, setStats] = useState(null);
    const [requests, setRequests] = useState([]);
    const [analytics, setAnalytics] = useState({
        trends: [],
        sentiment: [],
        topTags: [],
        ackStatus: null
    });
    const [loading, setLoading] = useState(true);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentText, setEditingCommentText] = useState('');
    const [user, setUser] = useState(null);
    useAuth();

    console.log("Top Tags Data:", analytics.topTags);

    useEffect(() => {
        fetchDashboardData();
        fetchRequests();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [feedbackResponse, statsResponse, trendsResponse, sentimentResponse, topTagsResponse, ackStatusResponse] = await Promise.all([
                api.get('/feedback/'),
                api.get('/feedback/dashboard/stats'),
                api.get('/feedback/analytics/employee/trends'),
                api.get('/feedback/analytics/employee/sentiment'),
                api.get('/feedback/analytics/employee/top-tags'),
                api.get('/feedback/analytics/employee/ack-status')
            ]);
            setFeedback(feedbackResponse.data);
            setStats(statsResponse.data);
            setAnalytics({
                trends: trendsResponse.data.trends,
                sentiment: sentimentResponse.data.trends,
                topTags: topTagsResponse.data.tags,
                ackStatus: ackStatusResponse.data.status
            });
            setUser(feedbackResponse.data.find(f => f.manager));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRequests = async () => {
        try {
            const response = await api.get('/feedback/feedback-requests/');
            setRequests(response.data);
        } catch (error) {
            setRequests([]);
        }
    };

    const hasPendingRequest = requests.some(r => r.status === 'pending');
    const lastRequest = requests.length > 0 ? requests[requests.length - 1] : null;

    const handleAcknowledge = async (feedbackId) => {
        try {
            await api.post(`/feedback/${feedbackId}/acknowledge`);
            fetchDashboardData(); // Refresh data
        } catch (error) {
            console.error('Error acknowledging feedback:', error);
            toast.error('Failed to acknowledge feedback.');
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

    const topTags = analytics.topTags.map(t => ({ ...t, count: Number(t.count) }));
    console.log('Top Tags Data:', topTags);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-primary-900 font-poppins tracking-tight">My Dashboard</h1>

            {/* Feedback Request Section */}
            <div className="glass shadow rounded-xl p-4 flex items-center space-x-4 mb-2 border border-white/30">
                <Link
                    to="/feedback-request/new"
                    className="inline-flex items-center px-4 py-2 border border-primary-300 text-sm font-medium rounded-lg text-primary-700 bg-primary-100/80 hover:bg-primary-200/80 disabled:opacity-50 font-inter transition-colors duration-200"
                    disabled={hasPendingRequest}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Request Feedback
                </Link>
                <Link
                    to="/feedback/new"
                    className="inline-flex items-center px-4 py-2 border border-green-300 text-sm font-medium rounded-lg text-green-700 bg-green-100/80 hover:bg-green-200/80 ml-2 font-inter transition-colors duration-200"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Send Peer Feedback
                </Link>
                {hasPendingRequest && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-yellow-800 bg-yellow-100/80 font-inter">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Request
                    </span>
                )}
                {lastRequest && lastRequest.status === 'completed' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-green-800 bg-green-100/80 font-inter">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Last request completed
                    </span>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass overflow-hidden shadow rounded-xl border border-white/30">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <MessageSquare className="h-6 w-6 text-primary-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-primary-600 truncate font-inter">
                                        Total Feedback
                                    </dt>
                                    <dd className="text-lg font-semibold text-primary-900 font-poppins">
                                        {stats?.total_feedback || 0}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass overflow-hidden shadow rounded-xl border border-white/30">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-6 w-6 text-primary-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-primary-600 truncate font-inter">
                                        Acknowledged
                                    </dt>
                                    <dd className="text-lg font-semibold text-primary-900 font-poppins">
                                        {stats?.acknowledged_feedback || 0}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass overflow-hidden shadow rounded-xl border border-white/30">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Clock className="h-6 w-6 text-primary-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-primary-600 truncate font-inter">
                                        Pending
                                    </dt>
                                    <dd className="text-lg font-semibold text-primary-900 font-poppins">
                                        {(stats?.total_feedback || 0) - (stats?.acknowledged_feedback || 0)}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass overflow-hidden shadow rounded-xl border border-white/30">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <TrendingUp className="h-6 w-6 text-primary-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-primary-600 truncate font-inter">
                                        Positive Rate
                                    </dt>
                                    <dd className="text-lg font-semibold text-primary-900 font-poppins">
                                        {stats?.total_feedback ? Math.round((stats.positive_feedback / stats.total_feedback) * 100) : 0}%
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Feedback Trends Over Time */}
                <div className="glass p-6 mb-6 border border-white/30 rounded-xl shadow">
                    <h3 className="text-lg font-semibold text-primary-900 mb-4 flex items-center font-poppins">
                        <TrendingUp className="h-5 w-5 mr-2 text-primary-600" />
                        Feedback Received Over Time
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={analytics.trends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            />
                            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px'
                                }}
                                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#3b82f6"
                                fill="#3b82f6"
                                fillOpacity={0.3}
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Sentiment Trends Over Time */}
                <div className="glass p-6 mb-6 border border-white/30 rounded-xl shadow">
                    <h3 className="text-lg font-semibold text-primary-900 mb-4 flex items-center font-poppins">
                        <BarChart3 className="h-5 w-5 mr-2 text-primary-600" />
                        Sentiment Trends Over Time
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.sentiment}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            />
                            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px'
                                }}
                                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                            />
                            <Line
                                type="monotone"
                                dataKey="positive"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                name="Positive"
                            />
                            <Line
                                type="monotone"
                                dataKey="neutral"
                                stroke="#6b7280"
                                strokeWidth={2}
                                dot={{ fill: '#6b7280', strokeWidth: 2, r: 4 }}
                                name="Neutral"
                            />
                            <Line
                                type="monotone"
                                dataKey="negative"
                                stroke="#ef4444"
                                strokeWidth={2}
                                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                                name="Negative"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Feedback Tags */}
                <div className="glass p-6 mb-6 border border-white/30 rounded-xl shadow">
                    <h3 className="text-lg font-semibold text-primary-900 mb-4 flex items-center font-poppins">
                        <Tag className="h-5 w-5 mr-2 text-primary-600" />
                        Top Feedback Tags
                    </h3>
                    <div style={{ width: 500, height: 300 }}>
                        <BarChart data={topTags} width={500} height={300}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="tag" tick={{ fontSize: 12, fill: '#6b7280' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px'
                                }}
                            />
                            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </div>
                </div>

                {/* Acknowledgment Status */}
                <div className="glass p-6 mb-6 border border-white/30 rounded-xl shadow">
                    <h3 className="text-lg font-semibold text-primary-900 mb-4 flex items-center font-poppins">
                        <UserCheck className="h-5 w-5 mr-2 text-primary-600" />
                        Acknowledgment Status
                    </h3>
                    <div className="space-y-4">
                        {/* Acknowledgment Rate Chart */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-primary-700 font-inter">Acknowledgment Rate</span>
                                <span className="text-lg font-semibold text-primary-900 font-poppins">
                                    {analytics.ackStatus ? Math.round(analytics.ackStatus.ack_rate) : 0}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${analytics.ackStatus ? analytics.ackStatus.ack_rate : 0}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Recent Unacknowledged Feedback */}
                        <div>
                            <h4 className="text-sm font-medium text-primary-700 mb-3 font-inter">Recent Unacknowledged Feedback</h4>
                            <div className="max-h-48 overflow-y-auto space-y-2">
                                {analytics.ackStatus && analytics.ackStatus.recent_unacknowledged.length > 0 ? (
                                    analytics.ackStatus.recent_unacknowledged.map((feedback) => (
                                        <div key={feedback.id} className="p-3 bg-white/50 rounded-lg border border-white/30">
                                            <div className="flex justify-between items-start mb-1">
                                                <h5 className="font-semibold text-primary-900 font-poppins text-sm">
                                                    {feedback.manager_name}
                                                </h5>
                                                <span className="text-xs text-primary-500 font-inter">
                                                    {new Date(feedback.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-primary-700 font-inter line-clamp-2">
                                                {feedback.strengths.substring(0, 100)}...
                                            </p>
                                            {feedback.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {feedback.tags.slice(0, 2).map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-block px-1 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full font-inter"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {feedback.tags.length > 2 && (
                                                        <span className="text-xs text-primary-500 font-inter">
                                                            +{feedback.tags.length - 2} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4">
                                        <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                                        <p className="text-primary-600 font-inter text-sm">All feedback acknowledged!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedback Timeline */}
            <div className="glass shadow rounded-xl border border-white/30">
                <div className="px-6 py-4 border-b border-white/30">
                    <h3 className="text-lg font-semibold text-primary-900 font-poppins">Recent Feedback</h3>
                </div>
                {feedback.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <MessageSquare className="mx-auto h-12 w-12 text-primary-400" />
                        <h3 className="mt-2 text-sm font-semibold text-primary-900 font-poppins">No feedback yet</h3>
                        <p className="mt-1 text-sm text-primary-600 font-inter">
                            You haven't received any feedback from your manager yet.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {feedback.slice(0, 3).map((item) => (
                            <FeedbackItem
                                key={item.id}
                                item={item}
                                user={user}
                                editingCommentId={editingCommentId}
                                setEditingCommentId={setEditingCommentId}
                                comment={editingCommentText}
                                setComment={setEditingCommentText}
                                handleCommentSubmit={handleAcknowledge}
                                handleAcknowledge={handleAcknowledge}
                                formatDate={formatDate}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default EmployeeDashboard; 