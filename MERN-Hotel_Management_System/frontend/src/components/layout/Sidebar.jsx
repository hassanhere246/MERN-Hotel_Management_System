import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    BedDouble,
    CalendarCheck,
    Receipt,
    Sparkles,
    BarChart3,
    Settings,
    LogOut,
    X,
    ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Sidebar = ({ isOpen, toggleSidebar, user, onLogout }) => {
    const userRole = user?.role || 'admin';
    const { t } = useLanguage();

    const getNavigationItems = () => {
        const baseItems = [
            { id: 'dashboard', name: t('dashboard'), path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'staff', 'guest'] },
            { id: 'users', name: t('users'), path: '/dashboard/users', icon: Users, roles: ['admin'] },
            { id: 'rooms', name: t('rooms'), path: '/dashboard/rooms', icon: BedDouble, roles: ['admin', 'staff'] },
            { id: 'reservations', name: t('reservations'), path: '/dashboard/reservations', icon: CalendarCheck, roles: ['admin', 'staff', 'guest'] },
            { id: 'billing', name: t('billing'), path: '/dashboard/billing', icon: Receipt, roles: ['admin', 'staff'] },
            { id: 'housekeeping', name: t('housekeeping'), path: '/dashboard/housekeeping', icon: Sparkles, roles: ['admin', 'staff'] },
            { id: 'reports', name: t('reports'), path: '/dashboard/reports', icon: BarChart3, roles: ['admin', 'staff'] },
            { id: 'settings', name: t('settings'), path: '/dashboard/settings', icon: Settings, roles: ['admin', 'staff', 'guest'] },
        ];

        return baseItems.filter(item => item.roles.includes(userRole));
    };

    const navigationItems = getNavigationItems();

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden" onClick={toggleSidebar} />
            )}

            <aside className={`fixed top-0 left-0 h-full bg-white dark:bg-navy-900 border-r border-gray-200 dark:border-white/5 transform transition-all duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static w-72 flex flex-col`}>
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/5">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">LuxuryStay</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Hospitality</p>
                    </div>
                    <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                <nav className="flex-1 p-4 overflow-y-auto">
                    <ul className="space-y-1">
                        {navigationItems.map((item) => (
                            <li key={item.name}>
                                <NavLink to={item.path} onClick={toggleSidebar} className={({ isActive }) => `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-gradient-to-r from-primary-500 to-blue-600 text-white shadow-soft' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-800 hover:text-primary-600 dark:hover:text-cyan-400'}`}>
                                    {({ isActive }) => (
                                        <>
                                            <div className="flex items-center space-x-3">
                                                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-cyan-400'}`} />
                                                <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{item.name}</span>
                                            </div>
                                            <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-600'}`} />
                                        </>
                                    )}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-white/5 space-y-4">
                    <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-white/5">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 flex-shrink-0">
                            {user?.profilePhoto ? (
                                <img src={`http://localhost:5000/${user.profilePhoto}`} alt="Me" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-white flex items-center justify-center text-primary-600 font-bold">
                                    {user?.name?.charAt(0) || 'A'}
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name || 'User'}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">{user?.role}</p>
                        </div>
                    </div>
                    <button onClick={onLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 group">
                        <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        <span className="font-bold text-sm">Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
