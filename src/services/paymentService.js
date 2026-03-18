const crypto = require("crypto");
const PaymentModel = require("../models/paymentModel");

const INSTALLMENT_INTEREST_BY_MONTH = {
    3: 0,
    6: 0.012,
    9: 0.014,
    12: 0.016
};
const INSTALLMENT_MONTH_OPTIONS = [3, 6, 9, 12];

const VNP_DEFAULT_VERSION = "2.1.0";
const VNP_DEFAULT_COMMAND = "pay";
const VNP_DEFAULT_CURR_CODE = "VND";
const VNP_DEFAULT_LOCALE = "vn";
const VNP_DEFAULT_ORDER_TYPE = "other";

const roundMoney = (value) => parseFloat(Number(value || 0).toFixed(2));
const normalizeMethod = (method) => String(method || "").trim().toUpperCase();
const normalizeStatus = (status) => String(status || "").trim().toLowerCase();

const encodeVnpComponent = (value) => encodeURIComponent(String(value ?? ""))
    .replace(/%20/g, "+")
    .replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);

const buildVnpHashData = (params) => {
    const sortedKeys = Object.keys(params).sort();
    return sortedKeys
        .map((key) => `${encodeVnpComponent(key)}=${encodeVnpComponent(params[key])}`)
        .join("&");
};

const buildVnpQueryString = (params) => {
    const sortedKeys = Object.keys(params).sort();
    return sortedKeys
        .map((key) => `${encodeVnpComponent(key)}=${encodeVnpComponent(params[key])}`)
        .join("&");
};

const getVnpayConfig = () => ({
    tmnCode: process.env.VNP_TMNCODE || process.env.VNPAY_TMNCODE || "",
    hashSecret: process.env.VNP_HASHSECRET || process.env.VNPAY_HASHSECRET || "",
    paymentUrl: process.env.VNP_URL || process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    returnUrl: process.env.VNP_RETURN_URL || process.env.VNPAY_RETURN_URL || "http://localhost:5000/api/payments/vnpay/return"
});

const resolveClientIp = (clientIp) => {
    if (!clientIp) {
        return "127.0.0.1";
    }

    const normalized = String(clientIp).split(",")[0].trim();
    if (normalized === "::1" || normalized === "::ffff:127.0.0.1") {
        return "127.0.0.1";
    }
    return normalized;
};

const formatDateYmdHis = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    const second = String(date.getSeconds()).padStart(2, "0");
    return `${year}${month}${day}${hour}${minute}${second}`;
};

const getVietnamDate = () => {
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
    return new Date(utcTime + 7 * 60 * 60 * 1000);
};

const signVnpParams = (params, hashSecret) => {
    const hashData = buildVnpHashData(params);
    return crypto.createHmac("sha512", hashSecret).update(hashData, "utf8").digest("hex");
};

const buildTxnRef = (paymentId, installmentNumber = null) => {
    if (Number.isInteger(installmentNumber) && installmentNumber > 0) {
        return `INS${paymentId}-${installmentNumber}-${Date.now()}`;
    }
    return `PAY${paymentId}-${Date.now()}`;
};

const parseTxnRef = (txnRef) => {
    const value = String(txnRef || "").trim();

    const installmentMatch = value.match(/^INS(\d+)-(\d+)-\d+$/i);
    if (installmentMatch) {
        return {
            paymentId: Number(installmentMatch[1]),
            installmentNumber: Number(installmentMatch[2])
        };
    }

    const fullMatch = value.match(/^PAY(\d+)-\d+$/i);
    if (fullMatch) {
        return {
            paymentId: Number(fullMatch[1]),
            installmentNumber: null
        };
    }

    return {
        paymentId: NaN,
        installmentNumber: null
    };
};

const isFirstPaidTransition = (paymentStatus) => {
    const status = normalizeStatus(paymentStatus);
    return status === "" || status === "pending" || status === "chờ thanh toán";
};

const getPaymentRow = async (paymentId, requesterUserId) => {
    const result = await PaymentModel.getPaymentAndOrderByPaymentId(paymentId);
    const row = result.recordset[0];
    if (!row) {
        throw new Error("Payment not found");
    }
    if (requesterUserId && Number(row.user_id) !== Number(requesterUserId)) {
        throw new Error("Forbidden payment access");
    }
    return row;
};

const getCurrentPaymentIdForUser = async (requesterUserId) => {
    const result = await PaymentModel.getCurrentPaymentByUserId(requesterUserId);
    const current = result.recordset[0];
    if (!current) {
        throw new Error("No active payment found for user");
    }
    return current.payment_id;
};

