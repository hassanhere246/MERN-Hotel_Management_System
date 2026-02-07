const API_URL = 'http://127.0.0.1:5000/api';

async function debugMaintenance() {
    try {
        console.log('1. Registering Manager (Bypassed)...');
        const managerEmail = `manager_${Date.now()}@test.com`;
        const managerPass = '123456';

        const registerRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Manager',
                email: managerEmail,
                password: managerPass,
                role: 'manager'
            })
        });

        const regData = await registerRes.json();
        if (!registerRes.ok) throw new Error(`Register failed: ${JSON.stringify(regData)}`);
        console.log('Manager registered.');

        const token = regData.token;
        console.log('Token acquired.');

        console.log('2. Fetching rooms...');
        const roomsRes = await fetch(`${API_URL}/rooms`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const roomsData = await roomsRes.json();
        if (!roomsRes.ok) throw new Error(`Get Rooms failed: ${JSON.stringify(roomsData)}`);

        const room = roomsData[0];
        if (!room) throw new Error('No rooms found');
        console.log(`Found room: ${room.roomNumber} (${room._id}) status:${room.status}`);

        console.log('3. Creating Maintenance Request...');
        const payload = {
            roomId: room._id,
            issueDescription: 'Debug test issue',
            priority: 'Normal'
        };
        const maintRes = await fetch(`${API_URL}/maintenance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const maintData = await maintRes.json();

        if (maintRes.ok) {
            console.log('SUCCESS! Request created:', maintData);
        } else {
            console.error('FAILURE! Status:', maintRes.status);
            console.error('Data:', JSON.stringify(maintData, null, 2));
        }

    } catch (error) {
        console.error('Script Error:', error.message);
        if (error.cause) console.error(error.cause);
    }
}

debugMaintenance();
