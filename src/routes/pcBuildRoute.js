const express = require("express");
const pcBuildController = require("../controllers/pcBuildController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: PC Builds
 *   description: Build PC and publish as Product
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PcBuildItemInput:
 *       type: object
 *       required:
 *         - product_id
 *         - quantity
 *       properties:
 *         product_id:
 *           type: integer
 *           example: 10
 *         quantity:
 *           type: integer
 *           example: 1
 *     PcBuildCreateRequest:
 *       type: object
 *       required:
 *         - build_name
 *         - items
 *       properties:
 *         build_name:
 *           type: string
 *           example: Gaming PC RTX 4070
 *         description:
 *           type: string
 *           example: Mid-high gaming build
 *         category_id:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         image_url:
 *           type: string
 *           nullable: true
 *           example: https://example.com/images/pc-build.jpg
 *         status:
 *           type: string
 *           example: Available
 *         brand:
 *           type: string
 *           example: Custom Build
 *         stock_quantity:
 *           type: integer
 *           example: 5
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PcBuildItemInput'
 *     PcBuildSummary:
 *       type: object
 *       properties:
 *         pc_build_id:
 *           type: integer
 *         build_name:
 *           type: string
 *         product_id:
 *           type: integer
 *         total_price:
 *           type: number
 *         item_count:
 *           type: integer
 *         status:
 *           type: string
 *         brand:
 *           type: string
 *         stock_quantity:
 *           type: integer
 *         image_url:
 *           type: string
 *           nullable: true
 *         category_id:
 *           type: integer
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *
 * /api/pc-builds:
 *   get:
 *     summary: Get all PC builds
 *     tags: [PC Builds]
 *     security: []
 *     responses:
 *       200:
 *         description: List of PC builds
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PcBuildSummary'
 */
router.get("/", pcBuildController.getAllPcBuilds);

/**
 * @swagger
 * /api/pc-builds:
 *   post:
 *     summary: Create a PC build, save items, and create linked product
 *     tags: [PC Builds]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PcBuildCreateRequest'
 *     responses:
 *       201:
 *         description: PC build created successfully
 *       400:
 *         description: Invalid input data
 */
router.post("/", pcBuildController.createPcBuild);

/**
 * @swagger
 * /api/pc-builds/{id}:
 *   get:
 *     summary: Get PC build detail by ID
 *     tags: [PC Builds]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: PC build detail
 *       404:
 *         description: PC build not found
 */
router.get("/:id", pcBuildController.getPcBuildById);

/**
 * @swagger
 * /api/pc-builds/{id}:
 *   put:
 *     summary: Update PC build and linked product
 *     tags: [PC Builds]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PcBuildCreateRequest'
 *     responses:
 *       200:
 *         description: PC build updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: PC build not found
 */
router.put("/:id", pcBuildController.updatePcBuild);

/**
 * @swagger
 * /api/pc-builds/{id}:
 *   delete:
 *     summary: Delete PC build and linked product
 *     tags: [PC Builds]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: PC build deleted successfully
 *       404:
 *         description: PC build not found
 */
router.delete("/:id", pcBuildController.deletePcBuild);

/**
 * @swagger
 * /api/pc-builds/{id}/items:
 *   post:
 *     summary: Add a new item to an existing PC build
 *     tags: [PC Builds]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: PC build ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PcBuildItemInput'
 *     responses:
 *       201:
 *         description: Item added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     item:
 *                       type: object
 *                     new_total_price:
 *                       type: number
 *       400:
 *         description: Invalid input
 *       404:
 *         description: PC build or product not found
 */
router.post("/:id/items", pcBuildController.addItem);

/**
 * @swagger
 * /api/pc-builds/{id}/items/{itemId}:
 *   put:
 *     summary: Update quantity of an item in a PC build
 *     tags: [PC Builds]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: PC build ID
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: PC build item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *     responses:
 *       200:
 *         description: Item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     item:
 *                       type: object
 *                     new_total_price:
 *                       type: number
 *       400:
 *         description: Invalid quantity
 *       404:
 *         description: PC build item not found
 */
router.put("/:id/items/:itemId", pcBuildController.updateItem);

/**
 * @swagger
 * /api/pc-builds/{id}/items/{itemId}:
 *   delete:
 *     summary: Delete an item from a PC build
 *     tags: [PC Builds]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: PC build ID
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: PC build item ID
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     deleted_item_id:
 *                       type: integer
 *                     new_total_price:
 *                       type: number
 *       404:
 *         description: PC build item not found
 */
router.delete("/:id/items/:itemId", pcBuildController.deleteItem);

module.exports = router;
