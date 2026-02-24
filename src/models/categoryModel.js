const {sql, pool} = require("../config/db");

class Category {
    static async getAll() {
        const conn = await pool;
        return await conn.request().query('SELECT * FROM categories');
    }

    static async getById(id) {
        const conn = await pool;
        return await conn.request()
            .input('category_id', sql.Int, id)
            .query('SELECT * FROM categories WHERE category_id = @category_id');
    }

    static async create(categoryData) {
        const conn = await pool;
        return await conn.request()
            .input('name', sql.NVarChar, categoryData.name)
            .query('INSERT INTO categories (name) OUTPUT INSERTED.* VALUES (@name)');
    }

    static async update(id, categoryData) {
        const conn = await pool;
        return await conn.request()
            .input('category_id', sql.Int, id)
            .input('name', sql.NVarChar, categoryData.name)
            .query('UPDATE categories SET name = @name WHERE category_id = @category_id');
    }

    static async delete(id) {
        const conn = await pool;
        return await conn.request()
            .input('category_id', sql.Int, id)
            .query('DELETE FROM categories WHERE category_id = @category_id');
    }
}
module.exports = Category;