const ensurePaymentMethod = (payment, expectedMethod) => {
    const currentMethod = normalizeMethod(payment.payment_method);
    if (currentMethod !== expectedMethod) {
        throw new Error(
            `Payment method mismatch. Expected ${expectedMethod}, got ${currentMethod || "N/A"}`
        );
    }
};

const buildVnpayPaymentUrl = ({ amount, txnRef, orderInfo, clientIp, bankCode }) => {
    const { tmnCode, hashSecret, paymentUrl, returnUrl } = getVnpayConfig();

    if (!tmnCode || !hashSecret || !paymentUrl) {
        throw new Error("VNPAY config missing (VNP_TMNCODE, VNP_HASHSECRET, VNP_URL)");
    }

    const createDate = getVietnamDate();
    const expireDate = new Date(createDate.getTime() + 15 * 60 * 1000);

    const params = {
        vnp_Version: VNP_DEFAULT_VERSION,
        vnp_Command: VNP_DEFAULT_COMMAND,
        vnp_TmnCode: tmnCode,
        vnp_Amount: Math.round(Number(amount || 0) * 100),
        vnp_CurrCode: VNP_DEFAULT_CURR_CODE,
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: VNP_DEFAULT_ORDER_TYPE,
        vnp_Locale: VNP_DEFAULT_LOCALE,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: resolveClientIp(clientIp),
        vnp_CreateDate: formatDateYmdHis(createDate),
        vnp_ExpireDate: formatDateYmdHis(expireDate)
    };

    if (bankCode) {
        params.vnp_BankCode = bankCode;
    }

    const vnpSecureHash = signVnpParams(params, hashSecret);
    const queryString = `${buildVnpQueryString(params)}&vnp_SecureHash=${vnpSecureHash}`;

    return {
        txnRef,
        payment_url: `${paymentUrl}?${queryString}`,
        vnp_params: params
    };
};

const ensureInstallmentPlan = async (orderId, principalAmount, months) => {
    const existingPlanResult = await PaymentModel.getInstallmentPlanByOrderId(orderId);
    const existingPlan = existingPlanResult.recordset[0];
    if (existingPlan) {
        return existingPlan;
    }

    const totalMonths = Number(months);
    const monthlyRate = INSTALLMENT_INTEREST_BY_MONTH[totalMonths];
    if (monthlyRate === undefined) {
        throw new Error("months must be one of 3, 6, 9, 12 for QR_INSTALLMENT");
    }

    const interestAmount = roundMoney(principalAmount * monthlyRate * totalMonths);
    const totalPayable = roundMoney(principalAmount + interestAmount);
    const monthlyAmount = roundMoney(totalPayable / totalMonths);

    const planResult = await PaymentModel.createInstallmentPlan(
        orderId,
        totalPayable,
        totalMonths,
        monthlyAmount,
        roundMoney(monthlyRate * 100)
    );
    const plan = planResult.recordset[0];

    let allocated = 0;
    const now = new Date();
    for (let index = 1; index <= totalMonths; index += 1) {
        let amountToPay = monthlyAmount;
        if (index < totalMonths) {
            allocated = roundMoney(allocated + amountToPay);
        } else {
            amountToPay = roundMoney(totalPayable - allocated);
        }

        const dueDate = new Date(now);
        dueDate.setMonth(dueDate.getMonth() + index);

        await PaymentModel.createInstallmentDetail(plan.plan_id, index, dueDate, amountToPay);
    }

    return plan;
};

