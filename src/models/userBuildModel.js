const { sql, pool } = require("../config/db");

class UserBuild {
    static async getProductsByIds(productIds) {
        const conn = await pool;
        const request = conn.request();
        const placeholders = [];

        productIds.forEach((id, index) => {
            const key = `product_id_${index}`;
            placeholders.push(`@${key}`);
            request.input(key, sql.Int, id);
        });

        return await request.query(`
            SELECT product_id, name, price
            FROM dbo.PRODUCT
            WHERE product_id IN (${placeholders.join(",")})
        `);
    }

    static async createUserBuildWithItems({ userId, buildName, totalPrice, items }) {
        const conn = await pool;
        const transaction = new sql.Transaction(conn);

        try {
            await transaction.begin();

            const buildResult = await new sql.Request(transaction)
                .input("user_id", sql.Int, userId)
                .input("build_name", sql.NVarChar(255), buildName)
                .input("total_price", sql.Decimal(18, 2), totalPrice)
                .query(`
                    INSERT INTO dbo.UserBuilds (user_id, build_name, total_price)
                    OUTPUT INSERTED.*
                    VALUES (@user_id, @build_name, @total_price)
                `);

            const build = buildResult.recordset[0];

            for (const item of items) {
                await new sql.Request(transaction)
                    .input("user_build_id", sql.Int, build.user_build_id)
                    .input("product_id", sql.Int, item.product_id)
                    .input("quantity", sql.Int, item.quantity)
                    .query(`
                        INSERT INTO dbo.UserBuildItems (user_build_id, product_id, quantity)
                        VALUES (@user_build_id, @product_id, @quantity)
                    `);
            }

            await transaction.commit();
            return build;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async recalculateTotalPrice(transaction, userBuildId) {
        const totalResult = await new sql.Request(transaction)
            .input("user_build_id", sql.Int, userBuildId)
            .query(`
                SELECT ISNULL(SUM(p.price * ubi.quantity), 0) AS total_price
                FROM dbo.UserBuildItems ubi
                JOIN dbo.PRODUCT p ON p.product_id = ubi.product_id
                WHERE ubi.user_build_id = @user_build_id
            `);

        const totalPrice = parseFloat(totalResult.recordset[0].total_price || 0);

        await new sql.Request(transaction)
            .input("user_build_id", sql.Int, userBuildId)
            .input("total_price", sql.Decimal(18, 2), totalPrice)
            .query(`
                UPDATE dbo.UserBuilds
                SET total_price = @total_price
                WHERE user_build_id = @user_build_id
            `);

        return totalPrice;
    }

    static async getUserBuildsByUserId(userId) {
        const conn = await pool;
        return await conn.request()
            .input("user_id", sql.Int, userId)
            .query(`
                SELECT
                    ub.user_build_id,
                    ub.user_id,
                    ub.build_name,
                    ub.total_price,
                    ub.build_source,
                    ub.created_at,
                    (
                        SELECT COUNT(*)
                        FROM dbo.UserBuildItems ubi
                        WHERE ubi.user_build_id = ub.user_build_id
                    ) AS item_count
                FROM dbo.UserBuilds ub
                WHERE ub.user_id = @user_id
                ORDER BY ub.user_build_id DESC
            `);
    }

    static async getUserBuildById(userBuildId) {
        const conn = await pool;
        return await conn.request()
            .input("user_build_id", sql.Int, userBuildId)
            .query(`
                SELECT
                    user_build_id,
                    user_id,
                    build_name,
                    total_price,
                    build_source,
                    created_at
                FROM dbo.UserBuilds
                WHERE user_build_id = @user_build_id
            `);
    }

    static async getUserBuildItems(userBuildId) {
        const conn = await pool;
        return await conn.request()
            .input("user_build_id", sql.Int, userBuildId)
            .query(`
                SELECT
                    ubi.user_build_item_id,
                    ubi.user_build_id,
                    ubi.product_id,
                    ubi.quantity,
                    p.name AS product_name,
                    p.price AS unit_price
                FROM dbo.UserBuildItems ubi
                JOIN dbo.PRODUCT p ON p.product_id = ubi.product_id
                WHERE ubi.user_build_id = @user_build_id
                ORDER BY ubi.user_build_item_id ASC
            `);
    }

    static async updateUserBuildWithItems(userBuildId, { buildName, totalPrice, items }) {
        const conn = await pool;
        const transaction = new sql.Transaction(conn);

        try {
            await transaction.begin();

            const existingResult = await new sql.Request(transaction)
                .input("user_build_id", sql.Int, userBuildId)
                .query("SELECT user_build_id FROM dbo.UserBuilds WHERE user_build_id = @user_build_id");

            if (!existingResult.recordset[0]) {
                throw new Error("User build not found");
            }

            await new sql.Request(transaction)
                .input("user_build_id", sql.Int, userBuildId)
                .input("build_name", sql.NVarChar(255), buildName)
                .input("total_price", sql.Decimal(18, 2), totalPrice)
                .query(`
                    UPDATE dbo.UserBuilds
                    SET build_name = @build_name,
                        total_price = @total_price
                    WHERE user_build_id = @user_build_id
                `);

            await new sql.Request(transaction)
                .input("user_build_id", sql.Int, userBuildId)
                .query("DELETE FROM dbo.UserBuildItems WHERE user_build_id = @user_build_id");

            for (const item of items) {
                await new sql.Request(transaction)
                    .input("user_build_id", sql.Int, userBuildId)
                    .input("product_id", sql.Int, item.product_id)
                    .input("quantity", sql.Int, item.quantity)
                    .query(`
                        INSERT INTO dbo.UserBuildItems (user_build_id, product_id, quantity)
                        VALUES (@user_build_id, @product_id, @quantity)
                    `);
            }

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async deleteUserBuild(userBuildId) {
        const conn = await pool;
        const transaction = new sql.Transaction(conn);

        try {
            await transaction.begin();

            const existingResult = await new sql.Request(transaction)
                .input("user_build_id", sql.Int, userBuildId)
                .query("SELECT user_build_id FROM dbo.UserBuilds WHERE user_build_id = @user_build_id");

            if (!existingResult.recordset[0]) {
                throw new Error("User build not found");
            }

            await new sql.Request(transaction)
                .input("user_build_id", sql.Int, userBuildId)
                .query("DELETE FROM dbo.UserBuildItems WHERE user_build_id = @user_build_id");

            await new sql.Request(transaction)
                .input("user_build_id", sql.Int, userBuildId)
                .query("DELETE FROM dbo.UserBuilds WHERE user_build_id = @user_build_id");

            await transaction.commit();
            return { user_build_id: userBuildId };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async addItem(userBuildId, item) {
        const conn = await pool;
        const transaction = new sql.Transaction(conn);

        try {
            await transaction.begin();

            const buildResult = await new sql.Request(transaction)
                .input("user_build_id", sql.Int, userBuildId)
                .query("SELECT user_build_id FROM dbo.UserBuilds WHERE user_build_id = @user_build_id");

            if (!buildResult.recordset[0]) {
                throw new Error("User build not found");
            }

            const insertResult = await new sql.Request(transaction)
                .input("user_build_id", sql.Int, userBuildId)
                .input("product_id", sql.Int, item.product_id)
                .input("quantity", sql.Int, item.quantity)
                .query(`
                    INSERT INTO dbo.UserBuildItems (user_build_id, product_id, quantity)
                    OUTPUT INSERTED.*
                    VALUES (@user_build_id, @product_id, @quantity)
                `);

            const newTotalPrice = await this.recalculateTotalPrice(transaction, userBuildId);

            await transaction.commit();
            return {
                item: insertResult.recordset[0],
                new_total_price: newTotalPrice
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async updateItem(userBuildId, userBuildItemId, quantity) {
        const conn = await pool;
        const transaction = new sql.Transaction(conn);

        try {
            await transaction.begin();

            const itemResult = await new sql.Request(transaction)
                .input("user_build_item_id", sql.Int, userBuildItemId)
                .query("SELECT user_build_item_id, user_build_id FROM dbo.UserBuildItems WHERE user_build_item_id = @user_build_item_id");

            if (!itemResult.recordset[0] || itemResult.recordset[0].user_build_id !== userBuildId) {
                throw new Error("User build item not found");
            }

            const updatedItem = await new sql.Request(transaction)
                .input("user_build_item_id", sql.Int, userBuildItemId)
                .input("quantity", sql.Int, quantity)
                .query(`
                    UPDATE dbo.UserBuildItems
                    SET quantity = @quantity
                    OUTPUT INSERTED.*
                    WHERE user_build_item_id = @user_build_item_id
                `);

            const newTotalPrice = await this.recalculateTotalPrice(transaction, userBuildId);

            await transaction.commit();
            return {
                item: updatedItem.recordset[0],
                new_total_price: newTotalPrice
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async deleteItem(userBuildId, userBuildItemId) {
        const conn = await pool;
        const transaction = new sql.Transaction(conn);

        try {
            await transaction.begin();

            const itemResult = await new sql.Request(transaction)
                .input("user_build_item_id", sql.Int, userBuildItemId)
                .query("SELECT user_build_item_id, user_build_id FROM dbo.UserBuildItems WHERE user_build_item_id = @user_build_item_id");

            if (!itemResult.recordset[0] || itemResult.recordset[0].user_build_id !== userBuildId) {
                throw new Error("User build item not found");
            }

            await new sql.Request(transaction)
                .input("user_build_item_id", sql.Int, userBuildItemId)
                .query("DELETE FROM dbo.UserBuildItems WHERE user_build_item_id = @user_build_item_id");

            const newTotalPrice = await this.recalculateTotalPrice(transaction, userBuildId);

            await transaction.commit();
            return {
                deleted_item_id: userBuildItemId,
                new_total_price: newTotalPrice
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

module.exports = UserBuild;
