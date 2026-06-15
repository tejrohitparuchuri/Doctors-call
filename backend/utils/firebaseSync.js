const https = require('https');

const syncUserToFirebase = (user) => {
    try {
        const userData = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            age: user.age,
            gender: user.gender,
            bloodGroup: user.bloodGroup,
            healthCondition: user.healthCondition,
            insuranceId: user.insuranceId,
            savedParts: user.savedParts || []
        };

        const postData = JSON.stringify(userData);

        const options = {
            hostname: 'doctors--call-default-rtdb.firebaseio.com',
            port: 443,
            path: `/users/${user._id.toString()}.json`,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            // Success
        });

        req.on('error', (e) => {
            console.error(`Firebase User Sync Error: ${e.message}`);
        });

        req.write(postData);
        req.end();
    } catch (err) {
        console.error('Firebase User Sync Exception:', err.message);
    }
};

module.exports = { syncUserToFirebase };
