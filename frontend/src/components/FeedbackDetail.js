import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FeedbackDetail;