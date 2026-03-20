const { sql, pool } = require("../config/db");

/**
 * Coerce string value from PRODUCT_SPEC to proper JS type
 * e.g. "24" → 24, "true" → true, '["AM5","LGA1700"]' → array
 */
function coerceValue(value) {
  if (value === null || value === undefined) return null;
  if (value === "true") return true;
  if (value === "false") return false;
  if (value !== "" && !isNaN(value)) return Number(value);
  try { return JSON.parse(value); } catch { return value; }
}

/**
 * Pivot flat PRODUCT_SPEC rows (one row per spec) into array of product objects.
 * Returns same shape as before: [{ PRODUCT_ID, PRODUCT_NAME, PRODUCT_PRICE, category_id, brand, specs_json }]
 * autoBuildService reads specs_json and parses it — no changes needed there.
 */
function pivotRows(rows) {
  const map = new Map();
  for (const row of rows) {
    if (!map.has(row.PRODUCT_ID)) {
      map.set(row.PRODUCT_ID, {
        PRODUCT_ID: row.PRODUCT_ID,
        PRODUCT_NAME: row.PRODUCT_NAME,
        PRODUCT_PRICE: row.PRODUCT_PRICE,
        category_id: row.category_id,
        brand: row.brand,
        _specs: {},
      });
    }
    if (row.spec_name) {
      map.get(row.PRODUCT_ID)._specs[row.spec_name] = coerceValue(row.spec_value);
    }
  }

  const result = [];
  for (const p of map.values()) {
    const hasSpecs = Object.keys(p._specs).length > 0;
    if (!hasSpecs) continue;
    const { _specs, ...rest } = p;
    result.push({ ...rest, specs_json: JSON.stringify(_specs) });
  }
  return result;
}

class SpecificationV2 {
  /**
   * Upsert specs for a product — DELETE existing rows then INSERT new key-value rows
   * into PRODUCT_SPEC. Does NOT touch specs_json column (no longer used).
   */
  static async createJsonSpecs(productId, _category, specs) {
    const conn = await pool;

    // Remove old specs for this product
    await conn
      .request()
      .input("product_id", sql.Int, productId)
      .query("DELETE FROM dbo.PRODUCT_SPEC WHERE product_id = @product_id");

    // Insert each field as a separate row
    for (const [specName, specValue] of Object.entries(specs)) {
      const valueStr =
        Array.isArray(specValue) || (typeof specValue === "object" && specValue !== null)
          ? JSON.stringify(specValue)
          : String(specValue);

      await conn
        .request()
        .input("product_id", sql.Int, productId)
        .input("spec_name", sql.NVarChar(255), specName)
        .input("spec_value", sql.NVarChar(sql.MAX), valueStr)
        .query(
          "INSERT INTO dbo.PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES (@product_id, @spec_name, @spec_value)"
        );
    }

    // Return product info in shape expected by specificationServiceV2
    const result = await conn
      .request()
      .input("product_id", sql.Int, productId)
      .query(
        "SELECT product_id, name, price, category_id FROM dbo.PRODUCT WHERE product_id = @product_id"
      );

    return {
      recordset: [{ ...result.recordset[0], specs_json: JSON.stringify(specs) }],
    };
  }

  /**
   * Get specs for a product — reads from PRODUCT_SPEC and returns as specs_json string
   */
  static async getJsonSpecsByProductId(productId) {
    const conn = await pool;
    const result = await conn
      .request()
      .input("product_id", sql.Int, productId)
      .query(
        "SELECT spec_name, spec_value FROM dbo.PRODUCT_SPEC WHERE product_id = @product_id"
      );

    const specs = {};
    for (const row of result.recordset) {
      specs[row.spec_name] = coerceValue(row.spec_value);
    }

    return {
      recordset: [
        {
          product_id: productId,
          specs_json: Object.keys(specs).length > 0 ? JSON.stringify(specs) : null,
        },
      ],
    };
  }

