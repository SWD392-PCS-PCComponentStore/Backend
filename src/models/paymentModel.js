const { sql, pool } = require("../config/db");

class PaymentModel {
    static async getCurrentPaymentByUserId(userId) {
        const conn = await pool;
        return await conn.request()
            .input("user_id", sql.Int, userId)
            .query(`
                SELECT TOP 1
                    p.payment_id,
                    p.order_id,
                    p.payment_status,
                    p.total_amount,
                    p.payment_method,
                    o.order_date,
                    o.status AS order_status
                FROM dbo.Payment p
                JOIN dbo.[ORDER] o ON o.order_id = p.order_id
                WHERE o.user_id = @user_id
                  AND o.status <> N'Hoàn Thành'
                ORDER BY p.payment_id DESC
            `);
    }

    static async getPaymentAndOrderByPaymentId(paymentId) {
        const conn = await pool;
        return await conn.request()
            .input("payment_id", sql.Int, paymentId)
            .query(`
                SELECT TOP 1
                    p.payment_id,
                    p.order_id,
                    p.payment_status,
                    p.total_amount AS payment_total_amount,
                    p.payment_method,
                    o.user_id,
                    o.status AS order_status,
                    o.total_amount AS order_total_amount,
                    o.shipping_address,
                    o.payment_type
                FROM dbo.Payment p
                JOIN dbo.[ORDER] o ON o.order_id = p.order_id
                WHERE p.payment_id = @payment_id
            `);
    }

    static async getOrderAndPaymentByOrderId(orderId) {
        const conn = await pool;
        return await conn.request()
            .input("order_id", sql.Int, orderId)
            .query(`
                SELECT TOP 1
                    o.order_id,
                    o.user_id,
                    o.status AS order_status,
                    o.total_amount AS order_total_amount,
                    o.shipping_address,
                    o.payment_type,
                    p.payment_id,
                    p.payment_status,
                    p.total_amount AS payment_total_amount,
                    p.payment_method
                FROM dbo.[ORDER] o
                LEFT JOIN dbo.Payment p ON p.order_id = o.order_id
                WHERE o.order_id = @order_id
                ORDER BY p.payment_id DESC
            `);
    }

    static async getPaymentById(paymentId) {
        const conn = await pool;
        return await conn.request()
            .input("payment_id", sql.Int, paymentId)
            .query(`
                SELECT TOP 1 *
                FROM dbo.Payment
                WHERE payment_id = @payment_id
            `);
    }

    static async updatePaymentStatus(paymentId, paymentStatus) {
        const conn = await pool;
        return await conn.request()
            .input("payment_id", sql.Int, paymentId)
            .input("payment_status", sql.NVarChar(50), paymentStatus)
            .query(`
                UPDATE dbo.Payment
                SET payment_status = @payment_status,
                    payment_date = GETDATE()
                WHERE payment_id = @payment_id;

                SELECT TOP 1 *
                FROM dbo.Payment
                WHERE payment_id = @payment_id;
            `);
    }

    static async updatePaymentSelection(paymentId, totalAmount, paymentMethod, paymentStatus) {
        const conn = await pool;
        return await conn.request()
            .input("payment_id", sql.Int, paymentId)
            .input("total_amount", sql.Decimal(18, 2), totalAmount)
            .input("payment_method", sql.NVarChar(50), paymentMethod)
            .input("payment_status", sql.NVarChar(50), paymentStatus)
            .query(`
                UPDATE dbo.Payment
                SET total_amount = @total_amount,
                    payment_method = @payment_method,
                    payment_status = @payment_status
                WHERE payment_id = @payment_id;

                SELECT TOP 1 *
                FROM dbo.Payment
                WHERE payment_id = @payment_id;
            `);
    }

    static async getNextUnpaidInstallmentByOrderId(orderId) {
        const conn = await pool;
        return await conn.request()
            .input("order_id", sql.Int, orderId)
            .query(`
                SELECT TOP 1
                    d.installment_detail_id,
                    d.installment_number,
                    d.amount_to_pay,
                    d.status,
                    p.total_months,
                    p.plan_id
                FROM dbo.INSTALLMENT_DETAILS d
                JOIN dbo.INSTALLMENT_PLANS p ON p.plan_id = d.plan_id
                WHERE p.order_id = @order_id
                  AND d.status = N'Unpaid'
                ORDER BY d.installment_number ASC
            `);
    }

    static async getOrderById(orderId) {
        const conn = await pool;
        return await conn.request()
            .input("order_id", sql.Int, orderId)
            .query(`
                SELECT TOP 1
                    order_id,
                    user_id,
                    status,
                    total_amount,
                    shipping_address,
                    payment_type
                FROM dbo.[ORDER]
                WHERE order_id = @order_id
            `);
    }

