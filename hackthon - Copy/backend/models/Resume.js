const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    metrics: {
        cgpa: { type: Number, default: 0 },
        internships: { type: Number, default: 0 },
        dsaScore: { type: Number, default: 0 }
    },
    analysis: {
        probability: { type: Number, default: 0 },
        atsScore: { type: Number, default: 0 },
        skills: [String],
        improvements: [String],
        strengths: [String],
        roles: [String]
    },
    fileName: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Resume', resumeSchema);
