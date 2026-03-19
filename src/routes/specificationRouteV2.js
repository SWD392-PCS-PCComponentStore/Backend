const express = require("express");
const specificationControllerV2 = require("../controllers/specificationControllerV2");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Specifications V2
 *   description: Product specifications management with JSON schema validation
 */

/**
 * @swagger
 * /api/specifications-v2/schemas:
 *   get:
 *     summary: Get all available specification schemas
 *     tags: [Specifications V2]
 *     security: []
 *     responses:
 *       200:
 *         description: List of all categories and their schemas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 categories:
 *                   type: number
 *                   example: 8
 *                 data:
 *                   type: array
 */
router.get("/schemas", specificationControllerV2.getAllSchemas);

/**
 * @swagger
 * /api/specifications-v2/schema/{category}:
 *   get:
 *     summary: Get specification schema for a specific category
 *     tags: [Specifications V2]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Category name (CPU, GPU, MAINBOARD, RAM, STORAGE, PSU, COOLER_CPU, CASE)
 *         example: CPU
 *     responses:
 *       200:
 *         description: Schema for the category
 *       400:
 *         description: Unknown category
 */
router.get("/schema/:category", specificationControllerV2.getSchema);

/**
 * @swagger
 * /api/specifications-v2/validate:
 *   post:
 *     summary: Validate specs against schema (without saving)
 *     tags: [Specifications V2]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 example: CPU
 *               specs:
 *                 type: object
 *                 example: {
 *                   "socket": "LGA1700",
 *                   "cores": 24,
 *                   "threads": 32,
 *                   "tdp": 253
 *                 }
 *     responses:
 *       200:
 *         description: Validation result
 */
router.post("/validate", specificationControllerV2.validateSpecs);

/**
 * @swagger
 * /api/specifications-v2/json:
 *   post:
 *     summary: Create or update JSON specs for a product
 *     tags: [Specifications V2]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: integer
 *               category:
 *                 type: string
 *               specs:
 *                 type: object
 *     responses:
 *       201:
 *         description: Specs created/updated successfully
 */
router.post("/json", specificationControllerV2.upsertJsonSpecs);

/**
 * @swagger
 * /api/specifications-v2/json/{product_id}:
 *   get:
 *     summary: Get JSON specs for a product
 *     tags: [Specifications V2]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product specifications
 *       404:
 *         description: Product not found
 */
router.get("/json/:product_id", specificationControllerV2.getJsonSpecs);

/**
 * @swagger
 * /api/specifications-v2/json/{product_id}:
 *   patch:
 *     summary: Update JSON specs for a product
 *     tags: [Specifications V2]
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               specs:
 *                 type: object
 *     responses:
 *       200:
 *         description: Specs updated successfully
 */
router.patch("/json/:product_id", specificationControllerV2.updateJsonSpecs);

/**
 * @swagger
 * /api/specifications-v2/json/{product_id}:
 *   delete:
 *     summary: Delete JSON specs for a product
 *     tags: [Specifications V2]
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Specs deleted successfully
 */
router.delete("/json/:product_id", specificationControllerV2.deleteJsonSpecs);

/**
 * @swagger
 * /api/specifications-v2/category/{category_id}:
 *   get:
 *     summary: Get all products with specs in a category
 *     tags: [Specifications V2]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: category_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of products with their specs
 */
router.get("/category/:category_id", specificationControllerV2.getAllSpecsByCategory);

// ==================== BACKWARD COMPATIBILITY ====================

/**
 * @swagger
 * /api/specifications-v2/traditional:
 *   post:
 *     summary: Create traditional spec (PRODUCT_SPEC) - Legacy
 *     tags: [Specifications V2]
 *     deprecated: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: integer
 *               spec_name:
 *                 type: string
 *               spec_value:
 *                 type: string
 *     responses:
 *       201:
 *         description: Spec created successfully
 */
router.post(
  "/traditional",
  specificationControllerV2.createTraditionalSpec
);

/**
 * @swagger
 * /api/specifications-v2/traditional/{product_id}:
 *   get:
 *     summary: Get all traditional specs for a product - Legacy
 *     tags: [Specifications V2]
 *     deprecated: true
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of specs
 */
router.get(
  "/traditional/:product_id",
  specificationControllerV2.getTraditionalByProduct
);

/**
 * @swagger
 * /api/specifications-v2/traditional/{spec_id}:
 *   patch:
 *     summary: Update traditional spec - Legacy
 *     tags: [Specifications V2]
 *     deprecated: true
 *     parameters:
 *       - in: path
 *         name: spec_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               spec_name:
 *                 type: string
 *               spec_value:
 *                 type: string
 *     responses:
 *       200:
 *         description: Spec updated successfully
 */
router.patch(
  "/traditional/:spec_id",
  specificationControllerV2.updateTraditionalSpec
);

/**
 * @swagger
 * /api/specifications-v2/traditional/{spec_id}:
 *   delete:
 *     summary: Delete traditional spec - Legacy
 *     tags: [Specifications V2]
 *     deprecated: true
 *     parameters:
 *       - in: path
 *         name: spec_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Spec deleted successfully
 */
router.delete(
  "/traditional/:spec_id",
  specificationControllerV2.deleteTraditionalSpec
);

module.exports = router;
