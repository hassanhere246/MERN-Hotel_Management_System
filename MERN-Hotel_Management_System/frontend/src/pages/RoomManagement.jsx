import React, { useState, useEffect } from 'react';
import {
    Plus,
    Grid,
    List,
    Edit,
    Trash2,
    Search,
    Loader2,
    Filter,
    MoreVertical,
    Bed,
    Zap,
    Wind,
    Wifi,
    AlertCircle,
    X
} from 'lucide-react';
import { getRooms, addRoom as addRoomApi, updateRoom as updateRoomApi, deleteRoom as deleteRoomApi } from '../services/roomService';
import { getSettings } from '../services/settingsService';

const RoomManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [baseRates, setBaseRates] = useState(null);

    const [formData, setFormData] = useState({
        roomNumber: '',
        type: 'single',
        floor: '',
        price: '',
        beds: '1',
        status: 'available',
        amenities: ''
    });

    const [editingRoom, setEditingRoom] = useState(null);
    const [editFormData, setEditFormData] = useState({
        roomNumber: '',
        type: 'single',
        floor: '',
        price: '',
        beds: '1',
        status: 'available',
        amenities: ''
    });

    const [formError, setFormError] = useState('');
    const [editFormError, setEditFormError] = useState('');

    useEffect(() => {
        fetchRooms();
        fetchBaseRates();
    }, []);

    const fetchBaseRates = async () => {
        try {
            const settings = await getSettings();
            if (settings && settings.roomRates) {
                setBaseRates(settings.roomRates);
                // Set initial price for default type 'single'
                setFormData(prev => ({ ...prev, price: settings.roomRates.single || '' }));
            }
        } catch (err) {
            console.error('Failed to fetch base rates');
        }
    };

    // Auto-fill price when type changes
    useEffect(() => {
        if (!showEditModal && baseRates && baseRates[formData.type]) {
            setFormData(prev => ({ ...prev, price: baseRates[formData.type] }));
        }
    }, [formData.type, baseRates, showEditModal]);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const data = await getRooms();
            setRooms(data);
        } catch (err) {
            setError('Failed to fetch rooms');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = (data) => {
        if (!data.roomNumber) return 'Room number is required';
        if (!data.floor || data.floor < 0) return 'Valid floor number is required';
        if (!data.price || data.price <= 0) return 'Price must be a positive number';
        if (!data.beds || data.beds <= 0) return 'At least 1 bed is required';
        return null;
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const validationError = validateForm(formData);
        if (validationError) {
            setFormError(validationError);
            return;
        }

        try {
            const roomData = {
                ...formData,
                price: Number(formData.price),
                floor: Number(formData.floor),
                beds: Number(formData.beds),
                amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a !== '')
            };

            await addRoomApi(roomData);
            setShowAddModal(false);
            setFormError('');
            setFormData({
                roomNumber: '',
                type: 'single',
                floor: '',
                price: baseRates?.single || '',
                beds: '1',
                status: 'available',
                amenities: ''
            });
            fetchRooms();
        } catch (err) {
            setFormError(err.response?.data?.message || 'Error adding room');
        }
    };

    const handleEditClick = (room) => {
        setEditingRoom(room);
        setEditFormData({
            roomNumber: room.roomNumber,
            type: room.type,
            floor: room.floor,
            price: room.price,
            beds: room.beds,
            status: room.status,
            amenities: room.amenities.join(', ')
        });
        setShowEditModal(true);
        setEditFormError('');
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const validationError = validateForm(editFormData);
        if (validationError) {
            setEditFormError(validationError);
            return;
        }

        try {
            const roomData = {
                ...editFormData,
                price: Number(editFormData.price),
                floor: Number(editFormData.floor),
                beds: Number(editFormData.beds),
                amenities: editFormData.amenities.split(',').map(a => a.trim()).filter(a => a !== '')
            };

            await updateRoomApi(editingRoom._id, roomData);
            setShowEditModal(false);
            setEditFormError('');
            fetchRooms();
        } catch (err) {
            setEditFormError(err.response?.data?.message || 'Error updating room');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            try {
                await deleteRoomApi(id);
                fetchRooms();
            } catch (err) {
                alert('Error deleting room');
            }
        }
    };

    const filteredRooms = rooms.filter(room => {
        const matchesSearch = (room.roomNumber || '').toString().includes(searchQuery);
        const matchesType = filterType === 'All' || room.type === filterType.toLowerCase();
        return matchesSearch && matchesType;
    });

    if (loading && rooms.length === 0) return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <Loader2 className="animate-spin w-12 h-12 text-primary-600" />
            <p className="text-gray-500 font-medium">Loading rooms...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-heading">Room Management</h1>
                    <p className="text-gray-500 mt-1">Manage and monitor all hotel rooms in real-time.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="bg-white border border-gray-200 rounded-xl p-1 flex">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Grid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                    <button onClick={() => setShowAddModal(true)} className="btn btn-primary flex items-center space-x-2">
                        <Plus className="w-5 h-5" />
                        <span>Add New Room</span>
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search room number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all text-gray-900 font-medium"
                    />
                </div>
                <div className="flex items-center space-x-4 w-full md:w-auto">
                    <div className="flex items-center space-x-4 bg-gray-100 dark:bg-navy-800 p-1 rounded-xl border border-gray-200 dark:border-white/5">
                        {['All', 'Single', 'Double', 'Suite'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === type ? 'bg-white dark:bg-navy-700 text-primary-600 dark:text-cyan-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid/Table Views (rest of the file remains same, but fixed) */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredRooms.map((room) => (
                        <div key={room._id} className="bg-white rounded-2xl border border-gray-100 shadow-soft hover:shadow-lg transition-all duration-300 group overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Room {room.roomNumber}</h3>
                                        <p className="text-sm text-gray-500 capitalize">{room.type} • Floor {room.floor}</p>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${room.status === 'available' ? 'bg-emerald-50 text-emerald-600' :
                                        room.status === 'occupied' ? 'bg-rose-50 text-rose-600' :
                                            'bg-amber-50 text-amber-600'
                                        }`}>
                                        {room.status}
                                    </span>
                                </div>

                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="flex items-center text-gray-400">
                                        <Bed className="w-4 h-4 mr-1.5" />
                                        <span className="text-sm font-medium">{room.beds}</span>
                                    </div>
                                    <div className="flex items-center text-gray-400">
                                        <Wind className="w-4 h-4 mr-1.5" />
                                        <span className="text-sm font-medium">AC</span>
                                    </div>
                                    <div className="flex items-center text-gray-400">
                                        <Wifi className="w-4 h-4 mr-1.5" />
                                        <span className="text-sm font-medium">Free</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                    <div>
                                        <span className="text-2xl font-bold text-gray-900">${room.price}</span>
                                        <span className="text-gray-400 text-sm font-medium"> /night</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleEditClick(room)}
                                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(room._id)}
                                            className="p-2 hover:bg-rose-50 rounded-lg text-gray-500 hover:text-rose-600 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Room</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Floor</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredRooms.map((room) => (
                                <tr key={room._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-gray-900">Room {room.roomNumber}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-gray-600 capitalize">{room.type}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-gray-500">{room.floor}th Floor</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${room.status === 'available' ? 'bg-emerald-50 text-emerald-600' :
                                            room.status === 'occupied' ? 'bg-rose-50 text-rose-600' :
                                                'bg-amber-50 text-amber-600'
                                            }`}>
                                            {room.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-gray-900">${room.price}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleEditClick(room)}
                                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(room._id)}
                                                className="p-2 hover:bg-rose-50 rounded-lg text-gray-500 hover:text-rose-600 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showAddModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-8 border-b border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900">Add New Room</h2>
                            <p className="text-gray-500 text-sm mt-1">Fill in the details for the new hotel room.</p>
                        </div>
                        <form onSubmit={handleCreate} className="p-8 space-y-6">
                            {formError && (
                                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    {formError}
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Room Number</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none text-gray-900 font-medium"
                                        value={formData.roomNumber}
                                        onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Room Type</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none capitalize text-gray-900 font-medium"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="single">Single</option>
                                        <option value="double">Double</option>
                                        <option value="suite">Suite</option>
                                        <option value="deluxe">Deluxe</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Floor</label>
                                    <input type="number" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none text-gray-900 font-medium" value={formData.floor} onChange={(e) => setFormData({ ...formData, floor: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Beds</label>
                                    <input type="number" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none text-gray-900 font-medium" value={formData.beds} onChange={(e) => setFormData({ ...formData, beds: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Price/Night</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold text-gray-900"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                    <p className="text-[10px] text-primary-600 font-bold uppercase tracking-tight">Defaulted from Settings</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Amenities</label>
                                <textarea
                                    placeholder="Enter amenities separated by commas (e.g. WiFi, AC, TV)..."
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none h-24 resize-none text-gray-900 font-medium"
                                    value={formData.amenities}
                                    onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-6">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                                <button type="submit" className="btn btn-primary px-8">Create Room</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Room Modal */}
            {showEditModal && editingRoom && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Edit Room {editingRoom.roomNumber}</h2>
                                <p className="text-gray-500 text-sm mt-1">Update the room details below.</p>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-8 space-y-6">
                            {editFormError && (
                                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    {editFormError}
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Room Number</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                                        value={editFormData.roomNumber}
                                        onChange={(e) => setEditFormData({ ...editFormData, roomNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Room Type</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none capitalize font-bold"
                                        value={editFormData.type}
                                        onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                                    >
                                        <option value="single">Single</option>
                                        <option value="double">Double</option>
                                        <option value="suite">Suite</option>
                                        <option value="deluxe">Deluxe</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Floor</label>
                                    <input type="number" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold" value={editFormData.floor} onChange={(e) => setEditFormData({ ...editFormData, floor: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Beds</label>
                                    <input type="number" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold" value={editFormData.beds} onChange={(e) => setEditFormData({ ...editFormData, beds: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Price/Night</label>
                                    <input type="number" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold" value={editFormData.price} onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Status</label>
                                <select
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none capitalize font-bold"
                                    value={editFormData.status}
                                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                >
                                    <option value="available">Available</option>
                                    <option value="occupied">Occupied</option>
                                    <option value="cleaning">Cleaning</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Amenities</label>
                                <textarea
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none h-24 resize-none font-medium"
                                    value={editFormData.amenities}
                                    onChange={(e) => setEditFormData({ ...editFormData, amenities: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-6">
                                <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                                <button type="submit" className="btn btn-primary px-8">Update Room</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomManagement;
