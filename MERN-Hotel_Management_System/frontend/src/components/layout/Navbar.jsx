import React from 'react';
import { Menu, Bell, Search, User, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import ThemeToggle from '../shared/ThemeToggle';

const Navbar = ({ toggleSidebar, user }) => {
    const { t } = useLanguage();
    return (
        <nav className="bg-white dark:bg-navy-900/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 shadow-sm sticky top-0 z-30 no-print transition-colors duration-300">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left Section */}
                    <div className="flex items-center space-x-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-lg transition-colors"
                        >
                            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                        </button>

                        {/* Search Bar - Desktop */}
                        <div className="hidden md:flex items-center">
                            <div className="relative w-96">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={t('search')}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-navy-800 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center space-x-4">
                        {/* Theme Toggle */}
                        <ThemeToggle variant="compact" />

                        {/* Notifications */}
                        <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-lg transition-colors group">
                            <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-cyan-400" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-navy-900"></span>
                        </button>

                        {/* User Profile Dropdown */}
                        <div className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-lg cursor-pointer transition-colors group">
                            <div className="w-9 h-9 bg-gray-100 dark:bg-navy-700 rounded-full overflow-hidden flex items-center justify-center border border-gray-200 dark:border-white/10">
                                {user?.profilePhoto ? (
                                    <img src={`http://localhost:5000/${user.profilePhoto}`} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                                        {user?.name?.charAt(0) || 'A'}
                                    </div>
                                )}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name || 'User'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role || 'Staff'}</p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-primary-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Search - Below Navbar */}
            <div className="md:hidden px-4 pb-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
