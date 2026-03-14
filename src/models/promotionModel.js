const { sql, pool } = require('../config/db');

class Promotion {
    static async getAll() {
        const conn = await pool;
        return await conn.request().query('SELECT * FROM dbo.PROMOTION ORDER BY promotion_id DESC');
    }

    static async getById(id) {
        const conn = await pool;
        return await conn.request()
            .input('promotion_id', sql.Int, id)
            .query('SELECT * FROM dbo.PROMOTION WHERE promotion_id = @promotion_id');
    }

    static async getByCode(code) {
        const conn = await pool;
        return await conn.request()
            .input('code', sql.VarChar(50), code)
            .query('SELECT * FROM dbo.PROMOTION WHERE code = @code');
    }

    static async create(promotionData) {
        const conn = await pool;
        return await conn.request()
            .input('code', sql.VarChar(50), promotionData.code)
            .input('discount_percent', sql.Decimal(5, 2), promotionData.discount_percent)
            .input('valid_from', sql.DateTime, promotionData.valid_from || null)
            .input('valid_to', sql.DateTime, promotionData.valid_to || null)
            .query(`
                INSERT INTO dbo.PROMOTION (code, discount_percent, valid_from, valid_to)
                OUTPUT INSERTED.*
                VALUES (@code, @discount_percent, @valid_from, @valid_to)
            `);
    }

    static async update(id, promotionData) {
        const conn = await pool;
        return await conn.request()
            .input('promotion_id', sql.Int, id)
            .input('code', sql.VarChar(50), promotionData.code)
            .input('discount_percent', sql.Decimal(5, 2), promotionData.discount_percent)
            .input('valid_from', sql.DateTime, promotionData.valid_from || null)
            .input('valid_to', sql.DateTime, promotionData.valid_to || null)
            .query(`
                UPDATE dbo.PROMOTION
                SET code = @code,
                    discount_percent = @discount_percent,
                    valid_from = @valid_from,
                    valid_to = @valid_to
                WHERE promotion_id = @promotion_id
            `);
    }

    static async delete(id) {
        const conn = await pool;
        return await conn.request()
            .input('promotion_id', sql.Int, id)
            .query('DELETE FROM dbo.PROMOTION WHERE promotion_id = @promotion_id');
    }
}

module.exports = Promotion;
