const fs = require('fs');
const readline = require('readline');
const path = require('path');
const https = require('https');

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

const pushToFirebase = async () => {
    try {
        const csvPath = path.join(__dirname, '../../doctors_india_1000.csv');
        if (!fs.existsSync(csvPath)) {
            console.error(`CSV file not found at ${csvPath}`);
            return;
        }

        console.log('Parsing doctors CSV...');
        const fileStream = fs.createReadStream(csvPath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        const doctorsData = {};
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

            doctorsData[docId] = {
                docId,
                name,
                experience: parseInt(exp) || 0,
                specialty,
                cost: parseInt(fee), // Raw fee matching MongoDB
                place,
                hospitalName: hospitalName.replace(/^"|"$/g, ''),
                rating: parseFloat(rating) || 0,
                initials: initials || 'DOC',
                parts: specialtyToParts[specialty] || ["Organs"]
            };
        }

        const count = Object.keys(doctorsData).length;
        console.log(`Parsed ${count} doctors. Pushing to Firebase Realtime Database...`);

        const postData = JSON.stringify(doctorsData);

        const options = {
            hostname: 'doctors--call-default-rtdb.firebaseio.com',
            port: 443,
            path: '/doctors.json',
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
                console.log('All doctors successfully pushed to Firebase!');
                process.exit(0);
            });
        });

        req.on('error', (e) => {
            console.error(`Error uploading data: ${e.message}`);
            process.exit(1);
        });

        req.write(postData);
        req.end();

    } catch (error) {
        console.error('Error parsing/uploading:', error.message);
        process.exit(1);
    }
};

pushToFirebase();
