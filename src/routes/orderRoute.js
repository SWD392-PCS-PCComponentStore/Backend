const express = require('express');
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         order_id:
 *           type: integer
 *           description: Order ID
 *           example: 1
 *         user_id:
 *           type: integer
 *           description: User ID
 *           example: 3
 *         promotion_id:
 *           type: integer
 *           nullable: true
 *           description: Promotion ID applied to order
 *           example: 1
 *         order_date:
 *           type: string
 *           format: date-time
 *           description: Created datetime
 *           example: 2026-03-14T12:00:00.000Z
 *         status:
 *           type: string
 *           description: Order status
 *           example: Pending
 *         total_amount:
 *           type: number
 *           format: decimal
 *           description: Total amount
 *           example: 72000000
 *         shipping_address:
 *           type: string
 *           nullable: true
 *           description: Shipping address
 *           example: 123 Nguyen Trai, Q1, HCM
 *         payment_type:
 *           type: string
 *           description: Payment type
 *           example: One-time
 *         payment_method:
 *           type: string
 *           nullable: true
 *           description: Payment method from payment record
 *           example: QR_FULL
 *         user_name:
 *           type: string
 *           description: User name from joined table
 *           example: Le Khach Hang
 *         user_email:
 *           type: string
 *           description: User email from joined table
 *           example: customer@gmail.com
 *         user_phone:
 *           type: string
 *           nullable: true
 *           description: User phone from joined table
 *           example: 0901234567
 *         promotion_code:
 *           type: string
 *           nullable: true
 *           description: Promotion code from joined table
 *           example: UUDAI2026
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
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
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticate, orderController.getAllOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticate, orderController.getOrderById);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create new order from selected cart items
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cart_item_ids
 *               - shipping_address
 *               - phone
 *               - payment_method
 *             properties:
 *               cart_item_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Selected cart item IDs to checkout
 *                 example: [1, 3, 5]
 *               promotion_code:
 *                 type: string
 *                 nullable: true
 *                 example: UUDAI2026
 *               shipping_address:
 *                 type: string
 *                 example: 123 Nguyen Trai, Q1, HCM
 *               phone:
 *                 type: string
 *                 example: 0901234567
 *               payment_method:
 *                 type: string
 *                 description: Allowed values QR_FULL, QR_INSTALLMENT, COD
 *                 example: QR_FULL
 *     responses:
 *       201:
 *         description: Order created successfully
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
 *                   example: Order created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     order_id:
 *                       type: integer
 *                       example: 101
 *                     payment_id:
 *                       type: integer
 *                       example: 88
 *                     selected_cart_item_ids:
 *                       type: array
 *                       items:
 *                         type: integer
 *                     subtotal:
 *                       type: number
 *                       format: decimal
 *                     discount_percent:
 *                       type: number
 *                       format: decimal
 *                     discount_amount:
 *                       type: number
 *                       format: decimal
 *                     total_amount:
 *                       type: number
 *                       format: decimal
 *                     promotion_code:
 *                       type: string
 *                       nullable: true
 *                     shipping_address:
 *                       type: string
 *                     contact_phone:
 *                       type: string
 *                     payment_type:
 *                       type: string
 *                     payment_method:
 *                       type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, orderController.createOrder);

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Update order
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 3
 *               promotion_id:
 *                 type: integer
 *                 nullable: true
 *                 example: 1
 *               status:
 *                 type: string
 *                 example: Pending
 *               total_amount:
 *                 type: number
 *                 format: decimal
 *                 example: 68000000
 *               shipping_address:
 *                 type: string
 *                 example: 234 Le Loi, Q1, HCM
 *               payment_type:
 *                 type: string
 *                 example: Installment
 *     responses:
 *       200:
 *         description: Order updated successfully
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
 *                   example: Order updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticate, orderController.updateOrder);

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Delete order
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Order deleted successfully
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
 *                   example: Order deleted successfully
 *       400:
 *         description: Cannot delete order due to FK constraints
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticate, orderController.deleteOrder);

module.exports = router;
