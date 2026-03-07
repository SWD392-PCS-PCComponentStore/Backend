const{sql, pool} = require("../config/db");

class Product{
    static async getAll(){
        const conn = await pool;
       return await conn.request().query('SELECT p.*, c.name AS category_name FROM dbo.Products p LEFT JOIN dbo.Categories c ON p.category_id = c.category_id');

    }

    static async getById(id){
        const conn = await pool;
        return await conn.request()
        .input('product_id', sql.Int, id)
        .query('SELECT p.*, c.name AS category_name FROM dbo.Products p LEFT JOIN dbo.Categories c ON p.category_id = c.category_id WHERE p.product_id = @product_id');
    }

    static async create(productData){
        const conn = await pool;
        return await conn.request()
        .input('name', sql.NVarChar(255), productData.name)
        .input('description', sql.NVarChar(sql.MAX), productData.description || null)
        .input('price', sql.Decimal(12, 2), productData.price)
        .input('stock_quantity', sql.Int, productData.stock_quantity || 0)
        .input('image_url', sql.NVarChar(1000), productData.image_url || null)
        .input('supplier_id', sql.Int, productData.supplier_id)
        .input('category_id', sql.Int, productData.category_id)
        .query(`INSERT INTO dbo.Products (name, description, price, stock_quantity, image_url, supplier_id, category_id) 
                OUTPUT INSERTED.* 
                VALUES (@name, @description, @price, @stock_quantity, @image_url, @supplier_id, @category_id)`);
    }

    static async update(id, productData){
        const conn = await pool;
        return await conn.request()
        .input('product_id', sql.Int, id)
        .input('name', sql.NVarChar(255), productData.name)
        .input('description', sql.NVarChar(sql.MAX), productData.description || null)
        .input('price', sql.Decimal(12, 2), productData.price)
        .input('stock_quantity', sql.Int, productData.stock_quantity || 0)
        .input('image_url', sql.NVarChar(1000), productData.image_url || null)
        .input('supplier_id', sql.Int, productData.supplier_id)
        .input('category_id', sql.Int, productData.category_id)
        .query(`UPDATE dbo.Products 
                SET name = @name, description = @description, price = @price, stock_quantity = @stock_quantity, image_url = @image_url, supplier_id = @supplier_id, category_id = @category_id
                WHERE product_id = @product_id`);
    }

    static async delete(id){
        const conn = await pool;
        return await conn.request()
        .input('product_id', sql.Int, id)
        .query('DELETE FROM dbo.Products WHERE product_id = @product_id');
    }
}
module.exports = Product;