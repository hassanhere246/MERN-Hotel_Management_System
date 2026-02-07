const Invoice = require("../models/Invoice");
const Reservation = require("../models/Reservation");
const Room = require("../models/Room");
const GuestProfile = require("../models/GuestProfile");
const Feedback = require("../models/Feedback");

// GET REVENUE REPORT
exports.getRevenueReport = async (req, res) => {
    try {
        const { timeframe = 'monthly' } = req.query;
        let startDate = new Date();
        let grouping = {};
        let formatDisplay = (item) => item;

        if (timeframe === 'daily') {
            startDate.setDate(startDate.getDate() - 7);
            grouping = { day: { $dayOfMonth: "$issuedAt" }, month: { $month: "$issuedAt" }, year: { $year: "$issuedAt" } };
            formatDisplay = (item) => ({ name: `${item._id.day}/${item._id.month}`, revenue: item.revenue, bookings: item.bookings });
        } else if (timeframe === 'weekly') {
            startDate.setDate(startDate.getDate() - 28);
            grouping = { week: { $week: "$issuedAt" }, year: { $year: "$issuedAt" } };
            formatDisplay = (item) => ({ name: `Week ${item._id.week}`, revenue: item.revenue, bookings: item.bookings });
        } else {
            startDate.setMonth(startDate.getMonth() - 6);
            grouping = { month: { $month: "$issuedAt" }, year: { $year: "$issuedAt" } };
            const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            formatDisplay = (item) => ({ name: monthNames[item._id.month], revenue: item.revenue, bookings: item.bookings });
        }

        const revenueReport = await Invoice.aggregate([
            {
                $match: {
                    paymentStatus: "paid",
                    issuedAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: grouping,
                    revenue: { $sum: "$totalAmount" },
                    bookings: { $count: {} }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 }
            }
        ]);

        const formattedRevenue = revenueReport.map(formatDisplay);

        // 2. Aggregate for KPIs
        const allPaidInvoices = await Invoice.find({ paymentStatus: "paid" });
        const totalRevenue = allPaidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

        const reservations = await Reservation.find({ status: { $ne: "canceled" } });
        const totalRooms = await Room.countDocuments();
        const occupancyRate = (reservations.length / (totalRooms * 30)) * 100; // Simplified monthly occupancy

        // 3. Occupancy by Room Type (Pie Chart)
        const occupancyByType = await Reservation.aggregate([
            {
                $match: {
                    status: { $ne: "canceled" }
                }
            },
            {
                $lookup: {
                    from: "rooms",
                    localField: "roomId",
                    foreignField: "_id",
                    as: "roomDetails"
                }
            },
            {
                $unwind: "$roomDetails"
            },
            {
                $group: {
                    _id: "$roomDetails.type",
                    value: { $sum: 1 }
                }
            },
            {
                $project: {
                    name: "$_id",
                    value: 1,
                    _id: 0
                }
            }
        ]);

        res.json({
            revenuePerformance: formattedRevenue,
            occupancyByType: occupancyByType.length > 0 ? occupancyByType : [
                { name: 'Single', value: 0 },
                { name: 'Double', value: 0 },
                { name: 'Suite', value: 0 },
                { name: 'Deluxe', value: 0 },
            ],
            kpis: {
                totalRevenue: totalRevenue.toFixed(2),
                avgDailyRate: (totalRevenue / (reservations.length || 1)).toFixed(2),
                occupancyRate: occupancyRate.toFixed(1),
                netProfit: (totalRevenue * 0.7).toFixed(2) // Mock profit logic
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET DASHBOARD OVERVIEW
exports.getDashboardOverview = async (req, res) => {
    try {
        // 1. Total Revenue
        const allPaidInvoices = await Invoice.find({ paymentStatus: "paid" });
        const totalRevenue = allPaidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

        // 2. Total Bookings
        const totalBookings = await Reservation.countDocuments();

        // 3. Total Guests
        const totalGuests = await GuestProfile.countDocuments();

        // 4. Occupancy Rate
        const totalRooms = await Room.countDocuments();
        const occupiedRooms = await Room.countDocuments({ status: "occupied" });
        const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

        // 5. Recent Bookings
        const recentBookings = await Reservation.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate({
                path: 'guestId',
                populate: { path: 'userId', select: 'name email' }
            })
            .populate('roomId', 'roomNumber type');

        // 6. Room Status counts
        const roomStatuses = await Room.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const statusCounts = {
            available: 0,
            occupied: 0,
            cleaning: 0,
            maintenance: 0
        };
        roomStatuses.forEach(s => {
            if (statusCounts.hasOwnProperty(s._id)) {
                statusCounts[s._id] = s.count;
            }
        });

        res.json({
            stats: {
                totalRevenue: totalRevenue.toFixed(2),
                totalBookings,
                totalGuests,
                occupancyRate: occupancyRate.toFixed(1)
            },
            recentBookings,
            roomStatus: statusCounts,
            totalRooms
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET ANALYTICS & FORECASTING
exports.getAnalytics = async (req, res) => {
    try {
        // 1. Demand Forecasting (Next 7 Days)
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        const upcomingReservations = await Reservation.find({
            checkInDate: { $lte: nextWeek },
            checkOutDate: { $gte: today },
            status: "confirmed"
        });

        const totalRooms = await Room.countDocuments();
        const forecast = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(today.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            const occupiedOnDate = upcomingReservations.filter(resv => {
                const start = new Date(resv.checkInDate).toISOString().split('T')[0];
                const end = new Date(resv.checkOutDate).toISOString().split('T')[0];
                return dateStr >= start && dateStr < end;
            }).length;

            forecast.push({
                date: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
                occupancy: (occupiedOnDate / (totalRooms || 1)) * 100,
                count: occupiedOnDate
            });
        }

        // 2. Pricing Optimization Recommendations
        const currentOccupancy = forecast[0].occupancy;
        let pricingRecommendation = {
            status: "Stables",
            action: "Maintain current rates",
            adjustment: 0,
            reason: "Occupancy is within optimal range (40-70%)"
        };

        if (currentOccupancy > 80) {
            pricingRecommendation = {
                status: "High Demand",
                action: "Increase rates by 20%",
                adjustment: 20,
                reason: "Extreme demand detected. Maximize ADR."
            };
        } else if (currentOccupancy > 60) {
            pricingRecommendation = {
                status: "Growth",
                action: "Increase rates by 10%",
                adjustment: 10,
                reason: "Healthy demand. Moderate price hike recommended."
            };
        } else if (currentOccupancy < 30) {
            pricingRecommendation = {
                status: "Low Demand",
                action: "Apply 15% discount",
                adjustment: -15,
                reason: "Occupancy is critically low. Drive volume via promotions."
            };
        }

        // 3. Guest Feedback Overview
        const feedbackStats = await Feedback.aggregate([
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        const recentFeedback = await Feedback.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate({
                path: 'guestId',
                populate: { path: 'userId', select: 'name' }
            })
            .populate('bookingId', 'bookingReference checkInDate checkOutDate');

        res.json({
            forecast,
            pricingRecommendation,
            feedback: {
                stats: feedbackStats[0] || { avgRating: 4.8, totalReviews: 24 }, // Fallback to mocks if no data
                recent: recentFeedback
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
