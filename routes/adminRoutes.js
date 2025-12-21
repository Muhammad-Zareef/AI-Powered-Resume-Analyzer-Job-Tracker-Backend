
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const verifyAdmin = require('../middlewares/verifyAdmin');
const { auth, getDashboardStats, getRecentActivity, getResumes, getResumeById, filterResumes, deleteResume, getJobs, filterJobs, getJobById, addJob, updateJob, deleteJob, getUsers, getUserById, addUser, updateUser, deleteUser, logout } = require('../controllers/adminController');

// Route-by-route verification
router.use(verifyToken, verifyAdmin);

// Dashboard
router.get("/dashboard", auth);
router.get("/dashboard-stats", getDashboardStats);
router.get("/recent-activity", getRecentActivity);

// Resumes
router.get('/resumes/filter', filterResumes);
router.get('/resumes', getResumes);
router.get('/resumes/:id', getResumeById);
router.delete('/resumes/:id', deleteResume);

// Jobs
router.get('/jobs/filter', filterJobs);
router.get('/jobs', getJobs);
router.get('/jobs/:id', getJobById);
router.post('/jobs', addJob);
router.put('/jobs/:id', updateJob);
router.delete('/jobs/:id', deleteJob);

// Users
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', addUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Auth
router.post('/logout', logout);

module.exports = router;
