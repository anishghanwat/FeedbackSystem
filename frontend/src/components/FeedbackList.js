import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import Select from 'react-select';
import { MessageSquare, CheckCircle, Clock, Edit, Trash2, XCircle, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

function FeedbackList() {
    const [feedback, setFeedback] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [comment, setComment] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [showAuthorIds, setShowAuthorIds] = useState([]);

    useEffect(() => {
        fetchFeedback();
        fetchTags();
    }, []);

    const fetchFeedback = async () => {
        try {
            const response = await api.get('/feedback/');
            setFeedback(response.data);
        } catch (error) {
            console.error('Error fetching feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTags = async () => {
        try {
            const response = await api.get('/feedback/tags/');
            setAllTags(response.data.map(tag => ({ value: tag.name, label: tag.name })));
        } catch (error) {
            console.error('Failed to fetch tags:', error);
        }
    };

    const handleAcknowledge = async (feedbackId) => {
        try {
            await api.post(`/feedback/${feedbackId}/acknowledge`);
            fetchFeedback();
        } catch (error) {
            console.error('Error acknowledging feedback:', error);
        }
    };

    const handleUnacknowledge = async (feedbackId) => {
        try {
            await api.post(`/feedback/${feedbackId}/unacknowledge`);
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
            await api.delete(`/feedback/${deleteId}`);
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

    const filteredFeedback = feedback.filter(item => {
        // Tag filtering
        if (selectedTags.length > 0) {
            const itemTags = Array.isArray(item.tags) ? item.tags.map(tag => tag.name) : [];
            if (!selectedTags.every(selectedTag => itemTags.includes(selectedTag.value))) {
                return false;
            }
        }
        // Visibility filtering
        if (user?.role === 'employee') {
            return item.anonymous === true || item.employee?.id === user.id;
        }
        // Managers see all feedback returned by backend
        return true;
    });

    const handleCommentSubmit = async (feedbackId) => {
        try {
            await api.post(`/feedback/${feedbackId}/comment`, {
                comment: comment
            });
            setComment("");
            setEditingCommentId(null);
            fetchFeedback();
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
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

            <div className="bg-white p-4 shadow rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Tags:</label>
                <Select
                    isMulti
                    options={allTags}
                    value={selectedTags}
                    onChange={setSelectedTags}
                    placeholder="Select tags to filter..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                />
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

            {filteredFeedback.length === 0 ? (
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
                    {filteredFeedback.map((item) => (
                        <div key={item.id} className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h4 className="font-medium text-gray-800">
                                                Feedback from {(() => {
                                                    if (user?.role === 'manager' && item.anonymous && item.visible_to_manager) {
                                                        if (showAuthorIds.includes(item.id)) {
                                                            return item.manager?.name || 'Unknown';
                                                        } else {
                                                            return (
                                                                <button
                                                                    className="text-blue-600 underline text-sm ml-1"
                                                                    onClick={() => setShowAuthorIds(prev => [...prev, item.id])}
                                                                >
                                                                    Show Author
                                                                </button>
                                                            );
                                                        }
                                                    }
                                                    if (item.manager && item.manager.name === 'Anonymous') return 'Anonymous';
                                                    if (!item.manager) return 'Anonymous';
                                                    return item.manager.name;
                                                })()} for {item.employee?.name}
                                            </h4>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(item.sentiment)}`}>
                                                {item.sentiment}
                                            </span>
                                            {item.acknowledged && (
                                                <span
                                                    className="relative inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-green-800 bg-green-100 group"
                                                    title={item.acknowledged_at ? `Acknowledged on ${formatDate(item.acknowledged_at)}` : 'Acknowledged'}
                                                >
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Acknowledged
                                                </span>
                                            )}
                                            {!item.acknowledged && user?.role === 'employee' && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-yellow-800 bg-yellow-100">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    Pending
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
                                                <div className="bg-green-50 p-3 rounded-md">
                                                    {(() => {
                                                        const val = item.strengths;
                                                        if (typeof val !== 'string' && typeof val !== 'number') {
                                                            console.warn('Unexpected type for strengths:', val);
                                                            return null;
                                                        }
                                                        return <ReactMarkdown>{String(val)}</ReactMarkdown>;
                                                    })()}
                                                </div>
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-medium text-gray-700 mb-2">Areas to Improve</h5>
                                                <div className="bg-yellow-50 p-3 rounded-md">
                                                    {(() => {
                                                        const val = item.improvements;
                                                        if (typeof val !== 'string' && typeof val !== 'number') {
                                                            console.warn('Unexpected type for improvements:', val);
                                                            return null;
                                                        }
                                                        return <ReactMarkdown>{String(val)}</ReactMarkdown>;
                                                    })()}
                                                </div>
                                            </div>
                                        </div>

                                        {item.comment && (
                                            <div className="mt-4">
                                                <h5 className="text-sm font-medium text-gray-700 mb-2">Employee's Comment</h5>
                                                <div className="bg-blue-50 p-3 rounded-md">
                                                    {(() => {
                                                        const val = item.comment;
                                                        if (typeof val !== 'string' && typeof val !== 'number') {
                                                            console.warn('Unexpected type for comment:', val);
                                                            return null;
                                                        }
                                                        return <ReactMarkdown>{String(val)}</ReactMarkdown>;
                                                    })()}
                                                </div>
                                            </div>
                                        )}

                                        {/* Form to add a comment */}
                                        {user?.role === 'employee' && item.acknowledged && !item.comment && (
                                            <div className="mt-4">
                                                {editingCommentId === item.id ? (
                                                    <div className="space-y-2">
                                                        <textarea
                                                            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                                                            rows="3"
                                                            placeholder="Add your comment..."
                                                            value={comment}
                                                            onChange={(e) => setComment(e.target.value)}
                                                        ></textarea>
                                                        <div className="flex justify-end space-x-2">
                                                            <button
                                                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                                                                onClick={() => setEditingCommentId(null)}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                                                onClick={() => handleCommentSubmit(item.id)}
                                                            >
                                                                Submit Comment
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className="text-sm text-blue-600 hover:underline"
                                                        onClick={() => {
                                                            setEditingCommentId(item.id);
                                                            setComment(""); // Clear previous comment text
                                                        }}
                                                    >
                                                        Add a comment...
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        <div className="border-t border-gray-200 mt-4 pt-3 flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <span>Created on {formatDate(item.created_at)}</span>
                                                {item.updated_at && item.updated_at !== item.created_at && (
                                                    <span>Updated on {formatDate(item.updated_at)}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-3">
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

                                                {/* Show edit/delete if current user is the author (manager or employee) */}
                                                {(user && item.manager && user.id === item.manager.id) && (
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
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FeedbackList; 