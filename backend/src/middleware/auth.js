const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware to verify JWT token and authenticate user
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required',
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Contains: { id, email, role }
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired',
            });
        }
        return res.status(403).json({
            success: false,
            message: 'Invalid token',
        });
    }
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch (error) {
            // Token invalid but we don't fail the request
            req.user = null;
        }
    }

    next();
};

module.exports = {
    authenticateToken,
    optionalAuth,
};
