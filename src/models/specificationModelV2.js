const { sql, pool } = require("../config/db");

class SpecificationV2 {
  /**
   * Create JSON specs for a product
   * @param {number} productId
   * @param {string} category - Category name (CPU, GPU, MAINBOARD, etc.)
   * @param {object} specs - Structured specs object
   * @returns {Promise<object>} - Created spec record
   */
  static async createJsonSpecs(productId, category, specs) {
    const conn = await pool;
    const specsJson = JSON.stringify(specs);

    return await conn
      .request()
      .input("product_id", sql.Int, productId)
      .input("specs_json", sql.NVarChar(sql.MAX), specsJson)
      .query(`
        UPDATE dbo.PRODUCT 
        SET specs_json = @specs_json 
        WHERE product_id = @product_id;
        
        SELECT product_id, name, price, category_id, specs_json 
        FROM dbo.PRODUCT 
        WHERE product_id = @product_id
      `);
  }

  /**
   * Get JSON specs for a product
   */
  static async getJsonSpecsByProductId(productId) {
    const conn = await pool;
    return await conn
      .request()
      .input("product_id", sql.Int, productId)
      .query(`
        SELECT product_id, specs_json 
        FROM dbo.PRODUCT 
        WHERE product_id = @product_id
      `);
  }

  /**
   * Update JSON specs for a product
   */
  static async updateJsonSpecs(productId, specs) {
    const conn = await pool;
    const specsJson = JSON.stringify(specs);

    return await conn
      .request()
      .input("product_id", sql.Int, productId)
      .input("specs_json", sql.NVarChar(sql.MAX), specsJson)
      .query(`
        UPDATE dbo.PRODUCT 
        SET specs_json = @specs_json 
        WHERE product_id = @product_id;
        
        SELECT product_id, name, price, category_id, specs_json 
        FROM dbo.PRODUCT 
        WHERE product_id = @product_id
      `);
  }

  /**
   * Delete JSON specs for a product
   */
  static async deleteJsonSpecs(productId) {
    const conn = await pool;
    return await conn
      .request()
      .input("product_id", sql.Int, productId)
      .query(`
        UPDATE dbo.PRODUCT 
        SET specs_json = NULL 
        WHERE product_id = @product_id
      `);
  }

  /**
   * Get all products with their JSON specs by category.
   * Accepts either a numeric category_id OR a category name string (e.g. "cpu", "VGA").
   * Name matching is case-insensitive and also handles aliases:
   *   "gpu" → "VGA", "cooler_cpu" → "Cooler", "case" → "Case"
   */
  static async getAllSpecsByCategory(categoryIdOrName) {
    const conn = await pool;

    // If it's a number (or numeric string), query by category_id directly
    if (!isNaN(categoryIdOrName) && categoryIdOrName !== "") {
      return (
        await conn
          .request()
          .input("category_id", sql.Int, parseInt(categoryIdOrName))
          .query(`
            SELECT p.product_id AS PRODUCT_ID, p.name AS PRODUCT_NAME, p.price AS PRODUCT_PRICE,
                   p.category_id, p.brand, p.specs_json
            FROM dbo.PRODUCT p
            WHERE p.category_id = @category_id AND p.specs_json IS NOT NULL
            ORDER BY p.product_id
          `)
      ).recordset;
    }

    // Map common aliases to canonical category names
    const ALIAS_MAP = {
      cpu: "CPU",
      gpu: "VGA",
      vga: "VGA",
      mainboard: "Mainboard",
      motherboard: "Mainboard",
      ram: "RAM",
      memory: "RAM",
      storage: "Storage",
      ssd: "Storage",
      hdd: "Storage",
      psu: "PSU",
      power: "PSU",
      cooler: "Cooler",
      cooler_cpu: "Cooler",
      case: "Case",
      chassis: "Case",
    };

    const normalizedName = ALIAS_MAP[String(categoryIdOrName).toLowerCase()] || categoryIdOrName;

    const result = await conn
      .request()
      .input("cat_name", sql.NVarChar(255), normalizedName)
      .query(`
        SELECT p.product_id AS PRODUCT_ID, p.name AS PRODUCT_NAME, p.price AS PRODUCT_PRICE,
               p.category_id, p.brand, p.specs_json
        FROM dbo.PRODUCT p
        INNER JOIN dbo.CATEGORY c ON p.category_id = c.category_id
        WHERE c.name = @cat_name AND p.specs_json IS NOT NULL
        ORDER BY p.product_id
      `);

    return result.recordset;
  }

  /**
   * Search products by JSON spec value (advanced)
   * Example: Find all CPUs with cores >= 16
   */
  static async searchBySpec(categoryId, specValue) {
    // This is for simple string matching in specs_json
    // For complex queries, consider using JSON_VALUE or JSON_QUERY in MSSQL
    const conn = await pool;
    return await conn
      .request()
      .input("category_id", sql.Int, categoryId)
      .input("spec_value", sql.NVarChar(255), `%${specValue}%`)
      .query(`
        SELECT p.product_id, p.name, p.price, p.specs_json
        FROM dbo.PRODUCT p
        WHERE p.category_id = @category_id 
        AND p.specs_json LIKE @spec_value
        ORDER BY p.price ASC
      `);
  }

  // ==================== BACKWARD COMPATIBILITY ====================
  // Keep old PRODUCT_SPEC methods for gradual migration

  static async create(specData) {
    const conn = await pool;
    return await conn
      .request()
      .input("product_id", sql.Int, specData.product_id)
      .input("spec_name", sql.NVarChar(255), specData.spec_name)
      .input("spec_value", sql.NVarChar(255), specData.spec_value)
      .query(`
        INSERT INTO dbo.PRODUCT_SPEC (product_id, spec_name, spec_value) 
        OUTPUT INSERTED.* 
        VALUES (@product_id, @spec_name, @spec_value)
      `);
  }

  static async getByProductId(productId) {
    const conn = await pool;
    return await conn
      .request()
      .input("product_id", sql.Int, productId)
      .query(`
        SELECT * FROM dbo.PRODUCT_SPEC WHERE product_id = @product_id
      `);
  }

  static async getById(specId) {
    const conn = await pool;
    return await conn
      .request()
      .input("spec_id", sql.Int, specId)
      .query(`
        SELECT * FROM dbo.PRODUCT_SPEC WHERE spec_id = @spec_id
      `);
  }

  static async update(specId, specData) {
    const conn = await pool;
    return await conn
      .request()
      .input("spec_id", sql.Int, specId)
      .input("spec_name", sql.NVarChar(255), specData.spec_name)
      .input("spec_value", sql.NVarChar(255), specData.spec_value)
      .query(`
        UPDATE dbo.PRODUCT_SPEC
        SET spec_name = @spec_name,
            spec_value = @spec_value
        WHERE spec_id = @spec_id
      `);
  }

  static async delete(specId) {
    const conn = await pool;
    return await conn
      .request()
      .input("spec_id", sql.Int, specId)
      .query(`
        DELETE FROM dbo.PRODUCT_SPEC WHERE spec_id = @spec_id
      `);
  }
}

module.exports = SpecificationV2;
