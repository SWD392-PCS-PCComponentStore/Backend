const { sql, pool } = require("../config/db");

class Cart {
    static async getCartByUserId(userId) {
        const conn = await pool;
        return await conn.request()
            .input('user_id', sql.Int, userId)
            .query(`
                SELECT c.cart_id, c.user_id, c.product_id, c.quantity, c.date_added,
                       p.name as product_name, p.price, p.stock_quantity, p.image_url
                FROM dbo.Carts c
                JOIN dbo.Products p ON c.product_id = p.product_id
                WHERE c.user_id = @user_id
                ORDER BY c.date_added DESC
            `);
    }

    static async getCartItemById(cartId) {
        const conn = await pool;
        return await conn.request()
            .input('cart_id', sql.Int, cartId)
            .query(`
                SELECT c.cart_id, c.user_id, c.product_id, c.quantity, c.date_added,
                       p.name as product_name, p.price, p.stock_quantity, p.image_url
                FROM dbo.Carts c
                JOIN dbo.Products p ON c.product_id = p.product_id
                WHERE c.cart_id = @cart_id
            `);
    }

    static async addToCart(cartData) {
        const conn = await pool;
        return await conn.request()
            .input('user_id', sql.Int, cartData.user_id)
            .input('product_id', sql.Int, cartData.product_id)
            .input('quantity', sql.Int, cartData.quantity || 1)
            .query(`
                IF EXISTS (SELECT 1 FROM dbo.Carts WHERE user_id = @user_id AND product_id = @product_id)
                BEGIN
                    UPDATE dbo.Carts 
                    SET quantity = quantity + @quantity
                    WHERE user_id = @user_id AND product_id = @product_id
                    SELECT c.cart_id, c.user_id, c.product_id, c.quantity, c.date_added,
                           p.name as product_name, p.price, p.stock_quantity, p.image_url
                    FROM dbo.Carts c
                    JOIN dbo.Products p ON c.product_id = p.product_id
                    WHERE c.user_id = @user_id AND c.product_id = @product_id
                END
                ELSE
                BEGIN
                    INSERT INTO dbo.Carts (user_id, product_id, quantity)
                    OUTPUT INSERTED.cart_id, INSERTED.user_id, INSERTED.product_id, 
                           INSERTED.quantity, INSERTED.date_added
                    VALUES (@user_id, @product_id, @quantity)
                END
            `);
    }

    static async updateQuantity(cartId, quantity) {
        const conn = await pool;
        return await conn.request()
            .input('cart_id', sql.Int, cartId)
            .input('quantity', sql.Int, quantity)
            .query(`
                UPDATE dbo.Carts 
                SET quantity = @quantity
                WHERE cart_id = @cart_id
            `);
    }

    static async removeFromCart(cartId) {
        const conn = await pool;
        return await conn.request()
            .input('cart_id', sql.Int, cartId)
            .query('DELETE FROM dbo.Carts WHERE cart_id = @cart_id');
    }

    static async clearUserCart(userId) {
        const conn = await pool;
        return await conn.request()
            .input('user_id', sql.Int, userId)
            .query('DELETE FROM dbo.Carts WHERE user_id = @user_id');
    }

    static async getCartItemByUserAndProduct(userId, productId) {
        const conn = await pool;
        return await conn.request()
            .input('user_id', sql.Int, userId)
            .input('product_id', sql.Int, productId)
            .query(`
                SELECT c.cart_id, c.user_id, c.product_id, c.quantity, c.date_added,
                       p.name as product_name, p.price, p.stock_quantity, p.image_url
                FROM dbo.Carts c
                JOIN dbo.Products p ON c.product_id = p.product_id
                WHERE c.user_id = @user_id AND c.product_id = @product_id
            `);
    }
}

module.exports = Cart;
