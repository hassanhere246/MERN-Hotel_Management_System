import React, { useState, useEffect } from 'react';
import {
    Sparkles,
    Loader2,
    Clock,
    AlertTriangle,
    CheckCircle2,
    User,
    Home,
    Wrench,
    ArrowRight,
    Circle,
    Calendar,
    Search,
    X
} from 'lucide-react';
import { getAllTasks, updateTaskStatus, getAllMaintenanceRequests, assignTask as assignTaskApi, createMaintenanceRequest } from '../services/housekeepingService';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const HousekeepingDashboard = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [maintenance, setMaintenance] = useState([]);
    const [staff, setStaff] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(user?.department === 'Maintenance' ? 'maintenance' : 'housekeeping');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [newTask, setNewTask] = useState({ roomId: '', taskType: 'cleaning', scheduledAt: '' });
    const [newMaintenance, setNewMaintenance] = useState({ roomId: '', issueDescription: '', priority: 'Normal' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tasksData, maintenanceData, usersRes, roomsRes] = await Promise.all([
                getAllTasks(),
                getAllMaintenanceRequests(),
                api.get('/users'),
                api.get('/rooms')
            ]);
            setTasks(tasksData);
            setMaintenance(maintenanceData);
            setStaff(usersRes.data.filter(u => u.role === 'staff' && u.department === 'Housekeeping'));
            setRooms(roomsRes.data);
        } catch (err) {
            console.error('Failed to fetch housekeeping data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        try {
            await assignTaskApi({
                ...newTask,
                scheduledAt: newTask.scheduledAt || new Date()
            });
            setShowAddModal(false);
            fetchData();
        } catch (err) {
            alert('Failed to add task');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await updateTaskStatus(id, status);
            fetchData();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleAssignStaff = async (taskId, staffId) => {
        try {
            await api.put(`/housekeeping/${taskId}/status`, { assignedTo: staffId, status: 'in-progress' });
            fetchData();
        } catch (err) {
            alert('Failed to assign staff');
        }
    };

    const handleMaintenanceSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await createMaintenanceRequest(newMaintenance);
            setShowMaintenanceModal(false);
            setNewMaintenance({ roomId: '', issueDescription: '', priority: 'Normal' });
            fetchData();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to create maintenance request');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateMaintenanceStatus = async (id, status) => {
        try {
            await api.put(`/maintenance/${id}/status`, { status });
            fetchData();
        } catch (err) {
            alert('Failed to update maintenance status');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <Loader2 className="animate-spin w-12 h-12 text-primary-600" />
            <p className="text-gray-500 font-medium">Loading housekeeping data...</p>
        </div>
    );

    const stats = {
        pendingTasks: tasks.filter(t => t.status !== 'completed').length,
        urgentMaintenance: maintenance.filter(m => m.priority === 'High' || m.status === 'pending').length,
        completedToday: tasks.filter(t => t.status === 'completed').length
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-heading">Housekeeping & Maintenance</h1>
                    <p className="text-gray-500 mt-1">Monitor room cleanliness and infrastructure maintenance.</p>
                </div>
                <div className="flex items-center space-x-3">
                    {user?.role === 'admin' && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="btn btn-primary flex items-center space-x-2"
                        >
                            <Sparkles className="w-5 h-5" />
                            <span>Add Cleaning</span>
                        </button>
                    )}
                    {user?.role === 'admin' || user?.role === 'staff' && (
                        <button
                            onClick={() => setShowMaintenanceModal(true)}
                            className="btn bg-rose-50 text-rose-600 border border-rose-100 flex items-center space-x-2 hover:bg-rose-100 transition-colors"
                        >
                            <Wrench className="w-5 h-5" />
                            <span>Report Issue</span>
                        </button>
                    )}
                    <div className="flex p-1 bg-white border border-gray-100 rounded-2xl shadow-soft">
                        {(user?.role === 'admin' || (user?.role === 'staff' && user?.department === 'Housekeeping')) && (
                            <button
                                onClick={() => setActiveTab('housekeeping')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'housekeeping' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                Housekeeping
                            </button>
                        )}
                        {(user?.role === 'admin' || (user?.role === 'staff' && (user?.department === 'Maintenance' || user?.department === 'Housekeeping'))) && (
                            <button
                                onClick={() => setActiveTab('maintenance')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'maintenance' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                Maintenance
                            </button>
                        )}
                        {user?.role === 'admin' && (
                            <button
                                onClick={() => setActiveTab('rooms')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'rooms' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                Room Status
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-soft flex items-center space-x-4">
                    <div className="p-3 bg-amber-50 rounded-xl">
                        <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Pending Tasks</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.pendingTasks}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-soft flex items-center space-x-4">
                    <div className="p-3 bg-rose-50 rounded-xl">
                        <AlertTriangle className="w-6 h-6 text-rose-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Urgent Maintenance</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.urgentMaintenance}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-soft flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                        <CheckCircle2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Completed Today</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {activeTab === 'housekeeping' ? (
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <Sparkles className="w-5 h-5 mr-2 text-primary-500" />
                            Cleaning Schedule
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {tasks.map((task) => (
                                <div key={task._id} className={`bg-white p-5 rounded-2xl border ${!task.assignedTo ? 'border-amber-200 bg-amber-50/20' : 'border-gray-100'} shadow-soft hover:shadow-md transition-all group`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center font-bold text-primary-600 shadow-sm">
                                                {task.roomId?.roomNumber || task.roomId?.number || '??'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 capitalize">{task.taskType || 'Regular Cleaning'}</p>
                                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                                    <User className="w-3 h-3 mr-1" />
                                                    {task.assignedTo ? (
                                                        <span className="font-medium text-gray-700">Assigned: {task.assignedTo?.name}</span>
                                                    ) : (
                                                        <select
                                                            className="bg-transparent border-none p-0 text-amber-600 font-bold focus:ring-0 cursor-pointer"
                                                            onChange={(e) => handleAssignStaff(task._id, e.target.value)}
                                                            defaultValue=""
                                                        >
                                                            <option value="" disabled>Assign Staff...</option>
                                                            {staff.map(member => (
                                                                <option key={member._id} value={member._id}>{member.name}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${task.status === 'completed' ? 'bg-blue-50 text-blue-600' :
                                                task.status === 'in-progress' ? 'bg-blue-50 text-blue-600' :
                                                    'bg-amber-50 text-amber-600'
                                                }`}>
                                                {task.status}
                                            </span>
                                            {task.status !== 'completed' && task.assignedTo && (
                                                <button
                                                    onClick={() => handleStatusUpdate(task._id, 'completed')}
                                                    className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
                                                    title="Mark as Completed"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setNewMaintenance({ ...newMaintenance, roomId: task.roomId?._id });
                                                    setShowMaintenanceModal(true);
                                                }}
                                                className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                                title="Report Maintenance Issue"
                                            >
                                                <Wrench className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {tasks.length === 0 && (
                                <div className="p-8 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
                                    <Home className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-500 text-sm">No active cleaning tasks</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : activeTab === 'maintenance' ? (
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <Wrench className="w-5 h-5 mr-2 text-rose-500" />
                            Active Maintenance
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {maintenance.map((req) => (
                                <div key={req._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft hover:shadow-md transition-all">
                                    <div className="flex items-start justify-between">
                                        <div className="flex space-x-4">
                                            <div className="p-3 bg-rose-50 rounded-xl h-fit">
                                                <AlertTriangle className="w-5 h-5 text-rose-500" />
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-bold text-gray-900">Room {req.roomId?.number || 'N/A'}</span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${req.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {req.priority || 'Normal'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">{req.issueDescription || req.description || req.issue}</p>
                                                <div className="flex items-center text-[10px] text-gray-400 mt-2 space-x-3">
                                                    <span className="flex items-center">
                                                        <Calendar className="w-3 h-3 mr-1" />
                                                        {new Date(req.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center uppercase font-bold tracking-tighter">
                                                        <Circle className="w-2 h-2 mr-1 fill-amber-500 text-amber-500" />
                                                        {req.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {(req.status !== 'resolved' && (user?.role === 'admin' || (user?.role === 'staff' && user?.department === 'Maintenance'))) && (
                                            <button
                                                onClick={() => handleUpdateMaintenanceStatus(req._id, 'resolved')}
                                                className="text-primary-600 hover:text-primary-700 font-bold text-xs flex items-center"
                                            >
                                                Resolve <ArrowRight className="w-3 h-3 ml-1" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {maintenance.length === 0 && (
                                <div className="p-8 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
                                    <Wrench className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-500 text-sm">No pending maintenance requests</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <Home className="w-5 h-5 mr-2 text-primary-500" />
                            All Rooms Status
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {rooms.map((room) => (
                                <div key={room._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-700">
                                                {room.roomNumber}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{room.type}</p>
                                                <p className="text-[10px] text-gray-500 uppercase font-black">Floor {room.floor}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${room.status === 'available' ? 'bg-blue-50 text-blue-600' :
                                            room.status === 'occupied' ? 'bg-blue-50 text-blue-600' :
                                                room.status === 'cleaning' ? 'bg-amber-50 text-amber-600' :
                                                    'bg-rose-50 text-rose-600'
                                            }`}>
                                            {room.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {room.status === 'available' ? (
                                            <button
                                                onClick={() => {
                                                    setNewTask({ ...newTask, roomId: room._id });
                                                    setShowAddModal(true);
                                                }}
                                                className="flex-1 py-2 bg-gray-50 text-gray-600 text-[10px] font-bold rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors"
                                            >
                                                Schedule Cleaning
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setNewMaintenance({ ...newMaintenance, roomId: room._id });
                                                    setShowMaintenanceModal(true);
                                                }}
                                                className="flex-1 py-2 bg-gray-50 text-gray-600 text-[10px] font-bold rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                            >
                                                Report Maintenance
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
                }

                {/* Sidebar Widget */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest text-blue-600 flex items-center">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Daily Statistics
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500 font-bold">Tasks Completed</span>
                                <span className="text-blue-600 font-black">75%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">Urgent Attention</h3>
                        <div className="space-y-4">
                            {maintenance.filter(m => m.priority === 'High').slice(0, 2).map(m => (
                                <div key={m._id} className="flex items-center space-x-3 p-3 bg-rose-50 rounded-xl border border-rose-100">
                                    <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-gray-900 truncate">Room {m.roomId?.number}</p>
                                        <p className="text-[10px] text-rose-600 truncate">{m.issueDescription}</p>
                                    </div>
                                </div>
                            ))}
                            <button className="w-full py-2 text-xs font-bold text-gray-500 hover:text-primary-600 transition-colors border-t border-gray-50 mt-2">
                                View all maintenance logs
                            </button>
                        </div>
                    </div>
                </div>
            </div >
            {/* Add Task Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">New Housekeeping Task</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <AlertTriangle className="w-6 h-6 rotate-180" />
                            </button>
                        </div>
                        <form onSubmit={handleAddTask} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Select Room</label>
                                <select
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-900"
                                    value={newTask.roomId}
                                    onChange={(e) => setNewTask({ ...newTask, roomId: e.target.value })}
                                >
                                    <option value="">Select Room...</option>
                                    {rooms.map(room => (
                                        <option key={room._id} value={room._id}>Room {room.roomNumber} ({room.status})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Task Type</label>
                                <select
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-900"
                                    value={newTask.taskType}
                                    onChange={(e) => setNewTask({ ...newTask, taskType: e.target.value })}
                                >
                                    <option value="cleaning">Cleaning</option>
                                    <option value="restocking">Restocking</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Scheduled Date/Time</label>
                                <input
                                    type="datetime-local"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-900"
                                    value={newTask.scheduledAt}
                                    onChange={(e) => setNewTask({ ...newTask, scheduledAt: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-6">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                                <button type="submit" className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all">Create Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Add Maintenance Request Modal */}
            {showMaintenanceModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                <Wrench className="w-6 h-6 mr-3 text-rose-500" />
                                Report Maintenance Issue
                            </h2>
                            <button onClick={() => setShowMaintenanceModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleMaintenanceSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Select Room</label>
                                <select
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-900"
                                    value={newMaintenance.roomId}
                                    onChange={(e) => setNewMaintenance({ ...newMaintenance, roomId: e.target.value })}
                                >
                                    <option value="">Select Room...</option>
                                    {rooms.map(room => (
                                        <option key={room._id} value={room._id}>Room {room.roomNumber} ({room.status})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Issue Description</label>
                                <textarea
                                    required
                                    rows="3"
                                    placeholder="Describe what needs to be fixed..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-900 resize-none"
                                    value={newMaintenance.issueDescription}
                                    onChange={(e) => setNewMaintenance({ ...newMaintenance, issueDescription: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Priority Level</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Low', 'Normal', 'High'].map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setNewMaintenance({ ...newMaintenance, priority: p })}
                                            className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${newMaintenance.priority === p
                                                ? (p === 'High' ? 'bg-rose-500 border-rose-500 text-white shadow-md' :
                                                    p === 'Normal' ? 'bg-amber-500 border-amber-500 text-white shadow-md' :
                                                        'bg-primary-500 border-primary-500 text-white shadow-md')
                                                : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-6">
                                <button type="button" onClick={() => setShowMaintenanceModal(false)} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn btn-primary px-8 flex items-center space-x-2"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                        <>
                                            <Wrench className="w-4 h-4" />
                                            <span>Report Issue</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div >
    );
};

export default HousekeepingDashboard;
