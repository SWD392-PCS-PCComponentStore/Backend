const express = require("express");
const paymentController = require("../controllers/paymentController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment APIs
 */

/**
 * @swagger
 * /api/payments/online/qr:
 *   get:
 *     summary: Generate VietQR for online full payment of current user active payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: QR generated successfully
 */
router.get("/online/qr", authenticate, paymentController.getOnlineQrByPaymentId);

/**
 * @swagger
 * /api/payments/installment/qr:
 *   post:
 *     summary: Generate VietQR for installment payment of current user active payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - months
 *             properties:
 *               months:
 *                 type: integer
 *                 enum: [3, 5, 9, 12]
 *                 description: Installment months
 *                 example: 5
 *     responses:
 *       200:
 *         description: Installment QR generated successfully
 */
router.post("/installment/qr", authenticate, paymentController.getInstallmentQrByPaymentId);

/**
 * @swagger
 * /api/payments/confirm:
 *   patch:
 *     summary: Confirm payment success for current user active payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - confirmation_message
 *             properties:
 *               confirmation_message:
 *                 type: string
 *                 example: Đã thanh toán thành công
 *     responses:
 *       200:
 *         description: Payment confirmed successfully
 */
router.patch("/confirm", authenticate, paymentController.confirmPaymentSuccess);

module.exports = router;
