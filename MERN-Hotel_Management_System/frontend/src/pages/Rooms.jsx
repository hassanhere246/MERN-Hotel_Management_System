import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/public/PublicLayout';
import { Bed, Users, Square, Filter, Search, ArrowRight, Star, Loader2, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getRooms } from '../services/roomService';

const Rooms = () => {
    const [filter, setFilter] = useState('All');
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const data = await getRooms();
            setRooms(data);
        } catch (err) {
            console.error('Failed to fetch rooms');
        } finally {
            setLoading(false);
        }
    };

    const filteredRooms = rooms.filter(room => {
        const matchesFilter = filter === 'All' || room.type.toLowerCase() === filter.toLowerCase();
        const matchesSearch = room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            room.type.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <PublicLayout>
            {/* Header */}
            <section className="relative bg-gray-50 dark:bg-navy-800 pt-40 pb-20 transition-colors duration-500 overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=2000&q=80"
                        alt="Luxury Hotel Room"
                        className="w-full h-full object-cover"
                    />
                    {/* Dark Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="text-cyan-400 font-bold uppercase tracking-widest text-sm mb-4 block drop-shadow-lg">Our Accommodation</span>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-8 drop-shadow-2xl">Rooms & <span className="text-cyan-400">Suites</span></h1>
                    <p className="max-w-2xl mx-auto text-gray-200 text-lg leading-relaxed drop-shadow-lg">
                        Each of our rooms is meticulously designed to provide the ultimate in comfort and style. Explore our selection of vacant rooms ready for your stay.
                    </p>
                </div>
            </section>

            {/* Filter Section */}
            <section className="bg-white/80 dark:bg-navy-950/80 py-6 sticky top-[64px] md:top-[80px] z-20 border-y border-gray-100 dark:border-white/5 backdrop-blur-xl transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full md:w-auto">
                            <div className="flex items-center space-x-2 self-start sm:self-center">
                                <Filter className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                                <span className="text-gray-900 dark:text-white font-bold whitespace-nowrap">Filter by:</span>
                            </div>
                            <div className="flex bg-gray-100 dark:bg-navy-900 p-1.5 rounded-2xl w-full sm:w-auto overflow-x-auto no-scrollbar border border-gray-200/50 dark:border-white/5">
                                {['All', 'Single', 'Double', 'Suite'].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setFilter(cat)}
                                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-1 sm:flex-none ${filter === cat ? 'bg-white dark:bg-navy-800 text-cyan-600 dark:text-cyan-400 shadow-sm ring-1 ring-black/5' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-navy-800/50'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search rooms..."
                                className="w-full bg-gray-50 dark:bg-navy-800 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-400 transition-colors"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Room List */}
            <section className="py-24 bg-white dark:bg-navy-900 transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-4" />
                            <p className="text-gray-500 font-medium">Fetching rooms...</p>
                        </div>
                    ) : filteredRooms.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {filteredRooms.map((room) => (
                                <div key={room._id} className="group flex flex-col h-full bg-gray-50 dark:bg-navy-800 rounded-[32px] overflow-hidden border border-gray-100 dark:border-white/5 hover:border-cyan-500/30 transition-all transform hover:-translate-y-2 hover:shadow-cyan-glow">
                                    <div className="relative h-72 overflow-hidden">
                                        <img
                                            src={room.type === 'suite' ? 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80' :
                                                room.type === 'double' ? 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80' :
                                                    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'}
                                            alt={room.roomNumber}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute top-6 left-6">
                                            <span className="bg-cyan-600 dark:bg-cyan-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                                                Room {room.roomNumber}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-8 flex flex-col flex-grow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className="text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-widest">{room.type} Class</span>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors capitalize">{room.type} Escape</h3>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${room.status === 'available' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'}`}>
                                                {room.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 my-6 py-6 border-y border-gray-100 dark:border-white/5 text-gray-900 dark:text-white">
                                            <div className="flex flex-col items-center border-r border-gray-100 dark:border-white/5">
                                                <Square className="w-5 h-5 text-gray-400 mb-2" />
                                                <span className="text-xs font-medium">Floor {room.floor}</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <Bed className="w-5 h-5 text-gray-400 mb-2" />
                                                <span className="text-xs font-medium capitalize">{room.type} Bed</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-tighter">Starts from</span>
                                                <span className="text-2xl font-bold text-gray-900 dark:text-white">${room.price}<span className="text-sm font-normal text-gray-500 dark:text-gray-400">/Night</span></span>
                                            </div>
                                            {room.status === 'available' ? (
                                                <Link
                                                    to={`/booking?roomType=${room.type}`}
                                                    className="w-14 h-14 bg-cyan-500 text-white rounded-2xl flex items-center justify-center hover:bg-cyan-400 hover:shadow-cyan-glow transition-all group/btn"
                                                >
                                                    <ArrowRight className="w-6 h-6 transform group-hover/btn:translate-x-1 transition-transform" />
                                                </Link>
                                            ) : (
                                                <div title="This room is currently being cleaned or maintained" className="w-14 h-14 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 cursor-not-allowed">
                                                    <Info className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <Search className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Matching Rooms</h3>
                            <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                        </div>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
};

export default Rooms;

