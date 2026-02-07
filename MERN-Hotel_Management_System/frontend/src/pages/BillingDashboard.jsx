import React, { useState, useEffect } from 'react';
import {
    Download,
    Printer,
    Eye,
    Loader2,
    Receipt,
    DollarSign,
    TrendingUp,
    Clock,
    CheckCircle2,
    Filter,
    Search,
    FileText,
    ArrowUpRight,
    X,
    Trash2,
    AlertCircle,
    Calendar,
    Hotel,
    Info
} from 'lucide-react';
import api from '../services/api';
import { getAllInvoices, updatePaymentStatus, deleteInvoice, generateInvoice } from '../services/invoiceService';
import { getAllBookings } from '../services/reservationService';

const BillingDashboard = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [availableReservations, setAvailableReservations] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        reservationId: '',
        services: []
    });

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const data = await getAllInvoices();
            setInvoices(data);
        } catch (err) {
            console.error('Failed to fetch invoices');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            setIsUpdating(true);
            await updatePaymentStatus(id, status);
            await fetchInvoices();
            if (selectedInvoice && selectedInvoice._id === id) {
                setShowDetailModal(false);
            }
        } catch (err) {
            alert('Failed to update payment status');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteInvoice = async (id) => {
        if (!window.confirm('Are you sure you want to delete this invoice?')) return;
        try {
            await deleteInvoice(id);
            await fetchInvoices();
        } catch (err) {
            alert('Failed to delete invoice');
        }
    };

    const handleExportCSV = () => {
        const headers = ["Invoice ID", "Guest", "Date", "Amount", "Status"];
        const data = invoices.map(inv => [
            inv._id.toUpperCase(),
            inv.guestId?.name || 'Unknown',
            new Date(inv.issuedAt).toLocaleDateString(),
            (inv.totalAmount || 0).toFixed(2),
            inv.paymentStatus
        ]);

        const csvContent = [headers, ...data].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoices_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const handleOpenCreateModal = async () => {
        try {
            const bookings = await getAllBookings();
            // Filter bookings that are checked-out but don't have an invoice yet
            const invoicedReservationIds = invoices.map(inv => inv.reservationId?._id);
            const pending = bookings.filter(b =>
                b.status === 'checked-out' && !invoicedReservationIds.includes(b._id)
            );
            setAvailableReservations(pending);
            setShowCreateModal(true);
        } catch (err) {
            console.error('Failed to prepare creation data');
        }
    };

    const handleCreateInvoice = async (e) => {
        e.preventDefault();
        try {
            setIsCreating(true);
            await generateInvoice(createFormData);
            setShowCreateModal(false);
            setCreateFormData({ reservationId: '', services: [] });
            fetchInvoices();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create invoice');
        } finally {
            setIsCreating(false);
        }
    };

    const calculateStats = () => {
        const totalRevenue = invoices
            .filter(inv => inv.paymentStatus === 'paid')
            .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

        const outstanding = invoices
            .filter(inv => inv.paymentStatus === 'pending')
            .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

        return { totalRevenue, outstanding };
    };

    const { totalRevenue, outstanding } = calculateStats();

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <Loader2 className="animate-spin w-12 h-12 text-primary-600" />
            <p className="text-gray-500 font-medium">Preparing billing data...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-heading">Billing & Invoices</h1>
                    <p className="text-gray-500 mt-1">Manage guest payments, invoices, and financial tracking.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleExportCSV}
                        className="btn bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export CSV</span>
                    </button>
                    <button
                        onClick={handleOpenCreateModal}
                        className="btn btn-primary flex items-center space-x-2"
                    >
                        <Receipt className="w-4 h-4" />
                        <span>Create Invoice</span>
                    </button>
                </div>
            </div>

            {/* Financial Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-soft">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <DollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="flex items-center text-xs font-bold text-blue-600">
                            +12.5% <ArrowUpRight className="w-3 h-3 ml-1" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm font-medium text-gray-500">Total Revenue (All Time)</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">${totalRevenue.toFixed(2)}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-soft">
                    <div className="p-3 bg-amber-50 rounded-xl w-fit">
                        <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="mt-4">
                        <p className="text-sm font-medium text-gray-500">Outstanding Balance</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">${outstanding.toFixed(2)}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-soft">
                    <div className="p-3 bg-blue-50 rounded-xl w-fit">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="mt-4">
                        <p className="text-sm font-medium text-gray-500">Total Invoices</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{invoices.length}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by invoice ID or guest..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none text-gray-900 font-medium"
                    />
                </div>
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-transparent border-none text-sm font-bold text-gray-900 focus:ring-0 cursor-pointer"
                        >
                            <option value="All">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Invoice List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Invoice ID</th>
                                <th className="px-6 py-4">Guest</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {invoices.filter(inv => {
                                const guestName = (inv.guestId?.name || 'Guest').toLowerCase();
                                const invId = inv._id.toLowerCase();
                                const matchesSearch = guestName.includes(searchQuery.toLowerCase()) || invId.includes(searchQuery.toLowerCase());
                                const matchesStatus = filterStatus === 'All' || inv.paymentStatus === filterStatus;
                                return matchesSearch && matchesStatus;
                            }).map((invoice) => (
                                <tr key={invoice._id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <FileText className="w-4 h-4 text-gray-400 mr-2" />
                                            <span className="font-mono text-[10px] text-gray-500">#{invoice._id.slice(-8).toUpperCase()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-900 font-bold uppercase tracking-wider">
                                        <p className="text-sm font-bold text-gray-900">{invoice.guestId?.name || 'Unknown Guest'}</p>
                                        <p className="text-[10px] text-gray-500">RES: {invoice.reservationId?._id?.slice(-8).toUpperCase() || 'N/A'}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-bold uppercase tracking-wider">{new Date(invoice.issuedAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900 uppercase tracking-wider">${(invoice.totalAmount || 0).toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${invoice.paymentStatus === 'paid' ? 'bg-blue-50 text-blue-600' :
                                            invoice.paymentStatus === 'pending' ? 'bg-amber-50 text-amber-600' :
                                                'bg-rose-50 text-rose-600'
                                            }`}>
                                            {invoice.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedInvoice(invoice);
                                                    setShowDetailModal(true);
                                                }}
                                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary-600 transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteInvoice(invoice._id)}
                                                className="p-2 hover:bg-rose-50 rounded-lg text-gray-400 hover:text-rose-600 transition-colors"
                                                title="Delete Invoice"
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
            </div>

            {/* Invoice Detail Modal */}
            {showDetailModal && selectedInvoice && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-white rounded-2xl shadow-sm">
                                    <Receipt className="w-6 h-6 text-primary-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Invoice Details</h2>
                                    <p className="text-gray-500 text-sm">#{selectedInvoice._id.toUpperCase()}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                            {/* Guest & Reservation Info */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Guest Information</p>
                                    <p className="text-lg font-bold text-gray-900">{selectedInvoice.guestId?.name || 'Guest'}</p>
                                    <p className="text-sm text-gray-500">{selectedInvoice.guestId?.email}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Issued On</p>
                                    <p className="text-lg font-bold text-gray-900">{new Date(selectedInvoice.issuedAt).toLocaleDateString()}</p>
                                    <p className="text-sm text-gray-500">{new Date(selectedInvoice.issuedAt).toLocaleTimeString()}</p>
                                </div>
                            </div>

                            {/* Stay Details */}
                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 text-gray-900">
                                        <Hotel className="w-5 h-5 text-gray-400" />
                                        <span className="font-bold">Room {selectedInvoice.reservationId?.roomId?.roomNumber}</span>
                                        <span className="text-xs text-gray-500 uppercase font-bold px-2 py-0.5 bg-white border border-gray-100 rounded-md">
                                            {selectedInvoice.reservationId?.roomId?.type}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm font-bold">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>{new Date(selectedInvoice.reservationId?.checkInDate).toLocaleDateString()}</span>
                                        <span className="text-gray-300 mx-1">—</span>
                                        <span>{new Date(selectedInvoice.reservationId?.checkOutDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Charges Breakdown */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Charges Breakdown</p>
                                <div className="space-y-3">
                                    <div className="flex justify-between py-3 border-b border-gray-50">
                                        <span className="text-gray-600 font-bold uppercase tracking-wider text-sm">Room Charges</span>
                                        <span className="text-gray-900 font-black">${selectedInvoice.roomCharges?.toFixed(2)}</span>
                                    </div>
                                    {selectedInvoice.additionalServicesCharges?.map((service, idx) => (
                                        <div key={idx} className="flex justify-between py-3 border-b border-gray-50">
                                            <span className="text-gray-600 font-bold uppercase tracking-wider text-sm">{service.serviceId?.name || 'Service'} (x{service.quantity})</span>
                                            <span className="text-gray-900 font-black">${service.amount?.toFixed(2)}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between py-4 text-primary-600 font-black border-t-2 border-primary-50">
                                        <span className="uppercase tracking-widest text-sm">Total Amount Due</span>
                                        <span className="text-2xl">${selectedInvoice.totalAmount?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Status Alert */}
                            {selectedInvoice.paymentStatus === 'pending' && (
                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center text-amber-700 text-xs font-bold leading-relaxed">
                                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                                    This payment is currently outstanding. Ensure physical payment is confirmed before marking as paid.
                                </div>
                            )}
                        </div>

                        <div className="p-8 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <button className="flex items-center space-x-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">
                                <Printer className="w-4 h-4" />
                                <span>Print Invoice</span>
                            </button>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Close
                                </button>
                                {selectedInvoice.paymentStatus === 'pending' && (
                                    <button
                                        disabled={isUpdating}
                                        onClick={() => handleUpdateStatus(selectedInvoice._id, 'paid')}
                                        className="btn btn-primary px-8 flex items-center space-x-2"
                                    >
                                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                            <>
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>Mark as Paid</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Create Invoice Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-primary-50 rounded-2xl">
                                    <Receipt className="w-6 h-6 text-primary-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Create Invoice</h2>
                                    <p className="text-gray-500 text-sm mt-1">Select a reservation to bill.</p>
                                </div>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateInvoice} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Select Pending Reservation</label>
                                <select
                                    required
                                    value={createFormData.reservationId}
                                    onChange={(e) => setCreateFormData({ ...createFormData, reservationId: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                                >
                                    <option value="">Select a reservation...</option>
                                    {availableReservations.map(res => (
                                        <option key={res._id} value={res._id}>
                                            {res.guestId?.name} - Room {res.roomId?.roomNumber} (${res.totalAmount})
                                        </option>
                                    ))}
                                </select>
                                {availableReservations.length === 0 && (
                                    <p className="text-xs text-amber-600 font-bold flex items-center mt-2">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        No pending checked-out reservations found.
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating || !createFormData.reservationId}
                                    className="btn btn-primary px-10"
                                >
                                    {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Invoice'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillingDashboard;
