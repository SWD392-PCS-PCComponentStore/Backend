const paymentService = require("../services/paymentService");

exports.getOnlineQrByPaymentId = async (req, res) => {
    try {
        const requesterUserId = Number(req.user?.userId);
        const data = await paymentService.getOnlineQrForCurrentUser(requesterUserId);
        return res.json({ success: true, data });
    } catch (error) {
        console.error("Get online QR error:", error);

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
            error.message === "Payment already completed"
        ) {
            return res.status(400).json({ success: false, error: error.message });
        }
        if (error.message.includes("VietQR")) {
            return res.status(502).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};

exports.getInstallmentQrByPaymentId = async (req, res) => {
    try {
        const requesterUserId = Number(req.user?.userId);
        const { months } = req.body;

        const data = await paymentService.getInstallmentQrForCurrentUser(months, requesterUserId);
        return res.json({ success: true, data });
    } catch (error) {
        console.error("Get installment QR error:", error);

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
        if (error.message.startsWith("months must be")) {
            return res.status(400).json({ success: false, error: error.message });
        }
        if (error.message.includes("VietQR")) {
            return res.status(502).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};

exports.confirmPaymentSuccess = async (req, res) => {
    try {
        const requesterUserId = Number(req.user?.userId);
        const { confirmation_message } = req.body;

        const data = await paymentService.confirmPaymentSuccessForCurrentUser(
            confirmation_message,
            requesterUserId
        );
        return res.json({
            success: true,
            message: "Hoàn Thành",
            data
        });
    } catch (error) {
        console.error("Confirm payment success error:", error);

        if (error.message === "Payment not found") {
            return res.status(404).json({ success: false, error: error.message });
        }
        if (error.message === "No unpaid installment found") {
            return res.status(404).json({ success: false, error: error.message });
        }
        if (error.message === "No active payment found for user") {
            return res.status(404).json({ success: false, error: error.message });
        }
        if (error.message === "Forbidden payment access") {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (
            error.message === "confirmation_message must be 'Đã thanh toán thành công'" ||
            error.message === "Payment method is not selected yet"
        ) {
            return res.status(400).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};

