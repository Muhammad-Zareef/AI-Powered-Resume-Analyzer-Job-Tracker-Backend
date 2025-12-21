
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const { getJobs, getJobById, addJob, updateJob, deleteJob } = require('../controllers/jobController');

router.get('/jobs', verifyToken, getJobs);
router.get('/jobs/:id', verifyToken, getJobById);
router.post('/jobs', verifyToken, addJob);
router.put('/jobs/:id', verifyToken, updateJob);
router.delete('/jobs/:id', verifyToken, deleteJob);

module.exports = router;
