const {sql , pool}= require("../config/db");

class User {
    static async findbyEmail(email) {
        const conn = await pool;
        const result = await conn.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM dbo.Users WHERE email = @email');

        return result.recordset[0];
    }

    static async create(userData) {
        const conn = await pool;

        const result = await conn.request()
            .input('name', sql.NVarChar(255), userData.name || userData.fullname)
            .input('email', sql.NVarChar(255), userData.email)
            .input('password_hash', sql.NVarChar(255), userData.password_hash)
            .input('phone', sql.NVarChar(50), userData.phone || null)
            .input('address', sql.NVarChar(500), userData.address || null)
            .query('INSERT INTO dbo.Users (name, email, password_hash, phone, address) OUTPUT INSERTED.* VALUES (@name, @email, @password_hash, @phone, @address)');

            return result.recordset[0];
    }
}

module.exports = User;