const markSuccessfulPaymentForOrder = async ({ payment, installmentMode = false, installmentNumber = null, paymentSource = "VNPAY" }) => {
    const method = normalizeMethod(payment.payment_method);

    if (installmentMode || method === "QR_INSTALLMENT") {
        const nextInstallmentResult = await PaymentModel.getNextUnpaidInstallmentByOrderId(payment.order_id);
        const nextInstallment = nextInstallmentResult.recordset[0];
        if (!nextInstallment) {
            return {
                payment_status: "Đã thanh toán",
                order_status: payment.order_status,
                unpaid_installments: 0,
                already_confirmed: true
            };
        }

        if (installmentNumber && Number(nextInstallment.installment_number) !== Number(installmentNumber)) {
            throw new Error("Installment number mismatch");
        }

        await PaymentModel.markInstallmentPaid(
            nextInstallment.installment_detail_id,
            `${paymentSource} Installment`
        );

        const unpaidResult = await PaymentModel.countUnpaidInstallments(nextInstallment.plan_id);
        const unpaidCount = Number(unpaidResult.recordset[0]?.unpaid_count || 0);

        const shouldDeductStock = isFirstPaidTransition(payment.payment_status);
        if (shouldDeductStock) {
            await PaymentModel.deductProductStockByOrderId(payment.order_id);
        }

        let paymentStatus = "Đã thanh toán 1 phần";
        let orderStatus = "Đang trả góp";

        if (unpaidCount === 0) {
            paymentStatus = "Đã thanh toán";
            orderStatus = "Chờ admin hoàn tất";
            await PaymentModel.updateInstallmentPlanStatus(nextInstallment.plan_id, "Completed");
        }

        await PaymentModel.updatePaymentStatus(payment.payment_id, paymentStatus);
        await PaymentModel.updateOrderStatus(payment.order_id, orderStatus);

        return {
            payment_status: paymentStatus,
            order_status: orderStatus,
            unpaid_installments: unpaidCount,
            admin_notification: unpaidCount === 0
                ? "Khách hàng đã thanh toán thành công. Admin vui lòng xác nhận hoàn tất đơn."
                : null
        };
    }

    const currentStatus = normalizeStatus(payment.payment_status);
    if (currentStatus === "đã thanh toán" || currentStatus === "paid") {
        return {
            payment_status: "Đã thanh toán",
            order_status: payment.order_status,
            already_confirmed: true
        };
    }

    if (isFirstPaidTransition(payment.payment_status)) {
        await PaymentModel.deductProductStockByOrderId(payment.order_id);
    }

    await PaymentModel.updatePaymentStatus(payment.payment_id, "Đã thanh toán");
    await PaymentModel.updateOrderStatus(payment.order_id, "Chờ admin hoàn tất");

    return {
        payment_status: "Đã thanh toán",
        order_status: "Chờ admin hoàn tất",
        admin_notification: "Khách hàng đã thanh toán thành công. Admin vui lòng xác nhận hoàn tất đơn."
    };
};

const verifyVnpaySignature = (query) => {
    const { hashSecret } = getVnpayConfig();
    if (!hashSecret) {
        throw new Error("VNPAY hash secret is missing");
    }

    const rawSecureHash = query?.vnp_SecureHash;
    if (!rawSecureHash) {
        return false;
    }

    const signedData = {};
    for (const [key, value] of Object.entries(query || {})) {
        if (!key.startsWith("vnp_")) {
            continue;
        }
        if (key === "vnp_SecureHash" || key === "vnp_SecureHashType") {
            continue;
        }
        signedData[key] = value;
    }

    const secureHash = signVnpParams(signedData, hashSecret);
    return String(secureHash).toUpperCase() === String(rawSecureHash).toUpperCase();
};

exports.getOnlineQrByPaymentId = async (paymentId, requesterUserId, clientIp) => {
    const payment = await getPaymentRow(paymentId, requesterUserId);
    ensurePaymentMethod(payment, "QR_FULL");

    const currentStatus = normalizeStatus(payment.payment_status);
    if (currentStatus === "đã thanh toán" || currentStatus === "paid") {
        throw new Error("Payment already completed");
    }

    await PaymentModel.updateOrderPaymentType(payment.order_id, "One-time");
    await PaymentModel.updatePaymentSelection(
        paymentId,
        roundMoney(payment.order_total_amount),
        "QR_FULL",
        "Pending"
    );

    const amount = roundMoney(payment.order_total_amount);
    const txnRef = buildTxnRef(paymentId);

    const vnpay = buildVnpayPaymentUrl({
        amount,
        txnRef,
        orderInfo: `Thanh toan don hang ORDER${payment.order_id}`,
        clientIp,
        bankCode: "VNPAYQR"
    });

    return {
        payment_id: paymentId,
        payment_method: "QR_FULL",
        total_amount: amount,
        ...vnpay
    };
};

exports.getOnlineQrForCurrentUser = async (requesterUserId, clientIp) => {
    const paymentId = await getCurrentPaymentIdForUser(requesterUserId);
    return await exports.getOnlineQrByPaymentId(paymentId, requesterUserId, clientIp);
};

