const express = require('express');
const staffBuildRequestController = require('../controllers/staffBuildRequestController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Staff Build Requests
 *   description: CRUD APIs for customer requests assigned to staff for PC build consulting
 */

/**
 * @swagger
 * /api/staff-build-requests:
 *   get:
 *     summary: Get all staff build requests
 *     tags: [Staff Build Requests]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter by customer user id
 *       - in: query
 *         name: staff_id
 *         schema:
 *           type: integer
 *         description: Filter by staff user id
 *     responses:
 *       200:
 *         description: List of staff build requests
 */
router.get('/', staffBuildRequestController.getAllStaffBuildRequests);

router.post('/me', authenticate, staffBuildRequestController.createMyStaffBuildRequest);
router.get('/me', authenticate, staffBuildRequestController.getMyStaffBuildRequests);
router.get('/staff/my-queue', authenticate, authorize('staff', 'admin'), staffBuildRequestController.getMyAssignedRequests);
router.patch('/:id/assign', authenticate, authorize('staff', 'admin'), staffBuildRequestController.assignStaffBuildRequest);
router.post('/:id/submit-build', authenticate, authorize('staff', 'admin'), staffBuildRequestController.submitBuildForRequest);

/**
 * @swagger
 * /api/staff-build-requests/user/{userId}:
 *   get:
 *     summary: Get all staff build requests by customer user id
 *     tags: [Staff Build Requests]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of staff build requests for a user
 *       400:
 *         description: Invalid user id
 */
router.get('/user/:userId', staffBuildRequestController.getStaffBuildRequestsByUserId);

/**
 * @swagger
 * /api/staff-build-requests/{id}:
 *   get:
 *     summary: Get staff build request by id
 *     tags: [Staff Build Requests]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Staff build request detail
 *       404:
 *         description: Not found
 */
router.get('/:id', staffBuildRequestController.getStaffBuildRequestById);

/**
 * @swagger
 * /api/staff-build-requests:
 *   post:
 *     summary: Create a new staff build request
 *     tags: [Staff Build Requests]
 *     security: []
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
 *                 type: integer
 *               staff_id:
 *                 type: integer
 *                 nullable: true
 *               customer_note:
 *                 type: string
 *               budget_range:
 *                 type: number
 *               status:
 *                 type: string
 *                 example: pending
 *               user_build_id:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Staff build request created
 */
router.post('/', staffBuildRequestController.createStaffBuildRequest);

/**
 * @swagger
 * /api/staff-build-requests/{id}:
 *   put:
 *     summary: Update staff build request by id
 *     tags: [Staff Build Requests]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               staff_id:
 *                 type: integer
 *                 nullable: true
 *               customer_note:
 *                 type: string
 *               budget_range:
 *                 type: number
 *               status:
 *                 type: string
 *               user_build_id:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Staff build request updated
 *       404:
 *         description: Not found
 */
router.put('/:id', staffBuildRequestController.updateStaffBuildRequest);

/**
 * @swagger
 * /api/staff-build-requests/{id}:
 *   delete:
 *     summary: Delete staff build request by id
 *     tags: [Staff Build Requests]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Staff build request deleted
 *       404:
 *         description: Not found
 */
router.delete('/:id', staffBuildRequestController.deleteStaffBuildRequest);

module.exports = router;
