import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Loader2,
    CheckCircle,
    XCircle,
    Search,
    Filter,
    Clock,
    User,
    ArrowRight,
    MoreVertical,
    CheckCircle2,
    CalendarCheck,
    LogOut,
    Ban,
    Plus,
    X,
    AlertCircle
} from 'lucide-react';
import { getAllBookings, createBooking as createBookingApi, checkIn as checkInApi, checkOut as checkOutApi, cancelBooking as cancelBookingApi } from '../services/reservationService';
import { getSettings } from '../services/settingsService';
import api from '../services/api';

const StatusBadge = ({ status }) => {
    const configs = {
        'confirmed': { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Confirmed' },
        'checked-in': { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Checked In' },
        'checked-out': { bg: 'bg-gray-50', text: 'text-gray-600', label: 'Checked Out' },
        'cancelled': { bg: 'bg-rose-50', text: 'text-rose-600', label: 'Cancelled' },
        'canceled': { bg: 'bg-rose-50', text: 'text-rose-600', label: 'Cancelled' },
        'pending': { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Pending' }
    };

    const config = configs[status.toLowerCase()] || configs['pending'];

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${config.bg} ${config.text}`}>
            {config.label}
        </span>
    );
};

const ReservationManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [taxRate, setTaxRate] = useState(0);

    // Modal states
    const [users, setUsers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [formData, setFormData] = useState({
        guestId: '',
        roomId: '',
        checkInDate: '',
        checkOutDate: '',
        totalAmount: 0
    });
    const [editingBooking, setEditingBooking] = useState(null);
    const [editFormData, setEditFormData] = useState({
        roomId: '',
        checkInDate: '',
        checkOutDate: '',
        totalAmount: 0
    });
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [editSelectedRoom, setEditSelectedRoom] = useState(null);
    const [modalError, setModalError] = useState('');
    const [editModalError, setEditModalError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchBookings();
        fetchTaxRate();
    }, []);

    const fetchTaxRate = async () => {
        try {
            const settings = await getSettings();
            if (settings && settings.taxes) {
                setTaxRate(settings.taxes);
            }
        } catch (err) {
            console.error('Failed to fetch tax rate');
        }
    };

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const data = await getAllBookings();
            setBookings(data);
        } catch (err) {
            console.error('Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    const fetchCreationData = async () => {
        try {
            const usersRes = await api.get('/users');
            setUsers(usersRes.data.filter(u => u.role === 'guest'));
        } catch (err) {
            console.error('Failed to fetch users');
        }
    };

    const fetchAvailableRooms = async (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return;
        try {
            const res = await api.get(`/rooms/availability?checkInDate=${checkIn}&checkOutDate=${checkOut}`);
            setRooms(res.data);
        } catch (err) {
            console.error('Failed to fetch availability');
        }
    };

    const handleAction = async (id, action) => {
        try {
            if (action === 'checkin') await checkInApi(id);
            else if (action === 'checkout') await checkOutApi(id);
            else if (action === 'cancel') await cancelBookingApi(id);
            fetchBookings();
        } catch (err) {
            alert(`Failed to ${action}`);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setModalError('');

        // Basic date validation
        const checkIn = new Date(formData.checkInDate);
        const checkOut = new Date(formData.checkOutDate);

        if (checkOut <= checkIn) {
            setModalError('Check-out date must be strictly after Check-in date.');
            return;
        }

        if (formData.totalAmount <= 0) {
            setModalError('Total amount must be greater than 0. Please select room and dates.');
            return;
        }

        try {
            setIsSubmitting(true);
            await createBookingApi(formData);
            setShowAddModal(false);
            setFormData({
                guestId: '',
                roomId: '',
                checkInDate: '',
                checkOutDate: '',
                totalAmount: 0
            });
            fetchBookings();
        } catch (err) {
            setModalError(err.response?.data?.message || 'Error creating booking');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (booking) => {
        setEditingBooking(booking);
        setEditFormData({
            roomId: booking.roomId?._id || booking.roomId,
            checkInDate: new Date(booking.checkInDate).toISOString().split('T')[0],
            checkOutDate: new Date(booking.checkOutDate).toISOString().split('T')[0],
            totalAmount: booking.totalAmount
        });
        setEditSelectedRoom(booking.roomId);
        setShowEditModal(true);
        setEditModalError('');

        // Fetch rooms for these dates
        fetchAvailableRooms(
            new Date(booking.checkInDate).toISOString().split('T')[0],
            new Date(booking.checkOutDate).toISOString().split('T')[0]
        );
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setEditModalError('');

        const checkIn = new Date(editFormData.checkInDate);
        const checkOut = new Date(editFormData.checkOutDate);

        if (checkOut <= checkIn) {
            setEditModalError('Check-out date must be strictly after Check-in date.');
            return;
        }

        try {
            setIsSubmitting(true);
            await api.put(`/reservations/${editingBooking._id}`, editFormData);
            setShowEditModal(false);
            fetchBookings();
        } catch (err) {
            setEditModalError(err.response?.data?.message || 'Error updating booking');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Price calculation logic
    const calculateTotal = (room, checkIn, checkOut) => {
        if (!room || !checkIn || !checkOut) return 0;
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if (nights <= 0) return 0;
        const subtotal = nights * room.price;
        return subtotal + (subtotal * (taxRate / 100));
    };

    useEffect(() => {
        if (formData.checkInDate && formData.checkOutDate) {
            fetchAvailableRooms(formData.checkInDate, formData.checkOutDate);
        }
    }, [formData.checkInDate, formData.checkOutDate]);

    useEffect(() => {
        if (editFormData.checkInDate && editFormData.checkOutDate) {
            fetchAvailableRooms(editFormData.checkInDate, editFormData.checkOutDate);
        }
    }, [editFormData.checkInDate, editFormData.checkOutDate]);

    useEffect(() => {
        if (formData.roomId && rooms.length > 0) {
            const room = rooms.find(r => r._id === formData.roomId);
            if (room) {
                setSelectedRoom(room);
                const total = calculateTotal(room, formData.checkInDate, formData.checkOutDate);
                setFormData(prev => ({ ...prev, totalAmount: total }));
            }
        }
    }, [formData.roomId, rooms, formData.checkInDate, formData.checkOutDate]);

    useEffect(() => {
        if (editFormData.roomId && (rooms.length > 0 || editSelectedRoom)) {
            const room = rooms.find(r => r._id === editFormData.roomId) || (editSelectedRoom?._id === editFormData.roomId ? editSelectedRoom : null);
            if (room) {
                setEditSelectedRoom(room);
                const total = calculateTotal(room, editFormData.checkInDate, editFormData.checkOutDate);
                setEditFormData(prev => ({ ...prev, totalAmount: total }));
            }
        }
    }, [editFormData.roomId, rooms, editFormData.checkInDate, editFormData.checkOutDate]);

    const filteredBookings = bookings.filter(booking => {
        const guestName = (booking.guestId?.name || 'Guest').toLowerCase();
        const matchesSearch = guestName.includes(searchQuery.toLowerCase()) || booking._id.includes(searchQuery);
        const matchesStatus = filterStatus === 'All' || booking.status.toLowerCase() === filterStatus.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const stats = [
        { label: 'Total Bookings', value: bookings.length, icon: CalendarCheck, color: 'text-primary-600', bg: 'bg-primary-50' },
        { label: 'Active Check-ins', value: bookings.filter(b => b.status === 'checked-in').length, icon: LogOut, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Pending Arrival', value: bookings.filter(b => b.status === 'confirmed').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, icon: Ban, color: 'text-rose-600', bg: 'bg-rose-50' },
    ];

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <Loader2 className="animate-spin w-12 h-12 text-primary-600" />
            <p className="text-gray-500 font-medium">Loading reservations...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-heading">Reservation Management</h1>
                    <p className="text-gray-500 mt-1">Monitor and handle all guest bookings and check-ins.</p>
                </div>
                <button
                    onClick={() => {
                        setShowAddModal(true);
                        fetchCreationData();
                    }}
                    className="btn btn-primary flex items-center space-x-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Create Reservation</span>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by guest or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all text-gray-900 font-medium"
                    />
                </div>
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-transparent border-none text-sm font-bold text-gray-900 focus:ring-0 cursor-pointer"
                        >
                            <option value="All">All Status</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="checked-in">Checked In</option>
                            <option value="checked-out">Checked Out</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Reservations Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Booking ID</th>
                                <th className="px-6 py-4">Guest Information</th>
                                <th className="px-6 py-4">Room Details</th>
                                <th className="px-6 py-4">Stay Dates</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredBookings.map((booking) => (
                                <tr key={booking._id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 text-sm font-mono text-gray-400">
                                        #{booking._id.slice(-6).toUpperCase()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{booking.guestId?.name || 'Walk-in Guest'}</p>
                                                <p className="text-xs text-gray-500">{booking.guestId?.email || 'No email provided'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                                                {booking.roomId?.number || booking.roomId?.roomNumber || 'TBD'}
                                            </span>
                                            <span className="text-xs text-gray-500">{booking.roomId?.type || 'Standard'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2 text-sm">
                                            <div className="flex flex-col">
                                                <span className="text-gray-900 font-medium">{new Date(booking.checkInDate).toLocaleDateString()}</span>
                                                <span className="text-[10px] text-gray-500">Check-in</span>
                                            </div>
                                            <ArrowRight className="w-3 h-3 text-gray-300" />
                                            <div className="flex flex-col">
                                                <span className="text-gray-900 font-medium">{new Date(booking.checkOutDate).toLocaleDateString()}</span>
                                                <span className="text-[10px] text-gray-500">Check-out</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={booking.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end space-x-2">
                                            {booking.status === 'confirmed' && (
                                                <button
                                                    onClick={() => handleAction(booking._id, 'checkin')}
                                                    className="btn bg-primary-500 text-white hover:bg-primary-600 text-xs py-1.5 px-3 rounded-lg font-bold transition-all shadow-sm hover:shadow-md"
                                                >
                                                    Check-in
                                                </button>
                                            )}
                                            {booking.status === 'checked-in' && (
                                                <button
                                                    onClick={() => handleAction(booking._id, 'checkout')}
                                                    className="btn bg-emerald-500 text-white hover:bg-emerald-600 text-xs py-1.5 px-3 rounded-lg font-bold transition-all shadow-sm hover:shadow-md"
                                                >
                                                    Check-out
                                                </button>
                                            )}
                                            {['confirmed', 'pending'].includes(booking.status.toLowerCase()) && (
                                                <button
                                                    onClick={() => handleAction(booking._id, 'cancel')}
                                                    className="p-2 hover:bg-rose-50 rounded-lg text-gray-400 hover:text-rose-600 transition-colors"
                                                    title="Cancel Reservation"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredBookings.length === 0 && (
                    <div className="p-10 text-center">
                        <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-gray-900 font-bold">No reservations found</h3>
                        <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
            {/* Create Reservation Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Create Reservation</h2>
                                <p className="text-gray-500 text-sm mt-1">Book a room for a guest.</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateSubmit} className="p-8 space-y-6">
                            {modalError && (
                                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl flex items-center animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    {modalError}
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Select Guest</label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.guestId}
                                            onChange={(e) => setFormData({ ...formData, guestId: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none appearance-none text-gray-900 font-medium"
                                        >
                                            <option value="">Select a guest...</option>
                                            {users.map(user => (
                                                <option key={user._id} value={user._id}>
                                                    {user.name} ({user.email}) - {user.contactInfo?.phone || 'No phone'}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <User className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Room</label>
                                    <select
                                        required
                                        disabled={!formData.checkInDate || !formData.checkOutDate}
                                        value={formData.roomId}
                                        onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none disabled:opacity-50 text-gray-900 font-medium"
                                    >
                                        <option value="">{formData.checkInDate && formData.checkOutDate ? 'Select a room...' : 'Select stay dates first'}</option>
                                        {rooms.map(room => (
                                            <option key={room._id} value={room._id}>Room {room.roomNumber} - {room.type} (${room.price}/night)</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Check-in Date</label>
                                    <input
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        value={formData.checkInDate}
                                        onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none text-gray-900 font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Check-out Date</label>
                                    <input
                                        type="date"
                                        required
                                        min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                                        value={formData.checkOutDate}
                                        onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none text-gray-900 font-medium"
                                    />
                                </div>
                            </div>

                            {selectedRoom && formData.totalAmount > 0 && (
                                <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <CalendarCheck className="w-5 h-5 text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-primary-600 uppercase tracking-wider">Estimated Total (Incl. {taxRate}% Tax)</p>
                                            <p className="text-lg font-black text-primary-900">${formData.totalAmount.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-primary-600 uppercase tracking-wider">Stay Duration</p>
                                        <p className="text-lg font-black text-primary-900">
                                            {Math.ceil((new Date(formData.checkOutDate) - new Date(formData.checkInDate)) / (1000 * 60 * 60 * 24))} Nights
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn btn-primary px-10 py-2.5 text-lg font-bold flex items-center space-x-2"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : 'Book Now'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Reservation Modal */}
            {showEditModal && editingBooking && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Edit Reservation</h2>
                                <p className="text-gray-500 text-sm mt-1">Guest: {editingBooking.guestId?.name || 'Walk-in'}</p>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateSubmit} className="p-8 space-y-6">
                            {editModalError && (
                                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    {editModalError}
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Check-in Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={editFormData.checkInDate}
                                        onChange={(e) => setEditFormData({ ...editFormData, checkInDate: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Check-out Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={editFormData.checkOutDate}
                                        onChange={(e) => setEditFormData({ ...editFormData, checkOutDate: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Room</label>
                                <select
                                    required
                                    value={editFormData.roomId}
                                    onChange={(e) => setEditFormData({ ...editFormData, roomId: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                                >
                                    <option value={editingBooking.roomId?._id}>{editingBooking.roomId?.roomNumber ? `Room ${editingBooking.roomId.roomNumber} (Current)` : 'Current Room'}</option>
                                    {rooms.filter(r => r._id !== editingBooking.roomId?._id).map(room => (
                                        <option key={room._id} value={room._id}>Room {room.roomNumber} - {room.type} (${room.price}/night)</option>
                                    ))}
                                </select>
                            </div>

                            {editSelectedRoom && editFormData.totalAmount > 0 && (
                                <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <CalendarCheck className="w-5 h-5 text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-primary-600 uppercase tracking-wider">Updated Total (Incl. {taxRate}% Tax)</p>
                                            <p className="text-lg font-black text-primary-900">${editFormData.totalAmount.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-primary-600 uppercase tracking-wider">Stay Duration</p>
                                        <p className="text-lg font-black text-primary-900">
                                            {Math.ceil((new Date(editFormData.checkOutDate) - new Date(editFormData.checkInDate)) / (1000 * 60 * 60 * 24))} Nights
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn btn-primary px-10"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReservationManagement;
