import api from './api';

const getDashboardOverview = async () => {
    const response = await api.get('/reports/dashboard-overview');
    return response.data;
};

const getAnalytics = async () => {
    const response = await api.get('/reports/analytics');
    return response.data;
};

const exportDashboardCSV = (data) => {
    const headers = ['Booking ID,Guest,Room,Check-in,Status,Amount'];
    const rows = data.recentBookings.map(b => {
        const guestName = b.guestId?.userId?.name || 'N/A';
        const roomInfo = `${b.roomId?.type || ''} ${b.roomId?.roomNumber || ''}`;
        const checkIn = new Date(b.checkInDate).toLocaleDateString();
        return `${b._id},"${guestName}","${roomInfo}",${checkIn},${b.status},${b.totalAmount}`;
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dashboard_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const reportService = {
    getDashboardOverview,
    getAnalytics,
    exportDashboardCSV
};

export default reportService;
