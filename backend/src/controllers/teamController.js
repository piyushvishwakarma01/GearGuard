const db = require('../config/database');

/**
 * @route   GET /api/teams
 * @desc    Get all maintenance teams
 * @access  Private
 */
const getAllTeams = async (req, res, next) => {
    try {
        const { user_id } = req.query;

        let query = `
      SELECT 
        mt.*,
        COALESCE(
          json_agg(
            json_build_object(
              'user_id', u.id,
              'full_name', u.full_name,
              'email', u.email,
              'role', u.role,
              'is_lead', tm.is_lead
            ) ORDER BY tm.is_lead DESC, u.full_name
          ) FILTER (WHERE u.id IS NOT NULL),
          '[]'
        ) as members
      FROM maintenance_teams mt
      LEFT JOIN team_members tm ON mt.id = tm.team_id
      LEFT JOIN users u ON tm.user_id = u.id AND u.deleted_at IS NULL
      WHERE mt.deleted_at IS NULL
    `;

        const values = [];

        if (user_id) {
            query += ` AND EXISTS (
        SELECT 1 FROM team_members tm2 
        WHERE tm2.team_id = mt.id AND tm2.user_id = $1
      )`;
            values.push(user_id);
        }

        query += ' GROUP BY mt.id ORDER BY mt.name';

        const result = await db.query(query, values);

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/teams/:id
 * @desc    Get single team with members
 * @access  Private
 */
const getTeamById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `SELECT 
        mt.*,
        COALESCE(
          json_agg(
            json_build_object(
              'user_id', u.id,
              'full_name', u.full_name,
              'email', u.email,
              'role', u.role,
              'phone', u.phone,
              'is_lead', tm.is_lead,
              'joined_at', tm.joined_at
            ) ORDER BY tm.is_lead DESC, u.full_name
          ) FILTER (WHERE u.id IS NOT NULL),
          '[]'
        ) as members,
        COUNT(DISTINCT e.id) as equipment_count,
        COUNT(DISTINCT mr.id) FILTER (WHERE mr.status NOT IN ('Repaired', 'Scrap') AND mr.deleted_at IS NULL) as active_requests_count
       FROM maintenance_teams mt
       LEFT JOIN team_members tm ON mt.id = tm.team_id
       LEFT JOIN users u ON tm.user_id = u.id AND u.deleted_at IS NULL
       LEFT JOIN equipment e ON mt.id = e.default_maintenance_team_id AND e.deleted_at IS NULL
       LEFT JOIN maintenance_requests mr ON mt.id = mr.maintenance_team_id
       WHERE mt.id = $1 AND mt.deleted_at IS NULL
       GROUP BY mt.id`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Team not found',
            });
        }

        res.json({
            success: true,
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/teams
 * @desc    Create new maintenance team
 * @access  Manager only
 */
const createTeam = async (req, res, next) => {
    try {
        const { name, description, team_type } = req.body;

        const result = await db.query(
            `INSERT INTO maintenance_teams (name, description, team_type)
       VALUES ($1, $2, $3)
       RETURNING *`,
            [name, description, team_type]
        );

        // Log audit
        await db.query(
            `INSERT INTO audit_logs (entity_type, entity_id, action, user_id, changes)
       VALUES ($1, $2, $3, $4, $5)`,
            [
                'maintenance_team',
                result.rows[0].id,
                'CREATE',
                req.user.id,
                JSON.stringify({ new_values: result.rows[0] }),
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Team created successfully',
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/teams/:id
 * @desc    Update team
 * @access  Manager only
 */
const updateTeam = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, team_type, is_active } = req.body;

        // Get old values for audit
        const oldData = await db.query(
            'SELECT * FROM maintenance_teams WHERE id = $1 AND deleted_at IS NULL',
            [id]
        );

        if (oldData.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Team not found',
            });
        }

        const result = await db.query(
            `UPDATE maintenance_teams SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        team_type = COALESCE($3, team_type),
        is_active = COALESCE($4, is_active)
       WHERE id = $5 AND deleted_at IS NULL
       RETURNING *`,
            [name, description, team_type, is_active, id]
        );

        // Log audit
        await db.query(
            `INSERT INTO audit_logs (entity_type, entity_id, action, user_id, changes)
       VALUES ($1, $2, $3, $4, $5)`,
            [
                'maintenance_team',
                id,
                'UPDATE',
                req.user.id,
                JSON.stringify({ old_values: oldData.rows[0], new_values: result.rows[0] }),
            ]
        );

        res.json({
            success: true,
            message: 'Team updated successfully',
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/teams/:id/members
 * @desc    Add member to team
 * @access  Manager only
 */
const addTeamMember = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { user_id, is_lead } = req.body;

        // Verify team exists
        const teamCheck = await db.query(
            'SELECT id FROM maintenance_teams WHERE id = $1 AND deleted_at IS NULL',
            [id]
        );

        if (teamCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Team not found',
            });
        }

        // Verify user exists and is technician or manager
        const userCheck = await db.query(
            `SELECT id, full_name, role FROM users 
       WHERE id = $1 AND role IN ('Technician', 'Manager') AND deleted_at IS NULL`,
            [user_id]
        );

        if (userCheck.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'User not found or not eligible (must be Technician or Manager)',
            });
        }

        // Add member
        const result = await db.query(
            `INSERT INTO team_members (team_id, user_id, is_lead)
       VALUES ($1, $2, $3)
       ON CONFLICT (team_id, user_id) 
       DO UPDATE SET is_lead = EXCLUDED.is_lead
       RETURNING *`,
            [id, user_id, is_lead || false]
        );

        // Log audit
        await db.query(
            `INSERT INTO audit_logs (entity_type, entity_id, action, user_id, changes)
       VALUES ($1, $2, $3, $4, $5)`,
            [
                'team_member',
                id,
                'ADD_MEMBER',
                req.user.id,
                JSON.stringify({ user_added: userCheck.rows[0], is_lead }),
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Team member added successfully',
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   DELETE /api/teams/:id/members/:userId
 * @desc    Remove member from team
 * @access  Manager only
 */
const removeTeamMember = async (req, res, next) => {
    try {
        const { id, userId } = req.params;

        // Check if member has active assigned requests
        const activeRequests = await db.query(
            `SELECT COUNT(*) as count FROM maintenance_requests
       WHERE maintenance_team_id = $1 
       AND assigned_technician_id = $2 
       AND status NOT IN ('Repaired', 'Scrap')
       AND deleted_at IS NULL`,
            [id, userId]
        );

        if (parseInt(activeRequests.rows[0].count) > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot remove member with active assigned maintenance requests',
            });
        }

        const result = await db.query(
            'DELETE FROM team_members WHERE team_id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Team member not found',
            });
        }

        // Log audit
        await db.query(
            `INSERT INTO audit_logs (entity_type, entity_id, action, user_id, changes)
       VALUES ($1, $2, $3, $4, $5)`,
            [
                'team_member',
                id,
                'REMOVE_MEMBER',
                req.user.id,
                JSON.stringify({ user_removed: userId }),
            ]
        );

        res.json({
            success: true,
            message: 'Team member removed successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   DELETE /api/teams/:id
 * @desc    Soft delete team
 * @access  Manager only
 */
const deleteTeam = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if team has equipment assigned
        const equipmentCount = await db.query(
            `SELECT COUNT(*) as count FROM equipment
       WHERE default_maintenance_team_id = $1 AND deleted_at IS NULL`,
            [id]
        );

        if (parseInt(equipmentCount.rows[0].count) > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete team with assigned equipment. Reassign equipment first.',
            });
        }

        const result = await db.query(
            `UPDATE maintenance_teams SET deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, name`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Team not found',
            });
        }

        // Log audit
        await db.query(
            `INSERT INTO audit_logs (entity_type, entity_id, action, user_id)
       VALUES ($1, $2, $3, $4)`,
            ['maintenance_team', id, 'DELETE', req.user.id]
        );

        res.json({
            success: true,
            message: 'Team deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllTeams,
    getTeamById,
    createTeam,
    updateTeam,
    addTeamMember,
    removeTeamMember,
    deleteTeam,
};
