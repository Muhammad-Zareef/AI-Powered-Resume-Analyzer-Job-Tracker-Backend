
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const { getResumes, getResumeById, analyzeResume, downloadResume, deleteResume, clearAllHistory, auth } = require('../controllers/resumeController');

router.get('/auth', verifyToken, auth);
router.get('/', verifyToken, getResumes);
router.get('/:id', verifyToken, getResumeById);
router.post('/analyze', verifyToken, analyzeResume);
router.post('/download', verifyToken, downloadResume);
router.delete('/deleteResume/:id', verifyToken, deleteResume);
router.delete('/clearAllHistory', verifyToken, clearAllHistory);

module.exports = router;
