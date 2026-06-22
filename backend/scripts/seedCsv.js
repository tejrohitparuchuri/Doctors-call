const fs = require('fs');
const readline = require('readline');
const path = require('path');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

const seedCsvDoctors = async () => {
    try {
        // Seed admin user if not exists
        const adminExists = await User.findOne({ email: 'admin@doctor.com' });
        if (!adminExists) {
            await User.create({
                fullName: 'Admin User',
                email: 'admin@doctor.com',
                password: '123456',
                role: 'admin',
                type: 'admin',
                phone: '1234567890',
                isdoctor: false
            });
            console.log('Admin credentials seeded: admin@doctor.com / 123456');
        }

        const doctorCount = await Doctor.countDocuments();
        if (doctorCount > 10) {
            console.log('Doctors are already seeded. Skipping CSV import.');
            return;
        }

        const csvPath = path.join(__dirname, '../../doctors_india_1000.csv');
        if (!fs.existsSync(csvPath)) {
            console.warn(`CSV file not found at ${csvPath}`);
            return;
        }

        console.log('Parsing doctors CSV...');
        const fileStream = fs.createReadStream(csvPath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        const doctorsData = [];
        let isHeader = true;

        for await (const line of rl) {
            if (!line.trim()) continue;
            if (isHeader) {
                isHeader = false;
                continue;
            }

            const cols = [];
            let current = '';
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    cols.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            cols.push(current.trim());

            if (cols.length < 8) continue;

            const [docId, name, exp, specialty, fee, place, hospitalName, rating] = cols;

            doctorsData.push({
                docId,
                name: name.replace(/^"|"$/g, ''),
                email: `doctor.${docId.toLowerCase()}@aesculapius.med`,
                experience: exp.trim(),
                specialty: specialty.trim(),
                cost: parseInt(fee) || 500,
                place: place.trim(),
                hospitalName: hospitalName.replace(/^"|"$/g, '')
            });
        }

        console.log(`Prepared ${doctorsData.length} doctors for seeding. Creating User credentials...`);

        // To comply with unique index constraints on userId, we will create user profiles for each doctor.
        // We do this in batches of 200 to be friendly to memory and db connection limits.
        const batchSize = 200;
        for (let i = 0; i < doctorsData.length; i += batchSize) {
            const batch = doctorsData.slice(i, i + batchSize);
            
            // Create user batch
            const userDocs = batch.map(d => ({
                fullName: d.name,
                email: d.email,
                password: 'doctorpassword123',
                role: 'doctor',
                type: 'doctor',
                isdoctor: true,
                phone: '9999999999'
            }));

            const createdUsers = await User.insertMany(userDocs);

            // Map user IDs back to doctors and insert doctors batch
            const doctorDocs = batch.map((d, index) => ({
                userId: createdUsers[index]._id,
                fullname: d.name,
                email: d.email,
                phone: '9999999999',
                address: `${d.hospitalName}, ${d.place}, India`,
                specialisation: d.specialty,
                experience: `${d.experience} years`,
                fees: d.cost,
                timings: ['09:00 - 13:00', '15:00 - 19:00'],
                status: 'approved'
            }));

            await Doctor.insertMany(doctorDocs);
            console.log(`Seeded batch ${i / batchSize + 1}...`);
        }

        console.log('All doctors imported successfully from CSV!');

    } catch (error) {
        console.error('Error seeding doctors from CSV:', error);
    }
};

module.exports = seedCsvDoctors;
