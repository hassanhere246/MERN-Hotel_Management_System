import React, { useState, useEffect } from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/userService';

const ThemeToggle = ({ variant = 'default' }) => {
    const { user, refreshUser } = useAuth();
    const [theme, setTheme] = useState(() => localStorage.getItem('appTheme') || 'light');

    useEffect(() => {
        // Sync local state if user preference changes
        if (user?.preferences?.theme) {
            setTheme(user.preferences.theme);
        }
    }, [user?.preferences?.theme]);

    const applyTheme = (newTheme) => {
        setTheme(newTheme);
        const root = document.documentElement;
        root.classList.remove('dark', 'glass');
        if (newTheme === 'dark') root.classList.add('dark');
        if (newTheme === 'glass') root.classList.add('glass');
        localStorage.setItem('appTheme', newTheme);

        // If logged in, save to profile
        if (user) {
            updateProfile({
                preferences: { ...user.preferences, theme: newTheme }
            }).then(() => refreshUser()).catch(err => console.error('Failed to save theme pref', err));
        }
    };

    const themes = [
        { id: 'light', icon: Sun, label: 'Light' },
        { id: 'dark', icon: Moon, label: 'Dark' },
        { id: 'glass', icon: Sparkles, label: 'Glass' }
    ];

    if (variant === 'compact') {
        const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'glass' : 'light';
        const CurrentIcon = themes.find(t => t.id === theme)?.icon || Sun;

        return (
            <button
                onClick={() => applyTheme(nextTheme)}
                className="p-2 rounded-xl bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition-all active:scale-90"
                title={`Switch to ${nextTheme} mode`}
            >
                <CurrentIcon className="w-5 h-5" />
            </button>
        );
    }

    return (
        <div className="flex items-center space-x-1 p-1 bg-gray-100 dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-white/5">
            {themes.map((t) => {
                const Icon = t.icon;
                const isActive = theme === t.id;
                return (
                    <button
                        key={t.id}
                        onClick={() => applyTheme(t.id)}
                        className={`p-2 rounded-xl transition-all flex items-center space-x-2 ${isActive
                                ? 'bg-white dark:bg-navy-700 text-cyan-500 shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-navy-700/50'
                            }`}
                        title={`${t.label} Mode`}
                    >
                        <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse-slow' : ''}`} />
                    </button>
                );
            })}
        </div>
    );
};

export default ThemeToggle;
