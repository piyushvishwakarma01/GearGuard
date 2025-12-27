const express = require('express');
const { body, param } = require('express-validator');
const {
    getAllRequests,
    getKanbanRequests,
    getCalendarRequests,
    getRequestById,
    createRequest,
    updateRequestStatus,
    assignTechnician,
    updateRequest,
    deleteRequest,
} = require('../controllers/requestController');
const { authenticateToken } = require('../middleware/auth');
const { requireManager } = require('../middleware/rbac');
const validate = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /api/requests:
 *   get:
 *     summary: Get all maintenance requests
 *     tags: [Maintenance Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [New, In Progress, Repaired, Scrap]
 *       - in: query
 *         name: request_type
 *         schema:
 *           type: string
 *           enum: [Corrective, Preventive]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: List of requests
 */
router.get('/', authenticateToken, getAllRequests);

/**
 * @swagger
 * /api/requests/kanban:
 *   get:
 *     summary: Get requests for Kanban board (grouped by status)
 *     tags: [Maintenance Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Requests grouped by status
 */
router.get('/kanban', authenticateToken, getKanbanRequests);

/**
 * @swagger
 * /api/requests/calendar:
 *   get:
 *     summary: Get preventive requests for calendar view
 *     tags: [Maintenance Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Calendar events
 */
router.get('/calendar', authenticateToken, getCalendarRequests);

/**
 * @swagger
 * /api/requests/{id}:
 *   get:
 *     summary: Get request by ID
 *     tags: [Maintenance Requests]
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
 *         description: Request details
 */
router.get(
    '/:id',
    authenticateToken,
    [param('id').isUUID().withMessage('Invalid request ID'), validate],
    getRequestById
);

/**
 * @swagger
 * /api/requests:
 *   post:
 *     summary: Create new maintenance request
 *     tags: [Maintenance Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - request_type
 *               - equipment_id
 *             properties:
 *               subject:
 *                 type: string
 *               description:
 *                 type: string
 *               request_type:
 *                 type: string
 *                 enum: [Corrective, Preventive]
 *               equipment_id:
 *                 type: string
 *               scheduled_date:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High, Critical]
 *     responses:
 *       201:
 *         description: Request created
 */
router.post(
    '/',
    authenticateToken,
    [
        body('subject').trim().notEmpty().withMessage('Subject required'),
        body('request_type').isIn(['Corrective', 'Preventive']).withMessage('Invalid request type'),
        body('equipment_id').isUUID('all').withMessage('Valid equipment ID required'),
        validate,
    ],
    createRequest
);

/**
 * @swagger
 * /api/requests/{id}:
 *   put:
 *     summary: Update request details (not status)
 *     tags: [Maintenance Requests]
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
 *         description: Request updated
 */
router.put(
    '/:id',
    authenticateToken,
    [param('id').isUUID().withMessage('Invalid request ID'), validate],
    updateRequest
);

/**
 * @swagger
 * /api/requests/{id}/status:
 *   patch:
 *     summary: Update request status (with workflow validation)
 *     tags: [Maintenance Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [In Progress, Repaired, Scrap]
 *               duration_hours:
 *                 type: number
 *               completion_notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch(
    '/:id/status',
    authenticateToken,
    [
        param('id').isUUID().withMessage('Invalid request ID'),
        body('status')
            .isIn(['In Progress', 'Repaired', 'Scrap'])
            .withMessage('Invalid status'),
        validate,
    ],
    updateRequestStatus
);

/**
 * @swagger
 * /api/requests/{id}/assign:
 *   patch:
 *     summary: Assign technician to request
 *     tags: [Maintenance Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               -assigned_technician_id
 *             properties:
 *               assigned_technician_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Technician assigned
 */
router.patch(
    '/:id/assign',
    authenticateToken,
    [
        param('id').isUUID().withMessage('Invalid request ID'),
        body('assigned_technician_id').isUUID().withMessage('Valid technician ID required'),
        validate,
    ],
    assignTechnician
);

/**
 * @swagger
 * /api/requests/{id}:
 *   delete:
 *     summary: Delete request (soft delete)
 *     tags: [Maintenance Requests]
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
 *         description: Request deleted
 */
router.delete(
    '/:id',
    authenticateToken,
    requireManager,
    [param('id').isUUID().withMessage('Invalid request ID'), validate],
    deleteRequest
);

module.exports = router;
