const { sql, pool } = require("../config/db");

class Cart {
    static async getCartByUserId(userId) {
        const conn = await pool;
        return await conn.request()
            .input('user_id', sql.BigInt, userId)
            .query(`
                SELECT c.cart_id, c.user_id, c.product_id, c.quantity, c.added_at,
                       p.name as product_name, p.price, p.stock, p.image_url
                FROM cart c
                JOIN products p ON c.product_id = p.product_id
                WHERE c.user_id = @user_id
                ORDER BY c.added_at DESC
            `);
    }

    static async getCartItemById(cartId) {
        const conn = await pool;
        return await conn.request()
            .input('cart_id', sql.BigInt, cartId)
            .query(`
                SELECT c.cart_id, c.user_id, c.product_id, c.quantity, c.added_at,
                       p.name as product_name, p.price, p.stock, p.image_url
                FROM cart c
                JOIN products p ON c.product_id = p.product_id
                WHERE c.cart_id = @cart_id
            `);
    }

    static async addToCart(cartData) {
        const conn = await pool;
        return await conn.request()
            .input('user_id', sql.BigInt, cartData.user_id)
            .input('product_id', sql.BigInt, cartData.product_id)
            .input('quantity', sql.Int, cartData.quantity || 1)
            .query(`
                IF EXISTS (SELECT 1 FROM cart WHERE user_id = @user_id AND product_id = @product_id)
                BEGIN
                    UPDATE cart 
                    SET quantity = quantity + @quantity
                    WHERE user_id = @user_id AND product_id = @product_id
                    SELECT c.cart_id, c.user_id, c.product_id, c.quantity, c.added_at,
                           p.name as product_name, p.price, p.stock, p.image_url
                    FROM cart c
                    JOIN products p ON c.product_id = p.product_id
                    WHERE c.user_id = @user_id AND c.product_id = @product_id
                END
                ELSE
                BEGIN
                    INSERT INTO cart (user_id, product_id, quantity)
                    OUTPUT INSERTED.cart_id, INSERTED.user_id, INSERTED.product_id, 
                           INSERTED.quantity, INSERTED.added_at
                    VALUES (@user_id, @product_id, @quantity)
                END
            `);
    }

    static async updateQuantity(cartId, quantity) {
        const conn = await pool;
        return await conn.request()
            .input('cart_id', sql.BigInt, cartId)
            .input('quantity', sql.Int, quantity)
            .query(`
                UPDATE cart 
                SET quantity = @quantity
                WHERE cart_id = @cart_id
            `);
    }

    static async removeFromCart(cartId) {
        const conn = await pool;
        return await conn.request()
            .input('cart_id', sql.BigInt, cartId)
            .query('DELETE FROM cart WHERE cart_id = @cart_id');
    }

    static async clearUserCart(userId) {
        const conn = await pool;
        return await conn.request()
            .input('user_id', sql.BigInt, userId)
            .query('DELETE FROM cart WHERE user_id = @user_id');
    }

    static async getCartItemByUserAndProduct(userId, productId) {
        const conn = await pool;
        return await conn.request()
            .input('user_id', sql.BigInt, userId)
            .input('product_id', sql.BigInt, productId)
            .query(`
                SELECT c.cart_id, c.user_id, c.product_id, c.quantity, c.added_at,
                       p.name as product_name, p.price, p.stock, p.image_url
                FROM cart c
                JOIN products p ON c.product_id = p.product_id
                WHERE c.user_id = @user_id AND c.product_id = @product_id
            `);
    }
}

module.exports = Cart;
