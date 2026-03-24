const paymentService = require("../services/paymentService");

const resolveClientIp = (req) => req.headers["x-forwarded-for"] || req.ip || req.socket?.remoteAddress;

exports.createQrFullPayment = async (req, res) => {
    try {
        const requesterUserId = Number(req.user?.userId);
        const data = await paymentService.getOnlineQrForCurrentUser(requesterUserId, resolveClientIp(req));
        return res.json({ success: true, data });
    } catch (error) {
        console.error("Create QR_FULL payment error:", error);

        if (
            error.message === "Payment not found" ||
            error.message === "No active payment found for user"
        ) {
            return res.status(404).json({ success: false, error: error.message });
        }
        if (error.message === "Forbidden payment access") {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (
            error.message.startsWith("Payment method mismatch") ||
            error.message === "Payment already completed" ||
            error.message.includes("VietQR config missing")
        ) {
            return res.status(400).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};

exports.createQrInstallmentPayment = async (req, res) => {
    try {
        const requesterUserId = Number(req.user?.userId);
        const { months } = req.body;

        const data = await paymentService.getInstallmentQrForCurrentUser(
            months,
            requesterUserId,
            resolveClientIp(req)
        );
        return res.json({ success: true, data });
    } catch (error) {
        console.error("Create QR_INSTALLMENT payment error:", error);

        if (
            error.message === "Payment not found" ||
            error.message === "No unpaid installment found" ||
            error.message === "No active payment found for user"
        ) {
            return res.status(404).json({ success: false, error: error.message });
        }
        if (error.message === "Forbidden payment access") {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (
            error.message.startsWith("Payment method mismatch") ||
            error.message.startsWith("months must be") ||
            error.message.includes("VietQR config missing")
        ) {
            return res.status(400).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};

exports.createCodPayment = async (req, res) => {
    try {
        const requesterUserId = Number(req.user?.userId);
        const data = await paymentService.selectCodForCurrentUser(requesterUserId);
        return res.json({ success: true, data });
    } catch (error) {
        console.error("Create COD payment error:", error);

        if (
            error.message === "Payment not found" ||
            error.message === "No active payment found for user"
        ) {
            return res.status(404).json({ success: false, error: error.message });
        }
        if (error.message === "Forbidden payment access") {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (
            error.message.startsWith("Payment method mismatch") ||
            error.message === "Payment already completed"
        ) {
            return res.status(400).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};

exports.confirmPaymentUpdate = async (req, res) => {
    try {
        const requesterUserId = Number(req.user?.userId);
        const { confirmation_message } = req.body;

        const data = await paymentService.confirmPaymentSuccessForCurrentUser(
            confirmation_message,
            requesterUserId
        );
        return res.json({
            success: true,
            message: "Payment updated successfully",
            data
        });
    } catch (error) {
        console.error("Confirm payment update error:", error);

        if (
            error.message === "Payment not found" ||
            error.message === "No unpaid installment found" ||
            error.message === "No active payment found for user"
        ) {
            return res.status(404).json({ success: false, error: error.message });
        }
        if (error.message === "Forbidden payment access") {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (
            error.message === "confirmation_message must be 'Đã thanh toán thành công' or 'CONFIRMED'" ||
            error.message === "Payment method is not selected yet" ||
            error.message === "Order already completed" ||
            error.message.startsWith("Insufficient stock")
        ) {
            return res.status(400).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};

exports.getPendingAdminCompletion = async (req, res) => {
    try {
        const data = await paymentService.getPendingAdminCompletionPayments();
        return res.json({
            success: true,
            role_scope: ["admin", "manager"],
            status_scope: ["Chờ duyệt", "Đang trả góp", "Chờ nhận hàng"],
            message: "Danh sách đơn mà admin/manager có thể kiểm tra để hoàn tất.",
            data
        });
    } catch (error) {
        console.error("Get pending admin completion error:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};


exports.adminCompleteOrderByOrderId = async (req, res) => {
    try {
        const orderId = Number(req.params.orderId);
        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({ success: false, error: "orderId must be a positive integer" });
        }

        const data = await paymentService.adminCompleteOrderByOrderId(orderId);
        return res.json({ success: true, data });
    } catch (error) {
        console.error("Admin complete order by order ID error:", error);
        if (
            error.message === "Order not found"
        ) {
            return res.status(404).json({ success: false, error: error.message });
        }
        if (
            error.message === "Order already completed" ||
            error.message === "Order is not ready for admin/manager completion"
        ) {
            return res.status(400).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};

// Backward-compatible aliases
exports.getOnlineQrByPaymentId = exports.createQrFullPayment;
exports.getInstallmentQrByPaymentId = exports.createQrInstallmentPayment;
