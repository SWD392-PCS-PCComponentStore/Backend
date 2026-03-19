const { sql, pool } = require('../config/db');

const roundMoney = (value) => parseFloat(Number(value || 0).toFixed(2));

const normalizePaymentMethod = (paymentMethod) => String(paymentMethod || '').trim().toUpperCase();

const resolveOrderPaymentType = (paymentMethod) => {
    if (paymentMethod === 'QR_INSTALLMENT') {
        return 'Installment';
    }
    return 'One-time';
};

class Order {
    static async getAll() {
        const conn = await pool;
        return await conn.request().query(`
            SELECT
                o.*,
                u.name AS user_name,
                u.email AS user_email,
                u.phone AS user_phone,
                p.code AS promotion_code,
                pay.payment_method
            FROM dbo.[ORDER] o
            LEFT JOIN dbo.USERS u ON u.user_id = o.user_id
            LEFT JOIN dbo.PROMOTION p ON p.promotion_id = o.promotion_id
            OUTER APPLY (
                SELECT TOP 1 pm.payment_method
                FROM dbo.Payment pm
                WHERE pm.order_id = o.order_id
                ORDER BY pm.payment_id DESC
            ) pay
            ORDER BY o.order_id DESC
        `);
    }

    static async getById(id) {
        const conn = await pool;
        return await conn.request()
            .input('order_id', sql.Int, id)
            .query(`
                SELECT
                    o.*,
                    u.name AS user_name,
                    u.email AS user_email,
                    u.phone AS user_phone,
                    p.code AS promotion_code,
                    pay.payment_method
                FROM dbo.[ORDER] o
                LEFT JOIN dbo.USERS u ON u.user_id = o.user_id
                LEFT JOIN dbo.PROMOTION p ON p.promotion_id = o.promotion_id
                OUTER APPLY (
                    SELECT TOP 1 pm.payment_method
                    FROM dbo.Payment pm
                    WHERE pm.order_id = o.order_id
                    ORDER BY pm.payment_id DESC
                ) pay
                WHERE o.order_id = @order_id
            `);
    }

    static async getByUserId(userId) {
        const conn = await pool;
        return await conn.request()
            .input('user_id', sql.Int, userId)
            .query(`
                SELECT
                    o.*,
                    u.name AS user_name,
                    u.email AS user_email,
                    u.phone AS user_phone,
                    p.code AS promotion_code,
                    pay.payment_method
                FROM dbo.[ORDER] o
                LEFT JOIN dbo.USERS u ON u.user_id = o.user_id
                LEFT JOIN dbo.PROMOTION p ON p.promotion_id = o.promotion_id
                OUTER APPLY (
                    SELECT TOP 1 pm.payment_method
                    FROM dbo.Payment pm
                    WHERE pm.order_id = o.order_id
                    ORDER BY pm.payment_id DESC
                ) pay
                WHERE o.user_id = @user_id
                ORDER BY o.order_id DESC
            `);
    }

    static async getItemsByOrderIds(orderIds) {
        if (!Array.isArray(orderIds) || orderIds.length === 0) {
            return { recordset: [] };
        }

        const conn = await pool;
        const request = conn.request();
        const uniqueOrderIds = Array.from(new Set(orderIds.map((id) => Number(id)).filter(Number.isInteger)));

        if (uniqueOrderIds.length === 0) {
            return { recordset: [] };
        }

        const orderIdParams = uniqueOrderIds.map((_, index) => `@order_id_${index}`);
        uniqueOrderIds.forEach((orderId, index) => {
            request.input(`order_id_${index}`, sql.Int, orderId);
        });

        return await request.query(`
            SELECT
                od.order_detail_id,
                od.order_id,
                od.product_id,
                od.user_build_id,
                od.quantity,
                od.price
            FROM dbo.ORDER_DETAIL od
            WHERE od.order_id IN (${orderIdParams.join(', ')})
            ORDER BY od.order_detail_id ASC
        `);
    }

