import api from './api';

export const getAllInvoices = async () => {
    const response = await api.get('/invoices');
    return response.data;
};

export const updatePaymentStatus = async (id, paymentStatus) => {
    const response = await api.put(`/invoices/${id}/payment`, { paymentStatus });
    return response.data;
};

export const deleteInvoice = async (id) => {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
};

export const getGuestInvoices = async (guestId) => {
    const response = await api.get(`/invoices/guest/${guestId}`);
    return response.data;
};

export const generateInvoice = async (data) => {
    const response = await api.post('/invoices', data);
    return response.data;
};
