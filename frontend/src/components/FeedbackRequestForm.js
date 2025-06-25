import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

function FeedbackRequestForm() {
    const [managers, setManagers] = useState([]);
    const [selectedManagerId, setSelectedManagerId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchManagers();
    }, []);

    const fetchManagers = async () => {
        try {
            const response = await api.get('/users/managers');
            setManagers(response.data);
        } catch (error) {
            console.error('Error fetching managers:', error);
            toast.error('Failed to load managers.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedManagerId) {
            setError('Please select a manager');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post('/feedback/feedback-requests/', {
                manager_id: parseInt(selectedManagerId)
            });
            toast.success('Feedback request sent successfully!');
            navigate('/dashboard');
        } catch (err) {
            let errorMessage = 'Failed to send feedback request.';
            if (err.response?.data?.detail) {
                errorMessage = err.response.data.detail;
            }
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Dashboard
                </button>
            </div>

            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Request Feedback</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Send a feedback request to your manager
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="manager_id" className="block text-sm font-medium text-gray-700 mb-2">
                            Select Manager
                        </label>
                        <select
                            id="manager_id"
                            value={selectedManagerId}
                            onChange={(e) => setSelectedManagerId(e.target.value)}
                            required
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">Choose a manager...</option>
                            {managers.map((manager) => (
                                <option key={manager.id} value={manager.id}>
                                    {manager.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <p className="text-sm text-blue-700">
                            <strong>Note:</strong> Your manager will be notified of this request and can provide feedback when they're ready.
                        </p>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !selectedManagerId}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            <Send className="h-4 w-4 mr-2" />
                            {loading ? 'Sending...' : 'Send Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FeedbackRequestForm; 