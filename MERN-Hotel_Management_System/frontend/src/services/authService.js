import api from './api';

export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('appTheme'); // Optional: clear theme on logout if user-specific
};

export const getCurrentUser = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    return token ? { role } : null;
};
