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
 *         cart_item_id:
 *           type: integer
 *           description: ID của item trong giỏ hàng
 *           example: 1
 *         cart_id:
 *           type: integer
 *           description: ID giỏ hàng của user
 *           example: 3
 *         user_id:
 *           type: integer
 *           description: ID người dùng
 *           example: 1
 *         product_id:
 *           type: integer
 *           nullable: true
 *           description: ID sản phẩm (null nếu là build)
 *           example: 5
 *         user_build_id:
 *           type: integer
 *           nullable: true
 *           description: ID build PC (null nếu là sản phẩm đơn lẻ)
 *           example: null
 *         quantity:
 *           type: integer
 *           description: Số lượng trong giỏ
 *           example: 2
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Ngày tạo giỏ hàng
 *         product_name:
 *           type: string
 *           nullable: true
 *           description: Tên sản phẩm (có khi product_id không null)
 *           example: NVIDIA GeForce RTX 4090
 *         product_price:
 *           type: number
 *           nullable: true
 *           description: Đơn giá sản phẩm
 *           example: 1599.99
 *         stock_quantity:
 *           type: integer
 *           nullable: true
 *           description: Tồn kho hiện tại của sản phẩm
 *           example: 50
 *         image_url:
 *           type: string
 *           nullable: true
 *           description: URL ảnh sản phẩm
 *         build_name:
 *           type: string
 *           nullable: true
 *           description: Tên build PC (có khi user_build_id không null)
 *           example: My Gaming PC
 *         build_price:
 *           type: number
 *           nullable: true
 *           description: Tổng giá build PC
 *           example: 2500.00
 *         subtotal:
 *           type: number
 *           description: "Đơn giá × số lượng của item này"
 *           example: 3199.98
 *     CartSummary:
 *       type: object
 *       properties:
 *         itemCount:
 *           type: integer
 *           description: Số loại item trong giỏ
 *           example: 3
 *         totalQuantity:
 *           type: integer
 *           description: Tổng số lượng tất cả item
 *           example: 5
 *         totalPrice:
 *           type: number
 *           description: Tổng tiền toàn bộ giỏ hàng
 *           example: 4799.97
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CartSummary'
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
 *                       description: Số loại item trong giỏ
 *                       example: 3
 *                     totalQuantity:
 *                       type: integer
 *                       description: Tổng số lượng
 *                       example: 5
 *                     totalPrice:
 *                       type: number
 *                       description: Tổng tiền toàn bộ giỏ hàng
 *                       example: 4799.97
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
 *             properties:
 *               product_id:
 *                 type: integer
 *                 nullable: true
 *                 description: "ID sản phẩm cần thêm (chọn 1 trong 2: product_id hoặc user_build_id)"
 *                 example: 1
 *               user_build_id:
 *                 type: integer
 *                 nullable: true
 *                 description: "ID build PC cần thêm (chọn 1 trong 2: product_id hoặc user_build_id)"
 *                 example: null
 *               quantity:
 *                 type: integer
 *                 description: Số lượng thêm vào (mặc định 1). Nếu sản phẩm đã có trong giỏ thì cộng dồn.
 *                 example: 2
 *     responses:
 *       201:
 *         description: Thêm vào giỏ thành công
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
 *                       description: Item vừa thêm/cập nhật (kèm subtotal)
 *                       properties:
 *                         cart_item_id:
 *                           type: integer
 *                           example: 1
 *                         product_id:
 *                           type: integer
 *                           nullable: true
 *                           example: 1
 *                         product_name:
 *                           type: string
 *                           example: NVIDIA GeForce RTX 4090
 *                         product_price:
 *                           type: number
 *                           example: 1599.99
 *                         quantity:
 *                           type: integer
 *                           example: 2
 *                         subtotal:
 *                           type: number
 *                           description: Đơn giá × số lượng (ví dụ 1599.99 × 2 = 3199.98)
 *                           example: 3199.98
 *                     cartSummary:
 *                       type: object
 *                       description: Tổng hợp toàn bộ giỏ hàng sau khi thêm
 *                       properties:
 *                         itemCount:
 *                           type: integer
 *                           description: Số loại sản phẩm trong giỏ
 *                           example: 3
 *                         totalQuantity:
 *                           type: integer
 *                           description: Tổng số lượng tất cả item
 *                           example: 5
 *                         totalPrice:
 *                           type: number
 *                           description: Tổng tiền toàn bộ giỏ hàng
 *                           example: 4799.97
 *       400:
 *         description: Thiếu ID, không đủ tồn kho, hoặc truyền cả 2 ID cùng lúc
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
 *         description: Cập nhật số lượng thành công
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
 *                   $ref: '#/components/schemas/CartItem'
 *       400:
 *         description: Số lượng không hợp lệ hoặc không đủ tồn kho
 *       404:
 *         description: Không tìm thấy item trong giỏ
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
 *         description: Xóa item khỏi giỏ thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Item removed from cart successfully
 *       404:
 *         description: Không tìm thấy item trong giỏ
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
 *         description: Xóa toàn bộ giỏ hàng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Cart cleared successfully
 */
router.delete("/:userId/clear", cartController.clearCart);

module.exports = router;
