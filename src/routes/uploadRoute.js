const express = require("express");
const router = express.Router();
const { upload, uploadToCloudinary } = require("../middlewares/uploadImage");

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: Image upload APIs
 */

/**
 * @swagger
 * /api/upload/image:
 *   post:
 *     summary: Upload single image to cloud
 *     tags: [Upload]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPEG, PNG, JPG, WEBP)
 *     responses:
 *       200:
 *         description: Image uploaded successfully
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
 *                   example: Image uploaded successfully
 *                 image_url:
 *                   type: string
 *                   example: https://res.cloudinary.com/demo/image/upload/v1234567/pc-components/abc123.jpg
 *       400:
 *         description: Invalid file type
 *       500:
 *         description: Upload failed
 */
router.post("/image", upload.single('image'), uploadToCloudinary, (req, res) => {
    res.json({
        success: true,
        message: 'Image uploaded successfully',
        image_url: req.body.image_url
    });
});

/**
 * @swagger
 * /api/upload/images:
 *   post:
 *     summary: Upload multiple images to cloud
 *     tags: [Upload]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - images
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Image files (max 10)
 *     responses:
 *       200:
 *         description: Images uploaded successfully
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
 *                   example: Images uploaded successfully
 *                 image_urls:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: 
 *                     - https://res.cloudinary.com/demo/image/upload/v1234567/pc-components/abc123.jpg
 *                     - https://res.cloudinary.com/demo/image/upload/v1234567/pc-components/def456.jpg
 *       400:
 *         description: Invalid file type
 *       500:
 *         description: Upload failed
 */
router.post("/images", upload.array('images', 10), uploadToCloudinary, (req, res) => {
    res.json({
        success: true,
        message: 'Images uploaded successfully',
        image_urls: req.body.image_urls
    });
});

module.exports = router;
