const express = require("express");
const checkoutController = require("../controllers/checkoutController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Checkout
 *   description: Checkout flow APIs
 */

/**
 * @swagger
 * /api/checkout:
 *   post:
 *     summary: Create ORDER, ORDER_DETAIL, PAYMENT from CART
 *     tags: [Checkout]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shipping_address
 *             properties:
 *               shipping_address:
 *                 type: string
 *                 example: 123 Nguyen Trai, Q1
 *     responses:
 *       201:
 *         description: Checkout successful
 */
router.post("/", authenticate, checkoutController.checkout);

module.exports = router;
