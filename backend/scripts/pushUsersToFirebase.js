const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const https = require('https');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

const pushUsersToFirebase = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/doctors_call');
        console.log('Connected to MongoDB...');

        const users = await User.find({}).select('-password');
        console.log(`Fetched ${users.length} users from MongoDB.`);

        const usersData = {};
        users.forEach(u => {
            usersData[u._id.toString()] = {
                id: u._id.toString(),
                email: u.email,
                role: u.role,
                age: u.age,
                gender: u.gender,
                bloodGroup: u.bloodGroup,
                healthCondition: u.healthCondition,
                insuranceId: u.insuranceId,
                savedParts: u.savedParts || []
            };
        });

        console.log('Pushing users data to Firebase Realtime Database...');
        const postData = JSON.stringify(usersData);

        const options = {
            hostname: 'doctors--call-default-rtdb.firebaseio.com',
            port: 443,
            path: '/users.json',
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            console.log(`Firebase Response Status: ${res.statusCode}`);
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                console.log('Upload finished.');
                console.log('All users successfully pushed to Firebase!');
                process.exit(0);
            });
        });

        req.on('error', (e) => {
            console.error(`Error uploading data: ${e.message}`);
            process.exit(1);
        });

        req.write(postData);
        req.end();

    } catch (err) {
        console.error('Error migrating users to Firebase:', err);
        process.exit(1);
    }
};

pushUsersToFirebase();
