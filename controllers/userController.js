
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const connectDB = require('../config/db');
const bcrypt = require("bcrypt");
require("dotenv").config();
const saltRounds = 10;

const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

const createToken = (user) => {
    return jwt.sign({user}, process.env.JWTSECRETKEY, { expiresIn: "3d" });
}

const login = async (req, res) => {
    try {
        const { loginEmail, loginPassword, role } = req.body;
        const user = await User.findOne({ email: loginEmail });
        if (!user) return res.send({ status: 404, message: 'User not found' });
        bcrypt.compare(loginPassword, user.password, function (err, result) {
            if (result) {
                const token = createToken({ id: user._id, name: user.name, email: user.email, role: user.role });
                const oneDay = 24 * 60 * 60 * 1000; // 1 day in milliseconds
                res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none", maxAge: oneDay });
                return res.send({ status: 200, user, token, message: "Login successfully" });
            } else {
                return res.send({ status: 401, message: "Wrong password" });
            }
        });
    } catch (err) {
        res.send({ status: 404, message: 'User not found' });
    }
}

const signup = async (req, res) => {
    const { name, email, password, role } = req.body;
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
            if (err) return console.log(err);
            try {
                const newUser = new User({ name, email, password: hash });
                await newUser.save();
                res.status(200).send({ status: 200, newUser, message: "User has been created successfully" });
            } catch (err) {
                if (err.code === 11000) return res.status(400).send({ status: 400, success: false, message: "Email already exists. Please use another email" });
                res.status(500).json({ success: false, status: 500, message: "Internal Server Error" });
            }
        });
    });
}

const logout = (req, res) => {
    res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "None" });
    res.json({ message: "Logged out successfully" });
}

module.exports = { getUsers, login, signup, logout };
