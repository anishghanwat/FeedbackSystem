import React, { useState, useEffect } from 'react';
import api from '../api';
import { MessageSquare, CheckCircle, Clock, TrendingUp, Plus, Tag, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

function EmployeeDashboard() {
    const [feedback, setFeedback] = useState([]);
    const [stats, setStats] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [requestLoading, setRequestLoading] = useState(false);
    const [requestError, setRequestError] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentText, setEditingCommentText] = useState('');
    useAuth();

    useEffect(() => {
        fetchDashboardData();
        fetchRequests();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [feedbackResponse, statsResponse] = await Promise.all([
                api.get('/feedback/'),
                api.get('/feedback/dashboard/stats')
            ]);
            setFeedback(feedbackResponse.data);
            setStats(statsResponse.data);
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

    const handleRequestFeedback = async () => {
        setRequestLoading(true);
        setRequestError('');
        try {
            await api.post('/feedback/feedback-requests/', {
                manager_id: feedback.length > 0 ? feedback[0].manager.id : null
            });
            fetchRequests();
            toast.success('Feedback request sent to your manager!');
        } catch (error) {
            setRequestError('Could not request feedback.');
            toast.error('Could not request feedback.');
        } finally {
            setRequestLoading(false);
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

    const handleEditComment = (item) => {
        setEditingCommentId(item.id);
        setEditingCommentText(item.comment || '');
    };

    const handleUpdateComment = async (feedbackId) => {
        if (!editingCommentText.trim()) {
            toast.error("Comment cannot be empty.");
            return;
        }
        try {
            await api.put(`/feedback/${feedbackId}/comment`, { comment: editingCommentText });
            setEditingCommentId(null);
            fetchDashboardData();
            toast.success("Comment updated successfully!");
        } catch (error) {
            console.error('Error updating comment:', error);
            toast.error("Failed to update comment.");
        }
    };

    const handleDeleteComment = async (feedbackId) => {
        if (window.confirm("Are you sure you want to delete this comment?")) {
            try {
                await api.delete(`/feedback/${feedbackId}/comment`);
                fetchDashboardData();
                toast.success("Comment deleted successfully!");
            } catch (error) {
                console.error('Error deleting comment:', error);
                toast.error("Failed to delete comment.");
            }
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

            {/* Feedback Request Section */}
            <div className="bg-white shadow rounded-lg p-4 flex items-center space-x-4 mb-2">
                <button
                    onClick={handleRequestFeedback}
                    className="inline-flex items-center px-4 py-2 border border-primary-300 text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 disabled:opacity-50"
                    disabled={hasPendingRequest || requestLoading}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    {requestLoading ? 'Requesting...' : 'Request Feedback'}
                </button>
                {hasPendingRequest && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-yellow-800 bg-yellow-100">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Request
                    </span>
                )}
                {lastRequest && lastRequest.status === 'completed' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-green-800 bg-green-100">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Last request completed
                    </span>
                )}
                {requestError && (
                    <span className="text-red-600 text-xs ml-2">{requestError}</span>
                )}
            </div>

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
                    <div className="space-y-4">
                        {feedback.slice(0, 3).map((item) => (
                            <div key={item.id} className="bg-white shadow rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h4 className="font-medium text-gray-800">
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

                                        {item.tags && item.tags.length > 0 && (
                                            <div className="flex items-center flex-wrap gap-2 mb-3">
                                                <Tag className="h-4 w-4 text-gray-400" />
                                                {item.tags.map(tag => (
                                                    <span key={tag.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {tag.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                                            <div>
                                                <h5 className="text-sm font-medium text-gray-700 mb-2">Strengths</h5>
                                                <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-md">
                                                    {item.strengths}
                                                </p>
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-medium text-gray-700 mb-2">Areas to Improve</h5>
                                                <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-md">
                                                    {item.improvements}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Display comment if it exists */}
                                        {item.comment && editingCommentId !== item.id && (
                                            <div className="mt-4">
                                                <div className="flex justify-between items-center">
                                                    <h5 className="text-sm font-medium text-gray-700 mb-2">Your Comment</h5>
                                                    <div className="flex space-x-2">
                                                        <button onClick={() => handleEditComment(item)} className="text-xs text-blue-500 hover:text-blue-700">
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteComment(item.id)} className="text-xs text-red-500 hover:text-red-700">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                                                    {item.comment}
                                                </p>
                                            </div>
                                        )}

                                        {editingCommentId === item.id && (
                                            <div className="mt-4">
                                                <h5 className="text-sm font-medium text-gray-700 mb-2">Edit Your Comment</h5>
                                                <textarea
                                                    value={editingCommentText}
                                                    onChange={(e) => setEditingCommentText(e.target.value)}
                                                    className="w-full p-2 border rounded-md"
                                                    rows="3"
                                                />
                                                <div className="flex justify-end space-x-2 mt-2">
                                                    <button onClick={() => setEditingCommentId(null)} className="px-3 py-1 text-sm rounded-md bg-gray-200 hover:bg-gray-300">
                                                        Cancel
                                                    </button>
                                                    <button onClick={() => handleUpdateComment(item.id)} className="px-3 py-1 text-sm rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                        )}

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