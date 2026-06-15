const fs = require('fs');
const readline = require('readline');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

const specialtyToParts = {
    'ENT Specialist': ["Organs"],
    'General Physician': ["Organs", "Muscle"],
    'Psychiatrist': ["Brain"],
    'Dermatologist': ["Organs"],
    'Orthopedic Surgeon': ["Bones", "Muscle"],
    'Gynecologist': ["Organs"],
    'Oncologist': ["Organs"],
    'Neurologist': ["Brain", "Organs"],
    'Ophthalmologist': ["Organs"],
    'Cardiologist': ["Organs"],
    'Pediatrician': ["Organs"],
    'Gastroenterologist': ["Organs"]
};

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

const seedCsvDoctors = async () => {
    try {
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

            const cols = parseCSVLine(line);
            if (cols.length < 8) continue;

            const [docId, name, exp, specialty, fee, place, hospitalName, rating] = cols;

            // Generate initials
            const names = name.replace('Dr. ', '').split(' ');
            const initials = names.map(n => n[0]).join('').substring(0, 3).toUpperCase();

            doctorsData.push({
                docId,
                name,
                email: `doctor.${docId.toLowerCase()}@aesculapius.med`,
                experience: parseInt(exp) || 0,
                specialty,
                cost: parseInt(fee), // Direct Avg Fee (INR) from CSV
                place,
                hospitalName: hospitalName.replace(/^"|"$/g, ''),
                rating: parseFloat(rating) || 0,
                initials: initials || 'DOC',
                parts: specialtyToParts[specialty] || ["Organs"]
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
                email: d.email,
                password: 'doctorpassword123',
                role: 'doctor'
            }));

            const createdUsers = await User.insertMany(userDocs);

            // Map user IDs back to doctors and insert doctors batch
            const doctorDocs = batch.map((d, index) => ({
                userId: createdUsers[index]._id,
                name: d.name,
                specialty: d.specialty,
                cost: d.cost,
                initials: d.initials,
                parts: d.parts,
                experience: d.experience,
                place: d.place,
                hospitalName: d.hospitalName,
                rating: d.rating,
                isApproved: true
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
