const express = require("express");
const supplierController = require("../controllers/supplierController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Suppliers
 *   description: Supplier management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Supplier:
 *       type: object
 *       properties:
 *         supplier_id:
 *           type: integer
 *           format: int32
 *           example: 1
 *         name:
 *           type: string
 *           maxLength: 255
 *           example: Tech Supplier Co.
 *         contact_email:
 *           type: string
 *           maxLength: 255
 *           nullable: true
 *           example: support@supplier.com
 *         address:
 *           type: string
 *           maxLength: 500
 *           nullable: true
 *           example: Ho Chi Minh City
 */

/**
 * @swagger
 * /api/suppliers:
 *   get:
 *     summary: Get all suppliers
 *     tags: [Suppliers]
 *     security: []
 *     responses:
 *       200:
 *         description: List of all suppliers
 *       500:
 *         description: Internal server error
 */
router.get("/", supplierController.getAllSuppliers);

/**
 * @swagger
 * /api/suppliers/{id}:
 *   get:
 *     summary: Get supplier by ID
 *     tags: [Suppliers]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *         example: 1
 *     responses:
 *       200:
 *         description: Supplier details
 *       404:
 *         description: Supplier not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", supplierController.getSupplierById);

/**
 * @swagger
 * /api/suppliers:
 *   post:
 *     summary: Create supplier
 *     tags: [Suppliers]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Gear Supplier
 *               contact_email:
 *                 type: string
 *                 example: contact@gear.vn
 *               address:
 *                 type: string
 *                 example: Ha Noi
 *     responses:
 *       201:
 *         description: Supplier created successfully
 *       500:
 *         description: Internal server error
 */
router.post("/", supplierController.createSupplier);

/**
 * @swagger
 * /api/suppliers/{id}:
 *   put:
 *     summary: Update supplier
 *     tags: [Suppliers]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Supplier Name
 *               contact_email:
 *                 type: string
 *                 example: updated@supplier.com
 *               address:
 *                 type: string
 *                 example: Da Nang
 *     responses:
 *       200:
 *         description: Supplier updated successfully
 *       404:
 *         description: Supplier not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete supplier
 *     tags: [Suppliers]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *         example: 1
 *     responses:
 *       200:
 *         description: Supplier deleted successfully
 *       404:
 *         description: Supplier not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", supplierController.updateSupplier);
router.delete("/:id", supplierController.deleteSupplier);

module.exports = router;
