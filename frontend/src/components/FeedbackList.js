import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import Select from 'react-select';
import { Trash2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FeedbackItem from './FeedbackItem';

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
    // Tab state for classification
    const [activeTab, setActiveTab] = useState('all');

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

    // Classification logic for employees
    let sentFeedback = [];
    let receivedFromManagers = [];
    let receivedFromPeers = [];
    let anonymousFeedback = [];
    if (user?.role === 'employee') {
        sentFeedback = feedback.filter(item => item.manager && item.manager.id === user.id);
        receivedFromManagers = feedback.filter(item => item.employee && item.employee.id === user.id && item.manager && item.manager.role === 'manager');
        receivedFromPeers = feedback.filter(item => item.employee && item.employee.id === user.id && item.manager && item.manager.role === 'employee' && item.manager.id !== user.id);
        anonymousFeedback = feedback.filter(item => item.anonymous === true);
    }
    // Classification logic for managers
    if (user?.role === 'manager') {
        // Feedback sent by this manager
        sentFeedback = feedback.filter(item => item.manager && item.manager.id === user.id);
        // Feedback received by this manager (not common, but for completeness)
        receivedFromManagers = feedback.filter(item => item.employee && item.employee.id === user.id && item.manager && item.manager.role === 'manager');
        // Feedback received from peers (if manager can receive feedback from employees)
        receivedFromPeers = feedback.filter(item => item.employee && item.employee.id === user.id && item.manager && item.manager.role === 'employee' && item.manager.id !== user.id);
        anonymousFeedback = feedback.filter(item => item.anonymous === true);
    }

    // Prepare tab data
    const allFeedback = user?.role === 'employee'
        ? [...sentFeedback, ...receivedFromManagers, ...receivedFromPeers]
        : filteredFeedback;
    const tabs = [
        { key: 'all', label: 'All', count: allFeedback.length },
        { key: 'sent', label: 'Sent', count: sentFeedback.length },
        { key: 'received', label: 'Received', count: receivedFromManagers.length + receivedFromPeers.length },
        { key: 'fromManagers', label: 'From Managers', count: receivedFromManagers.length },
        { key: 'fromPeers', label: 'From Peers', count: receivedFromPeers.length },
        { key: 'anonymous', label: 'Anonymous', count: anonymousFeedback.length },
    ];

    // Filter feedback to display based on active tab
    let feedbackToDisplay = allFeedback;
    if (activeTab === 'sent') feedbackToDisplay = sentFeedback;
    if (activeTab === 'received') feedbackToDisplay = [...receivedFromManagers, ...receivedFromPeers];
    if (activeTab === 'fromManagers') feedbackToDisplay = receivedFromManagers;
    if (activeTab === 'fromPeers') feedbackToDisplay = receivedFromPeers;
    if (activeTab === 'anonymous') feedbackToDisplay = anonymousFeedback;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <>
            {/* Tabs for classification */}
            <div className="flex space-x-2 mb-4">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-full flex items-center space-x-2 transition-colors duration-150 font-semibold backdrop-blur-md glass shadow border border-white/30
                            ${activeTab === tab.key ? 'bg-white/70 text-primary-700 shadow-lg' : 'bg-white/30 text-gray-700 hover:bg-white/50'}`}
                    >
                        {activeTab === tab.key && <span className="h-2 w-2 bg-primary-500 rounded-full mr-2"></span>}
                        <span>{tab.label}</span>
                        <span className="ml-1">{tab.count}</span>
                    </button>
                ))}
            </div>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-primary-900 tracking-tight font-poppins">
                        {user?.role === 'manager' ? 'Feedback Given' : 'My Feedback'}
                    </h1>
                </div>
                <div className="glass p-4 shadow rounded-xl border border-white/30">
                    <label className="block text-sm font-medium text-primary-700 mb-2">Filter by Tags:</label>
                    <Select
                        isMulti
                        options={allTags}
                        value={selectedTags}
                        onChange={setSelectedTags}
                        placeholder="Select tags to filter..."
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{
                            menu: (provided) => ({ ...provided, zIndex: 9999 }),
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                        menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                        menuPosition="fixed"
                    />
                </div>
                {/* Feedback list based on active tab */}
                {feedbackToDisplay.length === 0 ? (
                    <div className="text-center text-primary-500 font-inter py-8">No feedback found.</div>
                ) : (
                    <div className="space-y-4">
                        {feedbackToDisplay.map((item) => (
                            <FeedbackItem
                                key={item.id}
                                item={item}
                                user={user}
                                showAuthorIds={showAuthorIds}
                                setShowAuthorIds={setShowAuthorIds}
                                editingCommentId={editingCommentId}
                                setEditingCommentId={setEditingCommentId}
                                comment={comment}
                                setComment={setComment}
                                handleCommentSubmit={handleCommentSubmit}
                                handleAcknowledge={handleAcknowledge}
                                handleUnacknowledge={handleUnacknowledge}
                                handleEdit={handleEdit}
                                openDeleteModal={openDeleteModal}
                                formatDate={formatDate}
                            />
                        ))}
                    </div>
                )}
            </div>
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="glass rounded-xl shadow-lg max-w-md w-full p-6 relative animate-fade-in border border-white/30">
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                            onClick={closeDeleteModal}
                            aria-label="Close"
                        >
                            <XCircle className="h-6 w-6" />
                        </button>
                        <div className="flex flex-col items-center">
                            <Trash2 className="h-10 w-10 text-red-500 mb-2" />
                            <h2 className="text-lg font-semibold text-primary-900 mb-2 font-poppins">Delete Feedback?</h2>
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
        </>
    )
}

export default FeedbackList; 