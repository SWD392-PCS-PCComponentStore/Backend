const{sql, pool} = require("../config/db");

class Specification {
    static async create(specData) {
        const conn = await pool;
        return await conn.request()
        .input('product_id', sql.Int, specData.product_id)
        .input('attribute_name', sql.NVarChar(255), specData.attribute_name)
        .input('attribute_value', sql.NVarChar(255), specData.attribute_value)
        .input('unit', sql.NVarChar(50), specData.unit || null)
        .query(`INSERT INTO dbo.Product_Specs (product_id, attribute_name, attribute_value, unit) 
                OUTPUT INSERTED.* 
                VALUES (@product_id, @attribute_name, @attribute_value, @unit)`);
    }

    static async getByProductId(productId) {
        const conn = await pool;
        return await conn.request()
        .input('product_id', sql.Int, productId)
        .query('SELECT * FROM dbo.Product_Specs WHERE product_id = @product_id');
    }

    static async getById(specId) {
        const conn = await pool;
        return await conn.request()
        .input('spec_id', sql.Int, specId)
        .query('SELECT * FROM dbo.Product_Specs WHERE spec_id = @spec_id');
    }

    static async update(specId, specData) {
        const conn = await pool;
        return await conn.request()
        .input('spec_id', sql.Int, specId)
        .input('attribute_name', sql.NVarChar(255), specData.attribute_name)
        .input('attribute_value', sql.NVarChar(255), specData.attribute_value)
        .input('unit', sql.NVarChar(50), specData.unit || null)
        .query(`UPDATE dbo.Product_Specs
                SET attribute_name = @attribute_name,
                    attribute_value = @attribute_value,
                    unit = @unit
                WHERE spec_id = @spec_id`);
    }

    static async delete(specId) {
        const conn = await pool;
        return await conn.request()
        .input('spec_id', sql.Int, specId)
        .query('DELETE FROM dbo.Product_Specs WHERE spec_id = @spec_id');
    }

}
module.exports = Specification;