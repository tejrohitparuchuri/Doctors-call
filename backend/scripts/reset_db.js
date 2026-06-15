const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const reset = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/doctors_call');
        console.log('Connected to database to reset collections...');
        
        const db = conn.connection.db;
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        if (collectionNames.includes('doctors')) {
            await db.dropCollection('doctors');
            console.log('Dropped doctors collection.');
        }
        if (collectionNames.includes('users')) {
            // Drop users but maybe keep normal users?
            // Actually, the seed script seeds doctors, and normal users are registered by the patient.
            // If we drop users, the patient will need to register again. But since it's just local development, this is perfectly fine.
            await db.dropCollection('users');
            console.log('Dropped users collection.');
        }
        if (collectionNames.includes('appointments')) {
            await db.dropCollection('appointments');
            console.log('Dropped appointments collection.');
        }
        console.log('Database collections reset successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error resetting database:', err);
        process.exit(1);
    }
};

reset();
