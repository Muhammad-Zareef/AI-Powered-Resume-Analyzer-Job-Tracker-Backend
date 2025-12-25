
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

app.use(cors({
    origin: 'https://ai-powered-resume-analyzer-job-trac-delta.vercel.app',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload());

(async function () {
    try {
        await connectDB();
        console.log("DB connected successfully");
    } catch (error) {
        console.error("DB connection failed:", error);
    }
})();

app.use('/admin', adminRoutes);
app.use('/api', userRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api', jobRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log("Server running");
});
