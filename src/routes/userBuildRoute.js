const express = require("express");
const userBuildController = require("../controllers/userBuildController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User Builds
 *   description: User custom PC build CRUD (no authentication)
 */

/**
 * @swagger
 * components:
 *   parameters:
 *     UserIdQueryParam:
 *       in: query
 *       name: user_id
 *       required: true
 *       schema:
 *         type: integer
 *       description: User ID owner of builds
 *   schemas:
 *     UserBuildItemInput:
 *       type: object
 *       required:
 *         - product_id
 *       properties:
 *         product_id:
 *           type: integer
 *           example: 12
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *     UserBuildCreateRequest:
 *       type: object
 *       required:
 *         - build_name
 *         - items
 *       properties:
 *         build_name:
 *           type: string
 *           example: PC gaming RTX 4070 Super
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UserBuildItemInput'
 *     UserBuildUpdateRequest:
 *       type: object
 *       properties:
 *         build_name:
 *           type: string
 *           example: PC gaming updated
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UserBuildItemInput'
 *     UserBuildSummary:
 *       type: object
 *       properties:
 *         user_build_id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         build_name:
 *           type: string
 *         build_source:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         item_count:
 *           type: integer
 *         total_price:
 *           type: number
 *     UserBuildItemDetail:
 *       type: object
 *       properties:
 *         user_build_item_id:
 *           type: integer
 *         user_build_id:
 *           type: integer
 *         product_id:
 *           type: integer
 *         quantity:
 *           type: integer
 *         product_name:
 *           type: string
 *         unit_price:
 *           type: number
 *         subtotal:
 *           type: number
 *     UserBuildDetail:
 *       type: object
 *       properties:
 *         user_build_id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         build_name:
 *           type: string
 *         build_source:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         total_price:
 *           type: number
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UserBuildItemDetail'
 */

/**
 * @swagger
 * /api/user-builds:
 *   post:
 *     summary: Create a new user build and save items into UserBuildItems
 *     tags: [User Builds]
 *     security: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdQueryParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserBuildCreateRequest'
 *     responses:
 *       201:
 *         description: User build created successfully
 *       400:
 *         description: Invalid input data
 */
router.post("/", userBuildController.createUserBuild);

/**
 * @swagger
 * /api/user-builds:
 *   get:
 *     summary: Get all builds by user_id
 *     tags: [User Builds]
 *     security: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdQueryParam'
 *     responses:
 *       200:
 *         description: List user builds
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
 *                     $ref: '#/components/schemas/UserBuildSummary'
 *       400:
 *         description: Missing or invalid user_id
 */
router.get("/", userBuildController.getMyUserBuilds);

/**
 * @swagger
 * /api/user-builds/{id}:
 *   get:
 *     summary: Get detail of a user build
 *     tags: [User Builds]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User build detail
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserBuildDetail'
 *       400:
 *         description: Invalid user_build_id
 *       404:
 *         description: User build not found
 */
router.get("/:id", userBuildController.getMyUserBuildById);

/**
 * @swagger
 * /api/user-builds/{id}:
 *   put:
 *     summary: Update user build and recalculate total_price from selected products
 *     tags: [User Builds]
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
 *             $ref: '#/components/schemas/UserBuildUpdateRequest'
 *     responses:
 *       200:
 *         description: User build updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: User build not found
 */
router.put("/:id", userBuildController.updateMyUserBuild);

/**
 * @swagger
 * /api/user-builds/{id}:
 *   delete:
 *     summary: Delete a user build
 *     tags: [User Builds]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User build deleted successfully
 *       400:
 *         description: Invalid user_build_id
 *       404:
 *         description: User build not found
 */
router.delete("/:id", userBuildController.deleteMyUserBuild);

/**
 * @swagger
 * /api/user-builds/{id}/items:
 *   post:
 *     summary: Add an item to an existing user build
 *     tags: [User Builds]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User build ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserBuildItemInput'
 *     responses:
 *       201:
 *         description: Item added successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: User build or product not found
 */
router.post("/:id/items", userBuildController.addItem);

/**
 * @swagger
 * /api/user-builds/{id}/items/{itemId}:
 *   put:
 *     summary: Update quantity of an item in user build
 *     tags: [User Builds]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User build ID
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User build item ID
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
 *       400:
 *         description: Invalid quantity or IDs
 *       404:
 *         description: User build item not found
 */
router.put("/:id/items/:itemId", userBuildController.updateItem);

/**
 * @swagger
 * /api/user-builds/{id}/items/{itemId}:
 *   delete:
 *     summary: Delete an item from user build
 *     tags: [User Builds]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User build ID
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User build item ID
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *       400:
 *         description: Invalid IDs
 *       404:
 *         description: User build item not found
 */
router.delete("/:id/items/:itemId", userBuildController.deleteItem);

module.exports = router;
