const db = require('../config/database');

/**
 * @route   GET /api/equipment
 * @desc    Get all equipment with optional filters
 * @access  Private
 */
const getAllEquipment = async (req, res, next) => {
    try {
        const {
            department_id,
            category_id,
            assigned_employee_id,
            is_usable,
            search,
            page = 1,
            limit = 20,
        } = req.query;

        const offset = (page - 1) * limit;
        const conditions = ['e.deleted_at IS NULL'];
        const values = [];
        let paramCount = 1;

        // Build WHERE clause
        if (department_id) {
            conditions.push(`e.department_id = $${paramCount++}`);
            values.push(department_id);
        }

        if (category_id) {
            conditions.push(`e.category_id = $${paramCount++}`);
            values.push(category_id);
        }

        if (assigned_employee_id) {
            conditions.push(`e.assigned_employee_id = $${paramCount++}`);
            values.push(assigned_employee_id);
        }

        if (is_usable !== undefined) {
            conditions.push(`e.is_usable = $${paramCount++}`);
            values.push(is_usable === 'true');
        }

        if (search) {
            conditions.push(
                `(e.equipment_name ILIKE $${paramCount} OR e.serial_number ILIKE $${paramCount})`
            );
            values.push(`%${search}%`);
            paramCount++;
        }

        const whereClause = conditions.join(' AND ');

        // Get total count
        const countResult = await db.query(
            `SELECT COUNT(*) as total FROM equipment e WHERE ${whereClause}`,
            values
        );

        const total = parseInt(countResult.rows[0].total);

        // Get equipment with relationships and open request count
        values.push(limit, offset);

        const result = await db.query(
            `SELECT 
        e.*,
        ec.name as category_name,
        d.name as department_name,
        u.full_name as assigned_employee_name,
        mt.name as default_team_name,
        COUNT(mr.id) FILTER (WHERE mr.status NOT IN ('Repaired', 'Scrap') AND mr.deleted_at IS NULL) as open_request_count
       FROM equipment e
       LEFT JOIN equipment_categories ec ON e.category_id = ec.id
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN users u ON e.assigned_employee_id = u.id
       LEFT JOIN maintenance_teams mt ON e.default_maintenance_team_id = mt.id
       LEFT JOIN maintenance_requests mr ON e.id = mr.equipment_id
       WHERE ${whereClause}
       GROUP BY e.id, ec.name, d.name, u.full_name, mt.name
       ORDER BY e.created_at DESC
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
 * @route   GET /api/equipment/:id
 * @desc    Get single equipment by ID
 * @access  Private
 */
const getEquipmentById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `SELECT 
        e.*,
        ec.name as category_name,
        d.name as department_name,
        u.full_name as assigned_employee_name,
        u.email as assigned_employee_email,
        mt.name as default_team_name,
        COUNT(mr.id) FILTER (WHERE mr.status NOT IN ('Repaired', 'Scrap') AND mr.deleted_at IS NULL) as open_request_count,
        COUNT(mr.id) FILTER (WHERE mr.deleted_at IS NULL) as total_request_count
       FROM equipment e
       LEFT JOIN equipment_categories ec ON e.category_id = ec.id
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN users u ON e.assigned_employee_id = u.id
       LEFT JOIN maintenance_teams mt ON e.default_maintenance_team_id = mt.id
       LEFT JOIN maintenance_requests mr ON e.id = mr.equipment_id
       WHERE e.id = $1 AND e.deleted_at IS NULL
       GROUP BY e.id, ec.name, d.name, u.full_name, u.email, mt.name`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Equipment not found',
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
 * @route   GET /api/equipment/:id/maintenance-requests
 * @desc    Get all maintenance requests for specific equipment (Smart Button)
 * @access  Private
 */
const getEquipmentMaintenanceRequests = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.query;

        const conditions = ['mr.equipment_id = $1', 'mr.deleted_at IS NULL'];
        const values = [id];

        if (status) {
            conditions.push('mr.status = $2');
            values.push(status);
        }

        const result = await db.query(
            `SELECT 
        mr.*,
        u_created.full_name as created_by_name,
        u_assigned.full_name as assigned_technician_name,
        mt.name as team_name
       FROM maintenance_requests mr
       JOIN users u_created ON mr.created_by_user_id = u_created.id
       LEFT JOIN users u_assigned ON mr.assigned_technician_id = u_assigned.id
       JOIN maintenance_teams mt ON mr.maintenance_team_id = mt.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY mr.created_at DESC`,
            values
        );

        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/equipment
 * @desc    Create new equipment
 * @access  Manager only
 */
const createEquipment = async (req, res, next) => {
    try {
        const {
            equipment_name,
            serial_number,
            category_id,
            department_id,
            purchase_date,
            warranty_expiry_date,
            purchase_cost,
            physical_location,
            assigned_employee_id,
            default_maintenance_team_id,
            notes,
        } = req.body;

        const result = await db.query(
            `INSERT INTO equipment (
        equipment_name, serial_number, category_id, department_id,
        purchase_date, warranty_expiry_date, purchase_cost,
        physical_location, assigned_employee_id, default_maintenance_team_id, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
            [
                equipment_name,
                serial_number,
                category_id,
                department_id,
                purchase_date,
                warranty_expiry_date,
                purchase_cost,
                physical_location,
                assigned_employee_id,
                default_maintenance_team_id,
                notes,
            ]
        );

        // Log audit
        await db.query(
            `INSERT INTO audit_logs (entity_type, entity_id, action, user_id, changes)
       VALUES ($1, $2, $3, $4, $5)`,
            [
                'equipment',
                result.rows[0].id,
                'CREATE',
                req.user.id,
                JSON.stringify({ new_values: result.rows[0] }),
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Equipment created successfully',
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/equipment/:id
 * @desc    Update equipment
 * @access  Manager only
 */
const updateEquipment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            equipment_name,
            category_id,
            department_id,
            purchase_date,
            warranty_expiry_date,
            purchase_cost,
            physical_location,
            assigned_employee_id,
            default_maintenance_team_id,
            is_usable,
            notes,
        } = req.body;

        // Get old values for audit
        const oldData = await db.query(
            'SELECT * FROM equipment WHERE id = $1 AND deleted_at IS NULL',
            [id]
        );

        if (oldData.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Equipment not found',
            });
        }

        const result = await db.query(
            `UPDATE equipment SET
        equipment_name = COALESCE($1, equipment_name),
        category_id = COALESCE($2, category_id),
        department_id = COALESCE($3, department_id),
        purchase_date = COALESCE($4, purchase_date),
        warranty_expiry_date = COALESCE($5, warranty_expiry_date),
        purchase_cost = COALESCE($6, purchase_cost),
        physical_location = COALESCE($7, physical_location),
        assigned_employee_id = COALESCE($8, assigned_employee_id),
        default_maintenance_team_id = COALESCE($9, default_maintenance_team_id),
        is_usable = COALESCE($10, is_usable),
        notes = COALESCE($11, notes)
       WHERE id = $12 AND deleted_at IS NULL
       RETURNING *`,
            [
                equipment_name,
                category_id,
                department_id,
                purchase_date,
                warranty_expiry_date,
                purchase_cost,
                physical_location,
                assigned_employee_id,
                default_maintenance_team_id,
                is_usable,
                notes,
                id,
            ]
        );

        // Log audit
        await db.query(
            `INSERT INTO audit_logs (entity_type, entity_id, action, user_id, changes)
       VALUES ($1, $2, $3, $4, $5)`,
            [
                'equipment',
                id,
                'UPDATE',
                req.user.id,
                JSON.stringify({ old_values: oldData.rows[0], new_values: result.rows[0] }),
            ]
        );

        res.json({
            success: true,
            message: 'Equipment updated successfully',
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   DELETE /api/equipment/:id
 * @desc    Soft delete equipment
 * @access  Manager only
 */
const deleteEquipment = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check for active maintenance requests
        const activeRequests = await db.query(
            `SELECT COUNT(*) as count FROM maintenance_requests
       WHERE equipment_id = $1 AND status NOT IN ('Repaired', 'Scrap') AND deleted_at IS NULL`,
            [id]
        );

        if (parseInt(activeRequests.rows[0].count) > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete equipment with active maintenance requests',
            });
        }

        const result = await db.query(
            `UPDATE equipment SET deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, equipment_name`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Equipment not found',
            });
        }

        // Log audit
        await db.query(
            `INSERT INTO audit_logs (entity_type, entity_id, action, user_id)
       VALUES ($1, $2, $3, $4)`,
            ['equipment', id, 'DELETE', req.user.id]
        );

        res.json({
            success: true,
            message: 'Equipment deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/equipment/categories
 * @desc    Get all equipment categories
 * @access  Private
 */
const getCategories = async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT ec.*, mt.name as default_team_name
       FROM equipment_categories ec
       LEFT JOIN maintenance_teams mt ON ec.default_team_id = mt.id
       ORDER BY ec.name`
        );

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllEquipment,
    getEquipmentById,
    getEquipmentMaintenanceRequests,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    getCategories,
};
