const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        set: function(val) {
            if (typeof val !== 'string') return val;
            return val.charAt(0).toUpperCase() + val.slice(1);
        }
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    specialisation: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    fees: {
        type: Number,
        required: true
    },
    timings: {
        type: [String],
        required: true
    },
    status: {
        type: String,
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('doctor', DoctorSchema);
