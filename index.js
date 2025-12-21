
const express = require('express');
const app = express();
const connectDB = require('./config/db');
const fileUpload = require("express-fileupload");
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const jobRoutes = require('./routes/jobRoutes');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require("dotenv").config();

const PORT = process.env.PORT || 3000;

app.use(fileUpload());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: "https://ai-powered-resume-analyzer-job-trac-delta.vercel.app",
    credentials: true,
}));

// connect to database
connectDB();

app.use('/api', userRoutes);
app.use('/admin', adminRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api', jobRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log("Server running");
});
