const{sql, pool} = require("../config/db");

class Specification {
    static async create(specData) {
        const conn = await pool;
        return await conn.request()
        .input('product_id', sql.BigInt, specData.product_id)
        .input('spec_name', sql.NVarChar(150), specData.spec_name)
        .input('spec_value', sql.NVarChar(255), specData.spec_value)
        .query(`INSERT INTO product_specifications (product_id, spec_name, spec_value) 
                OUTPUT INSERTED.* 
                VALUES (@product_id, @spec_name, @spec_value)`);
    }

    static async getByProductId(productId) {
        const conn = await pool;
        return await conn.request()
        .input('product_id', sql.BigInt, productId)
        .query('SELECT * FROM product_specifications WHERE product_id = @product_id');
    }

}
module.exports = Specification;