
const Job = require('../models/jobModel');
const User = require('../models/userModel');
const Resume = require('../models/resumeModel');
const bcrypt = require("bcrypt");
const saltRounds = 10;

const auth = (req, res) => {
    res.json({ message: "Welcome Admin Dashboard", admin: req.user.user });
}

const getDashboardStats = async (req, res) => {
    try {
        const totalResumes = await Resume.countDocuments();
        const totalJobs = await Job.countDocuments();
        const totalUsers = await User.countDocuments();
        // growth logic (calculate in future)
        const resumeGrowth = 12;
        const jobGrowth = 8;
        const userGrowth = 15;
        res.status(200).json({ success: true, data: { totalResumes, resumeGrowth, totalJobs, jobGrowth, totalUsers, userGrowth }});
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to load dashboard stats" });
    }
}

const getRecentActivity = async (req, res) => {
    try {
        const resumes = await Resume.find().sort({ createdAt: -1 }).limit(3).select("userName createdAt");
        const jobs = await Job.find().sort({ createdAt: -1 }).limit(3).select("position company createdAt");
        const users = await User.find().sort({ createdAt: -1 }).limit(3).select("email createdAt");
        const activity = [
            ...resumes.map(r => ({
                type: "resume",
                title: "New resume analyzed",
                description: `${r.userName} uploaded a resume`,
                createdAt: r.createdAt
            })),
            ...jobs.map(j => ({
                type: "job",
                title: "New job added",
                description: `${j.position} at ${j.company}`,
                createdAt: j.createdAt
            })),
            ...users.map(u => ({
                type: "user",
                title: "New user registered",
                description: u.email,
                createdAt: u.createdAt
            }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        res.json({ success: true, data: activity });
    } catch (err) {
        res.status(500).json({ success: false });
    }
}

const getResumes = async (req, res) => {
    try {
        const resumes = await Resume.find().sort({ createdAt: -1 });
        res.status(200).json(resumes);
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const getResumeById = async (req, res) => {
    try {
        const { id } = req.params;
        const resume = await Resume.findById(id);
        res.status(200).json({ message: "Successfully!", resume });
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const filterResumes = async (req, res) => {
    const { search, ats, ai, date } = req.query;
    let query = {};
    if (search) {
        query.$or = [
        { userName: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
        ];
    }
    if (ats) {
        const [min, max] = ats.split("-").map(Number);
        query.atsScore = { $gte: min, $lte: max };
    }
    if (ai) {
        const [min, max] = ai.split("-").map(Number);
        query.aiScore = { $gte: min, $lte: max };
    }
    if (date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        query.createdAt = { $gte: start, $lte: end };
    }
    console.log(JSON.stringify(query, null, 2));
    try {
        const resumes = await Resume.find(query).sort({ createdAt: -1 });
        res.json({ success: true, resumes });
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const deleteResume = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedResume = await Resume.findByIdAndDelete(id);
        res.status(200).json({ message: "Resume deleted successfully", deletedResume });
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const filterJobs = async (req, res) => {
    try {
        const { search, status, company } = req.query;
        let query = {};
        // Search by job position
        if (search && search.trim() !== "") {
            query.position = { $regex: search.trim(), $options: "i" };
        }
        // Status filter
        if (status) {
            query.status = status;
        }
        // Company filter
        if (company) {
            query.company = new RegExp(company, "i");
        }
        const jobs = await Job.find(query).sort({ createdAt: -1 });
        res.json({ success: true, jobs });
    } catch (err) { res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

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
        const { company, position, description, status, link, notes, appliedDate } = req.body;
        const updatedJob = await Job.findByIdAndUpdate(id, { company, position, description, status, link, notes, appliedDate }, {new: true});
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

const getUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        res.status(200).json({ message: "Successfully!", user });
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const addUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
            if (err) {
                return console.log(err);
            }
            try {
                const newUser = new User({ name, email, password: hash, role });
                await newUser.save();
                res.status(200).send({ status: 200, newUser, message: "User has been created successfully" });
            } catch (err) {
                if (err.code === 11000) {
                    return res.status(400).send({ status: 400, success: false, message: "Email already exists. Please use another email" });
                }
                res.status(500).json({ success: false, status: 500, message: "Internal Server Error", });
            }
        });
    });
}

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;
        const updatedUser = await User.findByIdAndUpdate(id, { name, email, role }, {new: true});
        res.status(200).json({ message: "User updated successfully!", updatedUser });
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        res.status(200).json({ message: "User deleted successfully", deletedUser });
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const logout = (req, res) => {
    res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "None" });
    res.json({ message: "Logged out successfully" });
}

module.exports = { auth, getDashboardStats, getRecentActivity, getResumes, getResumeById, filterResumes, deleteResume, getJobs, filterJobs, getJobById, addJob, updateJob, deleteJob, getUsers, getUserById, addUser, updateUser, deleteUser, logout };
