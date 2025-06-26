import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import FeedbackItem from './FeedbackItem';

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
                    className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium font-inter"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Feedback List
                </Link>
            </div>
            <FeedbackItem
                item={feedback}
                user={user}
                showAuthorIds={showAuthor ? [feedback.id] : []}
                setShowAuthorIds={show => setShowAuthor(show.length > 0)}
                formatDate={date => new Date(date).toLocaleString()}
            />
        </div>
    );
}

export default FeedbackDetail;