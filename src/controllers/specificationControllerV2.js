const specificationServiceV2 = require("../services/specificationServiceV2");

/**
 * Get spec schema by category
 * GET /api/specifications/schema/:category
 */
exports.getSchema = async (req, res) => {
  try {
    const { category } = req.params;
    const schema = specificationServiceV2.getSpecSchema(category.toUpperCase());

    res.json({
      success: true,
      category: category.toUpperCase(),
      schema
    });
  } catch (error) {
    console.error("Get schema error:", error);
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get all available schemas
 * GET /api/specifications/schemas
 */
exports.getAllSchemas = async (req, res) => {
  try {
    const schemas = specificationServiceV2.getAllSchemasInfo();

    res.json({
      success: true,
      categories: schemas.length,
      data: schemas
    });
  } catch (error) {
    console.error("Get all schemas error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

/**
 * Validate specs without saving
 * POST /api/specifications/validate
 * Body: { category, specs: {...} }
 */
exports.validateSpecs = async (req, res) => {
  try {
    const { category, specs } = req.body;

    if (!category || !specs) {
      return res.status(400).json({
        success: false,
        error: "category and specs are required"
      });
    }

    const validation = specificationServiceV2.validateSpecsOnly(
      category.toUpperCase(),
      specs
    );

    res.json({
      success: validation.valid,
      valid: validation.valid,
      errors: validation.errors
    });
  } catch (error) {
    console.error("Validate specs error:", error);
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Create/Update JSON specs for a product
 * POST /api/specifications/json
 * Body: { product_id, category, specs: {...} }
 */
exports.upsertJsonSpecs = async (req, res) => {
  try {
    const { product_id, category, specs } = req.body;

    if (!product_id || !category || !specs) {
      return res.status(400).json({
        success: false,
        error: "product_id, category and specs are required"
      });
    }

    const result = await specificationServiceV2.upsertJsonSpecs(
      product_id,
      category.toUpperCase(),
      specs
    );

    res.status(201).json({
      success: true,
      message: "Specs created/updated successfully",
      data: result
    });
  } catch (error) {
    console.error("Upsert specs error:", error);
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get JSON specs for a product
 * GET /api/specifications/json/:product_id
 */
exports.getJsonSpecs = async (req, res) => {
  try {
    const { product_id } = req.params;

    const result = await specificationServiceV2.getJsonSpecs(
      parseInt(product_id)
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Get specs error:", error);
    return res.status(404).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Update JSON specs for a product
 * PATCH /api/specifications/json/:product_id
 * Body: { specs: {...} }
 */
exports.updateJsonSpecs = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { specs } = req.body;

    if (!specs) {
      return res.status(400).json({
        success: false,
        error: "specs object is required"
      });
    }

    const result = await specificationServiceV2.updateJsonSpecs(
      parseInt(product_id),
      specs
    );

    res.json({
      success: true,
      message: "Specs updated successfully",
      data: result
    });
  } catch (error) {
    console.error("Update specs error:", error);
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Delete JSON specs for a product
 * DELETE /api/specifications/json/:product_id
 */
exports.deleteJsonSpecs = async (req, res) => {
  try {
    const { product_id } = req.params;

    const result = await specificationServiceV2.deleteJsonSpecs(
      parseInt(product_id)
    );

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error("Delete specs error:", error);
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get all products with specs in a category
 * GET /api/specifications/category/:category_id
 */
exports.getAllSpecsByCategory = async (req, res) => {
  try {
    const { category_id } = req.params;

    const result = await specificationServiceV2.getAllSpecsByCategory(
      parseInt(category_id)
    );

    res.json({
      success: true,
      total: result.length,
      data: result
    });
  } catch (error) {
    console.error("Get category specs error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// ==================== BACKWARD COMPATIBILITY ====================

/**
 * Create traditional spec (PRODUCT_SPEC)
 * POST /api/specifications/traditional
 */
exports.createTraditionalSpec = async (req, res) => {
  try {
    const { product_id, spec_name, spec_value } = req.body;

    if (!product_id || !spec_name || !spec_value) {
      return res.status(400).json({
        success: false,
        error: "product_id, spec_name and spec_value are required"
      });
    }

    const result = await specificationServiceV2.createTraditional({
      product_id,
      spec_name,
      spec_value
    });

    res.status(201).json({
      success: true,
      message: "Spec created successfully",
      data: result
    });
  } catch (error) {
    console.error("Create traditional spec error:", error);
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get all traditional specs for a product
 * GET /api/specifications/traditional/:product_id
 */
exports.getTraditionalByProduct = async (req, res) => {
  try {
    const { product_id } = req.params;

    const result = await specificationServiceV2.getTraditionalByProductId(
      parseInt(product_id)
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Get traditional specs error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

/**
 * Update traditional spec
 * PATCH /api/specifications/traditional/:spec_id
 */
exports.updateTraditionalSpec = async (req, res) => {
  try {
    const { spec_id } = req.params;
    const { spec_name, spec_value } = req.body;

    if (!spec_name || !spec_value) {
      return res.status(400).json({
        success: false,
        error: "spec_name and spec_value are required"
      });
    }

    const result = await specificationServiceV2.updateTraditional(
      parseInt(spec_id),
      { spec_name, spec_value }
    );

    res.json({
      success: true,
      message: "Spec updated successfully",
      data: result
    });
  } catch (error) {
    console.error("Update traditional spec error:", error);
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Delete traditional spec
 * DELETE /api/specifications/traditional/:spec_id
 */
exports.deleteTraditionalSpec = async (req, res) => {
  try {
    const { spec_id } = req.params;

    await specificationServiceV2.deleteTraditional(parseInt(spec_id));

    res.json({
      success: true,
      message: "Spec deleted successfully"
    });
  } catch (error) {
    console.error("Delete traditional spec error:", error);
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
