import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, CheckCircle, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function FeedbackDetail() {
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { id } = useParams();

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

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

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
                                Feedback from {feedback.manager.name} for {feedback.employee.name}
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

                        {feedback.tags && feedback.tags.length > 0 && (
                            <div className="flex items-center flex-wrap gap-2 mb-3">
                                <Tag className="h-4 w-4 text-gray-400" />
                                {feedback.tags.map(tag => (
                                    <span key={tag.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                            <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Strengths</h5>
                                <div className="bg-green-50 p-3 rounded-md break-words">
                                    {(() => {
                                        const val = feedback.strengths;
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
                                <div className="bg-yellow-50 p-3 rounded-md break-words">
                                    {(() => {
                                        const val = feedback.improvements;
                                        if (typeof val !== 'string' && typeof val !== 'number') {
                                            console.warn('Unexpected type for improvements:', val);
                                            return null;
                                        }
                                        return <ReactMarkdown>{String(val)}</ReactMarkdown>;
                                    })()}
                                </div>
                            </div>
                        </div>

                        {feedback.comment && (
                            <div className="mt-4">
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Employee's Comment</h5>
                                <div className="bg-blue-50 p-3 rounded-md break-words">
                                    {(() => {
                                        const val = feedback.comment;
                                        if (typeof val !== 'string' && typeof val !== 'number') {
                                            console.warn('Unexpected type for comment:', val);
                                            return null;
                                        }
                                        return <ReactMarkdown>{String(val)}</ReactMarkdown>;
                                    })()}
                                </div>
                            </div>
                        )}

                        <div className="text-xs text-gray-500 mt-3 pt-3 border-t">
                            <p>Received on {formatDate(feedback.created_at)}</p>
                            {feedback.updated_at && <p>Last updated on {formatDate(feedback.updated_at)}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FeedbackDetail; 