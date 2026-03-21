const aiService = require("../services/aiService");

/**
 * Test Groq API connection
 * GET /api/ai/test
 */
const testAIConnection = async (req, res) => {
  try {
    const result = await aiService.testConnection();

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "✅ Groq API is connected successfully",
        data: result,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "❌ Failed to connect to Groq API",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error in testAIConnection:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Analyze user request using AI
 * POST /api/ai/analyze
 * Body: { query: "string" }
 */
const analyzeUserRequest = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Query is required",
      });
    }

    const analysis = await aiService.analyzeRequest(query);

    return res.status(200).json({
      success: true,
      message: "✅ Request analyzed successfully",
      data: analysis,
    });
  } catch (error) {
    console.error("Error in analyzeUserRequest:", error);
    return res.status(500).json({
      success: false,
      message: "Error analyzing request",
      error: error.message,
    });
  }
};

/**
 * Get AI recommendations
 * POST /api/ai/recommendations
 * Body: { requirements: "string" }
 */
const getRecommendations = async (req, res) => {
  try {
    const { requirements } = req.body;

    if (!requirements || requirements.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Requirements are required",
      });
    }

    const recommendations = await aiService.generateRecommendations(requirements);

    return res.status(200).json({
      success: true,
      message: "✅ Recommendations generated successfully",
      data: recommendations,
    });
  } catch (error) {
    console.error("Error in getRecommendations:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating recommendations",
      error: error.message,
    });
  }
};

/**
 * Full AI orchestration: parse query → auto-build → explain
 * POST /api/ai/build
 * Body: { query: "string" }
 */
const buildPC = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Query is required",
      });
    }

    const result = await aiService.orchestrateBuildPC(query);

    return res.status(200).json({
      success: true,
      message: "✅ PC build generated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in buildPC:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error generating PC build",
    });
  }
};

module.exports = {
  testAIConnection,
  analyzeUserRequest,
  getRecommendations,
  buildPC,
};
