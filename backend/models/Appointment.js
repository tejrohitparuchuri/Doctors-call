const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    doctorInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'doctor',
        required: true
    },
    userInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    date: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'pending'
    },
    document: {
        name: { type: String },
        path: { type: String }
    }
}, { timestamps: true });

module.exports = mongoose.model('appointment', AppointmentSchema);
