const{sql, pool} = require("../config/db");

class Product{
    static async getAll(){
        const conn = await pool;
       return await conn.request().query('SELECT p.*, c.name AS category_name FROM dbo.PRODUCT p LEFT JOIN dbo.CATEGORY c ON p.category_id = c.category_id');

    }

    static async getById(id){
        const conn = await pool;
        return await conn.request()
        .input('product_id', sql.Int, id)
        .query('SELECT p.*, c.name AS category_name FROM dbo.PRODUCT p LEFT JOIN dbo.CATEGORY c ON p.category_id = c.category_id WHERE p.product_id = @product_id');
    }

    static async getByCategoryId(categoryId){
        const conn = await pool;
        return await conn.request()
        .input('category_id', sql.Int, categoryId)
        .query('SELECT p.*, c.name AS category_name FROM dbo.PRODUCT p LEFT JOIN dbo.CATEGORY c ON p.category_id = c.category_id WHERE p.category_id = @category_id');
    }

    static async getByName(name){
        const conn = await pool;
        const normalizedName = String(name).toLowerCase();
        return await conn.request()
        .input('name', sql.NVarChar(255), `%${normalizedName}%`)
        .query(`SELECT p.*, c.name AS category_name
            FROM dbo.PRODUCT p
            LEFT JOIN dbo.CATEGORY c ON p.category_id = c.category_id
            WHERE LOWER(p.name) LIKE @name`);
    }

    static async create(productData){
        const conn = await pool;
        return await conn.request()
        .input('name', sql.NVarChar(255), productData.name)
        .input('description', sql.NVarChar(sql.MAX), productData.description || null)
        .input('price', sql.Decimal(18, 2), productData.price)
        .input('stock_quantity', sql.Int, productData.stock_quantity || 0)
        .input('image_url', sql.NVarChar(500), productData.image_url || null)
        .input('status', sql.NVarChar(50), productData.status || 'Available')
        .input('brand', sql.NVarChar(100), productData.brand || null)
        .input('category_id', sql.Int, productData.category_id)
        .query(`INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, image_url, status, brand, category_id) 
                OUTPUT INSERTED.* 
            VALUES (@name, @description, @price, @stock_quantity, @image_url, @status, @brand, @category_id)`);
    }

    static async update(id, productData){
        const conn = await pool;
        return await conn.request()
        .input('product_id', sql.Int, id)
        .input('name', sql.NVarChar(255), productData.name)
        .input('description', sql.NVarChar(sql.MAX), productData.description || null)
        .input('price', sql.Decimal(18, 2), productData.price)
        .input('stock_quantity', sql.Int, productData.stock_quantity || 0)
        .input('image_url', sql.NVarChar(500), productData.image_url || null)
        .input('status', sql.NVarChar(50), productData.status || 'Available')
        .input('brand', sql.NVarChar(100), productData.brand || null)
        .input('category_id', sql.Int, productData.category_id)
        .query(`UPDATE dbo.PRODUCT 
            SET name = @name, description = @description, price = @price, stock_quantity = @stock_quantity, image_url = @image_url, status = @status, brand = @brand, category_id = @category_id
                WHERE product_id = @product_id`);
    }

    static async delete(id){
        const conn = await pool;
        const transaction = new sql.Transaction(conn);

        try {
            await transaction.begin();

            const req = () => new sql.Request(transaction).input('product_id', sql.Int, id);

            // Xóa các bảng con không nullable trước
            await req().query('DELETE FROM dbo.PRODUCT_SPEC WHERE product_id = @product_id');
            await req().query('DELETE FROM dbo.PRODUCT_BENCHMARK WHERE product_id = @product_id');
            await req().query('DELETE FROM dbo.AI_BUILD_ITEMS WHERE product_id = @product_id');
            await req().query('DELETE FROM dbo.PC_Build_Items WHERE product_id = @product_id');
            await req().query('DELETE FROM dbo.UserBuildItems WHERE product_id = @product_id');

            // Set NULL các bảng cho phép null (giữ lại lịch sử đơn hàng / giỏ hàng)
            await req().query('UPDATE dbo.PC_Builds SET product_id = NULL WHERE product_id = @product_id');
            await req().query('UPDATE dbo.CART_ITEM SET product_id = NULL WHERE product_id = @product_id');
            await req().query('UPDATE dbo.ORDER_DETAIL SET product_id = NULL WHERE product_id = @product_id');

            // Xóa product
            const result = await req().query('DELETE FROM dbo.PRODUCT WHERE product_id = @product_id');

            await transaction.commit();
            return result;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}
module.exports = Product;