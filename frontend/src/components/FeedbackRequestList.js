import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function FeedbackRequestList() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await api.get('/feedback/feedback-requests/');
            setRequests(response.data);
        } catch (error) {
            toast.error('Failed to fetch feedback requests.');
            console.error('Error fetching feedback requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Feedback Requests</h1>
            <div className="bg-white shadow rounded-lg">
                <div className="divide-y divide-gray-200">
                    {loading ? (
                        <p className="p-6 text-center text-gray-500">Loading requests...</p>
                    ) : requests.length > 0 ? (
                        requests.map(request => (
                            <div key={request.id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${request.status === 'pending' ? 'bg-yellow-100' : 'bg-green-100'}`}>
                                            {request.status === 'pending' ? (
                                                <Clock className="h-6 w-6 text-yellow-600" />
                                            ) : (
                                                <CheckCircle className="h-6 w-6 text-green-600" />
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            Request from <span className="font-bold">{request.employee.name}</span>
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Requested on {formatDate(request.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    {request.status === 'pending' ? (
                                        <Link
                                            to={`/feedback/new?request=${request.id}&employee=${request.employee_id}`}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                                        >
                                            Give Feedback
                                        </Link>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Completed on {formatDate(request.completed_at)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="p-6 text-center text-gray-500">No feedback requests found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FeedbackRequestList; 