import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createBooking } from '../services/reservationService';
import PublicLayout from '../components/public/PublicLayout';
import { Calendar, Users, Hotel, ChevronRight, Check, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';

const Booking = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { search } = useLocation();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // STEP HANDLING: 
    // Step 1: Selection & Availability
    // Step 2: Authentication Check (Login Prompt)
    // Step 3: Final Review & Backend Submission

    // localStorage USAGE: Persist user selection as they navigate through the auth flow
    const [formData, setFormData] = useState(() => {
        // Priority 1: URL Parameters (passed from Rooms page)
        const params = new URLSearchParams(search);
        const urlRoomType = params.get('roomType');

        // Priority 2: Saved selection from localStorage
        const saved = localStorage.getItem('pendingBooking');
        const parsedSaved = saved ? JSON.parse(saved) : null;

        return {
            checkIn: parsedSaved?.checkIn || '',
            checkOut: parsedSaved?.checkOut || '',
            guests: parsedSaved?.guests || '2 Guests',
            roomType: urlRoomType || parsedSaved?.roomType || 'single'
        };
    });

    // Save pre-filled data to localStorage immediately on mount if it came from URL
    useEffect(() => {
        const params = new URLSearchParams(search);
        if (params.get('roomType')) {
            localStorage.setItem('pendingBooking', JSON.stringify(formData));
        }
    }, [search]);

    const roomTypes = [
        { name: 'Single', price: 199, type: 'single', desc: 'Perfect for solo travelers' },
        { name: 'Double', price: 299, type: 'double', desc: 'Ideal for couples' },
        { name: 'Suite', price: 599, type: 'suite', desc: 'Absolute luxury & space' },
    ];

    const [availableRooms, setAvailableRooms] = useState([]);
    const [selectedRoomId, setSelectedRoomId] = useState(null);

    // REDIRECTION LOGIC: Restore pending booking after successful login
    useEffect(() => {
        const pending = localStorage.getItem('pendingBooking');
        // If user is logged in and we have data, skip the login prompt (Step 2)
        if (user && pending && step === 1) {
            setStep(3);
        }
    }, [user, step]);

    // Fetch rooms when we reach Step 3 (Confirmation)
    useEffect(() => {
        if (step === 3 && user) {
            fetchRooms();
        }
    }, [step, user, formData.checkIn, formData.checkOut]);

    const fetchRooms = async () => {
        try {
            const api = (await import('../services/api')).default;
            const res = await api.get(`/rooms/availability?checkInDate=${formData.checkIn}&checkOutDate=${formData.checkOut}`);
            setAvailableRooms(res.data);

            // Debug logging
            console.log('Available rooms:', res.data);
            console.log('Looking for room type:', formData.roomType);
            console.log('Available room types:', res.data.map(r => r.type));

            // Auto-pick first available room of selected type
            // Back-end uses 'type' field with values: single, double, suite (lowercase)
            const matched = res.data.find(r => r.type.toLowerCase() === formData.roomType.toLowerCase());
            console.log('Matched room:', matched);

            if (matched) {
                setSelectedRoomId(matched._id);
            } else {
                setSelectedRoomId(null);
            }
        } catch (err) {
            console.error('Failed to fetch rooms:', err);
        }
    };

    const handleChange = (e) => {
        const newFormData = { ...formData, [e.target.name]: e.target.value };
        setFormData(newFormData);
        // Persist as user types to prevent loss on refresh
        localStorage.setItem('pendingBooking', JSON.stringify(newFormData));
    };

    const handleCheckAvailability = (e) => {
        e.preventDefault();
        localStorage.setItem('pendingBooking', JSON.stringify(formData));
        if (user) {
            setStep(3);
        } else {
            setStep(2); // Prompt guest to sign in
        }
    };

    const handleConfirmBooking = async () => {
        if (!selectedRoomId) {
            // The UI already shows a warning message, no need for alert
            console.warn('No room selected. Please check availability or try different dates/room type.');
            return;
        }

        setLoading(true);
        try {
            // BACKEND INTEGRATION: Submit the stored data to the API with strict naming
            const bookingData = {
                guestId: user._id,               // Backend resolves User ID to GuestProfile ID
                roomId: selectedRoomId,          // Strict requirement: ObjectId
                checkInDate: formData.checkIn,   // Correct API field name
                checkOutDate: formData.checkOut, // Correct API field name
                totalAmount: parseFloat((parseFloat(totalPrice) * 1.1).toFixed(2)), // Numeric total with tax
            };

            await createBooking(bookingData);
            setSuccess(true);
            localStorage.removeItem('pendingBooking'); // Clear on success

            setTimeout(() => {
                // Redirect guests to rooms page, others to dashboard
                if (user.role === 'guest') {
                    navigate('/rooms');
                } else {
                    navigate('/dashboard');
                }
            }, 3000);
        } catch (err) {
            alert(err.response?.data?.message || 'Booking failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Price Calculations
    const selectedRoomDetails = roomTypes.find(r => r.type === formData.roomType) || roomTypes[0];
    const nights = (new Date(formData.checkOut) - new Date(formData.checkIn)) / (1000 * 60 * 60 * 24) || 1;
    const totalPrice = (selectedRoomDetails.price * nights).toFixed(2);

    return (
        <PublicLayout>
            {/* Background Blobs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl -mr-64 -mt-64"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-3xl -ml-64 -mb-64"></div>

            <section className="bg-gray-50 dark:bg-navy-800 pt-40 pb-20 transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-widest text-sm mb-4 block">Reservation</span>
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-8">Book Your <span className="text-cyan-600 dark:text-cyan-400">Stay</span></h1>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-24 bg-white dark:bg-navy-900 transition-colors duration-500">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Success Message Overlay */}
                    {success && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950/80 backdrop-blur-sm px-4">
                            <div className="bg-white dark:bg-navy-900 p-12 rounded-[40px] shadow-2xl border border-cyan-500/30 text-center animate-slide-up max-w-md">
                                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                                    <Check className="w-10 h-10 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Booking Successful!</h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-8 font-medium">Your luxury escape is confirmed. Redirecting you to your dashboard...</p>
                                <div className="w-full bg-gray-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-cyan-500 h-full animate-[progress_3s_linear]"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stepper */}
                    {!success && (
                        <div className="flex items-center justify-between mb-16 relative">
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 dark:bg-white/5 -translate-y-1/2 -z-0"></div>
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="relative z-10 flex flex-col items-center">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold transition-all duration-500 border-2 ${step >= s ? 'bg-cyan-500 border-cyan-500 text-white shadow-cyan-glow' : 'bg-white dark:bg-navy-900 border-gray-100 dark:border-white/10 text-gray-400'}`}>
                                        {step > s ? <Check className="w-6 h-6" /> : s}
                                    </div>
                                    <span className={`absolute -bottom-8 text-xs font-bold uppercase tracking-widest whitespace-nowrap ${step >= s ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-400'}`}>
                                        {s === 1 ? 'Availability' : s === 2 ? 'Sign In' : 'Confirmation'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Step Content */}
                    {!success && (
                        <div className="relative">
                            {/* Step 1: Availability */}
                            {step === 1 && (
                                <div className="bg-white dark:bg-navy-900/50 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl animate-fade-in transition-all">
                                    <form onSubmit={handleCheckAvailability} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-gray-500 dark:text-gray-400 text-sm font-bold flex items-center"><Calendar className="w-4 h-4 mr-2" /> Check-in Date</label>
                                                <input
                                                    type="date"
                                                    name="checkIn"
                                                    value={formData.checkIn}
                                                    onChange={handleChange}
                                                    className="w-full bg-gray-50 dark:bg-navy-800 border border-gray-100 dark:border-white/10 rounded-2xl p-4 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all dark:[color-scheme:dark] font-bold"
                                                    required
                                                    min={new Date().toISOString().split('T')[0]}
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-gray-500 dark:text-gray-400 text-sm font-bold flex items-center"><Calendar className="w-4 h-4 mr-2" /> Check-out Date</label>
                                                <input
                                                    type="date"
                                                    name="checkOut"
                                                    value={formData.checkOut}
                                                    onChange={handleChange}
                                                    className="w-full bg-gray-50 dark:bg-navy-800 border border-gray-100 dark:border-white/10 rounded-2xl p-4 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all dark:[color-scheme:dark] font-bold"
                                                    required
                                                    min={formData.checkIn || new Date().toISOString().split('T')[0]}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-gray-500 dark:text-gray-400 text-sm font-bold flex items-center"><Users className="w-4 h-4 mr-2" /> Guests</label>
                                                <select
                                                    name="guests"
                                                    value={formData.guests}
                                                    onChange={handleChange}
                                                    className="w-full bg-gray-50 dark:bg-navy-800 border border-gray-100 dark:border-white/10 rounded-2xl p-4 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-400 transition-all font-bold"
                                                >
                                                    <option>1 Guest</option>
                                                    <option>2 Guests</option>
                                                    <option>3 Guests</option>
                                                    <option>4 Guests</option>
                                                </select>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-gray-500 dark:text-gray-400 text-sm font-bold flex items-center"><Hotel className="w-4 h-4 mr-2" /> Room Class</label>
                                                <select
                                                    name="roomType"
                                                    value={formData.roomType}
                                                    onChange={handleChange}
                                                    className="w-full bg-gray-50 dark:bg-navy-800 border border-gray-100 dark:border-white/10 rounded-2xl p-4 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-400 transition-all font-bold"
                                                >
                                                    {roomTypes.map(r => <option key={r.type} value={r.type}>{r.name} Class</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center group shadow-xl hover:shadow-cyan-glow transform hover:-translate-y-1">
                                            Check Availability <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Step 2: Login Prompt */}
                            {step === 2 && (
                                <div className="bg-white/50 dark:bg-navy-900/50 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl animate-fade-in text-center transition-all">
                                    <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <ShieldCheck className="w-10 h-10 text-cyan-500" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Almost There!</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-10 text-lg font-medium leading-relaxed">Rooms are available for your selected dates. Please sign in to securely complete your booking.</p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <button onClick={() => setStep(1)} className="px-10 py-5 rounded-2xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white font-bold hover:bg-gray-100 dark:hover:bg-white/5 transition-all">Go Back</button>
                                        <Link to="/login" className="px-10 py-5 rounded-2xl bg-cyan-500 text-white font-bold hover:bg-cyan-400 shadow-xl hover:shadow-cyan-glow transition-all transform hover:-translate-y-1">Proceed to Sign In</Link>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Review & Confirm */}
                            {step === 3 && (
                                <div className="bg-white/50 dark:bg-navy-900/50 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl animate-fade-in transition-all">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center">
                                        <CreditCard className="w-6 h-6 mr-3 text-cyan-500" /> Review Your Booking
                                    </h3>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
                                        <div className="space-y-6">
                                            <div className="p-6 bg-gray-50 dark:bg-navy-800 rounded-3xl border border-gray-100 dark:border-white/5">
                                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-4">Dates & Duration</span>
                                                <div className="flex justify-between items-center text-gray-900 dark:text-white">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Check-in</p>
                                                        <p className="font-bold">{formData.checkIn}</p>
                                                    </div>
                                                    <div className="w-10 h-px bg-gray-200 dark:bg-white/10 mx-4"></div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Check-out</p>
                                                        <p className="font-bold">{formData.checkOut}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6 bg-gray-50 dark:bg-navy-800 rounded-3xl border border-gray-100 dark:border-white/5">
                                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-4">Room selection</span>
                                                <div className="flex justify-between items-center text-gray-900 dark:text-white">
                                                    <div>
                                                        <p className="font-bold text-lg">{selectedRoomDetails.name} Class</p>
                                                        <p className="text-sm text-gray-500">{formData.guests} occupancy</p>
                                                    </div>
                                                    <p className="text-xl font-black text-cyan-500">${selectedRoomDetails.price}<span className="text-xs font-normal text-gray-500">/night</span></p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-100 dark:bg-navy-800/80 p-8 rounded-[32px] border border-cyan-500/10 h-full flex flex-col justify-between">
                                            <div className="space-y-4">
                                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                                    <span>Rate per night</span>
                                                    <span>${selectedRoomDetails.price}</span>
                                                </div>
                                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                                    <span>Nights</span>
                                                    <span>{nights}</span>
                                                </div>
                                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                                    <span>Service Tax (10%)</span>
                                                    <span>${(totalPrice * 0.1).toFixed(2)}</span>
                                                </div>
                                                <div className="pt-4 border-t border-gray-200 dark:border-white/10 flex justify-between items-end">
                                                    <span className="font-bold text-gray-900 dark:text-white">Total Amount</span>
                                                    <span className="text-3xl font-black text-cyan-500">${(parseFloat(totalPrice) * 1.1).toFixed(2)}</span>
                                                </div>
                                            </div>
                                            {!selectedRoomId && (
                                                <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                                                    <p className="text-xs font-bold text-amber-500 uppercase tracking-widest text-center">No {formData.roomType} room available for these dates.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button
                                            onClick={() => setStep(1)}
                                            disabled={loading}
                                            className="px-10 py-5 rounded-2xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white font-bold hover:bg-gray-100 dark:hover:bg-white/5 transition-all disabled:opacity-50"
                                        >
                                            Change Details
                                        </button>
                                        <button
                                            onClick={handleConfirmBooking}
                                            disabled={loading}
                                            className="flex-grow px-10 py-5 rounded-2xl bg-cyan-500 text-white font-bold hover:bg-cyan-400 shadow-xl hover:shadow-cyan-glow transition-all transform hover:-translate-y-1 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:pointer-events-none"
                                        >
                                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>
                                                <span>Confirm & Book Now</span>
                                                <ChevronRight className="w-5 h-5" />
                                            </>}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
};

export default Booking;
