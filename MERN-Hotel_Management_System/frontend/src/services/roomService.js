import api from './api';

export const getRooms = async () => {
    const response = await api.get('/rooms');
    return response.data;
};

export const addRoom = async (roomData) => {
    const response = await api.post('/rooms', roomData);
    return response.data;
};

export const updateRoom = async (id, roomData) => {
    const response = await api.put(`/rooms/${id}`, roomData);
    return response.data;
};

export const deleteRoom = async (id) => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
};

export const updateRoomStatus = async (id, status) => {
    const response = await api.put(`/rooms/${id}/status`, { status });
    return response.data;
};