exports.getInstallmentQrByPaymentId = async (paymentId, months, requesterUserId, clientIp) => {
    const payment = await getPaymentRow(paymentId, requesterUserId);
    ensurePaymentMethod(payment, "QR_INSTALLMENT");

    const plan = await ensureInstallmentPlan(
        payment.order_id,
        roundMoney(payment.order_total_amount),
        months
    );

    await PaymentModel.updateOrderPaymentType(payment.order_id, "Installment");
    await PaymentModel.updatePaymentSelection(
        paymentId,
        roundMoney(plan.total_amount),
        "QR_INSTALLMENT",
        "Pending"
    );

    const nextInstallmentResult = await PaymentModel.getNextUnpaidInstallmentByOrderId(payment.order_id);
    const nextInstallment = nextInstallmentResult.recordset[0];
    if (!nextInstallment) {
        throw new Error("No unpaid installment found");
    }

    const amount = roundMoney(nextInstallment.amount_to_pay);
    const txnRef = buildTxnRef(paymentId, Number(nextInstallment.installment_number));

    const vnpay = buildVnpayPaymentUrl({
        amount,
        txnRef,
        orderInfo: `Thanh toan tra gop ORDER${payment.order_id} ky ${nextInstallment.installment_number}`,
        clientIp
    });

    const principalAmount = roundMoney(payment.order_total_amount);
    const totalInstallmentAmount = roundMoney(plan.total_amount);
    const monthsValue = Number(plan.total_months);
    const monthlyInterestRate = roundMoney(Number(plan.interest_rate || 0));
    const monthlyInterestAmount = roundMoney(principalAmount * (monthlyInterestRate / 100));

    return {
        payment_id: paymentId,
        payment_method: "QR_INSTALLMENT",
        suggested_month_options: INSTALLMENT_MONTH_OPTIONS,
        months: monthsValue,
        total_amount: totalInstallmentAmount,
        monthly_interest_amount: monthlyInterestAmount,
        monthly_interest_rate_percent: monthlyInterestRate,
        next_installment_number: Number(nextInstallment.installment_number),
        next_installment_amount: amount,
        ...vnpay
    };
};

exports.getInstallmentQrForCurrentUser = async (months, requesterUserId, clientIp) => {
    const paymentId = await getCurrentPaymentIdForUser(requesterUserId);
    return await exports.getInstallmentQrByPaymentId(paymentId, months, requesterUserId, clientIp);
};

exports.selectCodByPaymentId = async (paymentId, requesterUserId) => {
    const payment = await getPaymentRow(paymentId, requesterUserId);
    ensurePaymentMethod(payment, "COD");

    const currentStatus = normalizeStatus(payment.payment_status);
    if (currentStatus === "đã thanh toán" || currentStatus === "paid") {
        throw new Error("Payment already completed");
    }

    await PaymentModel.updateOrderPaymentType(payment.order_id, "One-time");
    await PaymentModel.updatePaymentSelection(
        paymentId,
        roundMoney(payment.order_total_amount),
        "COD",
        "Pending"
    );
    await PaymentModel.updateOrderStatus(payment.order_id, "Chờ giao hàng");

    return {
        payment_id: paymentId,
        payment_method: "COD",
        total_amount: roundMoney(payment.order_total_amount),
        order_status: "Chờ giao hàng",
        note: "Thanh toán khi nhận hàng"
    };
};

exports.selectCodForCurrentUser = async (requesterUserId) => {
    const paymentId = await getCurrentPaymentIdForUser(requesterUserId);
    return await exports.selectCodByPaymentId(paymentId, requesterUserId);
};

exports.confirmPaymentSuccess = async (paymentId, confirmationMessage, requesterUserId) => {
    if (String(process.env.ALLOW_MANUAL_PAYMENT_CONFIRM || "false").toLowerCase() !== "true") {
        throw new Error("Manual confirm is disabled. Use VNPay IPN flow");
    }

    const normalizedConfirmation = String(confirmationMessage || "").trim();
    if (
        normalizedConfirmation &&
        normalizedConfirmation !== "Đã thanh toán thành công" &&
        normalizedConfirmation.toUpperCase() !== "CONFIRMED"
    ) {
        throw new Error("confirmation_message must be 'Đã thanh toán thành công' or 'CONFIRMED'");
    }

    const payment = await getPaymentRow(paymentId, requesterUserId);
    const method = normalizeMethod(payment.payment_method);

    if (!method) {
        throw new Error("Payment method is not selected yet");
    }

    return await markSuccessfulPaymentForOrder({
        payment,
        installmentMode: method === "QR_INSTALLMENT",
        paymentSource: "Manual"
    });
};

