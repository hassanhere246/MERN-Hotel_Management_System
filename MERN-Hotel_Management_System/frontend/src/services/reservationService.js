import api from './api';

export const getAllBookings = async () => {
    const response = await api.get('/reservations');
    return response.data;
};

export const createBooking = async (data) => {
    const response = await api.post('/reservations', data);
    return response.data;
};

export const checkIn = async (id) => {
    const response = await api.put(`/reservations/${id}/checkin`);
    return response.data;
};

export const checkOut = async (id) => {
    const response = await api.put(`/reservations/${id}/checkout`);
    return response.data;
};

export const cancelBooking = async (id) => {
    const response = await api.put(`/reservations/${id}/cancel`);
    return response.data;
};
