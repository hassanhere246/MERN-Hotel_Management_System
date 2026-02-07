import api from './api';

export const getAllTasks = async () => {
    const response = await api.get('/housekeeping');
    return response.data;
};

export const updateTaskStatus = async (id, status) => {
    const response = await api.put(`/housekeeping/${id}/status`, { status });
    return response.data;
};

export const createMaintenanceRequest = async (data) => {
    const response = await api.post('/maintenance', data);
    return response.data;
};

export const getAllMaintenanceRequests = async () => {
    const response = await api.get('/maintenance');
    return response.data;
};

export const assignTask = async (taskData) => {
    const response = await api.post('/housekeeping', taskData);
    return response.data;
};
