import React, { useState, useEffect } from 'react';
import {
    BedDouble,
    Users,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Wrench,
    TrendingUp,
    Loader2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import reportService from '../services/reportService';
import { getAllTasks, getAllMaintenanceRequests } from '../services/housekeepingService';
import api from '../services/api';

const StatCard = ({ title, value, icon: Icon, bgColor, textColor, loading }) => (
    <div className="card-hover">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                {loading ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-2"></div>
                ) : (
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
                )}
            </div>
            <div className={`w-14 h-14 ${bgColor} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-7 h-7 ${textColor}`} />
            </div>
        </div>
    </div>
);

const ManagerDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        overview: null,
        tasks: [],
        maintenance: [],
        bookings: []
    });

    useEffect(() => {
        fetchManagerData();
    }, []);

    const fetchManagerData = async () => {
        try {
            setLoading(true);
            const [overview, tasks, maintenance, bookingsRes] = await Promise.all([
                reportService.getDashboardOverview(),
                getAllTasks(),
                getAllMaintenanceRequests(),
                api.get('/reservations?today=true') // Assuming backend supports today filter or handling client side
            ]);

            setData({
                overview,
                tasks,
                maintenance,
                bookings: bookingsRes.data
            });
        } catch (err) {
            console.error('Failed to fetch manager dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <Loader2 className="animate-spin w-12 h-12 text-primary-600" />
            <p className="text-gray-500 font-medium">Loading manager dashboard...</p>
        </div>
    );

    const roomStatusData = [
        { name: 'Available', value: data.overview?.roomStatus?.available || 0, color: '#3b82f6' },
        { name: 'Occupied', value: data.overview?.roomStatus?.occupied || 0, color: '#0ea5e9' },
        { name: 'Cleaning', value: data.overview?.roomStatus?.cleaning || 0, color: '#f59e0b' },
        { name: 'Maintenance', value: data.overview?.roomStatus?.maintenance || 0, color: '#ef4444' },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
                    <p className="text-gray-600 mt-1">Today's operations overview and pending tasks.</p>
                </div>
                <button onClick={fetchManagerData} className="btn btn-secondary flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Refresh Data</span>
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <StatCard
                    title="Total Revenue"
                    value={`$${data.overview?.stats?.totalRevenue || 0}`}
                    icon={TrendingUp}
                    bgColor="bg-primary-100"
                    textColor="text-primary-600"
                />
                <StatCard
                    title="Room Occupancy"
                    value={`${data.overview?.stats?.occupancyRate || 0}%`}
                    icon={Users}
                    bgColor="bg-blue-100"
                    textColor="text-blue-600"
                />
                <StatCard
                    title="Total Bookings"
                    value={data.overview?.stats?.totalBookings || 0}
                    icon={CheckCircle}
                    bgColor="bg-blue-100"
                    textColor="text-blue-600"
                />
                <StatCard
                    title="Pending Tasks"
                    value={data.tasks.filter(t => t.status !== 'completed').length}
                    icon={Clock}
                    bgColor="bg-yellow-100"
                    textColor="text-yellow-600"
                />
                <StatCard
                    title="Open Maintenance"
                    value={data.maintenance.filter(m => m.status !== 'resolved').length}
                    icon={Wrench}
                    bgColor="bg-red-100"
                    textColor="text-red-600"
                />
            </div>

            {/* Room Status Chart & Tasks */}
            {/* Room Status Chart & Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={roomStatusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {roomStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Staff Activity & Bookings */}
                <div className="card lg:col-span-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Activity</h3>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                        {data.tasks.filter(t => t.status === 'completed').slice(0, 5).length > 0 ? (
                            data.tasks.filter(t => t.status === 'completed').slice(0, 5).map((task) => (
                                <div key={task._id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Task Completed</p>
                                        <p className="text-xs text-gray-500">Room {task.roomNumber} cleaned</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 italic">No recent staff activity completed.</p>
                        )}
                        {/* Mocking some activity if list is empty for visualization */}
                        {data.tasks.length === 0 && (
                            <>
                                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg opacity-60">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Shift Started</p>
                                        <p className="text-xs text-gray-500">Sarah J. clocked in</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg opacity-60">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                                        <Wrench className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Maintenance</p>
                                        <p className="text-xs text-gray-500">AC repair in Room 302</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Guest Feedback (Mock) */}
                <div className="card lg:col-span-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Feedback</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-yellow-400">★★★★★</span>
                                <span className="text-xs text-gray-500">2 mins ago</span>
                            </div>
                            <p className="text-sm text-gray-800 font-medium">"Amazing service! The room was spotless."</p>
                            <p className="text-xs text-gray-500 mt-1">- John D. (Room 101)</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-yellow-400">★★★★☆</span>
                                <span className="text-xs text-gray-500">1 hour ago</span>
                            </div>
                            <p className="text-sm text-gray-800 font-medium">"Great stay, but breakfast was a bit cold."</p>
                            <p className="text-xs text-gray-500 mt-1">- Sarah M. (Room 205)</p>
                        </div>
                        <div className="text-center mt-2">
                            <button className="text-sm text-primary-600 font-bold hover:underline">View All Feedback</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Bookings (Full Width) */}
            <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Recent Bookings</h3>
                <div className="space-y-3">
                    {data.overview?.recentBookings.slice(0, 5).map((booking) => (
                        <div key={booking._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                    <Users className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{booking.guestId?.userId?.name || 'Guest'}</p>
                                    <p className="text-sm text-gray-600">Room {booking.roomId?.roomNumber} • {booking.status}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                {booking.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
