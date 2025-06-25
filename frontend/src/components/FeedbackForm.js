import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CreatableSelect from 'react-select/creatable';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

function FeedbackForm() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        employee_id: '',
        strengths: '',
        improvements: '',
        sentiment: 'neutral',
        tags: [],
        anonymous: false,
        visible_to_manager: false
    });
    const [allTags, setAllTags] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');
    const requestId = searchParams.get('request');

    useEffect(() => {
        api.get('/users/employees')
            .then(response => {
                setEmployees(response.data.map(emp => ({ value: emp.id, label: emp.name })));
            })
            .catch(error => console.error('Error fetching employees:', error));

        api.get('/feedback/tags/')
            .then(response => {
                setAllTags(response.data.map(tag => ({ value: tag.name, label: tag.name })));
            })
            .catch(error => console.error('Error fetching tags:', error));

        if (editId) {
            api.get(`/feedback/`)
                .then(response => {
                    const feedbackToEdit = response.data.find(fb => fb.id === parseInt(editId));
                    if (feedbackToEdit) {
                        setFormData({
                            employee_id: feedbackToEdit.employee.id,
                            strengths: feedbackToEdit.strengths,
                            improvements: feedbackToEdit.improvements,
                            sentiment: feedbackToEdit.sentiment,
                            tags: feedbackToEdit.tags.map(tag => tag.name),
                            anonymous: feedbackToEdit.anonymous,
                            visible_to_manager: feedbackToEdit.visible_to_manager
                        });
                        setIsEdit(true);
                    }
                })
                .catch(error => console.error('Error fetching feedback for edit:', error));
        }
    }, [editId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const feedbackData = {
            employee_id: formData.employee_id,
            strengths: formData.strengths,
            improvements: formData.improvements,
            sentiment: formData.sentiment,
            tags: formData.tags,
            anonymous: formData.anonymous,
            visible_to_manager: formData.visible_to_manager
        };

        try {
            if (editId) {
                await api.put(`/feedback/${editId}`, feedbackData);
            } else {
                await api.post('/feedback/', feedbackData);
                if (requestId) {
                    try {
                        await api.patch(`/feedback/feedback-requests/${requestId}/complete`);
                    } catch (err) {
                        setError('Feedback saved, but failed to mark request as completed.');
                    }
                }
            }
            navigate('/feedback');
        } catch (err) {
            let errorMessage = 'An error occurred while submitting feedback.';
            if (err.response?.data?.detail) {
                if (Array.isArray(err.response.data.detail)) {
                    errorMessage = err.response.data.detail.map(e => `${e.loc[1]}: ${e.msg}`).join(', ');
                } else {
                    errorMessage = err.response.data.detail;
                }
            }
            setError(errorMessage);
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

    const handleTagChange = (selectedOptions) => {
        setFormData(prev => ({
            ...prev,
            tags: selectedOptions ? selectedOptions.map(option => option.value) : []
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
                            {employees
                                .filter(emp => user?.role !== 'employee' || String(emp.value) !== String(user.id))
                                .map((employee) => (
                                    <option key={employee.value} value={employee.value}>
                                        {employee.label}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {user?.role === 'employee' && formData.employee_id && String(formData.employee_id) !== String(user.id) && (
                        <div className="mt-2">
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.anonymous}
                                    onChange={e => setFormData(prev => ({ ...prev, anonymous: e.target.checked, visible_to_manager: false }))}
                                    className="form-checkbox h-4 w-4 text-primary-600"
                                />
                                <span className="ml-2 text-sm text-gray-700">Submit anonymously</span>
                            </label>
                            {formData.anonymous && (
                                <div className="ml-6 mt-1">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.visible_to_manager}
                                            onChange={e => setFormData(prev => ({ ...prev, visible_to_manager: e.target.checked }))}
                                            className="form-checkbox h-4 w-4 text-primary-600"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Allow manager to see my name</span>
                                    </label>
                                </div>
                            )}
                        </div>
                    )}

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

                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                            Tags
                        </label>
                        <CreatableSelect
                            isMulti
                            options={allTags}
                            value={formData.tags.map(tag => ({ value: tag, label: tag }))}
                            onChange={handleTagChange}
                            placeholder="Select or create tags..."
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
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