
const Job = require('../models/jobModel');

const getJobs = async (req, res) => {
    try {
        const userId = req.user.user.id;
        const jobs = await Job.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const getJobById = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await Job.findById(id);
        res.status(200).json({ message: "Successfully!", job });
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const addJob = async (req, res) => {
    try {
        const userId = req.user.user.id;
        const { company, position, description, status, link, notes, appliedDate } = req.body;
        const newJob = new Job({ userId, company, position, description, status, link, notes, appliedDate });
        await newJob.save();
        res.send({ success: true, job: newJob });
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const { company, position, jobDescription, status, notes } = req.body;
        const updatedJob = await Job.findByIdAndUpdate(id, { company, position, jobDescription, status, notes }, {new: true});
        res.status(200).json({ message: "Job updated successfully!", updatedJob });
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedJob = await Job.findByIdAndDelete(id);
        res.status(200).json({ message: "Job deleted successfully", deletedJob });
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports = { getJobs, getJobById, addJob, updateJob, deleteJob };
