const { sql, pool } = require("../config/db");

// Cột SELECT dùng chung cho mọi query trả về cart item
const CART_ITEM_SELECT = `
    SELECT
        ci.cart_item_id,
        c.cart_id,
        c.user_id,
        ci.product_id,
        ci.user_build_id,
        ci.quantity,
        c.created_at,
        p.name          AS product_name,
        p.price         AS product_price,
        p.stock_quantity,
        p.image_url,
        ub.build_name,
        ub.total_price  AS build_price
    FROM dbo.CART_ITEM ci
    JOIN dbo.CART c ON ci.cart_id = c.cart_id
    LEFT JOIN dbo.PRODUCT p ON ci.product_id = p.product_id
    LEFT JOIN dbo.UserBuilds ub ON ci.user_build_id = ub.user_build_id
`;

class Cart {
    // Lấy cart_id của user, nếu chưa có thì tạo mới
    static async getOrCreateCartId(userId) {
        const conn = await pool;
        const existing = await conn.request()
            .input('user_id', sql.Int, userId)
            .query('SELECT TOP 1 cart_id FROM dbo.CART WHERE user_id = @user_id ORDER BY cart_id ASC');

        if (existing.recordset[0]) {
            return existing.recordset[0].cart_id;
        }

        const created = await conn.request()
            .input('user_id', sql.Int, userId)
            .query('INSERT INTO dbo.CART (user_id) OUTPUT INSERTED.cart_id VALUES (@user_id)');

        return created.recordset[0].cart_id;
    }

    // Lấy toàn bộ items trong giỏ của user (kèm thông tin product / build)
    static async getCartByUserId(userId) {
        const conn = await pool;
        return await conn.request()
            .input('user_id', sql.Int, userId)
            .query(`${CART_ITEM_SELECT} WHERE c.user_id = @user_id ORDER BY ci.cart_item_id DESC`);
    }

    // Lấy 1 cart item theo cart_item_id
    static async getCartItemById(cartItemId) {
        const conn = await pool;
        return await conn.request()
            .input('cart_item_id', sql.Int, cartItemId)
            .query(`${CART_ITEM_SELECT} WHERE ci.cart_item_id = @cart_item_id`);
    }

    // Kiểm tra product đã có trong giỏ của user chưa
    static async getCartItemByUserAndProduct(userId, productId) {
        const conn = await pool;
        return await conn.request()
            .input('user_id', sql.Int, userId)
            .input('product_id', sql.Int, productId)
            .query(`
                SELECT ci.cart_item_id, ci.quantity
                FROM dbo.CART_ITEM ci
                JOIN dbo.CART c ON ci.cart_id = c.cart_id
                WHERE c.user_id = @user_id AND ci.product_id = @product_id
            `);
    }

    // Kiểm tra build đã có trong giỏ của user chưa
    static async getCartItemByUserAndBuild(userId, userBuildId) {
        const conn = await pool;
        return await conn.request()
            .input('user_id', sql.Int, userId)
            .input('user_build_id', sql.Int, userBuildId)
            .query(`
                SELECT ci.cart_item_id, ci.quantity
                FROM dbo.CART_ITEM ci
                JOIN dbo.CART c ON ci.cart_id = c.cart_id
                WHERE c.user_id = @user_id AND ci.user_build_id = @user_build_id
            `);
    }

    // Thêm product vào giỏ, trả về cart_item_id mới
    static async addProductToCart(userId, productId, quantity) {
        const conn = await pool;
        const cartId = await Cart.getOrCreateCartId(userId);
        const result = await conn.request()
            .input('cart_id', sql.Int, cartId)
            .input('product_id', sql.Int, productId)
            .input('quantity', sql.Int, quantity)
            .query(`
                INSERT INTO dbo.CART_ITEM (cart_id, product_id, quantity)
                OUTPUT INSERTED.cart_item_id
                VALUES (@cart_id, @product_id, @quantity)
            `);
        return result.recordset[0].cart_item_id;
    }

    // Thêm build vào giỏ, trả về cart_item_id mới
    static async addBuildToCart(userId, userBuildId, quantity) {
        const conn = await pool;
        const cartId = await Cart.getOrCreateCartId(userId);
        const result = await conn.request()
            .input('cart_id', sql.Int, cartId)
            .input('user_build_id', sql.Int, userBuildId)
            .input('quantity', sql.Int, quantity)
            .query(`
                INSERT INTO dbo.CART_ITEM (cart_id, user_build_id, quantity)
                OUTPUT INSERTED.cart_item_id
                VALUES (@cart_id, @user_build_id, @quantity)
            `);
        return result.recordset[0].cart_item_id;
    }

    static async updateQuantity(cartItemId, quantity) {
        const conn = await pool;
        return await conn.request()
            .input('cart_item_id', sql.Int, cartItemId)
            .input('quantity', sql.Int, quantity)
            .query('UPDATE dbo.CART_ITEM SET quantity = @quantity WHERE cart_item_id = @cart_item_id');
    }

    static async removeFromCart(cartItemId) {
        const conn = await pool;
        return await conn.request()
            .input('cart_item_id', sql.Int, cartItemId)
            .query('DELETE FROM dbo.CART_ITEM WHERE cart_item_id = @cart_item_id');
    }

    static async clearUserCart(userId) {
        const conn = await pool;
        return await conn.request()
            .input('user_id', sql.Int, userId)
            .query(`
                DELETE ci
                FROM dbo.CART_ITEM ci
                JOIN dbo.CART c ON ci.cart_id = c.cart_id
                WHERE c.user_id = @user_id
            `);
    }
}

module.exports = Cart;
