const express = require("express");
const cartController = require("../controllers/cartController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         cart_id:
 *           type: integer
 *           format: int64
 *           description: Cart item ID
 *           example: 1
 *         user_id:
 *           type: integer
 *           format: int64
 *           description: User ID
 *           example: 1
 *         product_id:
 *           type: integer
 *           format: int64
 *           description: Product ID
 *           example: 1
 *         quantity:
 *           type: integer
 *           description: Quantity of product
 *           example: 2
 *         added_at:
 *           type: string
 *           format: date-time
 *           description: When item was added to cart
 *         product_name:
 *           type: string
 *           description: Product name
 *           example: NVIDIA GeForce RTX 4090
 *         price:
 *           type: number
 *           format: decimal
 *           description: Product price
 *           example: 1599.99
 *         stock:
 *           type: integer
 *           description: Available stock
 *           example: 50
 *         image_url:
 *           type: string
 *           description: Product image URL
 */

/**
 * @swagger
 * /api/cart/{userId}/total:
 *   get:
 *     summary: Get cart total price and details
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Cart total retrieved successfully
 */
router.get("/:userId/total", cartController.getCartTotal);

/**
 * @swagger
 * /api/cart/{userId}:
 *   get:
 *     summary: Get user's shopping cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
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
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CartItem'
 *                     itemCount:
 *                       type: integer
 *                     totalQuantity:
 *                       type: integer
 *                     totalPrice:
 *                       type: number
 */
router.get("/:userId", cartController.getCart);

/**
 * @swagger
 * /api/cart/{userId}/add:
 *   post:
 *     summary: Add product to cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *             properties:
 *               product_id:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Product added to cart successfully
 *       400:
 *         description: Bad request or insufficient stock
 *       404:
 *         description: Product not found
 */
router.post("/:userId/add", cartController.addToCart);

/**
 * @swagger
 * /api/cart/{cartId}/update:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Cart Item ID
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
 *                 example: 5
 *     responses:
 *       200:
 *         description: Quantity updated successfully
 *       400:
 *         description: Invalid quantity or insufficient stock
 *       404:
 *         description: Cart item not found
 */
router.put("/:cartId/update", cartController.updateQuantity);

/**
 * @swagger
 * /api/cart/{cartId}/remove:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Cart Item ID
 *     responses:
 *       200:
 *         description: Item removed successfully
 *       404:
 *         description: Cart item not found
 */
router.delete("/:cartId/remove", cartController.removeFromCart);

/**
 * @swagger
 * /api/cart/{userId}/clear:
 *   delete:
 *     summary: Clear all items from user's cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 */
router.delete("/:userId/clear", cartController.clearCart);

module.exports = router;
