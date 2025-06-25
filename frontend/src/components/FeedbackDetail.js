import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';

function FeedbackDetail() {
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { id } = useParams();
    const { user } = useAuth();
    const [showAuthor, setShowAuthor] = useState(false);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const response = await api.get(`/feedback/${id}`);
                setFeedback(response.data);
            } catch (err) {
                setError('Failed to load feedback. You may not have permission to view this item.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, [id]);

    const getSentimentColor = (sentiment) => {
        switch (sentiment) {
            case 'positive': return 'text-green-600 bg-green-100';
            case 'negative': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    if (loading) {
        return <div className="text-center p-8">Loading...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">{error}</div>;
    }

    if (!feedback) {
        return <div className="text-center p-8">Feedback not found.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <Link
                    to="/feedback"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Feedback List
                </Link>
            </div>
            <div key={feedback.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-800">
                                Feedback from {(() => {
                                    if (user?.role === 'manager' && feedback.anonymous && feedback.visible_to_manager) {
                                        if (showAuthor) {
                                            return feedback.manager?.name || 'Unknown';
                                        } else {
                                            return (
                                                <button
                                                    className="text-blue-600 underline text-sm ml-1"
                                                    onClick={() => setShowAuthor(true)}
                                                >
                                                    Show Author
                                                </button>
                                            );
                                        }
                                    }
                                    if (feedback.manager && feedback.manager.name === 'Anonymous') return 'Anonymous';
                                    if (!feedback.manager) return 'Anonymous';
                                    return feedback.manager.name;
                                })()} for {feedback.employee?.name}
                            </h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(feedback.sentiment)}`}>
                                {feedback.sentiment}
                            </span>
                            {feedback.acknowledged && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-green-800 bg-green-100">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Acknowledged
                                </span>
                            )}
                        </div>
                        {/* Tags */}
                        {feedback.tags && feedback.tags.length > 0 && (
                            <div className="flex items-center flex-wrap gap-2 mb-3">
                                <span className="font-semibold text-sm text-gray-700">Tags:</span>
                                {feedback.tags.map(tag => (
                                    <span key={tag.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        )}
                        {/* Strengths */}
                        <div className="mb-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-1">Strengths</h5>
                            <div className="bg-green-50 p-3 rounded-md">
                                <ReactMarkdown>{feedback.strengths || 'None'}</ReactMarkdown>
                            </div>
                        </div>
                        {/* Areas to Improve */}
                        <div className="mb-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-1">Areas to Improve</h5>
                            <div className="bg-yellow-50 p-3 rounded-md">
                                <ReactMarkdown>{feedback.improvements || 'None'}</ReactMarkdown>
                            </div>
                        </div>
                        {/* Comment */}
                        {feedback.comment && (
                            <div className="mb-3">
                                <h5 className="text-sm font-medium text-gray-700 mb-1">Employee Comment</h5>
                                <div className="bg-gray-50 p-3 rounded-md">
                                    <ReactMarkdown>{feedback.comment}</ReactMarkdown>
                                </div>
                            </div>
                        )}
                        {/* Created At */}
                        <div className="text-xs text-gray-500 mt-2">
                            Created on {new Date(feedback.created_at).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FeedbackDetail;