const { sql, pool } = require("../config/db");

class Supplier {
    static async getAll() {
        const conn = await pool;
        return await conn.request().query("SELECT * FROM dbo.Suppliers");
    }

    static async getById(id) {
        const conn = await pool;
        return await conn.request()
            .input("supplier_id", sql.Int, id)
            .query("SELECT * FROM dbo.Suppliers WHERE supplier_id = @supplier_id");
    }

    static async create(supplierData) {
        const conn = await pool;
        return await conn.request()
            .input("name", sql.NVarChar(255), supplierData.name)
            .input("contact_email", sql.NVarChar(255), supplierData.contact_email || null)
            .input("address", sql.NVarChar(500), supplierData.address || null)
            .query("INSERT INTO dbo.Suppliers (name, contact_email, address) OUTPUT INSERTED.* VALUES (@name, @contact_email, @address)");
    }

    static async update(id, supplierData) {
        const conn = await pool;
        return await conn.request()
            .input("supplier_id", sql.Int, id)
            .input("name", sql.NVarChar(255), supplierData.name)
            .input("contact_email", sql.NVarChar(255), supplierData.contact_email || null)
            .input("address", sql.NVarChar(500), supplierData.address || null)
            .query("UPDATE dbo.Suppliers SET name = @name, contact_email = @contact_email, address = @address WHERE supplier_id = @supplier_id");
    }

    static async delete(id) {
        const conn = await pool;
        return await conn.request()
            .input("supplier_id", sql.Int, id)
            .query("DELETE FROM dbo.Suppliers WHERE supplier_id = @supplier_id");
    }
}

module.exports = Supplier;
