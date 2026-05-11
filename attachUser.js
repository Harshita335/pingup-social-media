const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Attach user to request if token cookie exists; do NOT fail if missing/invalid
module.exports = async (req, res, next) => {
    try {
        const { token } = req.cookies || {};
        if (!token) return next();

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded && decoded.id) {
            req.user = await User.findById(decoded.id);
        }
    } catch (e) {
        // ignore errors and continue without attaching user
    }
    next();
}
