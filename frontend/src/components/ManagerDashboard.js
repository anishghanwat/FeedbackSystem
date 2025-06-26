import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { Users, MessageSquare, TrendingUp, CheckCircle, Plus, Mail, Tag, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';

function ManagerDashboard() {
    const [stats, setStats] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [requests, setRequests] = useState([]);
    const [analytics, setAnalytics] = useState({
        trends: [],
        ackRate: [],
        topTags: [],
        unacknowledged: []
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const notifiedRequestIds = useRef(new Set());

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsResponse, employeesResponse, requestsResponse, trendsResponse, ackRateResponse, topTagsResponse, unacknowledgedResponse] = await Promise.all([
                    api.get('/feedback/dashboard/stats'),
                    api.get('/users/employees'),
                    api.get('/feedback/feedback-requests/'),
                    api.get('/feedback/analytics/trends'),
                    api.get('/feedback/analytics/ack_rate'),
                    api.get('/feedback/analytics/top-tags'),
                    api.get('/feedback/analytics/unacknowledged')
                ]);
                setStats(statsResponse.data);
                setEmployees(employeesResponse.data);
                setRequests(requestsResponse.data);
                setAnalytics({
                    trends: trendsResponse.data.trends,
                    ackRate: ackRateResponse.data.trends,
                    topTags: topTagsResponse.data.tags,
                    unacknowledged: unacknowledgedResponse.data.feedback
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchRequests = async (isInitialLoad = false) => {
            try {
                const response = await api.get('/feedback/feedback-requests/');
                const newRequests = response.data;
                setRequests(newRequests);

                const pendingRequests = newRequests.filter(r => r.status === 'pending');
                const newUnseenRequests = pendingRequests.filter(req => !notifiedRequestIds.current.has(req.id));

                if (newUnseenRequests.length > 0) {
                    if (isInitialLoad) {
                        toast(`You have ${newUnseenRequests.length} new pending request(s).`, { icon: '🔔' });
                    } else {
                        newUnseenRequests.forEach(req => {
                            toast.success(`${req.employee.name} requested feedback!`);
                        });
                    }
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

    const handleDownloadPDF = async (employee) => {
        try {
            const response = await api.get(`/users/employee/${employee.id}/feedback`);
            const feedbackList = response.data;

            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text(`Feedback Summary for ${employee.name}`, 20, 20);

            let y = 35;
            feedbackList.forEach((fb, idx) => {
                doc.setFontSize(12);
                doc.text(`Feedback #${idx + 1}`, 20, y);
                y += 7;
                doc.text(`Date: ${new Date(fb.created_at).toLocaleDateString()}`, 20, y);
                y += 7;
                doc.text(`Sentiment: ${fb.sentiment}`, 20, y);
                y += 7;
                doc.text(`Strengths: ${fb.strengths}`, 20, y);
                y += 7;
                doc.text(`Improvements: ${fb.improvements}`, 20, y);
                y += 7;
                if (fb.tags && fb.tags.length > 0) {
                    doc.text(`Tags: ${fb.tags.map(t => t.name).join(", ")}`, 20, y);
                    y += 7;
                }
                if (fb.comment) {
                    doc.text(`Comment: ${fb.comment}`, 20, y);
                    y += 7;
                }
                y += 5;
                if (y > 270) { doc.addPage(); y = 20; }
            });

            doc.save(`feedback-summary-${employee.name}.pdf`);
        } catch (err) {
            toast.error("Failed to generate PDF. Please try again.");
        }
    };

    const pendingRequests = requests.filter(r => r.status === 'pending');

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Team Members */}
            <div className="glass p-6 mb-6 border border-white/30 rounded-xl shadow">
                <div className="px-6 py-4 border-b border-white/30">
                    <h3 className="text-lg font-semibold text-primary-900 font-poppins">Team Members</h3>
                </div>
                <div className="divide-y divide-white/30">
                    {employees.map((employee) => (
                        <div key={employee.id} className="px-6 py-4 flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-semibold text-primary-900 font-poppins">{employee.name}</h4>
                                <p className="text-sm text-primary-500 font-inter">{employee.username}</p>
                            </div>
                            <div className="flex space-x-2">
                                <Link
                                    to={`/feedback/new?employee=${employee.id}`}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-lg text-primary-700 bg-primary-100/80 hover:bg-primary-200/80 font-inter transition-colors duration-200"
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Give Feedback
                                </Link>
                                <button
                                    onClick={() => handleDownloadPDF(employee)}
                                    className="inline-flex items-center px-3 py-1 border border-blue-300 text-sm font-medium rounded-lg text-blue-700 bg-blue-100/80 hover:bg-blue-200/80 font-inter transition-colors duration-200"
                                    title="Download all feedback for this employee as PDF"
                                >
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pending Feedback Requests */}
            {pendingRequests.length > 0 && (
                <div className="glass p-6 mb-6 border border-white/30 rounded-xl shadow">
                    <h3 className="text-lg font-semibold text-primary-900 mb-2 flex items-center font-poppins">
                        <Mail className="h-5 w-5 mr-2 text-primary-600" />
                        Pending Feedback Requests
                    </h3>
                    <ul className="divide-y divide-white/30">
                        {pendingRequests.map((req) => (
                            <li key={req.id} className="py-2 flex items-center justify-between">
                                <span className="text-primary-900 font-medium font-inter">{req.employee.name}</span>
                                <button
                                    onClick={() => handleGiveFeedback(req.employee.id, req.id)}
                                    className="inline-flex items-center px-3 py-1 border border-primary-300 text-sm font-medium rounded-lg text-primary-700 bg-primary-100/80 hover:bg-primary-200/80 font-inter transition-colors duration-200"
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
                <div className="glass p-6 mb-6 border border-white/30 rounded-xl shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <MessageSquare className="h-6 w-6 text-primary-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-primary-600 truncate font-inter">Total Feedback</dt>
                                <dd className="text-lg font-semibold text-primary-900 font-poppins">{stats?.total_feedback || 0}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
                <div className="glass p-6 mb-6 border border-white/30 rounded-xl shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Users className="h-6 w-6 text-primary-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-primary-600 truncate font-inter">Team Members</dt>
                                <dd className="text-lg font-semibold text-primary-900 font-poppins">{employees.length}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
                <div className="glass p-6 mb-6 border border-white/30 rounded-xl shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <CheckCircle className="h-6 w-6 text-primary-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-primary-600 truncate font-inter">Acknowledged</dt>
                                <dd className="text-lg font-semibold text-primary-900 font-poppins">{stats?.acknowledged_feedback || 0}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
                <div className="glass p-6 mb-6 border border-white/30 rounded-xl shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <TrendingUp className="h-6 w-6 text-primary-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-primary-600 truncate font-inter">Positive Rate</dt>
                                <dd className="text-lg font-semibold text-primary-900 font-poppins">{stats?.total_feedback ? Math.round((stats.positive_feedback / stats.total_feedback) * 100) : 0}%</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Feedback Trends Over Time */}
                <div className="glass p-6 mb-6 border border-white/30 rounded-xl shadow">
                    <h3 className="text-lg font-semibold text-primary-900 mb-4 flex items-center font-poppins">
                        <TrendingUp className="h-5 w-5 mr-2 text-primary-600" />
                        Feedback Trends Over Time
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={analytics.trends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            />
                            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px'
                                }}
                                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#3b82f6"
                                fill="#3b82f6"
                                fillOpacity={0.3}
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Acknowledgment Rate Over Time */}
                <div className="glass p-6 mb-6 border border-white/30 rounded-xl shadow">
                    <h3 className="text-lg font-semibold text-primary-900 mb-4 flex items-center font-poppins">
                        <CheckCircle className="h-5 w-5 mr-2 text-primary-600" />
                        Acknowledgment Rate Over Time
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.ackRate}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            />
                            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px'
                                }}
                                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                formatter={(value, name) => [value, name === 'acknowledged' ? 'Acknowledged' : 'Total']}
                            />
                            <Line
                                type="monotone"
                                dataKey="acknowledged"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="total"
                                stroke="#6b7280"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={{ fill: '#6b7280', strokeWidth: 2, r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Feedback Tags */}
                <div className="glass p-6 mb-6 border border-white/30 rounded-xl shadow">
                    <h3 className="text-lg font-semibold text-primary-900 mb-4 flex items-center font-poppins">
                        <Tag className="h-5 w-5 mr-2 text-primary-600" />
                        Top Feedback Tags
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.topTags} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} />
                            <YAxis
                                type="category"
                                dataKey="tag"
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                width={80}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px'
                                }}
                            />
                            <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Unacknowledged Feedback */}
                <div className="glass p-6 mb-6 border border-white/30 rounded-xl shadow">
                    <h3 className="text-lg font-semibold text-primary-900 mb-4 flex items-center font-poppins">
                        <Clock className="h-5 w-5 mr-2 text-primary-600" />
                        Unacknowledged Feedback
                    </h3>
                    <div className="max-h-80 overflow-y-auto">
                        {analytics.unacknowledged.length > 0 ? (
                            <div className="space-y-3">
                                {analytics.unacknowledged.map((feedback) => (
                                    <div key={feedback.id} className="p-4 bg-white/50 rounded-lg border border-white/30">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold text-primary-900 font-poppins text-sm">
                                                {feedback.employee_name}
                                            </h4>
                                            <span className="text-xs text-primary-500 font-inter">
                                                {new Date(feedback.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-xs font-medium text-primary-700 font-inter">Strengths:</p>
                                                <p className="text-sm text-primary-900 font-inter">{feedback.strengths}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-primary-700 font-inter">Improvements:</p>
                                                <p className="text-sm text-primary-900 font-inter">{feedback.improvements}</p>
                                            </div>
                                            {feedback.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {feedback.tags.map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-block px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full font-inter"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
                                <p className="text-primary-600 font-inter">All feedback has been acknowledged!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ManagerDashboard; 