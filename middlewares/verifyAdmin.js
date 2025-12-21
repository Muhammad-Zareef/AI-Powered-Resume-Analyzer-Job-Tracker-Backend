
const verifyAdmin = (req, res, next) => {
    if (req.user.user.role !== "admin") return res.status(403).json({ message: "Access denied, admin only" });
    next();
}

module.exports = verifyAdmin;
