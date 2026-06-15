const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const { protect, authorize } = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const { costLimit, parts, place, specialty, search } = req.query;
        let query = { isApproved: true };

        if (costLimit) {
            query.cost = { $lte: parseInt(costLimit) };
        }

        if (parts) {
            const partsArray = parts.split(',');
            query.parts = { $in: partsArray };
        }

        if (place) {
            query.place = place;
        }

        if (specialty) {
            query.specialty = specialty;
        }

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { name: searchRegex },
                { specialty: searchRegex },
                { hospitalName: searchRegex }
            ];
        }

        const doctors = await Doctor.find(query).limit(100);
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', protect, async (req, res) => {
    const { name, specialty, cost, initials, parts } = req.body;
    try {
        const doc = await Doctor.create({
            userId: req.user._id,
            name,
            specialty,
            cost,
            initials,
            parts,
            isApproved: true
        });
        res.status(201).json(doc);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
