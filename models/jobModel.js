
const { Schema, model } = require('mongoose');

const JobSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    company: {
        type: String,
        required: true,
        trim: true,
    },
    position: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: false,
        trim: true,
    },
    status: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        required: true,
    },
    notes: {
        type: String,
        default: "",
        trim: true,
    },
    appliedDate: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const JobModel = model("Job", JobSchema);

module.exports = JobModel;
