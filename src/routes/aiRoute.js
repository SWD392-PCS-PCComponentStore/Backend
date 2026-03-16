const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

/**
 * @swagger
 * /api/ai/test:
 *   get:
 *     summary: Test Gemini API connection
 *     description: Test if Gemini API is properly configured and connected
 *     tags:
 *       - AI
 *     responses:
 *       200:
 *         description: Gemini API is connected successfully
 *       500:
 *         description: Failed to connect to Gemini API
 */
router.get("/test", aiController.testAIConnection);

/**
 * @swagger
 * /api/ai/analyze:
 *   post:
 *     summary: Analyze user request using AI
 *     description: Parse natural language request to determine which API endpoints to call
 *     tags:
 *       - AI
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 example: "Tôi muốn build PC gaming với budget 25 triệu"
 *     responses:
 *       200:
 *         description: Request analyzed successfully
 *       400:
 *         description: Query is required
 *       500:
 *         description: Error analyzing request
 */
router.post("/analyze", aiController.analyzeUserRequest);

/**
 * @swagger
 * /api/ai/recommendations:
 *   post:
 *     summary: Get AI recommendations for PC build
 *     description: Generate AI recommendations based on user requirements
 *     tags:
 *       - AI
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requirements
 *             properties:
 *               requirements:
 *                 type: string
 *                 example: "High performance gaming, 4K gaming, streaming capable"
 *     responses:
 *       200:
 *         description: Recommendations generated successfully
 *       400:
 *         description: Requirements are required
 *       500:
 *         description: Error generating recommendations
 */
router.post("/recommendations", aiController.getRecommendations);

/**
 * @swagger
 * /api/ai/build:
 *   post:
 *     summary: Build PC from natural language query
 *     description: Full AI orchestration - parse user request, auto-select compatible components, generate explanation
 *     tags:
 *       - AI
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 example: "Build PC gaming 25 triệu"
 *     responses:
 *       200:
 *         description: PC build generated successfully
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
 *                     query:
 *                       type: string
 *                     analysis:
 *                       type: object
 *                     build:
 *                       type: object
 *                     explanation:
 *                       type: string
 *       400:
 *         description: Query is required
 *       500:
 *         description: Error generating PC build
 */
router.post("/build", aiController.buildPC);

module.exports = router;
