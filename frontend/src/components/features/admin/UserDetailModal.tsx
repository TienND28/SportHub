import { X, Mail, Phone, Calendar, Shield, CheckCircle, XCircle, User as UserIcon } from 'lucide-react';
import type { User } from '../services/admin/user.admin.service';

interface UserDetailModalProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function UserDetailModal({ user, isOpen, onClose }: UserDetailModalProps) {
    if (!isOpen || !user) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'owner':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full transform transition-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl px-6 py-8">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex items-center gap-6">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.full_name}
                                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-lg">
                                        <span className="text-4xl font-bold text-blue-600">
                                            {user.full_name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* User Info */}
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    {user.full_name}
                                </h2>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`px-3 py-1 text-sm font-semibold rounded-full border-2 ${getRoleBadgeClass(user.role)}`}>
                                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                    </span>
                                    {user.is_verified && (
                                        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 border-2 border-green-200 flex items-center gap-1">
                                            <CheckCircle size={14} />
                                            Verified
                                        </span>
                                    )}
                                    {user.is_active ? (
                                        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 border-2 border-green-200">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800 border-2 border-red-200">
                                            Inactive
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-6 space-y-6">
                        {/* Contact Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <UserIcon size={20} className="text-blue-600" />
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                    <Mail size={20} className="text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1">Email</p>
                                        <p className="text-sm text-gray-900 break-all">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                    <Phone size={20} className="text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1">Phone</p>
                                        <p className="text-sm text-gray-900">{user.phone || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar size={20} className="text-blue-600" />
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 font-medium mb-1">Date of Birth</p>
                                    <p className="text-sm text-gray-900">
                                        {user.date_of_birth
                                            ? new Date(user.date_of_birth).toLocaleDateString('vi-VN')
                                            : 'Not provided'
                                        }
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 font-medium mb-1">Gender</p>
                                    <p className="text-sm text-gray-900">
                                        {user.gender
                                            ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
                                            : 'Not provided'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Favorite Sports */}
                        {user.favorite_sports && user.favorite_sports.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Favorite Sports</h3>
                                <div className="flex flex-wrap gap-2">
                                    {user.favorite_sports.map((sport, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
                                        >
                                            {sport}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Account Status */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Shield size={20} className="text-blue-600" />
                                Account Status
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 font-medium mb-2">Verification Status</p>
                                    <div className="flex items-center gap-2">
                                        {user.is_verified ? (
                                            <>
                                                <CheckCircle size={18} className="text-green-600" />
                                                <span className="text-sm font-medium text-green-600">Verified</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={18} className="text-red-600" />
                                                <span className="text-sm font-medium text-red-600">Not Verified</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 font-medium mb-2">Account Status</p>
                                    <div className="flex items-center gap-2">
                                        {user.is_active ? (
                                            <>
                                                <CheckCircle size={18} className="text-green-600" />
                                                <span className="text-sm font-medium text-green-600">Active</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={18} className="text-red-600" />
                                                <span className="text-sm font-medium text-red-600">Inactive</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timestamps */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Timeline</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Created At</span>
                                    <span className="text-sm font-medium text-gray-900">{formatDate(user.created_at)}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Last Updated</span>
                                    <span className="text-sm font-medium text-gray-900">{formatDate(user.updated_at)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-200">
                        <div className="flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
