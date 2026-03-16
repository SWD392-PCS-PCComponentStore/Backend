const { sql, pool } = require('../config/db');

class StaffBuildRequest {
    static async getAll(filters = {}) {
        const conn = await pool;
        const request = conn.request();

        const whereClauses = [];

        if (filters.status) {
            whereClauses.push('sbr.status = @status');
            request.input('status', sql.VarChar(50), filters.status);
        }

        if (Number.isInteger(filters.user_id)) {
            whereClauses.push('sbr.user_id = @user_id');
            request.input('user_id', sql.Int, filters.user_id);
        }

        if (Number.isInteger(filters.staff_id)) {
            whereClauses.push('sbr.staff_id = @staff_id');
            request.input('staff_id', sql.Int, filters.staff_id);
        }

        const whereSql = whereClauses.length
            ? `WHERE ${whereClauses.join(' AND ')}`
            : '';

        return await request.query(`
            SELECT
                sbr.request_id,
                sbr.user_id,
                customer_user.name AS customer_name,
                customer_user.email AS customer_email,
                sbr.staff_id,
                staff_user.name AS staff_name,
                staff_user.email AS staff_email,
                sbr.customer_note,
                sbr.budget_range,
                sbr.status,
                sbr.user_build_id,
                ub.build_name,
                ub.total_price,
                sbr.created_at
            FROM dbo.STAFF_BUILD_REQUESTS sbr
            LEFT JOIN dbo.USERS customer_user ON customer_user.user_id = sbr.user_id
            LEFT JOIN dbo.USERS staff_user ON staff_user.user_id = sbr.staff_id
            LEFT JOIN dbo.UserBuilds ub ON ub.user_build_id = sbr.user_build_id
            ${whereSql}
            ORDER BY sbr.request_id DESC
        `);
    }

    static async getById(id) {
        const conn = await pool;
        return await conn.request()
            .input('request_id', sql.Int, id)
            .query(`
                SELECT
                    sbr.request_id,
                    sbr.user_id,
                    customer_user.name AS customer_name,
                    customer_user.email AS customer_email,
                    sbr.staff_id,
                    staff_user.name AS staff_name,
                    staff_user.email AS staff_email,
                    sbr.customer_note,
                    sbr.budget_range,
                    sbr.status,
                    sbr.user_build_id,
                    ub.build_name,
                    ub.total_price,
                    sbr.created_at
                FROM dbo.STAFF_BUILD_REQUESTS sbr
                LEFT JOIN dbo.USERS customer_user ON customer_user.user_id = sbr.user_id
                LEFT JOIN dbo.USERS staff_user ON staff_user.user_id = sbr.staff_id
                LEFT JOIN dbo.UserBuilds ub ON ub.user_build_id = sbr.user_build_id
                WHERE sbr.request_id = @request_id
            `);
    }

    static async create(data) {
        const conn = await pool;
        return await conn.request()
            .input('user_id', sql.Int, data.user_id)
            .input('staff_id', sql.Int, data.staff_id || null)
            .input('customer_note', sql.NVarChar(sql.MAX), data.customer_note || null)
            .input('budget_range', sql.Decimal(18, 2), data.budget_range || null)
            .input('status', sql.VarChar(50), data.status)
            .input('user_build_id', sql.Int, data.user_build_id || null)
            .query(`
                INSERT INTO dbo.STAFF_BUILD_REQUESTS (
                    user_id,
                    staff_id,
                    customer_note,
                    budget_range,
                    status,
                    user_build_id
                )
                OUTPUT INSERTED.*
                VALUES (
                    @user_id,
                    @staff_id,
                    @customer_note,
                    @budget_range,
                    @status,
                    @user_build_id
                )
            `);
    }

    static async createFromCustomer(data) {
        const conn = await pool;
        return await conn.request()
            .input('user_id', sql.Int, data.user_id)
            .input('customer_note', sql.NVarChar(sql.MAX), data.customer_note)
            .input('budget_range', sql.Decimal(18, 2), data.budget_range)
            .query(`
                INSERT INTO dbo.STAFF_BUILD_REQUESTS (
                    user_id,
                    customer_note,
                    budget_range,
                    status
                )
                OUTPUT INSERTED.*
                VALUES (
                    @user_id,
                    @customer_note,
                    @budget_range,
                    'pending'
                )
            `);
    }

    static async update(id, data) {
        const conn = await pool;
        return await conn.request()
            .input('request_id', sql.Int, id)
            .input('user_id', sql.Int, data.user_id)
            .input('staff_id', sql.Int, data.staff_id || null)
            .input('customer_note', sql.NVarChar(sql.MAX), data.customer_note || null)
            .input('budget_range', sql.Decimal(18, 2), data.budget_range || null)
            .input('status', sql.VarChar(50), data.status)
            .input('user_build_id', sql.Int, data.user_build_id || null)
            .query(`
                UPDATE dbo.STAFF_BUILD_REQUESTS
                SET user_id = @user_id,
                    staff_id = @staff_id,
                    customer_note = @customer_note,
                    budget_range = @budget_range,
                    status = @status,
                    user_build_id = @user_build_id
                WHERE request_id = @request_id
            `);
    }

    static async delete(id) {
        const conn = await pool;
        return await conn.request()
            .input('request_id', sql.Int, id)
            .query('DELETE FROM dbo.STAFF_BUILD_REQUESTS WHERE request_id = @request_id');
    }

    static async assignToStaff(id, staffId) {
        const conn = await pool;
        return await conn.request()
            .input('request_id', sql.Int, id)
            .input('staff_id', sql.Int, staffId)
            .query(`
                UPDATE dbo.STAFF_BUILD_REQUESTS
                SET staff_id = @staff_id,
                    status = CASE
                        WHEN status = 'pending' THEN 'assigned'
                        WHEN status = 'assigned' THEN 'assigned'
                        ELSE status
                    END
                WHERE request_id = @request_id
            `);
    }

    static async submitBuild(id, staffId, userBuildId) {
        const conn = await pool;
        return await conn.request()
            .input('request_id', sql.Int, id)
            .input('staff_id', sql.Int, staffId)
            .input('user_build_id', sql.Int, userBuildId)
            .query(`
                UPDATE dbo.STAFF_BUILD_REQUESTS
                SET staff_id = @staff_id,
                    user_build_id = @user_build_id,
                    status = 'completed'
                WHERE request_id = @request_id
            `);
    }
}

module.exports = StaffBuildRequest;
