import api from './api';

export const getMe = async () => {
    const response = await api.get('/users/me');
    return response.data;
};

export const updateProfile = async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
};

export const uploadProfilePhoto = async (formData) => {
    const response = await api.post('/users/profile-photo', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const changePassword = async (passwordData) => {
    const response = await api.put('/users/change-password', passwordData);
    return response.data;
};

export const updateUserStatus = async (userId, status) => {
    const response = await api.put(`/users/${userId}/status`, { status });
    return response.data;
};

export const updateUser = async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
};
