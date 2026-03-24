const PaymentModel = require("../models/paymentModel");

const INSTALLMENT_INTEREST_BY_MONTH = {
    3: 0,
    6: 0.012,
    9: 0.014,
    12: 0.016
};
const INSTALLMENT_MONTH_OPTIONS = [3, 6, 9, 12];

const VIETQR_DEFAULT_AMOUNT = 10000;
const ORDER_STATUS_PENDING_PAYMENT = "Chờ thanh toán";
const ORDER_STATUS_WAITING_APPROVAL = "Chờ duyệt";
const ORDER_STATUS_INSTALLMENT = "Đang trả góp";
const ORDER_STATUS_WAITING_RECEIVE = "Chờ nhận hàng";
const ORDER_STATUS_COMPLETED = "Hoàn Thành";
const ORDER_STATUS_PROCESSING = "Đang xử lý";
const PAYMENT_STATUS_PENDING_PAYMENT = "Chờ thanh toán";
const PAYMENT_STATUS_WAITING_APPROVAL = "Chờ duyệt";
const PAYMENT_STATUS_INSTALLMENT = "Đang trả góp";
const PAYMENT_STATUS_WAITING_RECEIVE = "Chờ nhận hàng";

const roundMoney = (value) => parseFloat(Number(value || 0).toFixed(2));
const normalizeMethod = (method) => String(method || "").trim().toUpperCase();
const normalizeStatus = (status) => String(status || "").trim().toLowerCase();
const isWaitingApprovalStatus = (status) => {
    const normalized = normalizeStatus(status);
    return normalized === normalizeStatus(ORDER_STATUS_WAITING_APPROVAL) || normalized === "chờ admin/manager duyệt";
};

const isAdminCompletableStatus = (status) => {
    const normalized = normalizeStatus(status);
    return normalized === normalizeStatus(ORDER_STATUS_WAITING_APPROVAL)
        || normalized === normalizeStatus(ORDER_STATUS_INSTALLMENT)
        || normalized === normalizeStatus(ORDER_STATUS_WAITING_RECEIVE)
        || normalized === "chờ admin/manager duyệt";
};

const getTrimmedEnv = (...keys) => {
    for (const key of keys) {
        if (process.env[key] !== undefined) {
            return String(process.env[key]).trim();
        }
    }
    return "";
};

const getVietQrConfig = () => ({
    accountNo: getTrimmedEnv("VIETQR_ACCOUNT_NO"),
    accountName: getTrimmedEnv("VIETQR_ACCOUNT_NAME"),
    acqId: getTrimmedEnv("VIETQR_ACQ_ID"),
    template: getTrimmedEnv("VIETQR_TEMPLATE") || "compact",
    templateId: getTrimmedEnv("VIETQR_TEMPLATE_ID"),
    quickLink: getTrimmedEnv("VIETQR_QUICK_LINK")
});

const isFirstPaidTransition = (paymentStatus) => {
    const status = normalizeStatus(paymentStatus);
    return status === ""
        || status === "pending"
        || status === normalizeStatus(PAYMENT_STATUS_PENDING_PAYMENT)
        || status === normalizeStatus(PAYMENT_STATUS_WAITING_APPROVAL)
        || status === normalizeStatus(PAYMENT_STATUS_INSTALLMENT)
        || status === normalizeStatus(PAYMENT_STATUS_WAITING_RECEIVE)
        || isWaitingApprovalStatus(status);
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

const getPaymentRowByOrderId = async (orderId, requesterUserId) => {
    const result = await PaymentModel.getOrderAndPaymentByOrderId(orderId);
    const row = result.recordset[0];
    if (!row) {
        throw new Error("Order not found");
    }
    if (requesterUserId && Number(row.user_id) !== Number(requesterUserId)) {
        throw new Error("Forbidden order access");
    }
    return row;
};

const ensurePaymentMethod = (payment, expectedMethod) => {
    const currentMethod = normalizeMethod(payment.payment_method);
    if (currentMethod !== expectedMethod) {
        throw new Error(
            `Payment method mismatch. Expected ${expectedMethod}, got ${currentMethod || "N/A"}`
        );
    }
};

const buildVietQrQuickLink = () => {
    const { accountNo, accountName, acqId, template, templateId, quickLink } = getVietQrConfig();
    const amount = VIETQR_DEFAULT_AMOUNT;

    if (quickLink) {
        return {
            provider: "VIETQR",
            payment_url: quickLink
        };
    }

    const templateSegment = templateId || template;
    if (!acqId || !accountNo || !templateSegment || !accountName) {
        throw new Error("VietQR config missing (VIETQR_ACQ_ID, VIETQR_ACCOUNT_NO, VIETQR_TEMPLATE or VIETQR_TEMPLATE_ID, VIETQR_ACCOUNT_NAME)");
    }

    const paymentUrl = `https://api.vietqr.io/image/${acqId}-${accountNo}-${templateSegment}.jpg?accountName=${encodeURIComponent(accountName)}&amount=${amount}`;

    return {
        provider: "VIETQR",
        payment_url: paymentUrl
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
        PAYMENT_STATUS_PENDING_PAYMENT
    );
    await PaymentModel.updateOrderStatus(payment.order_id, ORDER_STATUS_PENDING_PAYMENT);

    const vietQr = buildVietQrQuickLink();

    return {
        payment_id: paymentId,
        payment_method: "QR_FULL",
        total_amount: roundMoney(payment.order_total_amount),
        ...vietQr
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
        PAYMENT_STATUS_INSTALLMENT
    );
    await PaymentModel.updateOrderStatus(payment.order_id, ORDER_STATUS_INSTALLMENT);

    const nextInstallmentResult = await PaymentModel.getNextUnpaidInstallmentByOrderId(payment.order_id);
    const nextInstallment = nextInstallmentResult.recordset[0];
    if (!nextInstallment) {
        throw new Error("No unpaid installment found");
    }

    const amount = roundMoney(nextInstallment.amount_to_pay);
    const vietQr = buildVietQrQuickLink();

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
        ...vietQr
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
        PAYMENT_STATUS_WAITING_RECEIVE
    );
    await PaymentModel.updateOrderStatus(payment.order_id, ORDER_STATUS_WAITING_RECEIVE);

    return {
        payment_id: paymentId,
        payment_method: "COD",
        total_amount: roundMoney(payment.order_total_amount),
        payment_status: PAYMENT_STATUS_WAITING_RECEIVE,
        order_status: ORDER_STATUS_WAITING_RECEIVE,
        note: "Thanh toán khi nhận hàng"
    };
};

