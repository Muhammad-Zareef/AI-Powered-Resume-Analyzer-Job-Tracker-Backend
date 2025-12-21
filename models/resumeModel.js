
const { Schema, model } = require('mongoose');

const ResumeSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    userEmail: {
        type: String,
        required: true,
    },
    originalText: {
        type: String,
        required: true,
        trim: true,
    },
    aiImprovedText: {
        type: String,
        required: false,
        trim: true,
    },
    aiScore: {
        type: Number,
        default: 0,
    },
    atsScore: {
        type: Number,
        default: 0,
    },
    jobMatchPercentage: {
        type: Number,
        default: 0,
    },
    missingSkills: {
        type: [String],
        default: [],
    },
    suggestions: {
        type: [String],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const ResumeModel = model("Resume", ResumeSchema);

module.exports = ResumeModel;