    static async create(orderData) {
        const conn = await pool;
        const transaction = new sql.Transaction(conn);
        await transaction.begin();

        try {
            const uniqueCartItemIds = Array.from(new Set(orderData.cart_item_ids.map((id) => Number(id))));
            if (!uniqueCartItemIds.length) {
                throw new Error('No cart items selected');
            }

            const normalizedPaymentMethod = normalizePaymentMethod(orderData.payment_method);
            const allowedPaymentMethods = ['QR_FULL', 'QR_INSTALLMENT', 'COD'];
            if (!allowedPaymentMethods.includes(normalizedPaymentMethod)) {
                throw new Error('Unsupported payment_method. Allowed values: QR_FULL, QR_INSTALLMENT, COD');
            }

            const cartRequest = new sql.Request(transaction)
                .input('user_id', sql.Int, orderData.user_id);

            const cartItemParams = uniqueCartItemIds.map((_, index) => `@cart_item_id_${index}`);
            uniqueCartItemIds.forEach((cartItemId, index) => {
                cartRequest.input(`cart_item_id_${index}`, sql.Int, cartItemId);
            });

            const cartItemsResult = await cartRequest.query(`
                SELECT
                    ci.cart_item_id,
                    ci.product_id,
                    ci.user_build_id,
                    ci.quantity,
                    p.price AS product_price,
                    ub.total_price AS build_price
                FROM dbo.CART c
                JOIN dbo.CART_ITEM ci ON ci.cart_id = c.cart_id
                LEFT JOIN dbo.PRODUCT p ON ci.product_id = p.product_id
                LEFT JOIN dbo.UserBuilds ub ON ci.user_build_id = ub.user_build_id
                WHERE c.user_id = @user_id
                  AND ci.cart_item_id IN (${cartItemParams.join(', ')})
                ORDER BY ci.cart_item_id ASC
            `);

            const selectedItems = cartItemsResult.recordset;
            if (!selectedItems.length) {
                throw new Error('Selected cart items not found');
            }

            if (selectedItems.length !== uniqueCartItemIds.length) {
                throw new Error('Some selected cart items are invalid or do not belong to user');
            }

            const itemsWithPrice = selectedItems.map((item) => {
                const unitPrice = item.product_id ? Number(item.product_price) : Number(item.build_price);
                if (!Number.isFinite(unitPrice) || unitPrice < 0) {
                    throw new Error('Invalid cart item price');
                }

                return {
                    ...item,
                    unitPrice: roundMoney(unitPrice)
                };
            });

            const subtotal = roundMoney(
                itemsWithPrice.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
            );
            if (subtotal <= 0) {
                throw new Error('Cart total amount is invalid');
            }

            let promotionId = null;
            let promotionCode = null;
            let discountPercent = 0;

            if (orderData.promotion_code) {
                const promotionResult = await new sql.Request(transaction)
                    .input('code', sql.VarChar(50), String(orderData.promotion_code).trim())
                    .query(`
                        SELECT TOP 1 promotion_id, code, discount_percent
                        FROM dbo.PROMOTION
                        WHERE code = @code
                          AND (valid_from IS NULL OR valid_from <= GETDATE())
                          AND (valid_to IS NULL OR valid_to >= GETDATE())
                    `);

                const promotion = promotionResult.recordset[0];
                if (!promotion) {
                    throw new Error('Invalid promotion code or promotion has expired');
                }

                promotionId = promotion.promotion_id;
                promotionCode = promotion.code;
                discountPercent = Number(promotion.discount_percent || 0);
            }

            const discountAmount = roundMoney((subtotal * discountPercent) / 100);
            const totalAmount = roundMoney(Math.max(subtotal - discountAmount, 0));
            const paymentType = resolveOrderPaymentType(normalizedPaymentMethod);

            await new sql.Request(transaction)
                .input('user_id', sql.Int, orderData.user_id)
                .input('phone', sql.VarChar(20), orderData.phone)
                .query(`
                    UPDATE dbo.USERS
                    SET phone = @phone
                    WHERE user_id = @user_id
                `);

            const insertedOrder = await new sql.Request(transaction)
                .input('user_id', sql.Int, orderData.user_id)
                .input('promotion_id', sql.Int, promotionId)
                .input('status', sql.NVarChar(50), 'Pending')
                .input('total_amount', sql.Decimal(18, 2), totalAmount)
                .input('shipping_address', sql.NVarChar(sql.MAX), orderData.shipping_address)
                .input('payment_type', sql.VarChar(50), paymentType)
                .query(`
                    INSERT INTO dbo.[ORDER] (user_id, promotion_id, status, total_amount, shipping_address, payment_type)
                    OUTPUT INSERTED.order_id
                    VALUES (@user_id, @promotion_id, @status, @total_amount, @shipping_address, @payment_type)
                `);

            const orderId = insertedOrder.recordset[0].order_id;

            for (const item of itemsWithPrice) {
                await new sql.Request(transaction)
                    .input('order_id', sql.Int, orderId)
                    .input('product_id', sql.Int, item.product_id || null)
                    .input('user_build_id', sql.Int, item.user_build_id || null)
                    .input('quantity', sql.Int, item.quantity)
                    .input('price', sql.Decimal(18, 2), item.unitPrice)
                    .query(`
                        INSERT INTO dbo.ORDER_DETAIL (order_id, product_id, user_build_id, quantity, price)
                        VALUES (@order_id, @product_id, @user_build_id, @quantity, @price)
                    `);
            }

            const productQuantities = new Map();
            for (const item of itemsWithPrice) {
                const productId = Number(item.product_id);
                if (!Number.isInteger(productId) || productId <= 0) {
                    continue;
                }

                const previousQty = productQuantities.get(productId) || 0;
                productQuantities.set(productId, previousQty + Number(item.quantity || 0));
            }

            for (const [productId, quantity] of productQuantities.entries()) {
                if (!Number.isInteger(quantity) || quantity <= 0) {
                    continue;
                }

                const updateStockResult = await new sql.Request(transaction)
                    .input('product_id', sql.Int, productId)
                    .input('quantity', sql.Int, quantity)
                    .query(`
                        UPDATE dbo.PRODUCT
                        SET stock_quantity = stock_quantity - @quantity
                        WHERE product_id = @product_id
                          AND stock_quantity >= @quantity
                    `);

                const affectedRows = Array.isArray(updateStockResult.rowsAffected)
                    ? Number(updateStockResult.rowsAffected[0] || 0)
                    : 0;

                if (affectedRows === 0) {
                    const productResult = await new sql.Request(transaction)
                        .input('product_id', sql.Int, productId)
                        .query(`
                            SELECT TOP 1 name, stock_quantity
                            FROM dbo.PRODUCT
                            WHERE product_id = @product_id
                        `);

                    const product = productResult.recordset[0];
                    if (!product) {
                        throw new Error(`Product not found (product_id=${productId})`);
                    }

                    throw new Error(
                        `Insufficient stock for product \"${product.name}\" (product_id=${productId}). Available: ${product.stock_quantity}, requested: ${quantity}`
                    );
                }
            }

            const paymentResult = await new sql.Request(transaction)
                .input('order_id', sql.Int, orderId)
                .input('payment_status', sql.NVarChar(50), 'Pending')
                .input('total_amount', sql.Decimal(18, 2), totalAmount)
                .input('payment_method', sql.NVarChar(50), normalizedPaymentMethod)
                .query(`
                    INSERT INTO dbo.Payment (order_id, payment_status, total_amount, payment_method)
                    OUTPUT INSERTED.payment_id
                    VALUES (@order_id, @payment_status, @total_amount, @payment_method)
                `);

            const deleteRequest = new sql.Request(transaction)
                .input('user_id', sql.Int, orderData.user_id);
            uniqueCartItemIds.forEach((cartItemId, index) => {
                deleteRequest.input(`delete_cart_item_id_${index}`, sql.Int, cartItemId);
            });

            await deleteRequest.query(`
                DELETE ci
                FROM dbo.CART_ITEM ci
                JOIN dbo.CART c ON c.cart_id = ci.cart_id
                WHERE c.user_id = @user_id
                  AND ci.cart_item_id IN (${uniqueCartItemIds.map((_, index) => `@delete_cart_item_id_${index}`).join(', ')})
            `);

            await transaction.commit();

            return {
                order_id: orderId,
                payment_id: paymentResult.recordset[0].payment_id,
                selected_cart_item_ids: uniqueCartItemIds,
                subtotal,
                discount_percent: discountPercent,
                discount_amount: discountAmount,
                total_amount: totalAmount,
                promotion_code: promotionCode,
                shipping_address: orderData.shipping_address,
                contact_phone: orderData.phone,
                payment_type: paymentType,
                payment_method: normalizedPaymentMethod
            };
        } catch (error) {
            if (transaction._aborted !== true) {
                await transaction.rollback();
            }
            throw error;
        }
    }