exports.selectCodForCurrentUser = async (requesterUserId) => {
    const paymentId = await getCurrentPaymentIdForUser(requesterUserId);
    return await exports.selectCodByPaymentId(paymentId, requesterUserId);
};


exports.confirmPaymentSuccess = async (paymentId, confirmationMessage, requesterUserId) => {
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

    if (normalizeStatus(payment.order_status) === normalizeStatus(ORDER_STATUS_COMPLETED)) {
        throw new Error("Order already completed");
    }

    let nextPaymentStatus = PAYMENT_STATUS_WAITING_APPROVAL;
    let nextOrderStatus = ORDER_STATUS_WAITING_APPROVAL;

    if (method === "QR_INSTALLMENT") {
        nextPaymentStatus = PAYMENT_STATUS_INSTALLMENT;
        nextOrderStatus = ORDER_STATUS_INSTALLMENT;
    } else if (method === "COD") {
        nextPaymentStatus = PAYMENT_STATUS_WAITING_RECEIVE;
        nextOrderStatus = ORDER_STATUS_WAITING_RECEIVE;
    }

    await PaymentModel.updatePaymentStatus(payment.payment_id, nextPaymentStatus);
    await PaymentModel.updateOrderStatus(payment.order_id, nextOrderStatus);

    return {
        payment_id: Number(payment.payment_id),
        order_id: Number(payment.order_id),
        payment_method: method,
        payment_status: nextPaymentStatus,
        order_status: nextOrderStatus,
        approval_for_roles: ["admin", "manager"],
        message: "Đã ghi nhận xác nhận từ user. Admin/Manager có thể kiểm tra và hoàn tất đơn."
    };
};

exports.confirmPaymentSuccessForCurrentUser = async (confirmationMessage, requesterUserId) => {
    const paymentId = await getCurrentPaymentIdForUser(requesterUserId);
    return await exports.confirmPaymentSuccess(paymentId, confirmationMessage, requesterUserId);
};

exports.getPendingAdminCompletionPayments = async () => {
    const result = await PaymentModel.getPaymentsPendingAdminCompletion();
    return result.recordset || [];
};

exports.adminCompleteOrderByOrderId = async (orderId) => {
    const payment = await getPaymentRowByOrderId(orderId);
    if (normalizeStatus(payment.order_status) === normalizeStatus(ORDER_STATUS_COMPLETED)) {
        throw new Error("Order already completed");
    }

    if (!isAdminCompletableStatus(payment.order_status)) {
        throw new Error("Order is not ready for admin/manager completion");
    }

    if (isFirstPaidTransition(payment.payment_status)) {
        await PaymentModel.deductProductStockByOrderId(payment.order_id);
    }

    await PaymentModel.updatePaymentStatus(payment.payment_id, "Đã thanh toán");
    await PaymentModel.updateOrderStatus(payment.order_id, ORDER_STATUS_PROCESSING);

    return {
        payment_id: Number(payment.payment_id),
        order_id: Number(payment.order_id),
        payment_status: "Đã thanh toán",
        order_status: ORDER_STATUS_PROCESSING
    };
};

exports.getOnlineQrByPaymentIdLegacy = exports.getOnlineQrByPaymentId;
exports.getInstallmentQrByPaymentIdLegacy = exports.getInstallmentQrByPaymentId;
