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
        <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-800">
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
                                })()} for {item.employee?.name}
                            </h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.sentiment && typeof item.sentiment === 'string' ? (item.sentiment === 'positive' ? 'text-green-600 bg-green-100' : item.sentiment === 'negative' ? 'text-red-600 bg-red-100' : 'text-gray-600 bg-gray-100') : ''}`}>
                                {item.sentiment}
                            </span>
                            {item.acknowledged && (
                                <span
                                    className="relative inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-green-800 bg-green-100 group"
                                    title={item.acknowledged_at ? `Acknowledged on ${formatDate(item.acknowledged_at)}` : 'Acknowledged'}
                                >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Acknowledged
                                </span>
                            )}
                            {!item.acknowledged && user?.role === 'employee' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-yellow-800 bg-yellow-100">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Pending
                                </span>
                            )}
                        </div>
                        {item.tags && item.tags.length > 0 && (
                            <div className="flex items-center flex-wrap gap-2 mb-3">
                                <Tag className="h-4 w-4 text-gray-400" />
                                {item.tags.map(tag => (
                                    <span key={tag.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                            <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Strengths</h5>
                                <div className="bg-green-50 p-3 rounded-md">
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
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Areas to Improve</h5>
                                <div className="bg-yellow-50 p-3 rounded-md">
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
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Employee's Comment</h5>
                                <div className="bg-blue-50 p-3 rounded-md">
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
                                            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
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
                                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
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
                        <div className="border-t border-gray-200 mt-4 pt-3 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <span>Created on {formatDate(item.created_at)}</span>
                                {item.updated_at && item.updated_at !== item.created_at && (
                                    <span>Updated on {formatDate(item.updated_at)}</span>
                                )}
                            </div>
                            <div className="flex items-center space-x-3">
                                {!item.acknowledged && user?.role === 'employee' && (
                                    <button
                                        onClick={() => handleAcknowledge(item.id)}
                                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                                    >
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Acknowledge
                                    </button>
                                )}
                                {item.acknowledged && user?.role === 'employee' && (
                                    <button
                                        onClick={() => handleUnacknowledge(item.id)}
                                        className="inline-flex items-center px-3 py-1 border border-yellow-300 text-sm font-medium rounded-md text-yellow-700 bg-white hover:bg-yellow-50"
                                    >
                                        <Clock className="h-3 w-3 mr-1" />
                                        Unacknowledge
                                    </button>
                                )}
                                {(user && item.manager && user.id === item.manager.id) && (
                                    <>
                                        <button
                                            onClick={() => handleEdit(item.id)}
                                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            <Edit className="h-3 w-3 mr-1" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(item.id)}
                                            className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
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
        </div>
    );
};

export default FeedbackItem; 