  /**
   * Update specs — same as create (upsert)
   */
  static async updateJsonSpecs(productId, specs) {
    return this.createJsonSpecs(productId, null, specs);
  }

  /**
   * Delete all specs for a product from PRODUCT_SPEC
   */
  static async deleteJsonSpecs(productId) {
    const conn = await pool;
    await conn
      .request()
      .input("product_id", sql.Int, productId)
      .query("DELETE FROM dbo.PRODUCT_SPEC WHERE product_id = @product_id");
  }

  /**
   * Get all products with their specs by category.
   * Accepts either a numeric category_id OR a category name string (e.g. "cpu", "VGA").
   * Reads from PRODUCT_SPEC (not specs_json column).
   * Returns: [{ PRODUCT_ID, PRODUCT_NAME, PRODUCT_PRICE, category_id, brand, specs_json }]
   */
  static async getAllSpecsByCategory(categoryIdOrName) {
    const conn = await pool;

    if (!isNaN(categoryIdOrName) && categoryIdOrName !== "") {
      const result = await conn
        .request()
        .input("category_id", sql.Int, parseInt(categoryIdOrName))
        .query(`
          SELECT p.product_id  AS PRODUCT_ID,
                 p.name        AS PRODUCT_NAME,
                 p.price       AS PRODUCT_PRICE,
                 p.category_id,
                 p.brand,
                 ps.spec_name,
                 ps.spec_value
          FROM dbo.PRODUCT p
          INNER JOIN dbo.PRODUCT_SPEC ps ON p.product_id = ps.product_id
          WHERE p.category_id = @category_id
          ORDER BY p.product_id
        `);
      return pivotRows(result.recordset);
    }

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

    const normalizedName =
      ALIAS_MAP[String(categoryIdOrName).toLowerCase()] || categoryIdOrName;

    const result = await conn
      .request()
      .input("cat_name", sql.NVarChar(255), normalizedName)
      .query(`
        SELECT p.product_id  AS PRODUCT_ID,
               p.name        AS PRODUCT_NAME,
               p.price       AS PRODUCT_PRICE,
               p.category_id,
               p.brand,
               ps.spec_name,
               ps.spec_value
        FROM dbo.PRODUCT p
        INNER JOIN dbo.CATEGORY c  ON p.category_id = c.category_id
        INNER JOIN dbo.PRODUCT_SPEC ps ON p.product_id = ps.product_id
        WHERE c.name = @cat_name
        ORDER BY p.product_id
      `);

    return pivotRows(result.recordset);
  }

  /**
   * Search products by spec value
   */
  static async searchBySpec(categoryId, specValue) {
    const conn = await pool;
    return await conn
      .request()
      .input("category_id", sql.Int, categoryId)
      .input("spec_value", sql.NVarChar(255), `%${specValue}%`)
      .query(`
        SELECT DISTINCT p.product_id, p.name, p.price
        FROM dbo.PRODUCT p
        INNER JOIN dbo.PRODUCT_SPEC ps ON p.product_id = ps.product_id
        WHERE p.category_id = @category_id
          AND ps.spec_value LIKE @spec_value
        ORDER BY p.price ASC
      `);
  }

  // ==================== BACKWARD COMPATIBILITY (PRODUCT_SPEC - unchanged) ====================

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
      .query("SELECT * FROM dbo.PRODUCT_SPEC WHERE product_id = @product_id");
  }

  static async getById(specId) {
    const conn = await pool;
    return await conn
      .request()
      .input("spec_id", sql.Int, specId)
      .query("SELECT * FROM dbo.PRODUCT_SPEC WHERE spec_id = @spec_id");
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
        SET spec_name  = @spec_name,
            spec_value = @spec_value
        WHERE spec_id = @spec_id
      `);
  }

  static async delete(specId) {
    const conn = await pool;
    return await conn
      .request()
      .input("spec_id", sql.Int, specId)
      .query("DELETE FROM dbo.PRODUCT_SPEC WHERE spec_id = @spec_id");
  }
}

module.exports = SpecificationV2;
