const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

const getAllUsersControllers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

const getAllDoctorsControllers = async (req, res) => {
    try {
        const doctors = await Doctor.find({});
        res.status(200).json({ success: true, data: doctors });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

const getStatusApproveController = async (req, res) => {
    try {
        const { doctorId, status, userid } = req.body;
        if (!doctorId || !userid) {
            return res.status(400).json({ message: 'Doctor ID and User ID are required', success: false });
        }

        const doctor = await Doctor.findByIdAndUpdate(doctorId, { status: 'approved' }, { new: true });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found', success: false });
        }

        const user = await User.findById(userid);
        if (user) {
            user.isdoctor = true;
            user.role = 'doctor';
            user.type = 'doctor';
            user.notification.push({
                type: 'doctor-request-approved',
                message: `Your doctor account request has been approved.`,
                onClickPath: '/doctorhome'
            });
            await user.save();
        }

        res.status(200).json({ success: true, message: 'Doctor application approved', data: doctor });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

const getStatusRejectController = async (req, res) => {
    try {
        const { doctorId, status, userid } = req.body;
        if (!doctorId || !userid) {
            return res.status(400).json({ message: 'Doctor ID and User ID are required', success: false });
        }

        const doctor = await Doctor.findByIdAndUpdate(doctorId, { status: 'rejected' }, { new: true });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found', success: false });
        }

        const user = await User.findById(userid);
        if (user) {
            user.notification.push({
                type: 'doctor-request-rejected',
                message: `Your doctor account request has been rejected.`,
                onClickPath: '/apply-doctor'
            });
            await user.save();
        }

        res.status(200).json({ success: true, message: 'Doctor application rejected', data: doctor });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

const displayAllAppointmentController = async (req, res) => {
    try {
        const appointments = await Appointment.find({})
            .populate('doctorInfo')
            .populate('userInfo')
            .lean();

        res.status(200).json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

module.exports = {
    getAllUsersControllers,
    getAllDoctorsControllers,
    getStatusApproveController,
    getStatusRejectController,
    displayAllAppointmentController
};
