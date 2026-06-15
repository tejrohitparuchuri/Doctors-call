const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { syncUserToFirebase } = require('../utils/firebaseSync');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecuresecretkeyshouldbechangedinproduction', {
        expiresIn: '30d'
    });
};

router.post('/register', async (req, res) => {
    const { email, password, age, gender, bloodGroup, healthCondition, insuranceId } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            email,
            password,
            age,
            gender,
            bloodGroup,
            healthCondition,
            insuranceId,
            role: 'patient'
        });

        // Sync to Firebase RTDB
        syncUserToFirebase(user);

        res.status(201).json({
            _id: user._id,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or authorization key' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/profile/saved-parts', protect, async (req, res) => {
    const { part } = req.body;
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            if (!user.savedParts.includes(part)) {
                user.savedParts.push(part);
                await user.save();
                // Sync to Firebase RTDB
                syncUserToFirebase(user);
            }
            res.json({ savedParts: user.savedParts });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
