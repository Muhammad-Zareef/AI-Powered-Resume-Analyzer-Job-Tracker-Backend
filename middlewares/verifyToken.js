
const jwt = require('jsonwebtoken');
require("dotenv").config();

const verifyToken = (req, res, next) => {
    const token = req.cookies?.token; // read token from cookie
    if (!token) return res.json({ status: 401, message: "No token provided" });
    try {
        const decoded = jwt.verify(token, process.env.JWTSECRETKEY);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ err, message: "Invalid or expired token" });
    }
}

module.exports = verifyToken;
