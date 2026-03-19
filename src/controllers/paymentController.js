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
            error.message.includes("VNPAY config missing") ||
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
            error.message.includes("VNPAY config missing") ||
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

exports.vnpayIpn = async (req, res) => {
    try {
        const result = await paymentService.handleVnpayIpn(req.query);
        return res.json(result);
    } catch (error) {
        console.error("VNPAY IPN error:", error);
        return res.status(500).json({ RspCode: "99", Message: "Unknown error" });
    }
};

exports.vnpayReturn = async (req, res) => {
    try {
        const queryStr = req.originalUrl.substring(req.originalUrl.indexOf('?') + 1) || "";
        const pairs = queryStr.split('&');
        
        let secureHash = "";
        const hashDataPairs = [];
        
        for (const pair of pairs) {
            const index = pair.indexOf('=');
            if (index > -1) {
                const key = pair.substring(0, index);
                if (key === 'vnp_SecureHash') {
                    secureHash = pair.substring(index + 1);
                } else if (key !== 'vnp_SecureHashType' && key.startsWith('vnp_')) {
                    // Collect exactly the raw character stream for the parameter pair sent by VNPay
                    hashDataPairs.push(pair);
                }
            }
        }
        
        // VNPAY standard requires exact alphabetical sorting by key 
        hashDataPairs.sort((a, b) => {
            const keyA = a.split('=')[0];
            const keyB = b.split('=')[0];
            return keyA.localeCompare(keyB);
        });
        
        const signData = hashDataPairs.join('&');
        const crypto = require("crypto");
        const secretKey = process.env.VNP_HASHSECRET || process.env.VNPAY_HASHSECRET || "UE2B7S0QESNGSQDXUA8NJTL72DFGMKQX";
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        
        const isValid = secureHash.toUpperCase() === signed.toUpperCase();
        const responseCode = req.query.vnp_ResponseCode || "";
        
        const message = isValid 
            ? (responseCode === "00" ? "Thanh toán thành công" : "Giao dịch không thành công")
            : "Chữ ký không hợp lệ";

        // Try silently letting service process it to ensure DB updates (even if its internal verification fails)
        if (isValid && responseCode === "00") {
             // Let IPN handle the DB update as per VNPay standard, we just do frontend rendering here.
        }

        const frontendUrl = process.env.FRONTEND_URL || "https://swd392-frontend-cosmictech.vercel.app";
        const redirectUrl = (isValid && responseCode === "00") ? `${frontendUrl}/` : `${frontendUrl}/cart`;
        
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Kết quả thanh toán VNPAY</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f4f4f9; margin: 0; }
                    .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; max-width: 450px; }
                    .icon { font-size: 64px; margin-bottom: 20px; }
                    .success { color: #10b981; }
                    .error { color: #ef4444; }
                    h2 { margin: 0 0 10px; color: #1f2937; }
                    p { color: #6b7280; font-size: 15px; margin-bottom: 24px; line-height: 1.5; }
                    .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #6366f1; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin: 0 auto 16px; }
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="icon ${(isValid && responseCode === '00') ? 'success' : 'error'}">
                        ${(isValid && responseCode === '00') ? '✓' : '✗'}
                    </div>
                    <h2>${message}</h2>
                    <p>Giao dịch của bạn đã được ghi nhận. Hệ thống sẽ tự động quay trở lại cửa hàng trong giây lát.</p>
                    <div class="spinner"></div>
                </div>
                <script>
                    setTimeout(() => {
                        window.location.href = "${redirectUrl}";
                    }, 3500);
                </script>
            </body>
            </html>
        `;

        return res.send(htmlContent);
    } catch (error) {
        console.error("VNPAY Return error:", error);
        return res.send("<h2>Đã xảy ra lỗi hệ thống! Vui lòng thử lại.</h2>");
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

exports.adminCompleteOrder = async (req, res) => {
    try {
        const paymentId = Number(req.params.paymentId);
        if (!Number.isInteger(paymentId) || paymentId <= 0) {
            return res.status(400).json({ success: false, error: "paymentId must be a positive integer" });
        }

        const data = await paymentService.adminCompleteOrderByPaymentId(paymentId);
        return res.json({ success: true, data });
    } catch (error) {
        console.error("Admin complete order error:", error);
        if (
            error.message === "Payment not found"
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
exports.confirmPaymentSuccess = exports.confirmPaymentUpdate;
