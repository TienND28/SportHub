import { useState, useEffect } from 'react';
import { AdminLayout, UserDetailModal, ConfirmDialog } from '../../components';
import { adminService } from '../../services/admin/user.admin.service';
import type { User, GetAllUsersParams } from '../../services/admin/user.admin.service';
import {
    Search,
    Filter,
    UserPlus,
    Trash2,
    Ban,
    ChevronLeft,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'react-toastify';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    });

    // Filters
    const [filters, setFilters] = useState<GetAllUsersParams>({
        search: '',
        role: '',
        is_active: '',
        sortBy: 'created_at',
        sortOrder: 'desc',
        page: 1,
        limit: 10
    });

    const [showFilters, setShowFilters] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant: 'danger' | 'warning' | 'info';
        confirmText?: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        variant: 'warning'
    });

    // Fetch users
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await adminService.getAllUsers(filters);
            setUsers(response.data);
            setPagination(response.pagination);
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [filters]);

    // Handle search
    const handleSearch = (value: string) => {
        setFilters(prev => ({ ...prev, search: value, page: 1 }));
    };

    // Handle filter change
    const handleFilterChange = (key: keyof GetAllUsersParams, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    // Handle page change
    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    // Handle toggle status
    const handleToggleStatus = async (user: User) => {
        const action = user.is_active ? 'deactivate' : 'activate';

        setConfirmDialog({
            isOpen: true,
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
            message: `Are you sure you want to ${action} ${user.full_name}? ${user.is_active ? 'This user will not be able to access the system.' : 'This user will be able to access the system again.'}`,
            variant: user.is_active ? 'warning' : 'info',
            confirmText: action.charAt(0).toUpperCase() + action.slice(1),
            onConfirm: async () => {
                const oldStatus = user.is_active;

                // Optimistic update
                setUsers(prev => prev.map(u =>
                    u.id === user.id ? { ...u, is_active: !u.is_active } : u
                ));

                try {
                    await adminService.toggleUserStatus(user.id);
                    toast.success(`User ${oldStatus ? 'deactivated' : 'activated'} successfully`);
                } catch (error: any) {
                    // Rollback on error
                    setUsers(prev => prev.map(u =>
                        u.id === user.id ? { ...u, is_active: oldStatus } : u
                    ));
                    toast.error(error.message || 'Failed to toggle user status');
                }
            }
        });
    };

    // Handle delete user
    const handleDeleteUser = async (user: User) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete User',
            message: `Are you sure you want to delete ${user.full_name}? This action cannot be undone and all user data will be permanently removed.`,
            variant: 'danger',
            confirmText: 'Delete',
            onConfirm: async () => {
                // Optimistic update
                setUsers(prev => prev.filter(u => u.id !== user.id));
                setPagination(prev => ({ ...prev, total: prev.total - 1 }));

                try {
                    await adminService.deleteUser(user.id);
                    toast.success('User deleted successfully');
                } catch (error: any) {
                    // Rollback on error - refetch to restore
                    toast.error(error.message || 'Failed to delete user');
                    fetchUsers();
                }
            }
        });
    };

    // Handle role change
    const handleRoleChange = async (user: User, newRole: string) => {
        const oldRole = user.role;

        setConfirmDialog({
            isOpen: true,
            title: 'Change User Role',
            message: `Are you sure you want to change ${user.full_name}'s role from "${oldRole}" to "${newRole}"? This will affect their permissions and access level.`,
            variant: 'warning',
            confirmText: 'Change Role',
            onConfirm: async () => {
                // Optimistic update
                setUsers(prev => prev.map(u =>
                    u.id === user.id ? { ...u, role: newRole } : u
                ));

                try {
                    await adminService.updateUserRole(user.id, newRole);
                    toast.success('Role updated successfully');
                } catch (error: any) {
                    // Rollback on error
                    setUsers(prev => prev.map(u =>
                        u.id === user.id ? { ...u, role: oldRole } : u
                    ));
                    toast.error(error.message || 'Failed to update role');
                }
            }
        });
    };

    // Handle open user detail modal
    const handleOpenUserDetail = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    // Handle close user detail modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedUser(null), 300); // Clear after animation
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                        <p className="text-gray-500 mt-1">Manage all users in the system</p>
                    </div>
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        <UserPlus size={20} />
                        Add User
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={filters.search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>

                        {/* Filter Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors",
                                showFilters ? "bg-blue-50 border-blue-500 text-blue-600" : "border-gray-300 hover:bg-gray-50"
                            )}
                        >
                            <Filter size={20} />
                            Filters
                        </button>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={filters.role}
                                    onChange={(e) => handleFilterChange('role', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                >
                                    <option value="">All Roles</option>
                                    <option value="customer">Customer</option>
                                    <option value="owner">Owner</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={filters.is_active}
                                    onChange={(e) => handleFilterChange('is_active', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                >
                                    <option value="">All Status</option>
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                >
                                    <option value="created_at">Created Date</option>
                                    <option value="updated_at">Updated Date</option>
                                    <option value="full_name">Name</option>
                                    <option value="email">Email</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                                <select
                                    value={filters.sortOrder}
                                    onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                >
                                    <option value="desc">Descending</option>
                                    <option value="asc">Ascending</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No users found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Verified
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Joined
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((user) => (
                                            <tr
                                                key={user.id}
                                                onClick={() => handleOpenUserDetail(user)}
                                                className="hover:bg-blue-50 transition-colors cursor-pointer"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            {user.avatar ? (
                                                                <img className="h-10 w-10 rounded-full object-cover" src={user.avatar} alt="" />
                                                            ) : (
                                                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold">
                                                                    {user.full_name.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {user.full_name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={user.role}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={(e) => {
                                                            const newRole = e.target.value;
                                                            if (newRole !== user.role) {
                                                                handleRoleChange(user, newRole);
                                                                // Reset to current role immediately (will be updated after confirmation)
                                                                e.target.value = user.role;
                                                            }
                                                        }}
                                                        className={cn(
                                                            "px-3 py-1 text-xs font-semibold rounded-full border-2 outline-none cursor-pointer transition-colors",
                                                            user.role === 'admin' && "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
                                                            user.role === 'owner' && "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
                                                            user.role === 'customer' && "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                                        )}
                                                    >
                                                        <option value="customer">Customer</option>
                                                        <option value="owner">Owner</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={cn(
                                                        "px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full",
                                                        user.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                    )}>
                                                        {user.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            const oldVerified = user.is_verified;

                                                            // Optimistic update
                                                            setUsers(prev => prev.map(u =>
                                                                u.id === user.id ? { ...u, is_verified: !u.is_verified } : u
                                                            ));

                                                            try {
                                                                await adminService.toggleUserVerified(user.id);
                                                                toast.success(`User ${oldVerified ? 'unverified' : 'verified'} successfully`);
                                                            } catch (error: any) {
                                                                // Rollback on error
                                                                setUsers(prev => prev.map(u =>
                                                                    u.id === user.id ? { ...u, is_verified: oldVerified } : u
                                                                ));
                                                                toast.error(error.message || 'Failed to toggle verified status');
                                                            }
                                                        }}
                                                        className={cn(
                                                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                                                            user.is_verified ? "bg-green-500" : "bg-gray-300"
                                                        )}
                                                    >
                                                        <span
                                                            className={cn(
                                                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                                                user.is_verified ? "translate-x-6" : "translate-x-1"
                                                            )}
                                                        />
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleToggleStatus(user);
                                                            }}
                                                            className={cn(
                                                                "p-2 rounded-lg transition-colors",
                                                                user.is_active
                                                                    ? "text-orange-600 hover:text-orange-900 hover:bg-orange-50"
                                                                    : "text-green-600 hover:text-green-900 hover:bg-green-50"
                                                            )}
                                                            title={user.is_active ? "Deactivate" : "Activate"}
                                                        >
                                                            <Ban size={18} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteUser(user);
                                                            }}
                                                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                                    <span className="font-medium">
                                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                                    </span>{' '}
                                    of <span className="font-medium">{pagination.total}</span> results
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <span className="px-4 py-2 text-sm font-medium text-gray-700">
                                        Page {pagination.page} of {pagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page === pagination.totalPages}
                                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* User Detail Modal */}
            <UserDetailModal
                user={selectedUser}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmText={confirmDialog.confirmText}
                variant={confirmDialog.variant}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            />
        </AdminLayout>
    );
}
