const PaymentModel = require("../models/paymentModel");

const INSTALLMENT_INTEREST_BY_MONTH = {
    3: 0,
    5: 0.012,
    9: 0.014,
    12: 0.016
};

const roundMoney = (value) => parseFloat(Number(value || 0).toFixed(2));

const getBankInfo = () => ({
    bank_name: process.env.VIETQR_BANK_NAME || "VietQR Bank",
    account_no: process.env.VIETQR_ACCOUNT_NO || "113366668888"
});

const buildVietQrQuickLink = ({ amount, addInfo }) => {
    const configuredQuickLink = process.env.VIETQR_QUICK_LINK;
    if (configuredQuickLink) {
        const configuredUrl = new URL(configuredQuickLink);
        configuredUrl.searchParams.set("amount", String(Math.round(Number(amount || 0))));
        if (addInfo) {
            configuredUrl.searchParams.set("addInfo", addInfo);
        }
        return configuredUrl.toString();
    }

    const acqId = process.env.VIETQR_ACQ_ID || "970415";
    const accountNo = process.env.VIETQR_ACCOUNT_NO || "113366668888";
    const templateId = process.env.VIETQR_TEMPLATE_ID || "kXcqiTq";

    const url = new URL(`https://api.vietqr.io/image/${acqId}-${accountNo}-${templateId}.jpg`);
    url.searchParams.set("amount", String(Math.round(Number(amount || 0))));
    if (addInfo) {
        url.searchParams.set("addInfo", addInfo);
    }

    return url.toString();
};

