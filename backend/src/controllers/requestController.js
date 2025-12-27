const db = require('../config/database');

/**
 * @route   GET /api/requests
 * @desc    Get all maintenance requests with filters
 * @access  Private (filtered by team membership for non-managers)
 */
const getAllRequests = async (req, res, next) => {
    try {
        const {
            status,
            request_type,
            equipment_id,
            maintenance_team_id,
            assigned_technician_id,
            is_overdue,
            search,
            page = 1,
            limit = 20,
        } = req.query;

        const offset = (page - 1) * limit;
        const conditions = ['mr.deleted_at IS NULL'];
        const values = [];
        let paramCount = 1;

        // Non-managers can only see requests for their teams
        if (req.user.role !== 'Manager') {
            conditions.push(`EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = mr.maintenance_team_id
        AND tm.user_id = $${paramCount++}
      )`);
            values.push(req.user.id);
        }

        // Build WHERE clause
        if (status) {
            conditions.push(`mr.status = $${paramCount++}`);
            values.push(status);
        }

        if (request_type) {
            conditions.push(`mr.request_type = $${paramCount++}`);
            values.push(request_type);
        }

        if (equipment_id) {
            conditions.push(`mr.equipment_id = $${paramCount++}`);
            values.push(equipment_id);
        }

        if (maintenance_team_id) {
            conditions.push(`mr.maintenance_team_id = $${paramCount++}`);
            values.push(maintenance_team_id);
        }

        if (assigned_technician_id) {
            conditions.push(`mr.assigned_technician_id = $${paramCount++}`);
            values.push(assigned_technician_id);
        }

        if (is_overdue !== undefined) {
            conditions.push(`mr.is_overdue = $${paramCount++}`);
            values.push(is_overdue === 'true');
        }

        if (search) {
            conditions.push(
                `(mr.subject ILIKE $${paramCount} OR mr.description ILIKE $${paramCount})`
            );
            values.push(`%${search}%`);
            paramCount++;
        }

        const whereClause = conditions.join(' AND ');

        // Get total count
        const countResult = await db.query(
            `SELECT COUNT(*) as total FROM maintenance_requests mr WHERE ${whereClause}`,
            values
        );

        const total = parseInt(countResult.rows[0].total);

        // Get requests with full details
        values.push(limit, offset);

        const result = await db.query(
            `SELECT 
        mr.*,
        e.equipment_name,
        e.serial_number,
        e.physical_location,
        ec.name as category_name,
        mt.name as team_name,
        u_created.full_name as created_by_name,
        u_created.email as created_by_email,
        u_assigned.full_name as assigned_technician_name,
        u_assigned.email as assigned_technician_email,
        d.name as department_name
       FROM maintenance_requests mr
       JOIN equipment e ON mr.equipment_id = e.id
       LEFT JOIN equipment_categories ec ON mr.equipment_category_id = ec.id
       JOIN maintenance_teams mt ON mr.maintenance_team_id = mt.id
       JOIN users u_created ON mr.created_by_user_id = u_created.id
       LEFT JOIN users u_assigned ON mr.assigned_technician_id = u_assigned.id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE ${whereClause}
       ORDER BY mr.created_at DESC
       LIMIT $${paramCount++} OFFSET $${paramCount++}`,
            values
        );

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/requests/kanban
 * @desc    Get requests grouped by status for Kanban board
 * @access  Private
 */
const getKanbanRequests = async (req, res, next) => {
    try {
        const { maintenance_team_id } = req.query;
        const conditions = ['mr.deleted_at IS NULL'];
        const values = [];
        let paramCount = 1;

        // Filter by team for non-managers
        if (req.user.role !== 'Manager') {
            conditions.push(`EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = mr.maintenance_team_id
        AND tm.user_id = $${paramCount++}
      )`);
            values.push(req.user.id);
        } else if (maintenance_team_id) {
            conditions.push(`mr.maintenance_team_id = $${paramCount++}`);
            values.push(maintenance_team_id);
        }

        const result = await db.query(
            `SELECT 
        mr.id,
        mr.subject,
        mr.description,
        mr.request_type,
        mr.status,
        mr.priority,
        mr.scheduled_date,
        mr.is_overdue,
        mr.created_at,
        e.equipment_name,
        e.serial_number,
        mt.name as team_name,
        mt.id as team_id,
        u_assigned.id as assigned_technician_id,
        u_assigned.full_name as assigned_technician_name,
        u_assigned.email as assigned_technician_email
       FROM maintenance_requests mr
       JOIN equipment e ON mr.equipment_id = e.id
       JOIN maintenance_teams mt ON mr.maintenance_team_id = mt.id
       LEFT JOIN users u_assigned ON mr.assigned_technician_id = u_assigned.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY 
         CASE mr.priority
           WHEN 'Critical' THEN 1
           WHEN 'High' THEN 2
           WHEN 'Medium' THEN 3
           WHEN 'Low' THEN 4
         END,
         mr.scheduled_date ASC NULLS LAST,
         mr.created_at ASC`,
            values
        );

        // Group by status
        const grouped = {
            New: [],
            'In Progress': [],
            Repaired: [],
            Scrap: [],
        };

        result.rows.forEach((row) => {
            if (grouped[row.status]) {
                grouped[row.status].push(row);
            }
        });

        res.json({
            success: true,
            data: grouped,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/requests/calendar
 * @desc    Get preventive requests for calendar view
 * @access  Private
 */
const getCalendarRequests = async (req, res, next) => {
    try {
        const { start_date, end_date, maintenance_team_id } = req.query;
        const conditions = [
            'mr.deleted_at IS NULL',
            "mr.request_type = 'Preventive'",
            'mr.scheduled_date IS NOT NULL',
        ];
        const values = [];
        let paramCount = 1;

        if (start_date) {
            conditions.push(`mr.scheduled_date >= $${paramCount++}`);
            values.push(start_date);
        }

        if (end_date) {
            conditions.push(`mr.scheduled_date <= $${paramCount++}`);
            values.push(end_date);
        }

        // Filter by team for non-managers
        if (req.user.role !== 'Manager') {
            conditions.push(`EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = mr.maintenance_team_id
        AND tm.user_id = $${paramCount++}
      )`);
            values.push(req.user.id);
        } else if (maintenance_team_id) {
            conditions.push(`mr.maintenance_team_id = $${paramCount++}`);
            values.push(maintenance_team_id);
        }

        const result = await db.query(
            `SELECT 
        mr.id,
        mr.subject,
        mr.description,
        mr.status,
        mr.scheduled_date,
        mr.duration_hours,
        e.equipment_name,
        mt.name as team_name,
        mt.id as team_id,
        u_assigned.full_name as assigned_technician_name
       FROM maintenance_requests mr
       JOIN equipment e ON mr.equipment_id = e.id
       JOIN maintenance_teams mt ON mr.maintenance_team_id = mt.id
       LEFT JOIN users u_assigned ON mr.assigned_technician_id = u_assigned.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY mr.scheduled_date`,
            values
        );

        // Format for calendar
        const events = result.rows.map((row) => ({
            id: row.id,
            title: row.subject,
            start: row.scheduled_date,
            end: row.scheduled_date,
            extendedProps: {
                equipment_name: row.equipment_name,
                team_name: row.team_name,
                team_id: row.team_id,
                status: row.status,
                assigned_technician: row.assigned_technician_name,
                description: row.description,
            },
        }));

        res.json({
            success: true,
            data: events,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/requests/:id
 * @desc    Get single request by ID
 * @access  Private
 */
const getRequestById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `SELECT 
        mr.*,
        e.equipment_name,
        e.serial_number,
        e.physical_location,
        ec.name as category_name,
        mt.name as team_name,
        mt.id as team_id,
        u_created.full_name as created_by_name,
        u_created.email as created_by_email,
        u_assigned.full_name as assigned_technician_name,
        u_assigned.email as assigned_technician_email,
        d.name as department_name,
        COALESCE(
          json_agg(
            json_build_object(
              'old_status', rsh.old_status,
              'new_status', rsh.new_status,
              'changed_at', rsh.changed_at,
              'notes', rsh.notes
            ) ORDER BY rsh.changed_at DESC
          ) FILTER (WHERE rsh.id IS NOT NULL),
          '[]'
        ) as status_history
       FROM maintenance_requests mr
       JOIN equipment e ON mr.equipment_id = e.id
       LEFT JOIN equipment_categories ec ON mr.equipment_category_id = ec.id
       JOIN maintenance_teams mt ON mr.maintenance_team_id = mt.id
       JOIN users u_created ON mr.created_by_user_id = u_created.id
       LEFT JOIN users u_assigned ON mr.assigned_technician_id = u_assigned.id
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN request_status_history rsh ON mr.id = rsh.request_id
       WHERE mr.id = $1 AND mr.deleted_at IS NULL
       GROUP BY mr.id, e.equipment_name, e.serial_number, e.physical_location,
                ec.name, mt.name, mt.id, u_created.full_name, u_created.email,
                u_assigned.full_name, u_assigned.email, d.name`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Request not found',
            });
        }

        // Check team membership for non-managers
        if (req.user.role !== 'Manager') {
            const teamCheck = await db.query(
                'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
                [result.rows[0].team_id, req.user.id]
            );

            if (teamCheck.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Not a member of this team.',
                });
            }
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
 * @route   POST /api/requests
 * @desc    Create new maintenance request
 * @access  Private (any authenticated user)
 */
const createRequest = async (req, res, next) => {
    try {
        const {
            subject,
            description,
            request_type,
            equipment_id,
            scheduled_date,
            priority,
        } = req.body;

        // Auto-fill equipment category and maintenance team from equipment
        const equipmentData = await db.query(
            `SELECT category_id, default_maintenance_team_id
       FROM equipment
       WHERE id = $1 AND deleted_at IS NULL`,
            [equipment_id]
        );

        if (equipmentData.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Equipment not found',
            });
        }

        const { category_id, default_maintenance_team_id } = equipmentData.rows[0];

        const result = await db.query(
            `INSERT INTO maintenance_requests (
        subject, description, request_type, equipment_id,
        equipment_category_id, maintenance_team_id, created_by_user_id,
        scheduled_date, priority
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
            [
                subject,
                description,
                request_type,
                equipment_id,
                category_id,
                default_maintenance_team_id,
                req.user.id,
                scheduled_date,
                priority || 'Medium',
            ]
        );

        // Log audit
        await db.query(
            `INSERT INTO audit_logs (entity_type, entity_id, action, user_id, changes)
       VALUES ($1, $2, $3, $4, $5)`,
            [
                'maintenance_request',
                result.rows[0].id,
                'CREATE',
                req.user.id,
                JSON.stringify({ new_values: result.rows[0] }),
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Maintenance request created successfully',
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PATCH /api/requests/:id/status
 * @desc    Update request status with workflow validation
 * @access  Private (team members only)
 */
const updateRequestStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, completion_notes, duration_hours } = req.body;

        // Get current request
        const currentRequest = await db.query(
            `SELECT mr.*, e.equipment_name
       FROM maintenance_requests mr
       JOIN equipment e ON mr.equipment_id = e.id
       WHERE mr.id = $1 AND mr.deleted_at IS NULL`,
            [id]
        );

        if (currentRequest.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Request not found',
            });
        }

        const request = currentRequest.rows[0];

        // Check team membership
        if (req.user.role !== 'Manager') {
            const teamCheck = await db.query(
                'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
                [request.maintenance_team_id, req.user.id]
            );

            if (teamCheck.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Not a member of this team.',
                });
            }
        }

        // Workflow validation
        const validTransitions = {
            'New': ['In Progress'],
            'In Progress': ['Repaired', 'Scrap'],
            'Repaired': [], // Final state
            'Scrap': [], // Final state
        };

        if (!validTransitions[request.status].includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status transition from ${request.status} to ${status}`,
                allowed_transitions: validTransitions[request.status],
            });
        }

        // Additional validation based on target status
        if (status === 'In Progress' && !request.assigned_technician_id) {
            return res.status(400).json({
                success: false,
                message: 'Request must be assigned to a technician before moving to In Progress',
            });
        }

        if ((status === 'Repaired' || status === 'Scrap') && !duration_hours) {
            return res.status(400).json({
                success: false,
                message: 'Duration hours required when completing request',
            });
        }

        // Update request
        const updates = ['status = $1'];
        const values = [status];
        let paramCount = 2;

        if (status === 'In Progress' && !request.started_at) {
            updates.push(`started_at = CURRENT_TIMESTAMP`);
        }

        if (status === 'Repaired' || status === 'Scrap') {
            updates.push(`completed_at = CURRENT_TIMESTAMP`);
            updates.push(`duration_hours = $${paramCount++}`);
            values.push(duration_hours);

            if (completion_notes) {
                updates.push(`completion_notes = $${paramCount++}`);
                values.push(completion_notes);
            }
        }

        values.push(id);

        const result = await db.query(
            `UPDATE maintenance_requests
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
            values
        );

        // The trigger will automatically log status history

        // Log audit
        await db.query(
            `INSERT INTO audit_logs (entity_type, entity_id, action, user_id, changes)
       VALUES ($1, $2, $3, $4, $5)`,
            [
                'maintenance_request',
                id,
                'STATUS_CHANGE',
                req.user.id,
                JSON.stringify({ old_status: request.status, new_status: status }),
            ]
        );

        res.json({
            success: true,
            message: 'Request status updated successfully',
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PATCH /api/requests/:id/assign
 * @desc    Assign technician to request
 * @access  Private (team members only)
 */
const assignTechnician = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { assigned_technician_id } = req.body;

        // Get request
        const requestData = await db.query(
            'SELECT maintenance_team_id FROM maintenance_requests WHERE id = $1 AND deleted_at IS NULL',
            [id]
        );

        if (requestData.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Request not found',
            });
        }

        const team_id = requestData.rows[0].maintenance_team_id;

        // Check if requester is team member or manager
        if (req.user.role !== 'Manager') {
            const teamCheck = await db.query(
                'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
                [team_id, req.user.id]
            );

            if (teamCheck.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Not a member of this team.',
                });
            }
        }

        // Verify assigned technician is a member of the team
        const technicianCheck = await db.query(
            'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
            [team_id, assigned_technician_id]
        );

        if (technicianCheck.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Assigned technician is not a member of the maintenance team',
            });
        }

        const result = await db.query(
            `UPDATE maintenance_requests
       SET assigned_technician_id = $1
       WHERE id = $2
       RETURNING *`,
            [assigned_technician_id, id]
        );

        // Log audit
        await db.query(
            `INSERT INTO audit_logs (entity_type, entity_id, action, user_id, changes)
       VALUES ($1, $2, $3, $4, $5)`,
            [
                'maintenance_request',
                id,
                'ASSIGN_TECHNICIAN',
                req.user.id,
                JSON.stringify({ assigned_to: assigned_technician_id }),
            ]
        );

        res.json({
            success: true,
            message: 'Technician assigned successfully',
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/requests/:id
 * @desc    Update request details (not status)
 * @access  Private (team members only)
 */
const updateRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { subject, description, scheduled_date, priority } = req.body;

        // Get request
        const requestData = await db.query(
            'SELECT maintenance_team_id, status FROM maintenance_requests WHERE id = $1 AND deleted_at IS NULL',
            [id]
        );

        if (requestData.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Request not found',
            });
        }

        const { maintenance_team_id, status } = requestData.rows[0];

        // Cannot edit completed requests
        if (status === 'Repaired' || status === 'Scrap') {
            return res.status(400).json({
                success: false,
                message: 'Cannot edit completed requests',
            });
        }

        // Check team membership
        if (req.user.role !== 'Manager') {
            const teamCheck = await db.query(
                'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
                [maintenance_team_id, req.user.id]
            );

            if (teamCheck.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Not a member of this team.',
                });
            }
        }

        const result = await db.query(
            `UPDATE maintenance_requests
       SET subject = COALESCE($1, subject),
           description = COALESCE($2, description),
           scheduled_date = COALESCE($3, scheduled_date),
           priority = COALESCE($4, priority)
       WHERE id = $5
       RETURNING *`,
            [subject, description, scheduled_date, priority, id]
        );

        res.json({
            success: true,
            message: 'Request updated successfully',
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   DELETE /api/requests/:id
 * @desc    Soft delete request
 * @access  Manager only
 */
const deleteRequest = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `UPDATE maintenance_requests
       SET deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, subject`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Request not found',
            });
        }

        // Log audit
        await db.query(
            `INSERT INTO audit_logs (entity_type, entity_id, action, user_id)
       VALUES ($1, $2, $3, $4)`,
            ['maintenance_request', id, 'DELETE', req.user.id]
        );

        res.json({
            success: true,
            message: 'Request deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllRequests,
    getKanbanRequests,
    getCalendarRequests,
    getRequestById,
    createRequest,
    updateRequestStatus,
    assignTechnician,
    updateRequest,
    deleteRequest,
};