    static async updateOrderShippingAddress(orderId, shippingAddress) {
        const conn = await pool;
        return await conn.request()
            .input("order_id", sql.Int, orderId)
            .input("shipping_address", sql.NVarChar(sql.MAX), shippingAddress)
            .query(`
                UPDATE dbo.[ORDER]
                SET shipping_address = @shipping_address
                WHERE order_id = @order_id
            `);
    }

    static async updateOrderPaymentType(orderId, paymentType) {
        const conn = await pool;
        return await conn.request()
            .input("order_id", sql.Int, orderId)
            .input("payment_type", sql.VarChar(50), paymentType)
            .query(`
                UPDATE dbo.[ORDER]
                SET payment_type = @payment_type
                WHERE order_id = @order_id
            `);
    }

    static async updateOrderStatus(orderId, status) {
        const conn = await pool;
        return await conn.request()
            .input("order_id", sql.Int, orderId)
            .input("status", sql.NVarChar(50), status)
            .query(`
                UPDATE dbo.[ORDER]
                SET status = @status
                WHERE order_id = @order_id
            `);
    }

    static async getPaymentByOrderId(orderId) {
        const conn = await pool;
        return await conn.request()
            .input("order_id", sql.Int, orderId)
            .query(`
                SELECT TOP 1 *
                FROM dbo.Payment
                WHERE order_id = @order_id
                ORDER BY payment_id DESC
            `);
    }

    static async upsertPayment(orderId, paymentStatus, totalAmount, paymentMethod) {
        const conn = await pool;
        const existing = await PaymentModel.getPaymentByOrderId(orderId);
        const current = existing.recordset[0];

        if (current) {
            return await conn.request()
                .input("payment_id", sql.Int, current.payment_id)
                .input("payment_status", sql.NVarChar(50), paymentStatus)
                .input("total_amount", sql.Decimal(18, 2), totalAmount)
                .input("payment_method", sql.NVarChar(50), paymentMethod)
                .query(`
                    UPDATE dbo.Payment
                    SET payment_date = GETDATE(),
                        payment_status = @payment_status,
                        total_amount = @total_amount,
                        payment_method = @payment_method
                    WHERE payment_id = @payment_id;

                    SELECT TOP 1 *
                    FROM dbo.Payment
                    WHERE payment_id = @payment_id;
                `);
        }

        return await conn.request()
            .input("order_id", sql.Int, orderId)
            .input("payment_status", sql.NVarChar(50), paymentStatus)
            .input("total_amount", sql.Decimal(18, 2), totalAmount)
            .input("payment_method", sql.NVarChar(50), paymentMethod)
            .query(`
                INSERT INTO dbo.Payment (order_id, payment_status, total_amount, payment_method)
                OUTPUT INSERTED.*
                VALUES (@order_id, @payment_status, @total_amount, @payment_method)
            `);
    }

    static async getInstallmentPlanByOrderId(orderId) {
        const conn = await pool;
        return await conn.request()
            .input("order_id", sql.Int, orderId)
            .query(`
                SELECT TOP 1 *
                FROM dbo.INSTALLMENT_PLANS
                WHERE order_id = @order_id
                ORDER BY plan_id DESC
            `);
    }

    static async getInstallmentPlanById(planId) {
        const conn = await pool;
        return await conn.request()
            .input("plan_id", sql.Int, planId)
            .query(`
                SELECT TOP 1 *
                FROM dbo.INSTALLMENT_PLANS
                WHERE plan_id = @plan_id
            `);
    }

    static async createInstallmentPlan(orderId, totalAmount, totalMonths, monthlyAmount, interestRatePercent) {
        const conn = await pool;
        return await conn.request()
            .input("order_id", sql.Int, orderId)
            .input("total_amount", sql.Decimal(18, 2), totalAmount)
            .input("down_payment", sql.Decimal(18, 2), 0)
            .input("total_months", sql.Int, totalMonths)
            .input("monthly_amount", sql.Decimal(18, 2), monthlyAmount)
            .input("interest_rate", sql.Decimal(5, 2), interestRatePercent)
            .input("status", sql.NVarChar(50), "Active")
            .query(`
                INSERT INTO dbo.INSTALLMENT_PLANS
                    (order_id, total_amount, down_payment, total_months, monthly_amount, interest_rate, status)
                OUTPUT INSERTED.*
                VALUES (@order_id, @total_amount, @down_payment, @total_months, @monthly_amount, @interest_rate, @status)
            `);
    }

    static async createInstallmentDetail(planId, installmentNumber, dueDate, amountToPay) {
        const conn = await pool;
        return await conn.request()
            .input("plan_id", sql.Int, planId)
            .input("installment_number", sql.Int, installmentNumber)
            .input("due_date", sql.Date, dueDate)
            .input("amount_to_pay", sql.Decimal(18, 2), amountToPay)
            .input("status", sql.NVarChar(50), "Unpaid")
            .query(`
                INSERT INTO dbo.INSTALLMENT_DETAILS
                    (plan_id, installment_number, due_date, amount_to_pay, status)
                OUTPUT INSERTED.*
                VALUES (@plan_id, @installment_number, @due_date, @amount_to_pay, @status)
            `);
    }

