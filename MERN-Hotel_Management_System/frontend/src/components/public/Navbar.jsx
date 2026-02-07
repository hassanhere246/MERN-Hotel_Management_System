import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Hotel, Moon, Sun, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../shared/ThemeToggle';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user } = useAuth();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        handleScroll(); // Check on mount
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [location]); // Re-run on route change to sync state

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Rooms', path: '/rooms' },
        { name: 'About', path: '/about' },
        { name: 'Booking', path: '/booking' },
        { name: 'Contact', path: '/contact' },
    ];

    const isActive = (path) => location.pathname === path;
    const isHomePage = location.pathname === '/';
    const showSolidNav = isScrolled || !isHomePage;

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${showSolidNav ? 'bg-white dark:bg-navy-900/95 backdrop-blur-md py-3 shadow-lg' : 'bg-transparent py-5'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="group">
                        <span className={`text-2xl font-bold tracking-wider transition-colors ${showSolidNav ? 'text-gray-900 dark:text-white' : 'text-white'}`}>LUXE<span className="text-cyan-400">STAY</span></span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm font-medium transition-colors hover:text-cyan-400 ${isActive(link.path) ? 'text-cyan-400' : (showSolidNav ? 'text-gray-700 dark:text-gray-300' : 'text-gray-200 hover:text-white')}`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {/* Theme Toggle */}
                        <ThemeToggle variant="compact" />

                        {user ? (
                            <Link
                                to="/dashboard"
                                className="bg-cyan-500 hover:bg-cyan-400 text-white px-6 py-2 rounded-full text-sm font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                <span>Dashboard</span>
                            </Link>
                        ) : (
                            <Link
                                to="/login"
                                className="bg-cyan-500 hover:bg-cyan-400 text-white px-6 py-2 rounded-full text-sm font-semibold transition-all transform hover:scale-105 shadow-lg"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={`transition-colors ${showSolidNav ? 'text-gray-700 dark:text-gray-300' : 'text-gray-300 hover:text-white'}`}
                        >
                            {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white dark:bg-navy-900 border-t border-gray-100 dark:border-white/5 animate-fade-in">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block px-3 py-4 rounded-md text-base font-medium ${isActive(link.path) ? 'bg-cyan-500/10 text-cyan-500' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-800'}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        {user ? (
                            <Link
                                to="/dashboard"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block w-full text-center bg-cyan-500 text-white px-3 py-4 rounded-md text-base font-bold flex items-center justify-center space-x-2"
                            >
                                <LayoutDashboard className="w-5 h-5" />
                                <span>Dashboard</span>
                            </Link>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block w-full text-center bg-cyan-500 text-white px-3 py-4 rounded-md text-base font-bold"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
