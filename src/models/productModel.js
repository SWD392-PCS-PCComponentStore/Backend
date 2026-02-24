const{sql, pool} = require("../config/db");

class Product{
    static async getAll(){
        const conn = await pool;
       return await conn.request().query('SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.category_id');

    }

    static async getById(id){
        const conn = await pool;
        return await conn.request()
        .input('product_id', sql.BigInt, id)
        .query('SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.category_id WHERE p.product_id = @product_id');
    }

    static async create(productData){
        const conn = await pool;
        return await conn.request()
        .input('name', sql.NVarChar(255), productData.name)
        .input('category_id', sql.Int, productData.category_id)
        .input('brand', sql.NVarChar(150), productData.brand || null)
        .input('price', sql.Decimal(18, 2), productData.price)
        .input('stock', sql.Int, productData.stock || 0)
        .input('image_url', sql.NVarChar(500), productData.image_url || null)
        .query(`INSERT INTO products (name, category_id, brand, price, stock, image_url) 
                OUTPUT INSERTED.* 
                VALUES (@name, @category_id, @brand, @price, @stock, @image_url)`);
    }

    static async update(id, productData){
        const conn = await pool;
        return await conn.request()
        .input('product_id', sql.BigInt, id)
        .input('name', sql.NVarChar(255), productData.name)
        .input('category_id', sql.Int, productData.category_id)
        .input('brand', sql.NVarChar(150), productData.brand || null)
        .input('price', sql.Decimal(18, 2), productData.price)
        .input('stock', sql.Int, productData.stock || 0)
        .input('image_url', sql.NVarChar(500), productData.image_url || null)
        .query(`UPDATE products 
                SET name = @name, category_id = @category_id, brand = @brand, price = @price, stock = @stock, image_url = @image_url
                WHERE product_id = @product_id`);
    }

    static async delete(id){
        const conn = await pool;
        return await conn.request()
        .input('product_id', sql.BigInt, id)
        .query('DELETE FROM products WHERE product_id = @product_id');
    }
}
module.exports = Product;