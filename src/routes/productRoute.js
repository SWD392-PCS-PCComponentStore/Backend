const express = require("express");
const productController = require("../controllers/productController");
const { upload, uploadToCloudinary } = require("../middlewares/uploadImage");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         product_id:
 *           type: integer
 *           format: int64
 *           description: Product ID
 *           example: 1
 *         name:
 *           type: string
 *           maxLength: 255
 *           description: Product name
 *           example: NVIDIA GeForce RTX 4090
 *         category_id:
 *           type: integer
 *           description: Category ID
 *           example: 1
 *         brand:
 *           type: string
 *           maxLength: 150
 *           description: Product brand
 *           example: NVIDIA
 *         price:
 *           type: number
 *           format: decimal
 *           description: Product price
 *           example: 1599.99
 *         stock:
 *           type: integer
 *           description: Stock quantity
 *           example: 50
 *         image_url:
 *           type: string
 *           maxLength: 500
 *           description: Product image URL
 *           example: https://example.com/images/rtx4090.jpg
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         category_name:
 *           type: string
 *           description: Category name (from JOIN)
 *           example: Graphics Cards
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     security: []
 *     responses:
 *       200:
 *         description: List of all products
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
 *                     $ref: '#/components/schemas/Product'
 *       500:
 *         description: Internal server error
 */
router.get("/", productController.getAllProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", productController.getProductById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create new product
 *     tags: [Products]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category_id
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 255
 *                 example: AMD Ryzen 9 7950X
 *               category_id:
 *                 type: integer
 *                 example: 2
 *               brand:
 *                 type: string
 *                 maxLength: 150
 *                 example: AMD
 *               price:
 *                 type: number
 *                 format: decimal
 *                 example: 699.99
 *               stock:
 *                 type: integer
 *                 example: 100
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Upload image file
 *     responses:
 *       201:
 *         description: Product created successfully
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
 *                   example: Product created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post("/", upload.single("image"), uploadToCloudinary, productController.createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 255
 *                 example: NVIDIA GeForce RTX 4090 Ti
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               brand:
 *                 type: string
 *                 maxLength: 150
 *                 example: NVIDIA
 *               price:
 *                 type: number
 *                 format: decimal
 *                 example: 1799.99
 *               stock:
 *                 type: integer
 *                 example: 75
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Upload image file
 *     responses:
 *       200:
 *         description: Product updated successfully
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
 *                   example: Product updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", upload.single("image"), uploadToCloudinary, productController.updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Product deleted successfully
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
 *                   example: Product deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", productController.deleteProduct);

module.exports = router;