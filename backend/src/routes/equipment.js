const express = require('express');
const { body, param } = require('express-validator');
const {
    getAllEquipment,
    getEquipmentById,
    getEquipmentMaintenanceRequests,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    getCategories,
} = require('../controllers/equipmentController');
const { authenticateToken } = require('../middleware/auth');
const { requireManager } = require('../middleware/rbac');
const validate = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /api/equipment:
 *   get:
 *     summary: Get all equipment
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: List of equipment
 */
router.get('/', authenticateToken, getAllEquipment);

/**
 * @swagger
 * /api/equipment/categories:
 *   get:
 *     summary: Get all equipment categories
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/categories', authenticateToken, getCategories);

/**
 * @swagger
 * /api/equipment/{id}:
 *   get:
 *     summary: Get equipment by ID
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Equipment details
 *       404:
 *         description: Equipment not found
 */
router.get(
    '/:id',
    authenticateToken,
    [param('id').isUUID().withMessage('Invalid equipment ID'), validate],
    getEquipmentById
);

/**
 * @swagger
 * /api/equipment/{id}/maintenance-requests:
 *   get:
 *     summary: Get all maintenance requests for equipment (Smart Button)
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of maintenance requests
 */
router.get(
    '/:id/maintenance-requests',
    authenticateToken,
    [param('id').isUUID().withMessage('Invalid equipment ID'), validate],
    getEquipmentMaintenanceRequests
);

/**
 * @swagger
 * /api/equipment:
 *   post:
 *     summary: Create new equipment
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - equipment_name
 *               - serial_number
 *               - default_maintenance_team_id
 *             properties:
 *               equipment_name:
 *                 type: string
 *               serial_number:
 *                 type: string
 *               category_id:
 *                 type: string
 *               department_id:
 *                 type: string
 *               default_maintenance_team_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Equipment created
 */
router.post(
    '/',
    authenticateToken,
    requireManager,
    [
        body('equipment_name').trim().notEmpty().withMessage('Equipment name required'),
        body('serial_number').trim().notEmpty().withMessage('Serial number required'),
        body('default_maintenance_team_id')
            .isUUID()
            .withMessage('Valid maintenance team ID required'),
        validate,
    ],
    createEquipment
);

/**
 * @swagger
 * /api/equipment/{id}:
 *   put:
 *     summary: Update equipment
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Equipment updated
 */
router.put(
    '/:id',
    authenticateToken,
    requireManager,
    [param('id').isUUID().withMessage('Invalid equipment ID'), validate],
    updateEquipment
);

/**
 * @swagger
 * /api/equipment/{id}:
 *   delete:
 *     summary: Delete equipment
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Equipment deleted
 */
router.delete(
    '/:id',
    authenticateToken,
    requireManager,
    [param('id').isUUID().withMessage('Invalid equipment ID'), validate],
    deleteEquipment
);

module.exports = router;
