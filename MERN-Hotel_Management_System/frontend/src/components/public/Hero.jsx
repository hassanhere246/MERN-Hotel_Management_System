import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Play } from 'lucide-react';

const Hero = () => {
    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                    alt="Luxury Hotel"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/80 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl animate-slide-up">
                    <span className="inline-block px-4 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-bold tracking-widest uppercase mb-6">
                        Welcome to Paradise
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                        Experience <span className="text-cyan-400">Exquisite</span> Luxury
                    </h1>
                    <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                        Discover a world of unparalleled elegance and comfort. From breathtaking ocean views to world-class amenities, every moment at LuxeStay is crafted for perfection.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                        <Link to="/register" className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center transition-all shadow-lg hover:shadow-cyan-glow group">
                            Get Started
                            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button className="w-full sm:w-auto flex items-center justify-center space-x-3 text-white font-bold hover:text-cyan-400 transition-colors">
                            <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-all">
                                <Play className="w-5 h-5 fill-current" />
                            </div>
                            <span>Take a Virtual Tour</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                <span className="text-xs text-white/50 uppercase tracking-widest mb-4">Scroll to Explore</span>
                <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
