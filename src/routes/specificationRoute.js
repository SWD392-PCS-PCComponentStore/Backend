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
 *           format: int32
 *           description: Specification ID
 *           example: 1
 *         product_id:
 *           type: integer
 *           format: int32
 *           description: Product ID
 *           example: 1
 *         attribute_name:
 *           type: string
 *           maxLength: 255
 *           description: Specification name
 *           example: GPU Memory
 *         attribute_value:
 *           type: string
 *           maxLength: 255
 *           description: Specification value
 *           example: 24GB GDDR6X
 *         unit:
 *           type: string
 *           maxLength: 50
 *           nullable: true
 *           description: Optional unit
 *           example: GB
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
 *               - attribute_name
 *               - attribute_value
 *             properties:
 *               product_id:
 *                 type: integer
 *                 format: int32
 *                 example: 1
 *               attribute_name:
 *                 type: string
 *                 maxLength: 255
 *                 example: Core Clock
 *               attribute_value:
 *                 type: string
 *                 maxLength: 255
 *                 example: 2.52 GHz
 *               unit:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *                 example: GHz
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
 *           format: int32
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

/**
 * @swagger
 * /api/specifications/{specId}:
 *   put:
 *     summary: Update a specification by ID
 *     tags: [Specifications]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: specId
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *         description: Specification ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - attribute_name
 *               - attribute_value
 *             properties:
 *               attribute_name:
 *                 type: string
 *                 maxLength: 255
 *                 example: Core Clock
 *               attribute_value:
 *                 type: string
 *                 maxLength: 255
 *                 example: 2.60
 *               unit:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *                 example: GHz
 *     responses:
 *       200:
 *         description: Specification updated successfully
 *       404:
 *         description: Specification not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a specification by ID
 *     tags: [Specifications]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: specId
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *         description: Specification ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Specification deleted successfully
 *       404:
 *         description: Specification not found
 *       500:
 *         description: Internal server error
 */
router.put("/:specId", specificationController.updateSpecification);
router.delete("/:specId", specificationController.deleteSpecification);

module.exports = router;