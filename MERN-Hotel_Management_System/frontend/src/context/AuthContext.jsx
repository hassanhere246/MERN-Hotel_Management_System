import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, login as loginApi, logout as logoutApi } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            refreshUser();
        } else {
            setLoading(false);
        }
    }, []);

    // Theme Application Logic
    useEffect(() => {
        if (user?.preferences?.theme) {
            const theme = user.preferences.theme.toLowerCase();
            const root = document.documentElement;

            // Remove previous theme classes
            root.classList.remove('dark', 'glass');

            // Apply new theme class
            if (theme === 'dark') {
                root.classList.add('dark');
            } else if (theme === 'glass') {
                root.classList.add('glass');
            }

            // Save to localStorage for instant apply on next reload before user fetch
            localStorage.setItem('appTheme', theme);
        }
    }, [user?.preferences?.theme]);

    // Initial theme apply from localStorage (prevents flash)
    useEffect(() => {
        const savedTheme = localStorage.getItem('appTheme');
        if (savedTheme) {
            const root = document.documentElement;
            root.classList.remove('dark', 'glass');
            if (savedTheme === 'dark') root.classList.add('dark');
            if (savedTheme === 'glass') root.classList.add('glass');
        }
    }, []);

    const login = async (email, password) => {
        const data = await loginApi(email, password);
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        await refreshUser();
        return data;
    };

    const refreshUser = async () => {
        try {
            const { getMe } = await import('../services/userService');
            const data = await getMe();
            setUser(data);
        } catch (err) {
            console.error('Failed to refresh user');
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('role');
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        logoutApi();
        setUser(null);
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
