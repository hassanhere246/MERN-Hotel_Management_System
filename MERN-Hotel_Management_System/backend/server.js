require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const housekeepingRoutes = require('./routes/housekeepingRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const reportRoutes = require('./routes/reportRoutes');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);

app.use('/api/housekeeping', housekeepingRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/reports', reportRoutes);

const seedAdmin = require('./scripts/seedAdmin');

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB connected');
        await seedAdmin();
    })
    .catch(err => console.log(err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
