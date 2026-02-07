import React, { useEffect, useState } from 'react';
import {
    Calendar, User, CreditCard, Clock, ChevronRight,
    Wrench, X, Loader2, Star, Coffee, Truck, Bell,
    MessageSquare, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { createMaintenanceRequest } from '../services/housekeepingService';
import { submitFeedback } from '../services/feedbackService';
import { getAllServices, createServiceRequest, getMyServiceRequests } from '../services/serviceService';

const GuestDashboard = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [maintenanceRequests, setMaintenanceRequests] = useState([]);
    const [serviceRequests, setServiceRequests] = useState([]);
    const [availableServices, setAvailableServices] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals & Forms
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);

    const [maintenanceForm, setMaintenanceForm] = useState({ roomId: '', issueDescription: '', priority: 'Normal' });
    const [feedbackForm, setFeedbackForm] = useState({ bookingId: '', rating: 5, comments: '' });
    const [serviceForm, setServiceForm] = useState({ bookingId: '', serviceId: '', notes: '' });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bookingsRes, maintenanceRes, servicesRes, myServicesRes] = await Promise.all([
                    api.get(`/reservations/guest/${user._id}`),
                    api.get('/maintenance'),
                    getAllServices(),
                    getMyServiceRequests()
                ]);
                setBookings(bookingsRes.data);
                setMaintenanceRequests(maintenanceRes.data.filter(m => m.reportedBy?._id === user._id));
                setAvailableServices(servicesRes);
                setServiceRequests(myServicesRes);
            } catch (err) {
                console.error('Failed to fetch dashboard data');
            } finally {
                setLoading(false);
            }
        };
        if (user?._id) fetchData();
    }, [user]);

    const handleMaintenanceSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await createMaintenanceRequest(maintenanceForm);
            setShowMaintenanceModal(false);
            setMaintenanceForm({ roomId: '', issueDescription: '', priority: 'Normal' });
            alert('Maintenance issue reported successfully.');
            // Refresh requests
            const maintenanceRes = await api.get('/maintenance');
            setMaintenanceRequests(maintenanceRes.data.filter(m => m.reportedBy?._id === user._id));
        } catch (err) {
            alert('Failed to report issue.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await submitFeedback(feedbackForm);
            setShowFeedbackModal(false);
            setFeedbackForm({ bookingId: '', rating: 5, comments: '' });
            alert('Thank you for your feedback!');
        } catch (err) {
            alert('Failed to submit feedback.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleServiceSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await createServiceRequest(serviceForm);
            setShowServiceModal(false);
            setServiceForm({ bookingId: '', serviceId: '', notes: '' });
            alert('Service requested successfully!');
            // Refresh service requests
            const myServicesRes = await getMyServiceRequests();
            setServiceRequests(myServicesRes);
        } catch (err) {
            alert('Failed to request service.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getServiceIcon = (name) => {
        const n = name.toLowerCase();
        if (n.includes('food') || n.includes('room service') || n.includes('coffee')) return <Coffee className="w-5 h-5" />;
        if (n.includes('transport') || n.includes('taxi') || n.includes('airport')) return <Truck className="w-5 h-5" />;
        if (n.includes('wake') || n.includes('call')) return <Bell className="w-5 h-5" />;
        return <CheckCircle2 className="w-5 h-5" />;
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <Loader2 className="animate-spin w-12 h-12 text-cyan-600" />
            <p className="text-gray-500 font-bold">Initializing your luxury suite...</p>
        </div>
    );

    const activeMainBooking = bookings.find(b => b.status === 'checked-in') || bookings[0];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Welcome Section */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
                    <p className="text-gray-500 mt-2">Manage your stays and explore your luxury benefits.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            if (!activeMainBooking) return alert("You need a booking to request services.");
                            setServiceForm({ ...serviceForm, bookingId: activeMainBooking._id });
                            setShowServiceModal(true);
                        }}
                        className="btn bg-cyan-500 text-white hover:bg-cyan-600 flex items-center gap-2 shadow-lg shadow-cyan-100"
                    >
                        <Bell className="w-4 h-4" />
                        Request Service
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Bookings Overview */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Your Recent Bookings</h2>
                        <Link to="/dashboard/reservations" className="text-sm font-bold text-cyan-600 hover:text-cyan-700">View All</Link>
                    </div>

                    {bookings.length > 0 ? (
                        <div className="grid gap-4">
                            {bookings.map(booking => (
                                <div key={booking._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-soft hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600">
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 capitalize">{booking.roomId?.type || 'Room'} Class</p>
                                            <p className="text-sm text-gray-500">{new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${booking.status === 'confirmed' ? 'bg-blue-50 text-blue-600' :
                                                booking.status === 'checked-in' ? 'bg-green-50 text-green-600' :
                                                    'bg-amber-50 text-amber-600'
                                                }`}>
                                                {booking.status}
                                            </span>
                                            {['checked-in', 'checked-out'].includes(booking.status) && (
                                                <button
                                                    onClick={() => {
                                                        setFeedbackForm({ ...feedbackForm, bookingId: booking._id });
                                                        setShowFeedbackModal(true);
                                                    }}
                                                    className="text-[10px] font-bold text-cyan-600 hover:underline flex items-center gap-1"
                                                >
                                                    <Star className="w-3 h-3" />
                                                    Rate Stay
                                                </button>
                                            )}
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-cyan-500 transition-colors hidden sm:block" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-50 p-12 rounded-[40px] text-center border-2 border-dashed border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No active bookings</h3>
                            <p className="text-gray-500 mb-8">Ready for your next escape? Explore our premium suites.</p>
                            <Link to="/rooms" className="px-8 py-4 bg-cyan-500 text-white font-bold rounded-2xl shadow-xl hover:shadow-cyan-glow transition-all inline-block">Explore Rooms</Link>
                        </div>
                    )}

                    {/* Service Requests List */}
                    {serviceRequests.length > 0 && (
                        <div className="space-y-4 pt-4">
                            <h2 className="text-xl font-bold text-gray-900">Your Service Requests</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {serviceRequests.map(req => (
                                    <div key={req._id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-soft flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-2xl ${req.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                                                }`}>
                                                {getServiceIcon(req.serviceId?.name || '')}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{req.serviceId?.name || 'Service'}</p>
                                                <p className="text-[10px] text-gray-500">{new Date(req.requestedAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${req.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            req.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Details */}
                <div className="space-y-6">
                    {/* User Info */}
                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-3xl bg-gray-100 overflow-hidden mb-4 border-4 border-white shadow-lg">
                                {user?.profilePhoto ? (
                                    <img src={`http://localhost:5000/${user.profilePhoto}`} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-cyan-600">{user?.name?.charAt(0)}</div>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
                            <p className="text-gray-500 text-sm mb-6">{user?.email}</p>
                            <Link to="/dashboard/settings" className="w-full py-4 bg-gray-50 text-gray-900 font-bold rounded-2xl hover:bg-gray-100 transition-all">Edit Profile</Link>
                        </div>
                    </div>

                    {/* Maintenance Shortcut */}
                    <div className="bg-rose-50 p-6 rounded-[32px] border border-rose-100 flex items-center justify-between group cursor-pointer hover:bg-rose-100 transition-all"
                        onClick={() => {
                            const checkedInBooking = bookings.find(b => b.status === 'checked-in');
                            setMaintenanceForm({ ...maintenanceForm, roomId: checkedInBooking?.roomId?._id || '' });
                            setShowMaintenanceModal(true);
                        }}
                    >
                        <div className="flex items-center space-x-3 text-rose-600">
                            <Wrench className="w-5 h-5" />
                            <span className="font-bold">Room Maintenance?</span>
                        </div>
                        <span className="text-xs font-bold text-rose-500 group-hover:translate-x-1 transition-transform">Report Issue</span>
                    </div>

                    {/* Maintenance Requests List */}
                    {maintenanceRequests.length > 0 && (
                        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-soft">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest flex items-center">
                                <Wrench className="w-4 h-4 mr-2 text-rose-500" />
                                Your Requests
                            </h3>
                            <div className="space-y-4">
                                {maintenanceRequests.map(req => (
                                    <div key={req._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-gray-900 truncate">{req.issueDescription}</p>
                                            <p className="text-[10px] text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${req.status === 'resolved' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Maintenance Modal */}
            {showMaintenanceModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                <Wrench className="w-6 h-6 mr-3 text-rose-500" />
                                Report Issue
                            </h2>
                            <button onClick={() => setShowMaintenanceModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleMaintenanceSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500">Is something wrong with your room? Tell us what's happening and we'll fix it right away.</p>
                                {!maintenanceForm.roomId && (
                                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-xs font-bold">
                                        Note: You can only report issues if you have an active checked-in stay.
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Issue Description</label>
                                    <textarea
                                        required
                                        rows="3"
                                        placeholder="E.g. AC not cooling, sink leaking..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-bold text-gray-900 resize-none"
                                        value={maintenanceForm.issueDescription}
                                        onChange={(e) => setMaintenanceForm({ ...maintenanceForm, issueDescription: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 pt-6">
                                <button type="button" onClick={() => setShowMaintenanceModal(false)} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !maintenanceForm.roomId}
                                    className="px-8 py-3 bg-cyan-500 text-white font-bold rounded-xl hover:bg-cyan-600 shadow-lg shadow-cyan-100 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Report'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Feedback Modal */}
            {showFeedbackModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                <MessageSquare className="w-6 h-6 mr-3 text-cyan-500" />
                                Share Feedback
                            </h2>
                            <button onClick={() => setShowFeedbackModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleFeedbackSubmit} className="p-8 space-y-6">
                            <div className="flex flex-col items-center gap-4">
                                <p className="text-gray-500 font-medium">How was your stay?</p>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="transition-transform active:scale-95"
                                        >
                                            <Star
                                                className={`w-10 h-10 ${(hoverRating || feedbackForm.rating) >= star
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'text-gray-200'
                                                    } transition-colors`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Your Experience</label>
                                <textarea
                                    required
                                    rows="4"
                                    placeholder="Tell us everything! What did you love? What can we improve?"
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-bold text-gray-900 resize-none"
                                    value={feedbackForm.comments}
                                    onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-cyan-500 text-white font-bold rounded-2xl hover:bg-cyan-600 shadow-xl shadow-cyan-100 transition-all flex items-center justify-center"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Review'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Service Modal */}
            {showServiceModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                <Bell className="w-6 h-6 mr-3 text-cyan-500" />
                                Request Service
                            </h2>
                            <button onClick={() => setShowServiceModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleServiceSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {availableServices.map(service => (
                                    <button
                                        key={service._id}
                                        type="button"
                                        onClick={() => setServiceForm({ ...serviceForm, serviceId: service._id })}
                                        className={`p-6 rounded-3xl border-2 transition-all flex items-center gap-4 text-left ${serviceForm.serviceId === service._id
                                            ? 'border-cyan-500 bg-cyan-50'
                                            : 'border-gray-100 hover:border-cyan-200 bg-white'
                                            }`}
                                    >
                                        <div className={`p-3 rounded-2xl ${serviceForm.serviceId === service._id ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {getServiceIcon(service.name)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{service.name}</p>
                                            <p className="text-xs text-cyan-600 font-black">${service.price}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Special Requests / Notes</label>
                                <textarea
                                    rows="2"
                                    placeholder="Arrival time, dietary preferences, etc."
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-bold text-gray-900 resize-none"
                                    value={serviceForm.notes}
                                    onChange={(e) => setServiceForm({ ...serviceForm, notes: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting || !serviceForm.serviceId}
                                className="w-full py-4 bg-cyan-500 text-white font-bold rounded-2xl hover:bg-cyan-600 shadow-xl shadow-cyan-100 transition-all flex items-center justify-center disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Order'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GuestDashboard;
