const express = require('express');
const AuthController = require('../controllers/authController');
const { validateEmail, validatePhone } = require('../middlewares/validationMiddleware');

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nguyen Van A
 *               email:
 *                 type: string
 *                 example: an.nguyen@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               phone:
 *                 type: string
 *                 example: 0123456789
 *               address:
 *                 type: string
 *                 example: 123 Nguyen Trai, District 1, Ho Chi Minh City
 *               avatar:
 *                 type: string
 *                 example: https://example.com/avatars/user-1.jpg
 *     responses:
 *       201:
 *         description: Register successful
 *       400:
 *         description: Email already exists
 */
router.post('/register', validateEmail, validatePhone, AuthController.register);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: an.nguyen@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 */
router.post('/login', validateEmail, AuthController.login);

module.exports = router;