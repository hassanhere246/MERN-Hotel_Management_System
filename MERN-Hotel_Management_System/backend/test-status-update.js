const axios = require('axios');

async function testStatusUpdate() {
    const API_URL = 'http://localhost:5000/api';

    try {
        // 1. Login as Admin
        console.log('Logging in as admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@hotel.com', // Assuming this user exists
            password: 'password123'
        });

        const token = loginRes.data.token;
        console.log('Login successful.');

        // 2. Get all users to find a pending one (or just pick one)
        console.log('Fetching users...');
        const usersRes = await axios.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const users = usersRes.data;
        const pendingUser = users.find(u => u.status === 'pending') || users[0];

        if (!pendingUser) {
            console.log('No users found.');
            return;
        }

        console.log(`Updating status for user: ${pendingUser.email} (Current: ${pendingUser.status})`);

        // 3. Update status to approved
        const updateRes = await axios.put(`${API_URL}/users/${pendingUser._id}/status`,
            { status: 'approved' },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('Update Result:', updateRes.data);

        if (updateRes.data.user.status === 'approved') {
            console.log('SUCCESS: User status updated to approved.');
        } else {
            console.log('FAILURE: User status did not change correctly.');
        }

    } catch (err) {
        console.error('ERROR:', err.response?.data || err.message);
    }
}

testStatusUpdate();
