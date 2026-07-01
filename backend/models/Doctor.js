const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    specialty: {
        type: String,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    initials: {
        type: String,
        required: true
    },
    parts: [String],
    experience: Number,
    place: String,
    hospitalName: String,
    rating: Number,
    isApproved: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', DoctorSchema);
