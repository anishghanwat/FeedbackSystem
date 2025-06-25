import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save } from 'lucide-react';

function FeedbackForm() {
    const [formData, setFormData] = useState({
        employee_id: '',
        strengths: '',
        improvements: '',
        sentiment: 'neutral'
    });
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');

    useEffect(() => {
        fetchEmployees();
        const employeeId = searchParams.get('employee');
        if (employeeId) {
            setFormData(prev => ({ ...prev, employee_id: employeeId }));
        }
        if (editId) {
            setIsEdit(true);
            fetchFeedbackToEdit(editId);
        }
    }, [searchParams, editId]);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get('http://localhost:8000/users/employees');
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const fetchFeedbackToEdit = async (id) => {
        try {
            const response = await axios.get(`http://localhost:8000/feedback/${id}`);
            setFormData({
                employee_id: response.data.employee_id,
                strengths: response.data.strengths,
                improvements: response.data.improvements,
                sentiment: response.data.sentiment
            });
        } catch (error) {
            setError('Failed to load feedback for editing');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isEdit && editId) {
                await axios.put(`http://localhost:8000/feedback/${editId}`, formData);
            } else {
                await axios.post('http://localhost:8000/feedback/', formData);
            }
            navigate('/feedback');
        } catch (error) {
            setError(error.response?.data?.detail || 'Error saving feedback');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <button
                    onClick={() => navigate('/feedback')}
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Feedback List
                </button>
            </div>

            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">{isEdit ? 'Edit Feedback' : 'Create New Feedback'}</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700 mb-2">
                            Employee
                        </label>
                        <select
                            id="employee_id"
                            name="employee_id"
                            value={formData.employee_id}
                            onChange={handleChange}
                            required
                            disabled={isEdit}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">Select an employee</option>
                            {employees.map((employee) => (
                                <option key={employee.id} value={employee.id}>
                                    {employee.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="strengths" className="block text-sm font-medium text-gray-700 mb-2">
                            Strengths
                        </label>
                        <textarea
                            id="strengths"
                            name="strengths"
                            rows={4}
                            value={formData.strengths}
                            onChange={handleChange}
                            required
                            placeholder="Describe the employee's strengths and positive contributions..."
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="improvements" className="block text-sm font-medium text-gray-700 mb-2">
                            Areas to Improve
                        </label>
                        <textarea
                            id="improvements"
                            name="improvements"
                            rows={4}
                            value={formData.improvements}
                            onChange={handleChange}
                            required
                            placeholder="Describe areas where the employee can improve..."
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="sentiment" className="block text-sm font-medium text-gray-700 mb-2">
                            Overall Sentiment
                        </label>
                        <select
                            id="sentiment"
                            name="sentiment"
                            value={formData.sentiment}
                            onChange={handleChange}
                            required
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="positive">Positive</option>
                            <option value="neutral">Neutral</option>
                            <option value="negative">Negative</option>
                        </select>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate('/feedback')}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Feedback')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FeedbackForm; 