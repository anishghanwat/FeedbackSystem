import React from 'react';
import { CheckCircle, Clock, Edit, Trash2, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const FeedbackItem = ({
    item,
    user,
    showAuthorIds = [],
    setShowAuthorIds = () => { },
    editingCommentId,
    setEditingCommentId = () => { },
    comment = '',
    setComment = () => { },
    handleCommentSubmit = () => { },
    handleAcknowledge = () => { },
    handleUnacknowledge = () => { },
    handleEdit = () => { },
    openDeleteModal = () => { },
    formatDate = () => { },
}) => {
    return (
        <div className="glass shadow rounded-xl border border-white/30 p-6 mb-6">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-primary-900 font-poppins">
                            Feedback from {(() => {
                                if (user?.role === 'manager' && item.anonymous && item.visible_to_manager) {
                                    if (showAuthorIds.includes(item.id)) {
                                        return item.manager?.name || 'Unknown';
                                    } else {
                                        return (
                                            <button
                                                className="text-blue-600 underline text-sm ml-1"
                                                onClick={() => setShowAuthorIds(prev => [...prev, item.id])}
                                            >
                                                Show Author
                                            </button>
                                        );
                                    }
                                }
                                if (item.manager && item.manager.name === 'Anonymous') return 'Anonymous';
                                if (!item.manager) return 'Anonymous';
                                return item.manager.name;
                            })()} {item.employee && (<span className="font-normal text-primary-500">for {item.employee?.name}</span>)}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-inter
                            ${item.sentiment && typeof item.sentiment === 'string' ? (item.sentiment === 'positive' ? 'text-green-700 bg-green-100/80' : item.sentiment === 'negative' ? 'text-red-700 bg-red-100/80' : 'text-gray-700 bg-gray-100/80') : ''}`}>
                            {item.sentiment}
                        </span>
                        {item.acknowledged && (
                            <span
                                className="relative inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-green-800 bg-green-100/80 group"
                                title={item.acknowledged_at ? `Acknowledged on ${formatDate(item.acknowledged_at)}` : 'Acknowledged'}
                            >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Acknowledged
                            </span>
                        )}
                        {!item.acknowledged && user?.role === 'employee' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-yellow-800 bg-yellow-100/80">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                            </span>
                        )}
                    </div>
                    {item.tags && item.tags.length > 0 && (
                        <div className="flex items-center flex-wrap gap-2 mb-3">
                            <Tag className="h-4 w-4 text-primary-400" />
                            {item.tags.map(tag => (
                                <span key={tag.id || tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100/80 text-primary-700 font-inter">
                                    {tag.name || tag}
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                        <div>
                            <h5 className="text-sm font-medium text-primary-700 mb-2 font-inter">Strengths</h5>
                            <div className="glass p-3 rounded-md border border-white/30">
                                {(() => {
                                    const val = item.strengths;
                                    if (typeof val !== 'string' && typeof val !== 'number') {
                                        console.warn('Unexpected type for strengths:', val);
                                        return null;
                                    }
                                    return <ReactMarkdown>{String(val)}</ReactMarkdown>;
                                })()}
                            </div>
                        </div>
                        <div>
                            <h5 className="text-sm font-medium text-primary-700 mb-2 font-inter">Areas to Improve</h5>
                            <div className="glass p-3 rounded-md border border-white/30">
                                {(() => {
                                    const val = item.improvements;
                                    if (typeof val !== 'string' && typeof val !== 'number') {
                                        console.warn('Unexpected type for improvements:', val);
                                        return null;
                                    }
                                    return <ReactMarkdown>{String(val)}</ReactMarkdown>;
                                })()}
                            </div>
                        </div>
                    </div>
                    {item.comment && (
                        <div className="mt-4">
                            <h5 className="text-sm font-medium text-primary-700 mb-2 font-inter">{user?.role === 'manager' ? "Employee's Comment" : "Your Comment"}</h5>
                            <div className="glass p-3 rounded-md border border-white/30">
                                {(() => {
                                    const val = item.comment;
                                    if (typeof val !== 'string' && typeof val !== 'number') {
                                        console.warn('Unexpected type for comment:', val);
                                        return null;
                                    }
                                    return <ReactMarkdown>{String(val)}</ReactMarkdown>;
                                })()}
                            </div>
                        </div>
                    )}
                    {/* Form to add a comment */}
                    {user?.role === 'employee' && item.acknowledged && !item.comment && (
                        <div className="mt-4">
                            {editingCommentId === item.id ? (
                                <div className="space-y-2">
                                    <textarea
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-inter"
                                        rows="3"
                                        placeholder="Add your comment..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    ></textarea>
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                                            onClick={() => setEditingCommentId(null)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                                            onClick={() => handleCommentSubmit(item.id)}
                                        >
                                            Submit Comment
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    className="text-sm text-blue-600 hover:underline"
                                    onClick={() => {
                                        setEditingCommentId(item.id);
                                        setComment("");
                                    }}
                                >
                                    Add a comment...
                                </button>
                            )}
                        </div>
                    )}
                    <div className="border-t border-white/30 mt-4 pt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-xs text-primary-500 font-inter">
                            <span>Created on {formatDate(item.created_at)}</span>
                            {item.updated_at && item.updated_at !== item.created_at && (
                                <span>Updated on {formatDate(item.updated_at)}</span>
                            )}
                        </div>
                        <div className="flex items-center space-x-3">
                            {!item.acknowledged && user?.role === 'employee' && (
                                <button
                                    onClick={() => handleAcknowledge(item.id)}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 font-inter"
                                >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Acknowledge
                                </button>
                            )}
                            {item.acknowledged && user?.role === 'employee' && (
                                <button
                                    onClick={() => handleUnacknowledge(item.id)}
                                    className="inline-flex items-center px-3 py-1 border border-yellow-300 text-sm font-medium rounded-lg text-yellow-700 bg-white hover:bg-yellow-50 font-inter"
                                >
                                    <Clock className="h-3 w-3 mr-1" />
                                    Unacknowledge
                                </button>
                            )}
                            {(user && item.manager && user.id === item.manager.id) && (
                                <>
                                    <button
                                        onClick={() => handleEdit(item.id)}
                                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-inter"
                                    >
                                        <Edit className="h-3 w-3 mr-1" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(item.id)}
                                        className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 font-inter"
                                    >
                                        <Trash2 className="h-3 w-3 mr-1" />
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackItem; 