/**
 * Compatibility Controller
 * Handles HTTP requests for PC component compatibility features
 */

const CompatibilityService = require("../services/compatibilityService");
const AutoBuildService = require("../services/autoBuildService");

class CompatibilityController {
  /**
   * Check PC build compatibility
   * POST /api/compatibility/check-build
   * Body: { cpuId, mainboardId, ramId, gpuId, storageId, psuId, coolerId, caseId }
   */
  static async checkBuild(req, res) {
    try {
      const { cpuId, mainboardId, ramId, gpuId, storageId, psuId, coolerId, caseId } = req.body;

      // Validate required fields
      if (!cpuId || !mainboardId || !ramId || !storageId || !psuId || !coolerId || !caseId) {
        return res.status(400).json({
          success: false,
          error: "Missing required component IDs: cpuId, mainboardId, ramId, storageId, psuId, coolerId, caseId",
        });
      }

      const result = await CompatibilityService.checkBuildCompatibility({
        cpuId,
        mainboardId,
        ramId,
        gpuId,
        storageId,
        psuId,
        coolerId,
        caseId,
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Validate compatibility for two specific components
   * POST /api/compatibility/validate-pair
   * Body: { productId1, productId2, rule }
   */
  static async validatePair(req, res) {
    try {
      const { productId1, productId2, rule } = req.body;

      if (!productId1 || !productId2 || !rule) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: productId1, productId2, rule",
        });
      }

      const result = await CompatibilityService.validatePair(productId1, productId2, rule);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get recommended replacement products
   * GET /api/compatibility/recommendations/:productId/:category
   */
  static async getRecommendations(req, res) {
    try {
      const { productId, category } = req.params;

      if (!productId || !category) {
        return res.status(400).json({
          success: false,
          error: "Missing required parameters: productId, category",
        });
      }

      const result = await CompatibilityService.recommendReplacement(
        parseInt(productId),
        category
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get compatible products by category and filters
   * POST /api/compatibility/compatible-products/:category
   * Body: { socket, min_cores, max_tdp, ... }
   */
  static async getCompatibleProducts(req, res) {
    try {
      const { category } = req.params;
      const filters = req.body;

      if (!category) {
        return res.status(400).json({
          success: false,
          error: "Missing required parameter: category",
        });
      }

      const result = await CompatibilityService.getCompatibleProducts(filters, category);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Generate auto build based on budget
   * POST /api/compatibility/auto-build
   * Body: { budget, purpose, cpuPreference, gpuPreference, storageSize }
   */
  static async autoBuild(req, res) {
    try {
      const { budget, purpose, cpuPreference, gpuPreference, storageSize } = req.body;

      if (!budget || budget <= 0) {
        return res.status(400).json({
          success: false,
          error: "Invalid budget. Must be a positive number.",
        });
      }

      const preferences = {
        purpose: purpose || "gaming",
        cpuPreference: cpuPreference || "balanced",
        gpuPreference: gpuPreference || "performance",
        storageSize: storageSize || 500,
      };

      const result = await AutoBuildService.autoBuild(budget, preferences);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json({
        success: true,
        data: result.build,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get all compatibility rules
   * GET /api/compatibility/rules
   */
  static async getRules(req, res) {
    try {
      const rules = CompatibilityService.getAllRulesInfo();

      res.status(200).json({
        success: true,
        total_rules: rules.length,
        data: rules,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get specific compatibility rule info
   * GET /api/compatibility/rules/:ruleId
   */
  static async getRuleInfo(req, res) {
    try {
      const { ruleId } = req.params;

      if (!ruleId) {
        return res.status(400).json({
          success: false,
          error: "Missing required parameter: ruleId",
        });
      }

      const ruleInfo = CompatibilityService.getAllRulesInfo().find((r) => r.id.toString() === ruleId);

      if (!ruleInfo) {
        return res.status(404).json({
          success: false,
          error: "Rule not found",
        });
      }

      res.status(200).json({
        success: true,
        data: ruleInfo,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get build examples for different purposes
   * GET /api/compatibility/build-examples
   */
  static async getBuildExamples(req, res) {
    try {
      const examples = AutoBuildService.getBuildExamples();

      res.status(200).json({
        success: true,
        examples_count: Object.keys(examples).length,
        data: examples,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get budget allocation info
   * GET /api/compatibility/budget-allocation
   */
  static async getBudgetAllocation(req, res) {
    try {
      const allocation = AutoBuildService.BUDGET_ALLOCATION;

      const formatted = {};
      for (const [component, percentage] of Object.entries(allocation)) {
        formatted[component] = {
          percentage: percentage * 100,
          decimal: percentage,
        };
      }

      res.status(200).json({
        success: true,
        data: formatted,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = CompatibilityController;
