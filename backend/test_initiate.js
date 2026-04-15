const axios = require('axios');

async function testInitiate() {
    try {
        console.log("Sending ping to http://localhost:5000/api/donation/initiate...");
        const res = await axios.post('http://localhost:5000/api/donation/initiate', {
            firstName: "Debug",
            lastName: "Tester",
            email: "debug@example.com",
            phone: "1234567890",
            address: "123 Debug Lane",
            city: "Debugger",
            state: "CA",
            country: "United States",
            zip: "90210",
            amount: 15.50
        });
        console.log('Success!', res.data);
    } catch (err) {
        console.error('FAILED with status:', err.response?.status);
        console.error('Error Body:', JSON.stringify(err.response?.data, null, 2));
    }
}

testInitiate();
