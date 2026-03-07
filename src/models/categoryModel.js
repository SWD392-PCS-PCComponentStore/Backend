const {sql, pool} = require("../config/db");

class Category {
    static async getAll() {
        const conn = await pool;
        return await conn.request().query('SELECT * FROM dbo.Categories');
    }

    static async getById(id) {
        const conn = await pool;
        return await conn.request()
            .input('category_id', sql.Int, id)
            .query('SELECT * FROM dbo.Categories WHERE category_id = @category_id');
    }

    static async create(categoryData) {
        const conn = await pool;
        return await conn.request()
            .input('name', sql.NVarChar(255), categoryData.name)
            .input('description', sql.NVarChar(sql.MAX), categoryData.description || null)
            .query('INSERT INTO dbo.Categories (name, description) OUTPUT INSERTED.* VALUES (@name, @description)');
    }

    static async update(id, categoryData) {
        const conn = await pool;
        return await conn.request()
            .input('category_id', sql.Int, id)
            .input('name', sql.NVarChar(255), categoryData.name)
            .input('description', sql.NVarChar(sql.MAX), categoryData.description || null)
            .query('UPDATE dbo.Categories SET name = @name, description = @description WHERE category_id = @category_id');
    }

    static async delete(id) {
        const conn = await pool;
        return await conn.request()
            .input('category_id', sql.Int, id)
            .query('DELETE FROM dbo.Categories WHERE category_id = @category_id');
    }
}
module.exports = Category;