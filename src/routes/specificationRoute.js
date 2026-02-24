const express = require("express");
const router = express.Router();
const specificationController = require("../controllers/specificationController");

/**
 * @swagger
 * tags:
 *   name: Specifications
 *   description: Product specification management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Specification:
 *       type: object
 *       properties:
 *         spec_id:
 *           type: integer
 *           format: int64
 *           description: Specification ID
 *           example: 1
 *         product_id:
 *           type: integer
 *           format: int64
 *           description: Product ID
 *           example: 1
 *         spec_name:
 *           type: string
 *           maxLength: 150
 *           description: Specification name
 *           example: GPU Memory
 *         spec_value:
 *           type: string
 *           maxLength: 255
 *           description: Specification value
 *           example: 24GB GDDR6X
 */

/**
 * @swagger
 * /api/specifications:
 *   post:
 *     summary: Create new product specification
 *     tags: [Specifications]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - spec_name
 *               - spec_value
 *             properties:
 *               product_id:
 *                 type: integer
 *                 format: int64
 *                 example: 1
 *               spec_name:
 *                 type: string
 *                 maxLength: 150
 *                 example: Core Clock
 *               spec_value:
 *                 type: string
 *                 maxLength: 255
 *                 example: 2.52 GHz
 *     responses:
 *       201:
 *         description: Specification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Specification created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Specification'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post("/", specificationController.createSpecification);

/**
 * @swagger
 * /api/specifications/product/{productId}:
 *   get:
 *     summary: Get all specifications for a product
 *     tags: [Specifications]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *         description: Product ID
 *         example: 1
 *     responses:
 *       200:
 *         description: List of product specifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Specification'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get("/product/:productId", specificationController.getSpecificationsByProductId);

module.exports = router;