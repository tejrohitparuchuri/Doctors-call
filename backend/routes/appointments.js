const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect } = require('../middleware/auth');

// Create a new pending appointment request
router.post('/', protect, async (req, res) => {
    const { doctorId, dateTime, consultationType } = req.body;
    try {
        const appointment = await Appointment.create({
            patientId: req.user._id,
            doctorId,
            dateTime: dateTime || new Date(),
            consultationType: consultationType || 'online',
            status: 'pending',
            paymentStatus: 'unpaid',
            callsRemaining: 2
        });
        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin endpoint: Get all appointments/sessions in system
router.get('/all', protect, async (req, res) => {
    try {
        const appointments = await Appointment.find({})
            .populate('patientId', 'email age gender')
            .populate('doctorId');
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// User endpoint: Get active/my appointments
router.get('/my', protect, async (req, res) => {
    try {
        let appointments;
        if (req.user.role === 'doctor') {
            appointments = await Appointment.find({ doctorId: req.user._id }).populate('patientId', 'email age gender');
        } else {
            appointments = await Appointment.find({ patientId: req.user._id }).populate('doctorId');
        }
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin endpoint: Approve appointment request
router.put('/:id/approve', protect, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        appointment.status = 'approved';
        await appointment.save();
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// User endpoint: Pay for approved appointment
router.post('/:id/pay', protect, async (req, res) => {
    const { consultationType } = req.body;
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        if (appointment.status !== 'approved') {
            return res.status(400).json({ message: 'Appointment must be approved by admin before payment' });
        }
        
        appointment.status = 'confirmed';
        appointment.paymentStatus = 'paid';
        appointment.consultationType = consultationType || appointment.consultationType;
        appointment.expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from payment
        appointment.callsRemaining = 2;
        
        await appointment.save();
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Standard update endpoint
router.put('/:id', protect, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        appointment.status = req.body.status || appointment.status;
        await appointment.save();
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Active session call utility
router.post('/:id/use-call', protect, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Session not found' });
        }
        
        if (new Date(appointment.expiresAt) < new Date()) {
            return res.status(400).json({ message: 'Session has expired (48-hour limit reached)' });
        }
        
        if (appointment.callsRemaining <= 0) {
            return res.status(400).json({ message: 'No calls remaining in this session (max 2 calls reached)' });
        }
        
        appointment.callsRemaining -= 1;
        await appointment.save();
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
