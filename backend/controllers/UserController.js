const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_KEY || process.env.JWT_SECRET || 'supersecuresecretkeyshouldbechangedinproduction', {
        expiresIn: '30d'
    });
};

const registerController = async (req, res) => {
    try {
        const { fullName, email, password, phone, type } = req.body;
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required', success: false });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists', success: false });
        }

        const userType = type || 'user';
        const userRole = userType === 'user' ? 'patient' : userType;
        const newUser = new User({
            fullName,
            email,
            password,
            phone: phone || '',
            type: userType,
            role: userRole
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required', success: false });
        }

        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password', success: false });
        }

        const token = generateToken(user._id);
        const userData = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            isdoctor: user.isdoctor,
            type: user.type,
            role: user.role,
            notification: user.notification,
            seennotification: user.seennotification
        };

        res.json({ message: 'Login success', success: true, token, userData });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

const authController = async (req, res) => {
    try {
        const user = await User.findById(req.body.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }
        user.password = undefined;
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

const docController = async (req, res) => {
    try {
        const { fullname, email, phone, address, specialisation, experience, fees, timings, userId } = req.body;
        if (!fullname || !email || !phone || !address || !specialisation || !experience || !fees || !timings) {
            return res.status(400).json({ message: 'All doctor fields are required', success: false });
        }

        // Check if doctor profile already exists
        const docExists = await Doctor.findOne({ userId });
        if (docExists) {
            return res.status(400).json({ message: 'Doctor profile application already exists for this user', success: false });
        }

        const newDoctor = new Doctor({
            userId,
            fullname,
            email,
            phone,
            address,
            specialisation,
            experience,
            fees: Number(fees),
            timings: Array.isArray(timings) ? timings : [timings],
            status: 'pending'
        });

        await newDoctor.save();

        // Notify Admin
        const adminUser = await User.findOne({ $or: [{ type: 'admin' }, { role: 'admin' }] });
        if (adminUser) {
            adminUser.notification.push({
                type: 'new-doctor-application',
                message: `New doctor application request from ${fullname}`,
                onClickPath: '/admin/doctors'
            });
            await adminUser.save();
        }

        res.status(201).json({ message: 'Doctor profile application submitted successfully', success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

const getallnotificationController = async (req, res) => {
    try {
        const user = await User.findById(req.body.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        const notifications = user.notification;
        user.seennotification.push(...notifications);
        user.notification = [];
        const updatedUser = await user.save();
        updatedUser.password = undefined;

        res.status(200).json({ success: true, message: 'All notifications marked as read', data: updatedUser });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

const deleteallnotificationController = async (req, res) => {
    try {
        const user = await User.findById(req.body.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        user.notification = [];
        user.seennotification = [];
        const updatedUser = await user.save();
        updatedUser.password = undefined;

        res.status(200).json({ success: true, message: 'All notifications cleared', data: updatedUser });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

const getAllDoctorsControllers = async (req, res) => {
    try {
        const doctors = await Doctor.find({ status: 'approved' });
        res.status(200).json({ success: true, data: doctors });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

const appointmentController = async (req, res) => {
    try {
        const { doctorId, date, userId } = req.body;
        if (!doctorId || !date) {
            return res.status(400).json({ message: 'Doctor ID and Date are required', success: false });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        let docDetails = null;
        if (req.file) {
            docDetails = {
                name: req.file.originalname,
                path: req.file.path
            };
        }

        const newAppointment = new Appointment({
            doctorInfo: doctorId,
            userInfo: userId,
            date,
            status: 'pending',
            document: docDetails
        });

        await newAppointment.save();

        // Notify Doctor
        const doctor = await Doctor.findById(doctorId);
        if (doctor) {
            const doctorUser = await User.findById(doctor.userId);
            if (doctorUser) {
                doctorUser.notification.push({
                    type: 'new-appointment-booking',
                    message: `New appointment booking request from ${user.fullName}`,
                    onClickPath: '/doctor/appointments'
                });
                await doctorUser.save();
            }
        }

        res.status(201).json({ message: 'Appointment booked successfully', success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

const getAllUserAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ userInfo: req.body.userId })
            .populate('doctorInfo')
            .lean();

        // Map to inject docName and other details for client compatibility
        const mapped = appointments.map(appt => ({
            ...appt,
            docName: appt.doctorInfo ? appt.doctorInfo.fullname : 'N/A'
        }));

        res.status(200).json({ success: true, data: mapped });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

const getDocsforuser = async (req, res) => {
    try {
        // Retrieve appointments with documents
        const appointments = await Appointment.find({
            userInfo: req.body.userId,
            'document.path': { $exists: true, $ne: null }
        }).lean();

        const docs = appointments.map(appt => ({
            appointmentId: appt._id,
            document: appt.document,
            date: appt.date
        }));

        res.status(200).json({ success: true, data: docs });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

module.exports = {
    registerController,
    loginController,
    authController,
    docController,
    getallnotificationController,
    deleteallnotificationController,
    getAllDoctorsControllers,
    appointmentController,
    getAllUserAppointments,
    getDocsforuser
};
