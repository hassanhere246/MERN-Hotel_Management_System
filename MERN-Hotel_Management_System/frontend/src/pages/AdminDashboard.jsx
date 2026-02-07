import React, { useState, useEffect } from 'react';
import {
    Users,
    BedDouble,
    CalendarCheck,
    TrendingUp,
    DollarSign,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Loader2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import reportService from '../services/reportService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, loading }) => (
    <div className="card p-6 border-none dark:bg-navy-800 shadow-lg">
        <div className="flex justify-between items-start">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            {!loading && trend && (
                <div className={`flex items-center space-x-1 text-xs font-medium ${trend === 'up' ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    <span>{trend === 'up' ? '+' : '-'}{trendValue}%</span>
                    {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                </div>
            )}
        </div>
        <div className="mt-4">
            <h3 className="text-sm font-medium text-muted">{title}</h3>
            {loading ? (
                <div className="h-8 w-24 bg-gray-200 dark:bg-navy-700 animate-pulse rounded mt-1"></div>
            ) : (
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            )}
        </div>
    </div>
);

const AdminDashboard = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        stats: { totalRevenue: 0, totalBookings: 0, totalGuests: 0, occupancyRate: 0 },
        recentBookings: [],
        roomStatus: { available: 0, occupied: 0, cleaning: 0, maintenance: 0 },
        totalRooms: 0
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const overviewData = await reportService.getDashboardOverview();
            setData(overviewData);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        reportService.exportDashboardCSV(data);
    };

    const stats = [
        { title: t('total_revenue') || 'Total Revenue', value: `$${data.stats.totalRevenue}`, icon: DollarSign, trend: 'up', trendValue: '12', color: 'bg-primary-500', roles: ['admin', 'staff'] },
        { title: t('total_bookings') || 'Total Bookings', value: data.stats.totalBookings, icon: CalendarCheck, trend: 'up', trendValue: '8', color: 'bg-blue-500', roles: ['admin', 'staff'] },
        { title: t('total_guests') || 'Total Guests', value: data.stats.totalGuests, icon: Users, trend: 'down', trendValue: '3', color: 'bg-blue-600', roles: ['admin', 'staff'] },
        { title: t('occupancy_rate') || 'Room Occupancy', value: `${data.stats.occupancyRate}%`, icon: BedDouble, trend: 'up', trendValue: '5', color: 'bg-amber-500', roles: ['admin', 'staff'] },
    ].filter(stat => stat.roles.includes(user?.role));

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
            case 'checked-in': return 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
            case 'checked-out': return 'bg-gray-50 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400';
            case 'canceled': return 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400';
            default: return 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-heading">
                        {(user?.role === 'staff' && user?.department === 'Front Office') ? 'Receptionist Dashboard' : (t('dashboard_overview') || 'Dashboard Overview')}
                    </h1>
                    <p className="text-muted mt-1">
                        {(user?.role === 'staff' && user?.department === 'Front Office')
                            ? "Welcome to the front desk dashboard."
                            : (t('welcome_back_admin') || "Welcome back, Administrator. Here's what's happening today.")}
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    {user?.role === 'admin' && (
                        <button
                            onClick={handleExport}
                            className="btn bg-white dark:bg-navy-800 border border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-700"
                        >
                            {t('export') || 'Export Report'}
                        </button>
                    )}
                    <button
                        onClick={() => navigate('/dashboard/reservations')}
                        className="btn btn-primary"
                    >
                        {t('quick_booking') || 'Quick Booking'}
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} loading={loading} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Bookings Table */}
                <div className="lg:col-span-2 card overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('recent_bookings') || 'Recent Bookings'}</h2>
                        <button
                            onClick={() => navigate('/dashboard/reservations')}
                            className="text-primary-600 dark:text-cyan-400 hover:text-primary-700 dark:hover:text-cyan-300 font-medium text-sm"
                        >
                            {t('view_all') || 'View all'}
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="table-header">
                                <tr>
                                    <th className="px-6 py-4">{t('booking_id') || 'Booking ID'}</th>
                                    <th className="px-6 py-4">{t('guest') || 'Guest'}</th>
                                    <th className="px-6 py-4">{t('room') || 'Room'}</th>
                                    <th className="px-6 py-4">{t('check_in') || 'Check-in'}</th>
                                    <th className="px-6 py-4">{t('status') || 'Status'}</th>
                                    <th className="px-6 py-4">{t('amount') || 'Amount'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex justify-center items-center">
                                                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                                            </div>
                                        </td>
                                    </tr>
                                ) : data.recentBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-muted">
                                            No recent bookings found.
                                        </td>
                                    </tr>
                                ) : (
                                    data.recentBookings.map((booking) => (
                                        <tr key={booking._id} className="table-row">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">#{booking._id.substring(booking._id.length - 6).toUpperCase()}</td>
                                            <td className="px-6 py-4 text-sm text-body">{booking.guestId?.userId?.name || 'Unknown'}</td>
                                            <td className="px-6 py-4 text-sm text-muted">{booking.roomId?.type} {booking.roomId?.roomNumber}</td>
                                            <td className="px-6 py-4 text-sm text-muted">{new Date(booking.checkInDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">${booking.totalAmount}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Status Summary */}
                <div className="card p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('room_status') || 'Room Status'}</h2>
                    <div className="space-y-6">
                        {/* Available */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted flex items-center">
                                    <CheckCircle2 className="w-4 h-4 text-blue-500 mr-2" />
                                    {t('available') || 'Available'}
                                </span>
                                <span className="font-bold text-gray-900 dark:text-white">{data.roomStatus.available}</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 dark:bg-navy-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${(data.roomStatus.available / (data.totalRooms || 1)) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Occupied */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted flex items-center">
                                    <BedDouble className="w-4 h-4 text-blue-500 mr-2" />
                                    {t('occupied') || 'Occupied'}
                                </span>
                                <span className="font-bold text-gray-900 dark:text-white">{data.roomStatus.occupied}</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 dark:bg-navy-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${(data.roomStatus.occupied / (data.totalRooms || 1)) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Cleaning */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted flex items-center">
                                    <Clock className="w-4 h-4 text-amber-500 mr-2" />
                                    {t('cleaning') || 'Cleaning'}
                                </span>
                                <span className="font-bold text-gray-900 dark:text-white">{data.roomStatus.cleaning}</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 dark:bg-navy-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${(data.roomStatus.cleaning / (data.totalRooms || 1)) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Maintenance */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted flex items-center">
                                    <AlertCircle className="w-4 h-4 text-rose-500 mr-2" />
                                    {t('maintenance') || 'Maintenance'}
                                </span>
                                <span className="font-bold text-gray-900 dark:text-white">{data.roomStatus.maintenance}</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 dark:bg-navy-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-rose-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${(data.roomStatus.maintenance / (data.totalRooms || 1)) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {user?.role === 'admin' && (
                        <div className="mt-8 p-4 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-navy-800 dark:to-navy-800 rounded-xl border border-primary-100 dark:border-white/5">
                            <TrendingUp className="w-8 h-8 text-primary-600 dark:text-cyan-400 mb-2" />
                            <h4 className="font-bold text-gray-900 dark:text-white">{t('growth_month') || 'Growth Month'}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Your hotel revenue is up 12% compared to last month.</p>
                            <button
                                onClick={() => navigate('/dashboard/reports')}
                                className="btn btn-sm btn-ghost mt-3 text-primary-600 dark:text-cyan-400 hover:text-primary-700 dark:hover:text-cyan-300 font-bold"
                            >
                                {t('view_analytics') || 'View analytics →'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
