import api from './api';

export const getAllServices = async () => {
    const response = await api.get('/services');
    return response.data;
};

export const createServiceRequest = async (requestData) => {
    const response = await api.post('/service-requests', requestData);
    return response.data;
};

export const getMyServiceRequests = async () => {
    const response = await api.get('/service-requests/my');
    return response.data;
};