exports.confirmPaymentSuccessForCurrentUser = async (confirmationMessage, requesterUserId) => {
    const paymentId = await getCurrentPaymentIdForUser(requesterUserId);
    return await exports.confirmPaymentSuccess(paymentId, confirmationMessage, requesterUserId);
};

exports.handleVnpayIpn = async (query) => {
    if (!verifyVnpaySignature(query)) {
        return { RspCode: "97", Message: "Invalid signature" };
    }

    const { tmnCode } = getVnpayConfig();
    if (String(query.vnp_TmnCode || "") !== String(tmnCode)) {
        return { RspCode: "97", Message: "Invalid TmnCode" };
    }

    const { paymentId, installmentNumber } = parseTxnRef(query.vnp_TxnRef);
    if (!Number.isInteger(paymentId) || paymentId <= 0) {
        return { RspCode: "01", Message: "Order not found" };
    }

    let payment;
    try {
        payment = await getPaymentRow(paymentId);
    } catch (error) {
        return { RspCode: "01", Message: "Order not found" };
    }

    const vnpResponseCode = String(query.vnp_ResponseCode || "");
    const vnpTransactionStatus = String(query.vnp_TransactionStatus || "");
    const isSuccess = vnpResponseCode === "00" && vnpTransactionStatus === "00";

    if (!isSuccess) {
        return { RspCode: "00", Message: "Transaction failed recorded" };
    }

    try {
        const method = normalizeMethod(payment.payment_method);
        const receivedAmount = roundMoney(Number(query.vnp_Amount || 0) / 100);

        let expectedAmount = null;
        if (method !== "QR_INSTALLMENT") {
            expectedAmount = roundMoney(payment.payment_total_amount || payment.order_total_amount);
        } else {
            const nextInstallmentResult = await PaymentModel.getNextUnpaidInstallmentByOrderId(payment.order_id);
            const nextInstallment = nextInstallmentResult.recordset[0];
            if (!nextInstallment) {
                return { RspCode: "02", Message: "Installment already confirmed" };
            }
            expectedAmount = roundMoney(nextInstallment.amount_to_pay);
        }

        if (roundMoney(expectedAmount) !== receivedAmount) {
            return { RspCode: "04", Message: "Invalid amount" };
        }

        const updateResult = await markSuccessfulPaymentForOrder({
            payment,
            installmentMode: method === "QR_INSTALLMENT",
            installmentNumber,
            paymentSource: "VNPAY"
        });

        if (updateResult.already_confirmed) {
            return { RspCode: "02", Message: "Order already confirmed" };
        }

        return { RspCode: "00", Message: "Confirm Success" };
    } catch (error) {
        console.error("VNPAY IPN processing error:", error);
        if (String(error.message || "").startsWith("Insufficient stock")) {
            return { RspCode: "99", Message: "Stock update failed" };
        }
        return { RspCode: "99", Message: "Unknown error" };
    }
};

exports.handleVnpayReturn = async (query) => {
    const isValidSignature = verifyVnpaySignature(query);

    return {
        valid_signature: isValidSignature,
        response_code: String(query.vnp_ResponseCode || ""),
        transaction_status: String(query.vnp_TransactionStatus || ""),
        txn_ref: String(query.vnp_TxnRef || ""),
        message: isValidSignature
            ? (String(query.vnp_ResponseCode || "") === "00" ? "Thanh toán thành công" : "Thanh toán chưa thành công")
            : "Chữ ký không hợp lệ"
    };
};

exports.getPendingAdminCompletionPayments = async () => {
    const result = await PaymentModel.getPaymentsPendingAdminCompletion();
    return result.recordset || [];
};

exports.adminCompleteOrderByPaymentId = async (paymentId) => {
    const payment = await getPaymentRow(paymentId);
    if (normalizeStatus(payment.order_status) === "hoàn thành") {
        throw new Error("Order already completed");
    }

    if (normalizeStatus(payment.order_status) !== "chờ admin hoàn tất") {
        throw new Error("Order is not ready for admin completion");
    }

    await PaymentModel.updateOrderStatus(payment.order_id, "Hoàn Thành");

    return {
        payment_id: Number(payment.payment_id),
        order_id: Number(payment.order_id),
        order_status: "Hoàn Thành"
    };
};

exports.getOnlineQrByPaymentIdLegacy = exports.getOnlineQrByPaymentId;
exports.getInstallmentQrByPaymentIdLegacy = exports.getInstallmentQrByPaymentId;
