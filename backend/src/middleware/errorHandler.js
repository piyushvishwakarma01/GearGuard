/**
 * Global error handling middleware
 */

const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // PostgreSQL errors
    if (err.code) {
        switch (err.code) {
            case '23505': // Unique violation
                return res.status(409).json({
                    success: false,
                    message: 'Duplicate entry. This record already exists.',
                    error: err.detail,
                });
            case '23503': // Foreign key violation
                return res.status(400).json({
                    success: false,
                    message: 'Referenced record does not exist.',
                    error: err.detail,
                });
            case '23502': // Not null violation
                return res.status(400).json({
                    success: false,
                    message: 'Required field is missing.',
                    error: err.detail,
                });
            case '22P02': // Invalid text representation
                return res.status(400).json({
                    success: false,
                    message: 'Invalid data format.',
                    error: err.message,
                });
        }
    }

    // JWT errors (handled in auth middleware, but just in case)
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired',
        });
    }

    // Validation errors (from express-validator)
    if (err.status === 400 && err.errors) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: err.errors,
        });
    }

    // Default error
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

/**
 * 404 handler
 */
const notFound = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
};

module.exports = {
    errorHandler,
    notFound,
};