    static async update(id, orderData) {
        const conn = await pool;
        return await conn.request()
            .input('order_id', sql.Int, id)
            .input('user_id', sql.Int, orderData.user_id)
            .input('promotion_id', sql.Int, orderData.promotion_id ?? null)
            .input('status', sql.NVarChar(50), orderData.status)
            .input('total_amount', sql.Decimal(18, 2), orderData.total_amount)
            .input('shipping_address', sql.NVarChar(sql.MAX), orderData.shipping_address ?? null)
            .input('payment_type', sql.VarChar(50), orderData.payment_type)
            .query(`
                UPDATE dbo.[ORDER]
                SET user_id = @user_id,
                    promotion_id = @promotion_id,
                    status = @status,
                    total_amount = @total_amount,
                    shipping_address = @shipping_address,
                    payment_type = @payment_type
                WHERE order_id = @order_id
            `);
    }

    static async delete(id) {
        const conn = await pool;
        const transaction = new sql.Transaction(conn);
        await transaction.begin();

        try {
            await new sql.Request(transaction)
                .input('order_id', sql.Int, id)
                .query(`
                    DELETE idt
                    FROM dbo.INSTALLMENT_DETAILS idt
                    JOIN dbo.INSTALLMENT_PLANS ip ON ip.plan_id = idt.plan_id
                    WHERE ip.order_id = @order_id
                `);

            await new sql.Request(transaction)
                .input('order_id', sql.Int, id)
                .query('DELETE FROM dbo.INSTALLMENT_PLANS WHERE order_id = @order_id');

            await new sql.Request(transaction)
                .input('order_id', sql.Int, id)
                .query('DELETE FROM dbo.Payment WHERE order_id = @order_id');

            await new sql.Request(transaction)
                .input('order_id', sql.Int, id)
                .query('DELETE FROM dbo.ORDER_DETAIL WHERE order_id = @order_id');

            const deleteOrderResult = await new sql.Request(transaction)
                .input('order_id', sql.Int, id)
                .query('DELETE FROM dbo.[ORDER] WHERE order_id = @order_id');

            await transaction.commit();
            return deleteOrderResult;
        } catch (error) {
            if (transaction._aborted !== true) {
                await transaction.rollback();
            }
            throw error;
        }
    }
}

module.exports = Order;
