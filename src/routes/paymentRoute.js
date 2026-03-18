const express = require("express");
const paymentController = require("../controllers/paymentController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment APIs
 */

/**
 * @swagger
 * /api/payments/qr-full:
 *   post:
 *     summary: Generate VNPay payment URL for QR_FULL payment of current user active payment
 *     tags: [Payment]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: QR_FULL generated successfully
 */
router.post("/qr-full", authenticate, paymentController.createQrFullPayment);

/**
 * @swagger
 * /api/payments/qr-installment:
 *   post:
 *     summary: Generate VNPay payment URL for QR_INSTALLMENT payment of current user active payment
 *     tags: [Payment]
 *     security:
 *       - BearerAuth: []
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
 *                 enum: [3, 6, 9, 12]
 *                 description: Installment months (suggested 3, 6, 9, 12)
 *                 example: 6
 *     responses:
 *       200:
 *         description: QR_INSTALLMENT generated successfully
 */
router.post("/qr-installment", authenticate, paymentController.createQrInstallmentPayment);

/**
 * @swagger
 * /api/payments/cod:
 *   post:
 *     summary: Select COD payment for current user active payment
 *     tags: [Payment]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: COD selected successfully
 */
router.post("/cod", authenticate, paymentController.createCodPayment);

/**
 * @swagger
 * /api/payments/confirm:
 *   patch:
 *     summary: Manual confirm payment (TEST ONLY, not production flow)
 *     tags: [Payment]
 *     security:
 *       - BearerAuth: []
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
router.patch("/confirm", authenticate, paymentController.confirmPaymentUpdate);

router.get("/vnpay/ipn", paymentController.vnpayIpn);
router.get("/vnpay/return", paymentController.vnpayReturn);

router.get(
	"/admin/pending-completion",
	authenticate,
	authorize("admin"),
	paymentController.getPendingAdminCompletion
);
router.patch(
	"/admin/:paymentId/complete",
	authenticate,
	authorize("admin"),
	paymentController.adminCompleteOrder
);

// Backward-compatible legacy routes
router.get("/online/qr", authenticate, paymentController.getOnlineQrByPaymentId);
router.post("/installment/qr", authenticate, paymentController.getInstallmentQrByPaymentId);

module.exports = router;