const tryGenerateVietQr = async ({ amount, addInfo }) => {
    const clientId = process.env.VIETQR_CLIENT_ID;
    const apiKey = process.env.VIETQR_API_KEY;

    if (!clientId || !apiKey) {
        return null;
    }

    const payload = {
        accountNo: process.env.VIETQR_ACCOUNT_NO || "113366668888",
        accountName: process.env.VIETQR_ACCOUNT_NAME || "WED BAN HANG PC COMPONENT STORE",
        acqId: process.env.VIETQR_ACQ_ID || "970415",
        addInfo,
        amount: String(Math.round(Number(amount || 0))),
        template: process.env.VIETQR_TEMPLATE || "compact"
    };

    const response = await fetch("https://api.vietqr.io/v2/generate", {
        method: "POST",
        headers: {
            "x-client-id": clientId,
            "x-api-key": apiKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok || String(data.code) !== "00") {
        throw new Error(data.desc || "VietQR generate failed");
    }

    return {
        requestPayload: payload,
        vietqrResponse: data
    };
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

const ensureInstallmentPlan = async (orderId, principalAmount, months) => {
    const existingPlanResult = await PaymentModel.getInstallmentPlanByOrderId(orderId);
    const existingPlan = existingPlanResult.recordset[0];
    if (existingPlan) {
        return existingPlan;
    }

    const totalMonths = Number(months);
    const monthlyRate = INSTALLMENT_INTEREST_BY_MONTH[totalMonths];
    if (monthlyRate === undefined) {
        throw new Error("months must be one of 3, 5, 9, 12 for QR_INSTALLMENT");
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

exports.getOnlineQrByPaymentId = async (paymentId, requesterUserId) => {
    const payment = await getPaymentRow(paymentId, requesterUserId);
    if (String(payment.payment_status || "").toLowerCase() === "đã thanh toán" || String(payment.payment_status || "").toLowerCase() === "paid") {
        throw new Error("Payment already completed");
    }

    await PaymentModel.updateOrderPaymentType(payment.order_id, "One-time");
    const updatedPaymentResult = await PaymentModel.updatePaymentSelection(
        paymentId,
        roundMoney(payment.order_total_amount),
        "QR_FULL",
        "Pending"
    );

    const amount = roundMoney(payment.order_total_amount);
    const content = `ORDER${payment.order_id}`;
    const quickLink = buildVietQrQuickLink({ amount, addInfo: content });
    const vietqr = await tryGenerateVietQr({ amount, addInfo: content });

    return {
        payment_id: paymentId,
        bank_info: getBankInfo(),
        total_amount: amount,
        qr_url: quickLink
    };
};

exports.getOnlineQrForCurrentUser = async (requesterUserId) => {
    const paymentId = await getCurrentPaymentIdForUser(requesterUserId);
    return await exports.getOnlineQrByPaymentId(paymentId, requesterUserId);
};

exports.getInstallmentQrByPaymentId = async (paymentId, months, requesterUserId) => {
    const payment = await getPaymentRow(paymentId, requesterUserId);

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
    const content = `ORDER${payment.order_id}-I${nextInstallment.installment_number}`;
    const quickLink = buildVietQrQuickLink({ amount, addInfo: content });
    await tryGenerateVietQr({ amount, addInfo: content });

    const principalAmount = roundMoney(payment.order_total_amount);
    const totalInstallmentAmount = roundMoney(plan.total_amount);
    const monthsValue = Number(plan.total_months);
    const monthlyInterestRate = roundMoney(Number(plan.interest_rate || 0));
    const monthlyInterestAmount = roundMoney(
        principalAmount * (monthlyInterestRate / 100)
    );

    return {
        payment_id: paymentId,
        bank_info: getBankInfo(),
        months: monthsValue,
        total_amount: totalInstallmentAmount,
        monthly_interest_amount: monthlyInterestAmount,
        monthly_interest_rate_percent: monthlyInterestRate,
        qr_url: quickLink
    };
};

exports.getInstallmentQrForCurrentUser = async (months, requesterUserId) => {
    const paymentId = await getCurrentPaymentIdForUser(requesterUserId);
    return await exports.getInstallmentQrByPaymentId(paymentId, months, requesterUserId);
};

exports.confirmPaymentSuccess = async (paymentId, confirmationMessage, requesterUserId) => {
    if (String(confirmationMessage || "").trim() !== "Đã thanh toán thành công") {
        throw new Error("confirmation_message must be 'Đã thanh toán thành công'");
    }

    const payment = await getPaymentRow(paymentId, requesterUserId);
    const method = String(payment.payment_method || "").toUpperCase();

    if (!method) {
        throw new Error("Payment method is not selected yet");
    }

    if (method === "QR_INSTALLMENT") {
        const nextInstallmentResult = await PaymentModel.getNextUnpaidInstallmentByOrderId(payment.order_id);
        const nextInstallment = nextInstallmentResult.recordset[0];
        if (!nextInstallment) {
            throw new Error("No unpaid installment found");
        }

        const updatedInstallmentResult = await PaymentModel.markInstallmentPaid(
            nextInstallment.installment_detail_id,
            "VietQR Installment"
        );

        const unpaidResult = await PaymentModel.countUnpaidInstallments(nextInstallment.plan_id);
        const unpaidCount = Number(unpaidResult.recordset[0]?.unpaid_count || 0);

        let paymentStatus = "Đã thanh toán 1 phần";
        let orderStatus = "Pending";

        if (unpaidCount === 0) {
            paymentStatus = "Đã thanh toán";
            orderStatus = "Hoàn Thành";
            await PaymentModel.updateInstallmentPlanStatus(nextInstallment.plan_id, "Completed");
        }

        await PaymentModel.updatePaymentStatus(paymentId, paymentStatus);
        await PaymentModel.updateOrderStatus(payment.order_id, orderStatus);

        return {
            payment_status: paymentStatus,
            order_status: orderStatus,
            unpaid_installments: unpaidCount
        };
    }

    await PaymentModel.updatePaymentStatus(paymentId, "Đã thanh toán");
    await PaymentModel.updateOrderStatus(payment.order_id, "Hoàn Thành");

    return {
        payment_status: "Đã thanh toán",
        order_status: "Hoàn Thành"
    };
};

exports.confirmPaymentSuccessForCurrentUser = async (confirmationMessage, requesterUserId) => {
    const paymentId = await getCurrentPaymentIdForUser(requesterUserId);
    return await exports.confirmPaymentSuccess(paymentId, confirmationMessage, requesterUserId);
};

