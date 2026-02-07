import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Search,
    Filter,
    Mail,
    Phone,
    Shield,
    MoreVertical,
    Edit,
    Trash2,
    Loader2,
    UserCircle,
    X,
    AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { updateUserStatus, updateUser } from '../services/userService';
import { useAuth } from '../context/AuthContext';

const UserManagement = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDepartment, setFilterDepartment] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'staff',
        department: 'Front Office',
        status: 'pending',
        contactInfo: { phone: '' }
    });
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (err) {
            console.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (userId, newStatus) => {
        try {
            await api.put(`/users/${userId}/status`, { status: newStatus });
            fetchUsers(); // Refresh list after update
            alert(`User successfully ${newStatus}`);
        } catch (err) {
            console.error('Status update error:', err);
            alert(err.response?.data?.message || 'Failed to update user status');
        }
    };

    const handleRoleUpdate = async (user, newRole) => {
        try {
            // Optimistic UI update - update local state immediately
            setUsers(prevUsers =>
                prevUsers.map(u =>
                    u._id === user._id ? { ...u, role: newRole } : u
                )
            );

            // Then update backend
            await api.put(`/users/${user._id}/role`, { role: newRole });
        } catch (error) {
            console.error('Failed to update user role:', error);
            alert('Failed to update user role. Please try again.');
            // Revert on error
            fetchUsers();
        }
    };

    const validateEmail = (email) => {
        return /^\S+@\S+\.\S+$/.test(email);
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();

        // Frontend Validation
        if (newUser.name.length < 2) {
            setCreateError('Name must be at least 2 characters');
            return;
        }
        if (!validateEmail(newUser.email)) {
            setCreateError('Please enter a valid email address');
            return;
        }
        if (newUser.password.length < 6) {
            setCreateError('Password must be at least 6 characters');
            return;
        }

        try {
            setCreateLoading(true);
            setCreateError('');

            await api.post('/users', newUser);

            setIsAddModalOpen(false);
            fetchUsers();

            setNewUser({
                name: '',
                email: '',
                password: '',
                role: 'staff',
                department: 'Front Office',
                status: 'pending',
                contactInfo: { phone: '' }
            });
        } catch (err) {
            setCreateError(err.response?.data?.message || 'Failed to create user');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            setNewUser({ ...newUser, contactInfo: { ...newUser.contactInfo, phone: value } });
        } else {
            setNewUser({ ...newUser, [name]: value });
        }
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            setEditingUser({ ...editingUser, contactInfo: { ...editingUser.contactInfo, phone: value } });
        } else {
            setEditingUser({ ...editingUser, [name]: value });
        }
    };

    const handleEditClick = (user) => {
        setEditingUser({
            ...user,
            department: user.department || '', // aggregated from backend
            contactInfo: { phone: user.contactInfo?.phone || '' }
        });
        setIsEditModalOpen(true);
        setEditError('');
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();

        // Frontend Validation
        if (editingUser.name.length < 2) {
            setEditError('Name must be at least 2 characters');
            return;
        }
        if (!validateEmail(editingUser.email)) {
            setEditError('Please enter a valid email address');
            return;
        }

        try {
            setEditLoading(true);
            setEditError('');
            await updateUser(editingUser._id, {
                name: editingUser.name,
                email: editingUser.email,
                role: editingUser.role,
                status: editingUser.status,
                department: editingUser.department,
                contactInfo: editingUser.contactInfo
            });
            setIsEditModalOpen(false);
            fetchUsers();
        } catch (err) {
            setEditError(err.response?.data?.message || 'Failed to update user');
        } finally {
            setEditLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
        const matchesDepartment = filterDepartment === 'all' || (user.department || '-') === filterDepartment;
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesRole && matchesStatus && matchesSearch && matchesDepartment;
    });

    const departments = ['all', ...new Set(users.map(u => u.department || '-').filter(Boolean))];

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <Loader2 className="animate-spin w-12 h-12 text-primary-600" />
            <p className="text-gray-500 font-medium">Loading user database...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-heading">User Management</h1>
                    <p className="text-gray-500 mt-1">Manage system access, roles, and staff profiles.</p>
                </div>
                {user?.role === 'admin' && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="btn btn-primary flex items-center space-x-2"
                    >
                        <UserPlus className="w-5 h-5" />
                        <span>Add New User</span>
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none text-gray-900 font-medium"
                    />
                </div>
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="bg-transparent border-none text-sm font-bold text-gray-900 focus:ring-0 cursor-pointer"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="staff">Staff</option>
                            <option value="guest">Guest</option>
                        </select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-transparent border-none text-sm font-bold text-gray-900 focus:ring-0 cursor-pointer"
                        >
                            <option value="all">All Statuses</option>
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                            <option value="deactivated">Deactivated</option>
                        </select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={filterDepartment}
                            onChange={(e) => setFilterDepartment(e.target.value)}
                            className="bg-transparent border-none text-sm font-bold text-gray-900 focus:ring-0 cursor-pointer"
                        >
                            <option value="all">All Depts</option>
                            {departments.filter(d => d !== 'all').map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Contact Info</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Department</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                                                <p className="text-xs text-gray-500">ID: {user._id.slice(-6).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Mail className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                                {user.email}
                                            </div>
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Phone className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                                {user.contactInfo?.phone || 'No phone'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleUpdate(user, e.target.value)}
                                                className="bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-primary-500 text-sm font-bold text-gray-900 dark:text-white capitalize focus:outline-none cursor-pointer py-1 pr-6"
                                            >
                                                <option value="admin" className="bg-white dark:bg-navy-900 text-gray-900 dark:text-white">Admin</option>
                                                <option value="staff" className="bg-white dark:bg-navy-900 text-gray-900 dark:text-white">Staff</option>
                                                <option value="guest" className="bg-white dark:bg-navy-900 text-gray-900 dark:text-white">Guest</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-500 font-medium">
                                            {user.role === 'guest' ? '-' : (user.department || 'N/A')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                                            user.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                                user.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                                                    user.status === 'deactivated' ? 'bg-slate-100 text-slate-600' :
                                                        'bg-gray-50 text-gray-600'
                                            }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end space-x-2">
                                            {/* Status Toggle Buttons */}
                                            {user.status !== 'approved' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(user._id, 'approved')}
                                                    className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 transition-colors uppercase tracking-wider"
                                                    title="Approve User"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {user.status !== 'rejected' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(user._id, 'rejected')}
                                                    className="px-3 py-1 bg-rose-600 text-white text-[10px] font-bold rounded-lg hover:bg-rose-700 transition-colors uppercase tracking-wider"
                                                    title="Reject User"
                                                >
                                                    Reject
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleStatusUpdate(user._id, user.status === 'deactivated' ? 'approved' : 'deactivated')}
                                                className={`p-2 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-lg transition-colors group ${user.status === 'deactivated' ? 'text-emerald-500' : 'text-gray-400'}`}
                                                title={user.status === 'deactivated' ? "Activate User" : "Deactivate User"}
                                            >
                                                <Shield className={`w-5 h-5 ${user.status === 'deactivated' ? 'fill-emerald-500/10' : ''}`} />
                                            </button>
                                            <button
                                                onClick={() => handleEditClick(user)}
                                                className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-lg transition-colors group"
                                                title="Edit User"
                                            >
                                                <Edit className="w-5 h-5 group-hover:text-primary-600" />
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm('Are you sure you want to delete this user?')) {
                                                        try {
                                                            await api.delete(`/users/${user._id}`);
                                                            fetchUsers();
                                                        } catch (err) {
                                                            alert('Failed to delete user');
                                                        }
                                                    }
                                                }}
                                                className="p-2 hover:bg-rose-50 rounded-lg text-gray-500 hover:text-rose-600 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="p-10 text-center">
                        <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-gray-900 font-bold">No users found</h3>
                        <p className="text-gray-500 text-sm mt-1">Try changing your search or role filters.</p>
                    </div>
                )}
            </div>

            {/* Add User Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-primary-100 rounded-xl text-primary-600">
                                    <UserPlus className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Add New System User</h2>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            {createError && (
                                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    {createError}
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    value={newUser.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-gray-900 transition-all"
                                    placeholder="e.g. John Smith"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={newUser.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-gray-900 transition-all"
                                    placeholder="smith@example.com"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Initial Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    value={newUser.password}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-gray-900 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">System Role</label>
                                <select
                                    name="role"
                                    required
                                    value={newUser.role}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-gray-900 cursor-pointer transition-all"
                                >
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                    <option value="guest">Guest</option>
                                </select>
                            </div>

                            {newUser.role === 'staff' && (
                                <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Department</label>
                                    <select
                                        name="department"
                                        required
                                        value={newUser.department}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-gray-900 cursor-pointer transition-all"
                                    >
                                        <option value="Front Office">Front Office (Reception)</option>
                                        <option value="Housekeeping">Housekeeping</option>
                                        <option value="Management">Management</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Kitchen">Kitchen</option>
                                        <option value="Security">Security</option>
                                    </select>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Account Status</label>
                                <select
                                    name="status"
                                    value={newUser.status}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-gray-900 cursor-pointer transition-all"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="deactivated">Deactivated</option>
                                </select>
                            </div>

                            <div className="pt-4 flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 px-4 py-3 border border-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="flex-1 px-4 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-gray-200"
                                >
                                    {createLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <UserPlus className="w-5 h-5" />
                                            <span>Create User</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div >
            )}
            {/* Edit User Modal */}
            {
                isEditModalOpen && editingUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                                        <Edit className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Edit User Details</h2>
                                </div>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                                {editError && (
                                    <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-2" />
                                        {editError}
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        value={editingUser.name}
                                        onChange={handleEditInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-gray-900 transition-all"
                                        placeholder="e.g. John Smith"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        value={editingUser.email}
                                        onChange={handleEditInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-gray-900 transition-all"
                                        placeholder="smith@example.com"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
                                    <input
                                        name="phone"
                                        type="text"
                                        value={editingUser.contactInfo?.phone}
                                        onChange={handleEditInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-gray-900 transition-all"
                                        placeholder="e.g. +1 234 567 890"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">System Role</label>
                                    <select
                                        name="role"
                                        value={editingUser.role}
                                        onChange={handleEditInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-gray-900 cursor-pointer transition-all"
                                    >
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                        <option value="guest">Guest</option>
                                    </select>
                                </div>

                                {editingUser.role !== 'guest' && (
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Department</label>
                                        <input
                                            name="department"
                                            type="text"
                                            required
                                            value={editingUser.department || ''}
                                            onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-gray-900 transition-all"
                                            placeholder="e.g. Front Office"
                                        />
                                    </div>
                                )}

                                <div className="pt-4 flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="flex-1 px-4 py-3 border border-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editLoading}
                                        className="flex-1 px-4 py-3 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg"
                                    >
                                        {editLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Edit className="w-5 h-5" />
                                                <span>Update User</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default UserManagement;
