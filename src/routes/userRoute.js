const express = require('express');
const UserController = require('../controllers/userController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserResponse:
 *       type: object
 *       properties:
 *         user_id:
 *           type: integer
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *         status:
 *           type: string
 *         phone:
 *           type: string
 *         address:
 *           type: string
 *         avatar:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *     UserCreateRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           example: Nguyen Van A
 *         email:
 *           type: string
 *           example: nguyenvana@example.com
 *         password:
 *           type: string
 *           example: Password123
 *         role:
 *           type: string
 *           example: customer
 *         status:
 *           type: string
 *           example: active
 *         phone:
 *           type: string
 *           example: 0901234567
 *         address:
 *           type: string
 *           example: 123 Le Loi, Ho Chi Minh City
 *         avatar:
 *           type: string
 *           example: https://example.com/avatar.jpg
 *     UserUpdateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Nguyen Van A
 *         email:
 *           type: string
 *           example: nguyenvana@example.com
 *         password:
 *           type: string
 *           example: NewPassword123
 *         role:
 *           type: string
 *           example: customer
 *         status:
 *           type: string
 *           example: active
 *         phone:
 *           type: string
 *           example: 0901234567
 *         address:
 *           type: string
 *           example: 123 Le Loi, Ho Chi Minh City
 *         avatar:
 *           type: string
 *           example: https://example.com/avatar.jpg
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreateRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input data
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security: []
 *     responses:
 *       200:
 *         description: List of users
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
 *                     $ref: '#/components/schemas/UserResponse'
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User detail
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user and change any field in USERS table
 *     tags: [Users]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateRequest'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Users]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 */
router.post('/', UserController.create);
router.get('/', UserController.getAll);
router.get('/:id', UserController.getById);
router.put('/:id', UserController.update);
router.delete('/:id', UserController.delete);

module.exports = router;