    static async getInstallmentDetailById(installmentDetailId) {
        const conn = await pool;
        return await conn.request()
            .input("installment_detail_id", sql.Int, installmentDetailId)
            .query(`
                SELECT TOP 1
                    d.*,
                    p.order_id,
                    p.total_months,
                    p.total_amount AS plan_total_amount
                FROM dbo.INSTALLMENT_DETAILS d
                JOIN dbo.INSTALLMENT_PLANS p ON d.plan_id = p.plan_id
                WHERE d.installment_detail_id = @installment_detail_id
            `);
    }

    static async markInstallmentPaid(installmentDetailId, paymentMethod) {
        const conn = await pool;
        return await conn.request()
            .input("installment_detail_id", sql.Int, installmentDetailId)
            .input("payment_method", sql.NVarChar(100), paymentMethod)
            .input("status", sql.NVarChar(50), "Paid")
            .query(`
                UPDATE dbo.INSTALLMENT_DETAILS
                SET paid_date = GETDATE(),
                    status = @status,
                    payment_method = @payment_method
                WHERE installment_detail_id = @installment_detail_id;

                SELECT TOP 1 *
                FROM dbo.INSTALLMENT_DETAILS
                WHERE installment_detail_id = @installment_detail_id;
            `);
    }

    static async countUnpaidInstallments(planId) {
        const conn = await pool;
        return await conn.request()
            .input("plan_id", sql.Int, planId)
            .query(`
                SELECT COUNT(1) AS unpaid_count
                FROM dbo.INSTALLMENT_DETAILS
                WHERE plan_id = @plan_id
                  AND status <> N'Paid'
            `);
    }

    static async updateInstallmentPlanStatus(planId, status) {
        const conn = await pool;
        return await conn.request()
            .input("plan_id", sql.Int, planId)
            .input("status", sql.NVarChar(50), status)
            .query(`
                UPDATE dbo.INSTALLMENT_PLANS
                SET status = @status
                WHERE plan_id = @plan_id
            `);
    }

    static async deductProductStockByOrderId(orderId) {
        const conn = await pool;
        const transaction = new sql.Transaction(conn);
        await transaction.begin();

        try {
            const itemsResult = await new sql.Request(transaction)
                .input("order_id", sql.Int, orderId)
                .query(`
                    SELECT
                        od.product_id,
                        SUM(od.quantity) AS total_quantity
                    FROM dbo.ORDER_DETAIL od
                    WHERE od.order_id = @order_id
                      AND od.product_id IS NOT NULL
                    GROUP BY od.product_id
                `);

            for (const item of itemsResult.recordset) {
                const requestedQuantity = Number(item.total_quantity || 0);
                if (!item.product_id || requestedQuantity <= 0) {
                    continue;
                }

                const stockResult = await new sql.Request(transaction)
                    .input("product_id", sql.Int, item.product_id)
                    .query(`
                        SELECT TOP 1 stock_quantity
                        FROM dbo.PRODUCT
                        WHERE product_id = @product_id
                    `);

                const currentStock = Number(stockResult.recordset[0]?.stock_quantity || 0);
                if (currentStock < requestedQuantity) {
                    throw new Error(`Insufficient stock for product_id=${item.product_id}. Available: ${currentStock}`);
                }

                await new sql.Request(transaction)
                    .input("product_id", sql.Int, item.product_id)
                    .input("deduct_qty", sql.Int, requestedQuantity)
                    .query(`
                        UPDATE dbo.PRODUCT
                        SET stock_quantity = stock_quantity - @deduct_qty
                        WHERE product_id = @product_id
                    `);
            }

            await transaction.commit();
            return { success: true };
        } catch (error) {
            if (transaction._aborted !== true) {
                await transaction.rollback();
            }
            throw error;
        }
    }

    static async getPaymentsPendingAdminCompletion() {
        const conn = await pool;
        return await conn.request()
            .query(`
                SELECT
                    p.payment_id,
                    p.order_id,
                    p.payment_status,
                    p.total_amount,
                    p.payment_method,
                    p.payment_date,
                    o.user_id,
                    o.status AS order_status,
                    o.shipping_address,
                    o.total_amount AS order_total_amount,
                    u.name AS user_name,
                    u.email AS user_email,
                    u.phone AS user_phone
                FROM dbo.Payment p
                JOIN dbo.[ORDER] o ON o.order_id = p.order_id
                JOIN dbo.USERS u ON u.user_id = o.user_id
                        WHERE o.status IN (N'Chờ duyệt', N'Chờ admin/manager duyệt', N'Đang trả góp', N'Chờ nhận hàng')
                ORDER BY p.payment_date DESC, p.payment_id DESC
            `);
    }
}

module.exports = PaymentModel;