const { sql, pool } = require("../config/db");

const roundMoney = (value) => parseFloat(Number(value || 0).toFixed(2));

class CheckoutModel {
    static async checkoutFromCart({ userId, shippingAddress }) {
        const conn = await pool;
        const transaction = new sql.Transaction(conn);
        await transaction.begin();

        try {
            const cartItemsResult = await new sql.Request(transaction)
                .input("user_id", sql.Int, userId)
                .query(`
                    SELECT
                        ci.cart_item_id,
                        ci.product_id,
                        ci.user_build_id,
                        ci.quantity,
                        p.price AS product_price,
                        ub.total_price AS build_price
                    FROM dbo.CART c
                    JOIN dbo.CART_ITEM ci ON c.cart_id = ci.cart_id
                    LEFT JOIN dbo.PRODUCT p ON ci.product_id = p.product_id
                    LEFT JOIN dbo.UserBuilds ub ON ci.user_build_id = ub.user_build_id
                    WHERE c.user_id = @user_id
                    ORDER BY ci.cart_item_id ASC
                `);

            const cartItems = cartItemsResult.recordset;
            if (!cartItems.length) {
                throw new Error("Cart is empty");
            }

            const itemsWithPrice = cartItems.map((item) => {
                const unitPrice = item.product_id ? Number(item.product_price) : Number(item.build_price);
                if (!Number.isFinite(unitPrice) || unitPrice < 0) {
                    throw new Error("Invalid cart item price");
                }
                return {
                    ...item,
                    unitPrice: roundMoney(unitPrice)
                };
            });

            const principalTotal = roundMoney(
                itemsWithPrice.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
            );

            if (principalTotal <= 0) {
                throw new Error("Cart total amount is invalid");
            }
            const insertedOrder = await new sql.Request(transaction)
                .input("user_id", sql.Int, userId)
                .input("status", sql.NVarChar(50), "Pending")
                .input("total_amount", sql.Decimal(18, 2), principalTotal)
                .input("shipping_address", sql.NVarChar(sql.MAX), shippingAddress)
                .input("payment_type", sql.VarChar(50), "Pending")
                .query(`
                    INSERT INTO dbo.[ORDER] (user_id, status, total_amount, shipping_address, payment_type)
                    OUTPUT INSERTED.order_id
                    VALUES (@user_id, @status, @total_amount, @shipping_address, @payment_type)
                `);

            const orderId = insertedOrder.recordset[0].order_id;

            for (const item of itemsWithPrice) {
                await new sql.Request(transaction)
                    .input("order_id", sql.Int, orderId)
                    .input("product_id", sql.Int, item.product_id || null)
                    .input("user_build_id", sql.Int, item.user_build_id || null)
                    .input("quantity", sql.Int, item.quantity)
                    .input("price", sql.Decimal(18, 2), item.unitPrice)
                    .query(`
                        INSERT INTO dbo.ORDER_DETAIL (order_id, product_id, user_build_id, quantity, price)
                        VALUES (@order_id, @product_id, @user_build_id, @quantity, @price)
                    `);
            }

            const paymentResult = await new sql.Request(transaction)
                .input("order_id", sql.Int, orderId)
                .input("payment_status", sql.NVarChar(50), "Pending")
                .input("total_amount", sql.Decimal(18, 2), principalTotal)
                .input("payment_method", sql.NVarChar(50), null)
                .query(`
                    INSERT INTO dbo.Payment (order_id, payment_status, total_amount, payment_method)
                    OUTPUT INSERTED.payment_id
                    VALUES (@order_id, @payment_status, @total_amount, @payment_method)
                `);

            await new sql.Request(transaction)
                .input("user_id", sql.Int, userId)
                .query(`
                    DELETE ci
                    FROM dbo.CART_ITEM ci
                    JOIN dbo.CART c ON c.cart_id = ci.cart_id
                    WHERE c.user_id = @user_id
                `);

            await transaction.commit();

            return {
                order_id: orderId,
                payment_id: paymentResult.recordset[0].payment_id,
                total_amount: principalTotal,
                payment_method: null
            };
        } catch (error) {
            if (transaction._aborted !== true) {
                await transaction.rollback();
            }
            throw error;
        }
    }
}

module.exports = CheckoutModel;