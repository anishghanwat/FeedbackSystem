import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, MessageSquare, TrendingUp, CheckCircle, Plus, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

function ManagerDashboard() {
    const [stats, setStats] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const notifiedRequestIds = useRef(new Set());

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsResponse, employeesResponse] = await Promise.all([
                    axios.get('http://localhost:8000/feedback/dashboard/stats'),
                    axios.get('http://localhost:8000/users/employees')
                ]);
                setStats(statsResponse.data);
                setEmployees(employeesResponse.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchRequests = async (isInitialLoad = false) => {
            try {
                const response = await axios.get('http://localhost:8000/feedback/feedback-requests/');
                const newRequests = response.data;
                setRequests(newRequests);

                const pendingRequests = newRequests.filter(r => r.status === 'pending');
                const newUnseenRequests = pendingRequests.filter(req => !notifiedRequestIds.current.has(req.id));

                if (newUnseenRequests.length > 0) {
                    if (isInitialLoad) {
                        // On initial load, show a single summary notification for all unseen requests
                        toast(`You have ${newUnseenRequests.length} new pending request(s).`, { icon: '🔔' });
                    } else {
                        // For polling, show individual toasts
                        newUnseenRequests.forEach(req => {
                            toast.success(`${req.employee.name} requested feedback!`);
                        });
                    }
                    // Mark all newly found requests as notified
                    newUnseenRequests.forEach(req => notifiedRequestIds.current.add(req.id));
                }
            } catch (error) {
                console.error('Failed to fetch requests:', error);
            }
        };

        fetchDashboardData();
        fetchRequests(true);

        const interval = setInterval(() => {
            fetchRequests(false);
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    const handleGiveFeedback = (employeeId, requestId) => {
        navigate(`/feedback/new?employee=${employeeId}&request=${requestId}`);
    };

    const pendingRequests = requests.filter(r => r.status === 'pending');

    const chartData = stats ? [
        { name: 'Positive', value: stats.positive_feedback, color: '#10B981' },
        { name: 'Neutral', value: stats.neutral_feedback, color: '#6B7280' },
        { name: 'Negative', value: stats.negative_feedback, color: '#EF4444' }
    ] : [];

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
                <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
                <Link
                    to="/feedback/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Feedback
                </Link>
            </div>

            {/* Pending Feedback Requests */}
            {pendingRequests.length > 0 && (
                <div className="bg-white shadow rounded-lg p-4 mb-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                        <Mail className="h-5 w-5 mr-2 text-primary-600" />
                        Pending Feedback Requests
                    </h3>
                    <ul className="divide-y divide-gray-200">
                        {pendingRequests.map((req) => (
                            <li key={req.id} className="py-2 flex items-center justify-between">
                                <span className="text-gray-800 font-medium">{req.employee.name}</span>
                                <button
                                    onClick={() => handleGiveFeedback(req.employee.id, req.id)}
                                    className="inline-flex items-center px-3 py-1 border border-primary-300 text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Give Feedback
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <MessageSquare className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total Feedback
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats?.total_feedback || 0}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Users className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Team Members
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {employees.length}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Acknowledged
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats?.acknowledged_feedback || 0}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <TrendingUp className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Positive Rate
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats?.total_feedback ? Math.round((stats.positive_feedback / stats.total_feedback) * 100) : 0}%
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Sentiment Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Feedback by Sentiment</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3B82F6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Team Members */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {employees.map((employee) => (
                        <div key={employee.id} className="px-6 py-4 flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900">{employee.name}</h4>
                                <p className="text-sm text-gray-500">{employee.username}</p>
                            </div>
                            <Link
                                to={`/feedback/new?employee=${employee.id}`}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                Give Feedback
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ManagerDashboard; 