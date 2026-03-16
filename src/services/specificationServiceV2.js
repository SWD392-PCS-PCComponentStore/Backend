const SpecificationV2 = require("../models/specificationModelV2");
const { validateSpecs, getSchema, getAllCategories } = require("../utils/specSchemas");

/**
 * Create or update JSON specs for a product
 */
exports.upsertJsonSpecs = async (productId, category, specs) => {
  // Validate specs against schema
  const validation = validateSpecs(category, specs);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join("; ")}`);
  }

  // Save to database
  const result = await SpecificationV2.createJsonSpecs(productId, category, specs);
  return {
    product_id: result.recordset[0].product_id,
    name: result.recordset[0].name,
    specs: JSON.parse(result.recordset[0].specs_json || "{}"),
    category
  };
};

/**
 * Get JSON specs for a product
 */
exports.getJsonSpecs = async (productId) => {
  const result = await SpecificationV2.getJsonSpecsByProductId(productId);
  
  if (!result.recordset[0]) {
    throw new Error("Product or specs not found");
  }

  const record = result.recordset[0];
  return {
    product_id: record.product_id,
    specs: record.specs_json ? JSON.parse(record.specs_json) : null
  };
};

/**
 * Update JSON specs for a product
 */
exports.updateJsonSpecs = async (productId, specs) => {
  // Note: caller should validate category before calling this
  const result = await SpecificationV2.updateJsonSpecs(productId, specs);
  
  if (!result.recordset[0]) {
    throw new Error("Product not found");
  }

  return {
    product_id: result.recordset[0].product_id,
    name: result.recordset[0].name,
    specs: JSON.parse(result.recordset[0].specs_json || "{}")
  };
};

/**
 * Delete JSON specs for a product
 */
exports.deleteJsonSpecs = async (productId) => {
  await SpecificationV2.deleteJsonSpecs(productId);
  return { message: "Specs deleted successfully" };
};

/**
 * Get all products with specs in a category
 */
exports.getAllSpecsByCategory = async (categoryId) => {
  const result = await SpecificationV2.getAllSpecsByCategory(categoryId);
  
  return result.recordset.map(record => ({
    product_id: record.product_id,
    name: record.name,
    price: record.price,
    brand: record.brand,
    specs: record.specs_json ? JSON.parse(record.specs_json) : null
  }));
};

/**
 * Get spec schema for a category
 */
exports.getSpecSchema = (category) => {
  const schema = getSchema(category);
  if (!schema) {
    throw new Error(`Unknown category: ${category}`);
  }
  return schema;
};

/**
 * Get all available categories and their schemas
 */
exports.getAllSchemasInfo = () => {
  const categories = getAllCategories();
  return categories.map(category => ({
    category,
    schema: getSchema(category)
  }));
};

/**
 * Validate specs (without saving)
 */
exports.validateSpecsOnly = (category, specs) => {
  return validateSpecs(category, specs);
};

// ==================== BACKWARD COMPATIBILITY ====================

exports.createTraditional = async (specData) => {
  const result = await SpecificationV2.create(specData);
  return result.recordset[0];
};

exports.getTraditionalByProductId = async (productId) => {
  const result = await SpecificationV2.getByProductId(productId);
  return result.recordset;
};

exports.getTraditionalById = async (specId) => {
  const result = await SpecificationV2.getById(specId);
  return result.recordset[0];
};

exports.updateTraditional = async (specId, specData) => {
  await SpecificationV2.update(specId, specData);
  return await exports.getTraditionalById(specId);
};

exports.deleteTraditional = async (specId) => {
  await SpecificationV2.delete(specId);
  return { message: "Spec deleted successfully" };
};
