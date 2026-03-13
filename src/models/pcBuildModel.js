const { sql, pool } = require("../config/db");

class PcBuild {
    static async getProductsByIds(productIds) {
        const conn = await pool;
        const request = conn.request();
        const placeholders = [];

        productIds.forEach((id, idx) => {
            const key = `product_id_${idx}`;
            placeholders.push(`@${key}`);
            request.input(key, sql.Int, id);
        });

        return await request.query(`
            SELECT product_id, name, price, stock_quantity
            FROM dbo.PRODUCT
            WHERE product_id IN (${placeholders.join(",")})
        `);
    }

    static async createPcBuildWithItems(buildData) {
        const conn = await pool;
        const transaction = new sql.Transaction(conn);

        try {
            await transaction.begin();

            const productInsert = await new sql.Request(transaction)
                .input("name", sql.NVarChar(255), buildData.build_name)
                .input("description", sql.NVarChar(sql.MAX), buildData.description || "PC build assembled from selected components")
                .input("price", sql.Decimal(18, 2), buildData.total_price)
                .input("stock_quantity", sql.Int, buildData.stock_quantity || 0)
                .input("image_url", sql.NVarChar(500), buildData.image_url || null)
                .input("category_id", sql.Int, buildData.category_id || null)
                .input("status", sql.NVarChar(50), buildData.status || "Available")
                .input("brand", sql.NVarChar(100), buildData.brand || "Custom Build")
                .query(`
                    INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, image_url, category_id, status, brand)
                    OUTPUT INSERTED.*
                    VALUES (@name, @description, @price, @stock_quantity, @image_url, @category_id, @status, @brand)
                `);

            const createdProduct = productInsert.recordset[0];

            const buildInsert = await new sql.Request(transaction)
                .input("product_id", sql.Int, createdProduct.product_id)
                .input("build_name", sql.NVarChar(255), buildData.build_name)
                .query(`
                    INSERT INTO dbo.PC_Builds (product_id, build_name)
                    OUTPUT INSERTED.*
                    VALUES (@product_id, @build_name)
                `);

            const createdBuild = buildInsert.recordset[0];

            for (const item of buildData.items) {
                await new sql.Request(transaction)
                    .input("pc_build_id", sql.Int, createdBuild.pc_build_id)
                    .input("product_id", sql.Int, item.product_id)
                    .input("quantity", sql.Int, item.quantity)
                    .query(`
                        INSERT INTO dbo.PC_Build_Items (pc_build_id, product_id, quantity)
                        VALUES (@pc_build_id, @product_id, @quantity)
                    `);
            }

            await transaction.commit();

            return {
                build: createdBuild,
                product: createdProduct
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async getAllPcBuilds() {
        const conn = await pool;
        return await conn.request().query(`
            SELECT
                pb.pc_build_id,
                pb.build_name,
                pb.product_id,
                p.price AS total_price,
                p.status,
                p.brand,
                p.stock_quantity,
                p.image_url,
                p.category_id,
                p.created_at,
                (
                    SELECT COUNT(*)
                    FROM dbo.PC_Build_Items pbi
                    WHERE pbi.pc_build_id = pb.pc_build_id
                ) AS item_count
            FROM dbo.PC_Builds pb
            LEFT JOIN dbo.PRODUCT p ON p.product_id = pb.product_id
            ORDER BY pb.pc_build_id DESC
        `);
    }

    static async getPcBuildById(pcBuildId) {
        const conn = await pool;
        return await conn.request()
            .input("pc_build_id", sql.Int, pcBuildId)
            .query(`
                SELECT
                    pb.pc_build_id,
                    pb.build_name,
                    pb.product_id,
                    p.name AS product_name,
                    p.description,
                    p.price AS total_price,
                    p.stock_quantity,
                    p.image_url,
                    p.category_id,
                    p.status,
                    p.brand,
                    p.created_at
                FROM dbo.PC_Builds pb
                LEFT JOIN dbo.PRODUCT p ON p.product_id = pb.product_id
                WHERE pb.pc_build_id = @pc_build_id
            `);
    }

    static async getPcBuildItems(pcBuildId) {
        const conn = await pool;
        return await conn.request()
            .input("pc_build_id", sql.Int, pcBuildId)
            .query(`
                SELECT
                    pbi.pc_build_item_id,
                    pbi.pc_build_id,
                    pbi.product_id,
                    pbi.quantity,
                    p.name AS product_name,
                    p.price AS unit_price
                FROM dbo.PC_Build_Items pbi
                JOIN dbo.PRODUCT p ON p.product_id = pbi.product_id
                WHERE pbi.pc_build_id = @pc_build_id
                ORDER BY pbi.pc_build_item_id ASC
            `);
    }

    static async updatePcBuildWithItems(pcBuildId, buildData) {
        const conn = await pool;
        const transaction = new sql.Transaction(conn);

        try {
            await transaction.begin();

            const existingBuild = await new sql.Request(transaction)
                .input("pc_build_id", sql.Int, pcBuildId)
                .query("SELECT pc_build_id, product_id FROM dbo.PC_Builds WHERE pc_build_id = @pc_build_id");

            if (!existingBuild.recordset[0]) {
                throw new Error("PC build not found");
            }

            const productId = existingBuild.recordset[0].product_id;

            await new sql.Request(transaction)
                .input("pc_build_id", sql.Int, pcBuildId)
                .input("build_name", sql.NVarChar(255), buildData.build_name)
                .query(`
                    UPDATE dbo.PC_Builds
                    SET build_name = @build_name
                    WHERE pc_build_id = @pc_build_id
                `);

            await new sql.Request(transaction)
                .input("pc_build_id", sql.Int, pcBuildId)
                .query("DELETE FROM dbo.PC_Build_Items WHERE pc_build_id = @pc_build_id");

            for (const item of buildData.items) {
                await new sql.Request(transaction)
                    .input("pc_build_id", sql.Int, pcBuildId)
                    .input("product_id", sql.Int, item.product_id)
                    .input("quantity", sql.Int, item.quantity)
                    .query(`
                        INSERT INTO dbo.PC_Build_Items (pc_build_id, product_id, quantity)
                        VALUES (@pc_build_id, @product_id, @quantity)
                    `);
            }

            const updatedProductResult = await new sql.Request(transaction)
                .input("product_id", sql.Int, productId)
                .input("name", sql.NVarChar(255), buildData.build_name)
                .input("description", sql.NVarChar(sql.MAX), buildData.description)
                .input("price", sql.Decimal(18, 2), buildData.total_price)
                .input("stock_quantity", sql.Int, buildData.stock_quantity)
                .input("image_url", sql.NVarChar(500), buildData.image_url)
                .input("category_id", sql.Int, buildData.category_id)
                .input("status", sql.NVarChar(50), buildData.status)
                .input("brand", sql.NVarChar(100), buildData.brand)
                .query(`
                    UPDATE dbo.PRODUCT
                    SET name = @name,
                        description = @description,
                        price = @price,
                        stock_quantity = @stock_quantity,
                        image_url = @image_url,
                        category_id = @category_id,
                        status = @status,
                        brand = @brand
                    OUTPUT INSERTED.*
                    WHERE product_id = @product_id
                `);

            await transaction.commit();

            return {
                product: updatedProductResult.recordset[0],
                product_id: productId
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async deletePcBuild(pcBuildId) {
        const conn = await pool;
        const transaction = new sql.Transaction(conn);

        try {
            await transaction.begin();

            const existingBuild = await new sql.Request(transaction)
                .input("pc_build_id", sql.Int, pcBuildId)
                .query("SELECT pc_build_id, product_id FROM dbo.PC_Builds WHERE pc_build_id = @pc_build_id");

            if (!existingBuild.recordset[0]) {
                throw new Error("PC build not found");
            }

            const productId = existingBuild.recordset[0].product_id;

            await new sql.Request(transaction)
                .input("pc_build_id", sql.Int, pcBuildId)
                .query("DELETE FROM dbo.PC_Build_Items WHERE pc_build_id = @pc_build_id");

            await new sql.Request(transaction)
                .input("pc_build_id", sql.Int, pcBuildId)
                .query("DELETE FROM dbo.PC_Builds WHERE pc_build_id = @pc_build_id");

            if (productId) {
                await new sql.Request(transaction)
                    .input("product_id", sql.Int, productId)
                    .query("DELETE FROM dbo.PRODUCT WHERE product_id = @product_id");
            }

            await transaction.commit();

            return { pc_build_id: pcBuildId, product_id: productId };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async addItem(pcBuildId, item) {
        const conn = await pool;
        const transaction = new sql.Transaction(conn);
        try {
            await transaction.begin();

            const buildResult = await new sql.Request(transaction)
                .input("pc_build_id", sql.Int, pcBuildId)
                .query("SELECT pc_build_id, product_id FROM dbo.PC_Builds WHERE pc_build_id = @pc_build_id");

            if (!buildResult.recordset[0]) throw new Error("PC build not found");
            const linkedProductId = buildResult.recordset[0].product_id;

            const insertResult = await new sql.Request(transaction)
                .input("pc_build_id", sql.Int, pcBuildId)
                .input("product_id", sql.Int, item.product_id)
                .input("quantity", sql.Int, item.quantity)
                .query(`
                    INSERT INTO dbo.PC_Build_Items (pc_build_id, product_id, quantity)
                    OUTPUT INSERTED.*
                    VALUES (@pc_build_id, @product_id, @quantity)
                `);

            const totalResult = await new sql.Request(transaction)
                .input("pc_build_id", sql.Int, pcBuildId)
                .query(`
                    SELECT ISNULL(SUM(p.price * pbi.quantity), 0) AS total_price
                    FROM dbo.PC_Build_Items pbi
                    JOIN dbo.PRODUCT p ON p.product_id = pbi.product_id
                    WHERE pbi.pc_build_id = @pc_build_id
                `);

            const totalPrice = parseFloat(totalResult.recordset[0].total_price || 0);

            await new sql.Request(transaction)
                .input("product_id", sql.Int, linkedProductId)
                .input("price", sql.Decimal(18, 2), totalPrice)
                .query("UPDATE dbo.PRODUCT SET price = @price WHERE product_id = @product_id");

            await transaction.commit();
            return { item: insertResult.recordset[0], new_total_price: totalPrice };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async updateItem(pcBuildId, pcBuildItemId, quantity) {
        const conn = await pool;
        const transaction = new sql.Transaction(conn);
        try {
            await transaction.begin();

            const itemResult = await new sql.Request(transaction)
                .input("pc_build_item_id", sql.Int, pcBuildItemId)
                .query("SELECT pc_build_item_id, pc_build_id FROM dbo.PC_Build_Items WHERE pc_build_item_id = @pc_build_item_id");

            if (!itemResult.recordset[0] || itemResult.recordset[0].pc_build_id !== pcBuildId) {
                throw new Error("PC build item not found");
            }

            const buildResult = await new sql.Request(transaction)
                .input("pc_build_id", sql.Int, pcBuildId)
                .query("SELECT product_id FROM dbo.PC_Builds WHERE pc_build_id = @pc_build_id");

            const linkedProductId = buildResult.recordset[0].product_id;

            const updateResult = await new sql.Request(transaction)
                .input("pc_build_item_id", sql.Int, pcBuildItemId)
                .input("quantity", sql.Int, quantity)
                .query(`
                    UPDATE dbo.PC_Build_Items
                    SET quantity = @quantity
                    OUTPUT INSERTED.*
                    WHERE pc_build_item_id = @pc_build_item_id
                `);

            const totalResult = await new sql.Request(transaction)
                .input("pc_build_id", sql.Int, pcBuildId)
                .query(`
                    SELECT ISNULL(SUM(p.price * pbi.quantity), 0) AS total_price
                    FROM dbo.PC_Build_Items pbi
                    JOIN dbo.PRODUCT p ON p.product_id = pbi.product_id
                    WHERE pbi.pc_build_id = @pc_build_id
                `);

            const totalPrice = parseFloat(totalResult.recordset[0].total_price || 0);

            await new sql.Request(transaction)
                .input("product_id", sql.Int, linkedProductId)
                .input("price", sql.Decimal(18, 2), totalPrice)
                .query("UPDATE dbo.PRODUCT SET price = @price WHERE product_id = @product_id");

            await transaction.commit();
            return { item: updateResult.recordset[0], new_total_price: totalPrice };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async deleteItem(pcBuildId, pcBuildItemId) {
        const conn = await pool;
        const transaction = new sql.Transaction(conn);
        try {
            await transaction.begin();

            const itemResult = await new sql.Request(transaction)
                .input("pc_build_item_id", sql.Int, pcBuildItemId)
                .query("SELECT pc_build_item_id, pc_build_id FROM dbo.PC_Build_Items WHERE pc_build_item_id = @pc_build_item_id");

            if (!itemResult.recordset[0] || itemResult.recordset[0].pc_build_id !== pcBuildId) {
                throw new Error("PC build item not found");
            }

            const buildResult = await new sql.Request(transaction)
                .input("pc_build_id", sql.Int, pcBuildId)
                .query("SELECT product_id FROM dbo.PC_Builds WHERE pc_build_id = @pc_build_id");

            const linkedProductId = buildResult.recordset[0].product_id;

            await new sql.Request(transaction)
                .input("pc_build_item_id", sql.Int, pcBuildItemId)
                .query("DELETE FROM dbo.PC_Build_Items WHERE pc_build_item_id = @pc_build_item_id");

            const totalResult = await new sql.Request(transaction)
                .input("pc_build_id", sql.Int, pcBuildId)
                .query(`
                    SELECT ISNULL(SUM(p.price * pbi.quantity), 0) AS total_price
                    FROM dbo.PC_Build_Items pbi
                    JOIN dbo.PRODUCT p ON p.product_id = pbi.product_id
                    WHERE pbi.pc_build_id = @pc_build_id
                `);

            const totalPrice = parseFloat(totalResult.recordset[0].total_price || 0);

            await new sql.Request(transaction)
                .input("product_id", sql.Int, linkedProductId)
                .input("price", sql.Decimal(18, 2), totalPrice)
                .query("UPDATE dbo.PRODUCT SET price = @price WHERE product_id = @product_id");

            await transaction.commit();
            return { deleted_item_id: pcBuildItemId, new_total_price: totalPrice };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

module.exports = PcBuild;
