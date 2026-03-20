const express = require('express');
const promotionController = require('../controllers/promotionController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Promotions
 *   description: Promotion management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Promotion:
 *       type: object
 *       properties:
 *         promotion_id:
 *           type: integer
 *           description: Promotion ID
 *           example: 1
 *         code:
 *           type: string
 *           description: Unique promotion code
 *           example: SUMMER2026
 *         discount_percent:
 *           type: number
 *           format: decimal
 *           description: Discount percent from 0 to 100
 *           example: 15
 *         valid_from:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Start datetime of promotion
 *           example: 2026-06-01T00:00:00.000Z
 *         valid_to:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: End datetime of promotion
 *           example: 2026-06-30T23:59:59.000Z
 */

/**
 * @swagger
 * /api/promotions:
 *   get:
 *     summary: Get all promotions
 *     tags: [Promotions]
 *     security: []
 *     responses:
 *       200:
 *         description: List of promotions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Promotion'
 *       500:
 *         description: Internal server error
 */
router.get('/', promotionController.getAllPromotions);

/**
 * @swagger
 * /api/promotions/code/{code}:
 *   get:
 *     summary: Get promotion by code
 *     tags: [Promotions]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Promotion code
 *         example: SUMMER2026
 *     responses:
 *       200:
 *         description: Promotion details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Promotion'
 *       404:
 *         description: Promotion not found
 *       500:
 *         description: Internal server error
 */
router.get('/code/:code', promotionController.getPromotionByCode);

/**
 * @swagger
 * /api/promotions/{id}:
 *   get:
 *     summary: Get promotion by ID
 *     tags: [Promotions]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Promotion ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Promotion details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Promotion'
 *       404:
 *         description: Promotion not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', promotionController.getPromotionById);

/**
 * @swagger
 * /api/promotions:
 *   post:
 *     summary: Create new promotion
 *     tags: [Promotions]
 *     description: Requires authenticated account with role admin, manager or staff
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - discount_percent
 *             properties:
 *               code:
 *                 type: string
 *                 example: SUMMER2026
 *               discount_percent:
 *                 type: number
 *                 format: decimal
 *                 example: 20
 *               valid_from:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               valid_to:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Promotion created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Promotion created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Promotion'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin, manager or staff)
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/promotions/{id}:
 *   put:
 *     summary: Update promotion
 *     tags: [Promotions]
 *     description: Requires authenticated account with role admin, manager or staff
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Promotion ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: SUMMER2026-NEW
 *               discount_percent:
 *                 type: number
 *                 format: decimal
 *                 example: 25
 *               valid_from:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               valid_to:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Promotion updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Promotion updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Promotion'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin, manager or staff)
 *       404:
 *         description: Promotion not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/promotions/{id}:
 *   delete:
 *     summary: Delete promotion
 *     tags: [Promotions]
 *     description: Requires authenticated account with role admin, manager or staff
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Promotion ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Promotion deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Promotion deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin, manager or staff)
 *       404:
 *         description: Promotion not found
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, authorize('admin', 'manager', 'staff'), promotionController.createPromotion);
router.put('/:id', authenticate, authorize('admin', 'manager', 'staff'), promotionController.updatePromotion);
router.delete('/:id', authenticate, authorize('admin', 'manager', 'staff'), promotionController.deletePromotion);

module.exports = router;
