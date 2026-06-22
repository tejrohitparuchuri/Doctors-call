const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const path = require('path');
const fs = require('fs');

const updateDoctorProfileController = async (req, res) => {
    try {
        const { userId } = req.body;
        const doctor = await Doctor.findOneAndUpdate({ userId }, req.body, { new: true });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found', success: false });
        }
        res.status(200).json({ success: true, message: 'Doctor profile updated', data: doctor });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

const getAllDoctorAppointmentsController = async (req, res) => {
    try {
        const { userId } = req.body;
        const doctor = await Doctor.findOne({ userId });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found', success: false });
        }

        const appointments = await Appointment.find({ doctorInfo: doctor._id })
            .populate('userInfo')
            .lean();

        res.status(200).json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

const handleStatusController = async (req, res) => {
    try {
        const { appointmentId, status, userId } = req.body; // userId is the doctor's userId
        if (!appointmentId || !status) {
            return res.status(400).json({ message: 'Appointment ID and status are required', success: false });
        }

        const appointment = await Appointment.findByIdAndUpdate(appointmentId, { status }, { new: true });
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found', success: false });
        }

        const doctor = await Doctor.findOne({ userId });
        const doctorName = doctor ? doctor.fullname : 'Doctor';

        const user = await User.findById(appointment.userInfo);
        if (user) {
            user.notification.push({
                type: 'appointment-status-updated',
                message: `Your appointment with Dr. ${doctorName} has been ${status}`,
                onClickPath: '/userhome'
            });
            await user.save();
        }

        res.status(200).json({ success: true, message: `Appointment status updated to ${status}`, data: appointment });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

const documentDownloadController = async (req, res) => {
    try {
        const { appointId } = req.query;
        if (!appointId) {
            return res.status(400).json({ message: 'Appointment ID is required', success: false });
        }

        const appointment = await Appointment.findById(appointId);
        if (!appointment || !appointment.document || !appointment.document.path) {
            return res.status(404).json({ message: 'Document path not found for this appointment', success: false });
        }

        const filePath = path.resolve(appointment.document.path);
        if (fs.existsSync(filePath)) {
            res.download(filePath, appointment.document.name || 'document');
        } else {
            res.status(404).json({ message: 'Document file not found on disk', success: false });
        }
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

module.exports = {
    updateDoctorProfileController,
    getAllDoctorAppointmentsController,
    handleStatusController,
    documentDownloadController
};
