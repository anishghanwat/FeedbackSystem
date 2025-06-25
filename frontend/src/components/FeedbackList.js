import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { MessageSquare, CheckCircle, Clock, Edit, Trash2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function FeedbackList() {
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            const response = await axios.get('http://localhost:8000/feedback/');
            setFeedback(response.data);
        } catch (error) {
            console.error('Error fetching feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcknowledge = async (feedbackId) => {
        try {
            await axios.post(`http://localhost:8000/feedback/${feedbackId}/acknowledge`);
            fetchFeedback();
        } catch (error) {
            console.error('Error acknowledging feedback:', error);
        }
    };

    const handleUnacknowledge = async (feedbackId) => {
        try {
            await axios.post(`http://localhost:8000/feedback/${feedbackId}/unacknowledge`);
            fetchFeedback();
        } catch (error) {
            console.error('Error unacknowledging feedback:', error);
        }
    };

    const openDeleteModal = (feedbackId) => {
        setDeleteId(feedbackId);
        setDeleteError('');
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setDeleteId(null);
        setDeleteError('');
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleteLoading(true);
        setDeleteError('');
        try {
            await axios.delete(`http://localhost:8000/feedback/${deleteId}`);
            closeDeleteModal();
            fetchFeedback();
        } catch (error) {
            setDeleteError(error.response?.data?.detail || 'Failed to delete feedback');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleEdit = (feedbackId) => {
        navigate(`/feedback/new?edit=${feedbackId}`);
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
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                    {user?.role === 'manager' ? 'Feedback Given' : 'My Feedback'}
                </h1>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative animate-fade-in">
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                            onClick={closeDeleteModal}
                            aria-label="Close"
                        >
                            <XCircle className="h-6 w-6" />
                        </button>
                        <div className="flex flex-col items-center">
                            <Trash2 className="h-10 w-10 text-red-500 mb-2" />
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete Feedback?</h2>
                            <p className="text-gray-600 text-center mb-4">Are you sure you want to delete this feedback? This action cannot be undone.</p>
                            {deleteError && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-2 w-full text-center text-red-600 text-sm">
                                    {deleteError}
                                </div>
                            )}
                            <div className="flex space-x-3 mt-2">
                                <button
                                    onClick={closeDeleteModal}
                                    className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium"
                                    disabled={deleteLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 rounded-md border border-transparent bg-red-600 text-white hover:bg-red-700 font-medium disabled:opacity-50"
                                    disabled={deleteLoading}
                                >
                                    {deleteLoading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {feedback.length === 0 ? (
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-12 text-center">
                        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No feedback yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {user?.role === 'manager'
                                ? 'You haven\'t given any feedback yet.'
                                : 'You haven\'t received any feedback yet.'
                            }
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {feedback.map((item) => (
                        <div key={item.id} className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <h4 className="text-lg font-medium text-gray-900">
                                                {user?.role === 'manager'
                                                    ? `Feedback for ${item.employee.name}`
                                                    : `Feedback from ${item.manager.name}`
                                                }
                                            </h4>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(item.sentiment)}`}>
                                                {item.sentiment}
                                            </span>
                                            {item.acknowledged && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-green-800 bg-green-100">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Acknowledged
                                                    {item.acknowledged_at && (
                                                        <span className="ml-2 text-gray-500">({formatDate(item.acknowledged_at)})</span>
                                                    )}
                                                </span>
                                            )}
                                            {!item.acknowledged && user?.role === 'employee' && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-yellow-800 bg-yellow-100">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    Pending
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>Created on {formatDate(item.created_at)}</span>
                                            {item.updated_at && item.updated_at !== item.created_at && (
                                                <span>Updated on {formatDate(item.updated_at)}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="ml-4 flex flex-col space-y-2">
                                        {!item.acknowledged && user?.role === 'employee' && (
                                            <button
                                                onClick={() => handleAcknowledge(item.id)}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                                            >
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Acknowledge
                                            </button>
                                        )}

                                        {item.acknowledged && user?.role === 'employee' && (
                                            <button
                                                onClick={() => handleUnacknowledge(item.id)}
                                                className="inline-flex items-center px-3 py-1 border border-yellow-300 text-sm font-medium rounded-md text-yellow-700 bg-white hover:bg-yellow-50"
                                            >
                                                <Clock className="h-3 w-3 mr-1" />
                                                Unacknowledge
                                            </button>
                                        )}

                                        {user?.role === 'manager' && (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(item.id)}
                                                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                >
                                                    <Edit className="h-3 w-3 mr-1" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(item.id)}
                                                    className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-3 w-3 mr-1" />
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FeedbackList; 