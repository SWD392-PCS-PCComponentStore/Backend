const {sql , pool}= require("../config/db");

class User {
    static async findbyEmail(email) {
        const conn = await pool;
        const result = await conn.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM users WHERE email = @email');

        return result.recordset[0];
    }

    static async create(userData) {
        const conn = await pool;

        const result = await conn.request()
            .input('fullname', sql.NVarChar, userData.fullname)
            .input('email', sql.NVarChar, userData.email)
            .input('password_hash', sql.NVarChar, userData.password_hash)
            .input("phone", sql.NVarChar, userData.phone)
            .query('INSERT INTO users (full_name, email, password_hash, phone) OUTPUT INSERTED.* VALUES (@fullname, @email, @password_hash, @phone)');

            return result.recordset[0];
    }
}

module.exports = User;