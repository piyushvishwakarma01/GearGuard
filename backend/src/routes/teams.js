const express = require('express');
const { body, param } = require('express-validator');
const {
    getAllTeams,
    getTeamById,
    createTeam,
    updateTeam,
    addTeamMember,
    removeTeamMember,
    deleteTeam,
} = require('../controllers/teamController');
const { authenticateToken } = require('../middleware/auth');
const { requireManager } = require('../middleware/rbac');
const validate = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Get all maintenance teams
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         description: Filter teams by user membership
 *     responses:
 *       200:
 *         description: List of teams
 */
router.get('/', authenticateToken, getAllTeams);

/**
 * @swagger
 * /api/teams/{id}:
 *   get:
 *     summary: Get team by ID
 *     tags: [Teams]
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
 *         description: Team details with members
 */
router.get(
    '/:id',
    authenticateToken,
    [param('id').isUUID().withMessage('Invalid team ID'), validate],
    getTeamById
);

/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Create new team
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               team_type:
 *                 type: string
 *     responses:
 *       201:
 *         description: Team created
 */
router.post(
    '/',
    authenticateToken,
    requireManager,
    [body('name').trim().notEmpty().withMessage('Team name required'), validate],
    createTeam
);

/**
 * @swagger
 * /api/teams/{id}:
 *   put:
 *     summary: Update team
 *     tags: [Teams]
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
 *         description: Team updated
 */
router.put(
    '/:id',
    authenticateToken,
    requireManager,
    [param('id').isUUID().withMessage('Invalid team ID'), validate],
    updateTeam
);

/**
 * @swagger
 * /api/teams/{id}/members:
 *   post:
 *     summary: Add member to team
 *     tags: [Teams]
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
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *               is_lead:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Member added
 */
router.post(
    '/:id/members',
    authenticateToken,
    requireManager,
    [
        param('id').isUUID().withMessage('Invalid team ID'),
        body('user_id').isUUID().withMessage('Valid user ID required'),
        validate,
    ],
    addTeamMember
);

/**
 * @swagger
 * /api/teams/{id}/members/{userId}:
 *   delete:
 *     summary: Remove member from team
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed
 */
router.delete(
    '/:id/members/:userId',
    authenticateToken,
    requireManager,
    [
        param('id').isUUID().withMessage('Invalid team ID'),
        param('userId').isUUID().withMessage('Invalid user ID'),
        validate,
    ],
    removeTeamMember
);

/**
 * @swagger
 * /api/teams/{id}:
 *   delete:
 *     summary: Delete team
 *     tags: [Teams]
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
 *         description: Team deleted
 */
router.delete(
    '/:id',
    authenticateToken,
    requireManager,
    [param('id').isUUID().withMessage('Invalid team ID'), validate],
    deleteTeam
);

module.exports = router;
