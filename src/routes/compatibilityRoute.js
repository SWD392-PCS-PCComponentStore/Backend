/**
 * Compatibility Routes
 * Routes for PC component compatibility checking and auto-build features
 */

const express = require("express");
const router = express.Router();
const CompatibilityController = require("../controllers/compatibilityController");

/**
 * @swagger
 * tags:
 *   name: Compatibility
 *   description: PC component compatibility checking and auto-build features
 */

/**
 * @swagger
 * /api/compatibility/check-build:
 *   post:
 *     summary: Check PC build compatibility
 *     tags: [Compatibility]
 *     description: Check if all components in a PC build are compatible with each other
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cpuId, mainboardId, ramId, storageId, psuId, coolerId, caseId]
 *             properties:
 *               cpuId:
 *                 type: integer
 *                 example: 4
 *                 description: CPU product ID
 *               mainboardId:
 *                 type: integer
 *                 example: 5
 *                 description: Mainboard product ID
 *               ramId:
 *                 type: integer
 *                 example: 7
 *                 description: RAM product ID
 *               gpuId:
 *                 type: integer
 *                 example: 6
 *                 description: GPU product ID (optional)
 *               storageId:
 *                 type: integer
 *                 example: 8
 *                 description: Storage product ID
 *               psuId:
 *                 type: integer
 *                 example: 9
 *                 description: PSU product ID
 *               coolerId:
 *                 type: integer
 *                 example: 10
 *                 description: CPU Cooler product ID
 *               caseId:
 *                 type: integer
 *                 example: 11
 *                 description: Case product ID
 *     responses:
 *       200:
 *         description: Build compatibility check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     is_compatible:
 *                       type: boolean
 *                     compatibility_score:
 *                       type: number
 *                     summary:
 *                       type: object
 *                     checks:
 *                       type: array
 *                     errors:
 *                       type: array
 *                     warnings:
 *                       type: array
 */
router.post("/check-build", CompatibilityController.checkBuild);

/**
 * @swagger
 * /api/compatibility/validate-pair:
 *   post:
 *     summary: Validate compatibility between two components
 *     tags: [Compatibility]
 *     description: Check compatibility between a pair of components using a specific rule
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId1, productId2, rule]
 *             properties:
 *               productId1:
 *                 type: integer
 *                 example: 4
 *               productId2:
 *                 type: integer
 *                 example: 5
 *               rule:
 *                 type: string
 *                 example: CPU_SOCKET_MATCH
 *                 enum: [CPU_SOCKET_MATCH, RAM_TYPE_SUPPORT, COOLER_SOCKET_SUPPORT, GPU_CASE_SIZE_FIT, COOLER_CASE_SIZE_FIT]
 *     responses:
 *       200:
 *         description: Pair compatibility result
 */
router.post("/validate-pair", CompatibilityController.validatePair);

/**
 * @swagger
 * /api/compatibility/recommendations/{productId}/{category}:
 *   get:
 *     summary: Get replacement recommendations for a component
 *     tags: [Compatibility]
 *     description: Get compatible replacement products for a specific component
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 4
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         example: cpu
 *     responses:
 *       200:
 *         description: List of recommended replacement products
 */
router.get("/recommendations/:productId/:category", CompatibilityController.getRecommendations);

/**
 * @swagger
 * /api/compatibility/compatible-products/{category}:
 *   post:
 *     summary: Get compatible products by category and filters
 *     tags: [Compatibility]
 *     description: Filter products in a category by specifications
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         example: cpu
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               socket:
 *                 type: string
 *                 example: LGA1700
 *               min_cores:
 *                 type: integer
 *                 example: 8
 *               min_speed:
 *                 type: integer
 *                 example: 3000
 *     responses:
 *       200:
 *         description: Filtered list of compatible products
 */
router.post("/compatible-products/:category", CompatibilityController.getCompatibleProducts);

/**
 * @swagger
 * /api/compatibility/auto-build:
 *   post:
 *     summary: Generate automatic PC build based on budget
 *     tags: [Compatibility]
 *     description: Automatically generate a compatible PC build based on budget and preferences
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [budget]
 *             properties:
 *               budget:
 *                 type: number
 *                 example: 1000
 *                 description: Total budget in currency units
 *               purpose:
 *                 type: string
 *                 example: gaming
 *                 enum: [gaming, workstation, office]
 *               cpuPreference:
 *                 type: string
 *                 example: balanced
 *                 enum: [budget, balanced, performance]
 *               gpuPreference:
 *                 type: string
 *                 example: performance
 *                 enum: [none, budget, balanced, performance, high-end]
 *               storageSize:
 *                 type: integer
 *                 example: 500
 *                 description: Preferred storage size in GB
 *     responses:
 *       200:
 *         description: Generated PC build recommendation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     budget_total:
 *                       type: number
 *                     components:
 *                       type: object
 *                     estimated_total_cost:
 *                       type: number
 *                     compatibility:
 *                       type: object
 */
router.post("/auto-build", CompatibilityController.autoBuild);

/**
 * @swagger
 * /api/compatibility/rules:
 *   get:
 *     summary: Get all compatibility rules
 *     tags: [Compatibility]
 *     description: Retrieve information about all 6+ compatibility rules
 *     responses:
 *       200:
 *         description: List of all compatibility rules
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 total_rules:
 *                   type: integer
 *                 data:
 *                   type: array
 */
router.get("/rules", CompatibilityController.getRules);

/**
 * @swagger
 * /api/compatibility/rules/{ruleId}:
 *   get:
 *     summary: Get specific compatibility rule info
 *     tags: [Compatibility]
 *     description: Get detailed information about a specific compatibility rule
 *     parameters:
 *       - in: path
 *         name: ruleId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Compatibility rule details
 */
router.get("/rules/:ruleId", CompatibilityController.getRuleInfo);

/**
 * @swagger
 * /api/compatibility/build-examples:
 *   get:
 *     summary: Get PC build examples
 *     tags: [Compatibility]
 *     description: Get example builds for different purposes and budgets
 *     responses:
 *       200:
 *         description: List of build examples
 */
router.get("/build-examples", CompatibilityController.getBuildExamples);

/**
 * @swagger
 * /api/compatibility/budget-allocation:
 *   get:
 *     summary: Get budget allocation percentages
 *     tags: [Compatibility]
 *     description: Get default budget allocation for each component category
 *     responses:
 *       200:
 *         description: Budget allocation percentages
 */
router.get("/budget-allocation", CompatibilityController.getBudgetAllocation);

module.exports = router;
