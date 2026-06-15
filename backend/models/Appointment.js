const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    dateTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    consultationType: {
        type: String,
        enum: ['online', 'offline'],
        default: 'online'
    },
    expiresAt: {
        type: Date
    },
    callsRemaining: {
        type: Number,
        default: 2
    },
    documents: [String]
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
