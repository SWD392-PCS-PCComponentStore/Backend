const{sql, pool} = require("../config/db");

class Specification {
    static async create(specData) {
        const conn = await pool;
        return await conn.request()
        .input('product_id', sql.Int, specData.product_id)
    .input('spec_name', sql.NVarChar(255), specData.spec_name)
    .input('spec_value', sql.NVarChar(255), specData.spec_value)
    .query(`INSERT INTO dbo.PRODUCT_SPEC (product_id, spec_name, spec_value) 
                OUTPUT INSERTED.* 
        VALUES (@product_id, @spec_name, @spec_value)`);
    }

    static async getByProductId(productId) {
        const conn = await pool;
        return await conn.request()
        .input('product_id', sql.Int, productId)
        .query('SELECT * FROM dbo.PRODUCT_SPEC WHERE product_id = @product_id');
    }

    static async getById(specId) {
        const conn = await pool;
        return await conn.request()
        .input('spec_id', sql.Int, specId)
        .query('SELECT * FROM dbo.PRODUCT_SPEC WHERE spec_id = @spec_id');
    }

    static async update(specId, specData) {
        const conn = await pool;
        return await conn.request()
        .input('spec_id', sql.Int, specId)
        .input('spec_name', sql.NVarChar(255), specData.spec_name)
        .input('spec_value', sql.NVarChar(255), specData.spec_value)
        .query(`UPDATE dbo.PRODUCT_SPEC
                SET spec_name = @spec_name,
                    spec_value = @spec_value
                WHERE spec_id = @spec_id`);
    }

    static async delete(specId) {
        const conn = await pool;
        return await conn.request()
        .input('spec_id', sql.Int, specId)
        .query('DELETE FROM dbo.PRODUCT_SPEC WHERE spec_id = @spec_id');
    }

}
module.exports = Specification;