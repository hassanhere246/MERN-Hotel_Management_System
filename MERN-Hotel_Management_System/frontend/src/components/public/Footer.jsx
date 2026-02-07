import React from 'react';
import { Link } from 'react-router-dom';
import { Hotel, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-50 dark:bg-navy-900 border-t border-gray-100 dark:border-white/5 pt-16 pb-8 transition-colors duration-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand & Description */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center space-x-2 group">
                            <div className="bg-cyan-500 p-2 rounded-lg group-hover:shadow-cyan-glow transition-all">
                                <Hotel className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-wider">LUXE<span className="text-cyan-400">STAY</span></span>
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Experience luxury and comfort in every stay. Our hotel combines modern elegance with timeless hospitality to create unforgettable memories.
                        </p>
                        <div className="flex space-x-4">
                            {[Facebook, Twitter, Instagram].map((Icon, index) => (
                                <a key={index} href="#" className="w-10 h-10 bg-gray-200 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-cyan-500 hover:text-white transition-all transform hover:-translate-y-1">
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-gray-900 dark:text-white font-bold text-lg mb-6">Quick Links</h4>
                        <ul className="space-y-4">
                            {['Home', 'Rooms', 'About Us', 'Booking', 'Contact'].map((item) => (
                                <li key={item}>
                                    <Link to={`/${item.toLowerCase().replace(' ', '-')}`} className="text-gray-600 dark:text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-cyan-500/50 rounded-full mr-2 group-hover:bg-cyan-400 transition-colors"></span>
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-gray-900 dark:text-white font-bold text-lg mb-6">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3 text-gray-600 dark:text-gray-400">
                                <MapPin className="w-5 h-5 text-cyan-500 dark:text-cyan-400 mt-1" />
                                <span>123 Luxury Lane, Paradise Island, Maldives</span>
                            </li>
                            <li className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                                <Phone className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                                <span>03333372204</span>
                            </li>
                            <li className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                                <Mail className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                                <span>hassanhere246@gmail.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-gray-900 dark:text-white font-bold text-lg mb-6">Newsletter</h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Subscribe to receive special offers and updates.</p>
                        <form className="relative">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full py-3 px-6 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-400 transition-colors"
                            />
                            <button className="absolute right-2 top-2 bg-cyan-500 hover:bg-cyan-400 text-white p-2 rounded-full transition-colors">
                                <Mail className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-100 dark:border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>© 2026 LuxeStay Hotel Group. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
