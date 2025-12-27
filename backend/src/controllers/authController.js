const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
require('dotenv').config();

/**
 * Generate JWT access token
 */
const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
    );
};

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
    );
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public (or Manager only in production)
 */
const register = async (req, res, next) => {
    try {
        const { email, password, full_name, role, phone } = req.body;

        // Check if user already exists
        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists',
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert user
        const result = await db.query(
            `INSERT INTO users (email, password_hash, full_name, role, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, role, phone, is_active, created_at`,
            [email, password_hash, full_name, role || 'User', phone]
        );

        const user = result.rows[0];

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    phone: user.phone,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user
        const result = await db.query(
            `SELECT id, email, password_hash, full_name, role, phone, is_active
       FROM users
       WHERE email = $1 AND deleted_at IS NULL`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        const user = result.rows[0];

        // Check if user is active
        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated. Please contact administrator.',
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    phone: user.phone,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token required',
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Get latest user data
        const result = await db.query(
            `SELECT id, email, full_name, role, is_active
       FROM users
       WHERE id = $1 AND deleted_at IS NULL`,
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
            });
        }

        const user = result.rows[0];

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated',
            });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(user);

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken: newAccessToken,
            },
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Refresh token expired. Please login again.',
            });
        }
        next(error);
    }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT u.id, u.email, u.full_name, u.role, u.phone, u.is_active, u.created_at,
              COALESCE(
                json_agg(
                  json_build_object(
                    'team_id', mt.id,
                    'team_name', mt.name,
                    'is_lead', tm.is_lead
                  )
                ) FILTER (WHERE mt.id IS NOT NULL),
                '[]'
              ) as teams
       FROM users u
       LEFT JOIN team_members tm ON u.id = tm.user_id
       LEFT JOIN maintenance_teams mt ON tm.team_id = mt.id AND mt.deleted_at IS NULL
       WHERE u.id = $1 AND u.deleted_at IS NULL
       GROUP BY u.id`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const user = result.rows[0];

        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                phone: user.phone,
                is_active: user.is_active,
                created_at: user.created_at,
                teams: user.teams,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/auth/profile
 * @desc    Update current user profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
    try {
        const { full_name, phone, current_password, new_password } = req.body;
        const updates = [];
        const values = [];
        let paramCount = 1;

        // Build dynamic update query
        if (full_name) {
            updates.push(`full_name = $${paramCount++}`);
            values.push(full_name);
        }

        if (phone) {
            updates.push(`phone = $${paramCount++}`);
            values.push(phone);
        }

        // Handle password change
        if (new_password) {
            if (!current_password) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password required to change password',
                });
            }

            // Verify current password
            const userResult = await db.query(
                'SELECT password_hash FROM users WHERE id = $1',
                [req.user.id]
            );

            const isPasswordValid = await bcrypt.compare(
                current_password,
                userResult.rows[0].password_hash
            );

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect',
                });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(new_password, salt);

            updates.push(`password_hash = $${paramCount++}`);
            values.push(password_hash);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update',
            });
        }

        // Add user ID to values
        values.push(req.user.id);

        const result = await db.query(
            `UPDATE users
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, email, full_name, role, phone, updated_at`,
            values
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    refreshToken,
    getProfile,
    updateProfile,
};
