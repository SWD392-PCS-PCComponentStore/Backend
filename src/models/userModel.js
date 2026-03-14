const {sql , pool}= require("../config/db");

class User {
    static async findAll() {
        const conn = await pool;
        const result = await conn.request().query('SELECT * FROM dbo.USERS ORDER BY user_id DESC');
        return result.recordset;
    }

    static async findById(userId) {
        const conn = await pool;
        const result = await conn.request()
            .input('user_id', sql.Int, userId)
            .query('SELECT * FROM dbo.USERS WHERE user_id = @user_id');

        return result.recordset[0];
    }

    static async findbyEmail(email) {
        const conn = await pool;
        const result = await conn.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM dbo.USERS WHERE email = @email');

        return result.recordset[0];
    }

    static async create(userData) {
        const conn = await pool;

        const result = await conn.request()
            .input('name', sql.NVarChar(255), userData.name || userData.fullname)
            .input('email', sql.NVarChar(255), userData.email)
            .input('password', sql.NVarChar(255), userData.password)
            .input('role', sql.VarChar(50), userData.role || 'customer')
            .input('status', sql.VarChar(20), userData.status || 'active')
            .input('phone', sql.NVarChar(50), userData.phone || null)
            .input('address', sql.NVarChar(500), userData.address || null)
            .input('avatar', sql.NVarChar(500), userData.avatar || null)
            .query(`
                INSERT INTO dbo.USERS (name, email, password, role, status, phone, address, avatar)
                OUTPUT INSERTED.*
                VALUES (@name, @email, @password, @role, @status, @phone, @address, @avatar)
            `);

            return result.recordset[0];
    }

    static async update(userId, userData) {
        const conn = await pool;

        const result = await conn.request()
            .input('user_id', sql.Int, userId)
            .input('name', sql.NVarChar(255), userData.name)
            .input('email', sql.NVarChar(255), userData.email)
            .input('password', sql.NVarChar(255), userData.password)
            .input('role', sql.VarChar(50), userData.role)
            .input('status', sql.VarChar(20), userData.status)
            .input('phone', sql.NVarChar(50), userData.phone)
            .input('address', sql.NVarChar(sql.MAX), userData.address)
            .input('avatar', sql.NVarChar(500), userData.avatar)
            .query(`
                UPDATE dbo.USERS
                SET name = @name,
                    email = @email,
                    password = @password,
                    role = @role,
                    status = @status,
                    phone = @phone,
                    address = @address,
                    avatar = @avatar
                OUTPUT INSERTED.*
                WHERE user_id = @user_id
            `);

        return result.recordset[0];
    }

    static async deleteById(userId) {
        const conn = await pool;
        const result = await conn.request()
            .input('user_id', sql.Int, userId)
            .query(`
                DELETE FROM dbo.USERS
                OUTPUT DELETED.user_id
                WHERE user_id = @user_id
            `);

        return result.recordset[0];
    }
}

module.exports = User;