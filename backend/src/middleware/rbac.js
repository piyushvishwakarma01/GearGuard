/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces permissions based on user roles
 */

const ROLES = {
    USER: 'User',
    TECHNICIAN: 'Technician',
    MANAGER: 'Manager',
};

/**
 * Require specific roles to access endpoint
 * @param {...string} allowedRoles - Roles that can access this endpoint
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
            });
        }

        next();
    };
};

/**
 * Check if user is a manager
 */
const requireManager = requireRole(ROLES.MANAGER);

/**
 * Check if user is a technician or manager
 */
const requireTechnicianOrManager = requireRole(ROLES.TECHNICIAN, ROLES.MANAGER);

/**
 * Check if user is authenticated (any role)
 */
const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required',
        });
    }
    next();
};

/**
 * Check if user is a member of the specified team
 * Requires teamId in request (params, body, or query)
 */
const requireTeamMember = async (req, res, next) => {
    const db = require('../config/database');

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required',
        });
    }

    // Managers have access to all teams
    if (req.user.role === ROLES.MANAGER) {
        return next();
    }

    const teamId = req.params.teamId || req.body.maintenance_team_id || req.query.teamId;

    if (!teamId) {
        return res.status(400).json({
            success: false,
            message: 'Team ID required',
        });
    }

    try {
        const result = await db.query(
            `SELECT id FROM team_members 
       WHERE team_id = $1 AND user_id = $2`,
            [teamId, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this team',
            });
        }

        next();
    } catch (error) {
        console.error('Team membership check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error verifying team membership',
        });
    }
};

module.exports = {
    ROLES,
    requireRole,
    requireManager,
    requireTechnicianOrManager,
    requireAuth,
    requireTeamMember,
};
