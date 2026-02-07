import React from 'react';
import PublicLayout from '../components/public/PublicLayout';
import Hero from '../components/public/Hero';
import { Bed, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    const featuredRooms = [
        {
            title: 'Royal Penthouse',
            image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            price: '$1200',
            type: 'Suite',
            rating: 5,
        },
        {
            title: 'Ocean View Suite',
            image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            price: '$850',
            type: 'Double',
            rating: 4.8,
        },
        {
            title: 'Executive Room',
            image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            price: '$450',
            type: 'Single',
            rating: 4.5,
        }
    ];

    return (
        <PublicLayout>
            <Hero />

            {/* Featured Rooms Section */}
            <section className="py-24 bg-white dark:bg-navy-900 transition-colors duration-500 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 space-y-6 md:space-y-0">
                        <div className="max-w-2xl">
                            <span className="text-cyan-500 dark:text-cyan-400 font-bold uppercase tracking-widest text-sm mb-4 block">Our Accommodation</span>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                                Featured Rooms & <span className="text-cyan-500 dark:text-cyan-400">Suites</span>
                            </h2>
                        </div>
                        <Link to="/rooms" className="flex items-center space-x-2 text-cyan-400 font-bold hover:text-cyan-300 transition-colors group">
                            <span>View All Rooms</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredRooms.map((room, index) => (
                            <div key={index} className="group relative bg-gray-50 dark:bg-navy-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5 hover:border-cyan-500/30 transition-all hover:shadow-cyan-glow">
                                <div className="h-72 overflow-hidden">
                                    <img
                                        src={room.image}
                                        alt={room.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute top-6 right-6 bg-white/90 dark:bg-navy-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white font-bold">
                                        {room.price}<span className="text-xs text-gray-500 dark:text-gray-400 font-normal"> / Night</span>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-cyan-500 dark:text-cyan-400 text-sm font-bold uppercase tracking-wider">{room.type}</span>
                                        <div className="flex items-center text-gold-500">
                                            <Star className="w-4 h-4 fill-current" />
                                            <span className="ml-1 text-sm font-bold text-gray-900 dark:text-white">{room.rating}</span>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">{room.title}</h3>
                                    <div className="flex items-center pt-6 border-t border-gray-100 dark:border-white/5">
                                        <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400 text-sm">
                                            <div className="flex items-center"><Bed className="w-4 h-4 mr-1.5 text-cyan-500" /> 2 Beds</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Special Offers Section */}
            <section className="py-24 bg-gray-50 dark:bg-navy-800 transition-colors duration-500 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <span className="text-cyan-500 dark:text-cyan-400 font-bold uppercase tracking-widest text-sm mb-4 block">Exclusive Deals</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">Specials & <span className="text-cyan-500 dark:text-cyan-400">Offers</span></h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="relative h-96 rounded-3xl overflow-hidden group">
                            <img
                                src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Honeymoon Offer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-transparent p-12 flex flex-col justify-end text-white">
                                <span className="text-cyan-400 font-bold text-sm tracking-widest uppercase mb-4">Limited Time</span>
                                <h3 className="text-3xl font-bold mb-4">Honeymoon Package</h3>
                                <p className="text-gray-300 mb-8 max-w-md">Enjoy a romantic 5-night stay with spa treatments and candlelit dinner.</p>
                                <button className="self-start px-8 py-3 bg-white text-navy-900 rounded-full font-bold hover:bg-cyan-400 hover:text-white transition-all transform hover:scale-105 shadow-xl">
                                    Claim offer
                                </button>
                            </div>
                        </div>
                        <div className="relative h-96 rounded-3xl overflow-hidden group">
                            <img
                                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Business Offer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-transparent p-12 flex flex-col justify-end text-white">
                                <span className="text-cyan-400 font-bold text-sm tracking-widest uppercase mb-4">Corporate</span>
                                <h3 className="text-3xl font-bold mb-4">Business Elite</h3>
                                <p className="text-gray-300 mb-8 max-w-md">Get 20% off on all business suites including meeting room access.</p>
                                <button className="self-start px-8 py-3 bg-white text-navy-900 rounded-full font-bold hover:bg-cyan-400 hover:text-white transition-all transform hover:scale-105 shadow-xl">
                                    Learn more
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
};

export default Home;
