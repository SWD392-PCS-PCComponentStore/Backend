/**
 * Compatibility Service
 * Handles PC component compatibility checking, recommendations, and filtering
 */

const CompatibilityRules = require("../utils/compatibilityRules");
const specificationModelV2 = require("../models/specificationModelV2");
const productModel = require("../models/productModel");

class CompatibilityService {
  /**
   * Check if a PC build is compatible
   * @param {array} productIds - Array of product IDs [cpuId, mainboardId, ramId, gpuId, storageId, psuId, coolerId, caseId]
   * @returns {Promise<object>} Compatibility check results
   */
  static async checkBuildCompatibility(productIds) {
    try {
      const { cpuId, mainboardId, ramId, gpuId, storageId, psuId, coolerId, caseId } = productIds;

      // Fetch all specs
      const [cpuSpecsResult, mainboardSpecsResult, ramSpecsResult, gpuSpecsResult, storageSpecsResult, psuSpecsResult, coolerSpecsResult, caseSpecsResult] =
        await Promise.all([
          specificationModelV2.getJsonSpecsByProductId(cpuId),
          specificationModelV2.getJsonSpecsByProductId(mainboardId),
          specificationModelV2.getJsonSpecsByProductId(ramId),
          gpuId ? specificationModelV2.getJsonSpecsByProductId(gpuId) : null,
          specificationModelV2.getJsonSpecsByProductId(storageId),
          specificationModelV2.getJsonSpecsByProductId(psuId),
          specificationModelV2.getJsonSpecsByProductId(coolerId),
          specificationModelV2.getJsonSpecsByProductId(caseId),
        ]);

      // Parse JSON specs from database results
      const cpuSpecs = cpuSpecsResult?.recordset?.[0]?.specs_json ? JSON.parse(cpuSpecsResult.recordset[0].specs_json) : {};
      const mainboardSpecs = mainboardSpecsResult?.recordset?.[0]?.specs_json ? JSON.parse(mainboardSpecsResult.recordset[0].specs_json) : {};
      const ramSpecs = ramSpecsResult?.recordset?.[0]?.specs_json ? JSON.parse(ramSpecsResult.recordset[0].specs_json) : {};
      const gpuSpecs = gpuSpecsResult?.recordset?.[0]?.specs_json ? JSON.parse(gpuSpecsResult.recordset[0].specs_json) : null;
      const storageSpecs = storageSpecsResult?.recordset?.[0]?.specs_json ? JSON.parse(storageSpecsResult.recordset[0].specs_json) : {};
      const psuSpecs = psuSpecsResult?.recordset?.[0]?.specs_json ? JSON.parse(psuSpecsResult.recordset[0].specs_json) : {};
      const coolerSpecs = coolerSpecsResult?.recordset?.[0]?.specs_json ? JSON.parse(coolerSpecsResult.recordset[0].specs_json) : {};
      const caseSpecs = caseSpecsResult?.recordset?.[0]?.specs_json ? JSON.parse(caseSpecsResult.recordset[0].specs_json) : {};

      // Fetch product names
      const [cpuProduct, mainboardProduct, ramProduct, gpuProduct, storageProduct, psuProduct, coolerProduct, caseProduct] =
        await Promise.all([
          productModel.getById(cpuId),
          productModel.getById(mainboardId),
          productModel.getById(ramId),
          gpuId ? productModel.getById(gpuId) : null,
          productModel.getById(storageId),
          productModel.getById(psuId),
          productModel.getById(coolerId),
          productModel.getById(caseId),
        ]);

      // Extract product data from result sets
      const cpuName = cpuProduct?.recordset?.[0];
      const mainboardName = mainboardProduct?.recordset?.[0];
      const ramName = ramProduct?.recordset?.[0];
      const gpuName = gpuProduct?.recordset?.[0];
      const storageName = storageProduct?.recordset?.[0];
      const psuName = psuProduct?.recordset?.[0];
      const coolerName = coolerProduct?.recordset?.[0];
      const caseName = caseProduct?.recordset?.[0];

      // Run compatibility checks
      const checkResults = CompatibilityRules.runAllChecks({
        cpu: {
          ...cpuSpecs,
          product_id: cpuId,
          product_name: cpuName?.name,
        },
        mainboard: {
          ...mainboardSpecs,
          product_id: mainboardId,
          product_name: mainboardName?.name,
        },
        ram: {
          ...ramSpecs,
          product_id: ramId,
          product_name: ramName?.name,
        },
        gpu: gpuSpecs
          ? {
              ...gpuSpecs,
              product_id: gpuId,
              product_name: gpuName?.name,
            }
          : null,
        storage: {
          ...storageSpecs,
          product_id: storageId,
          product_name: storageName?.name,
        },
        psu: {
          ...psuSpecs,
          product_id: psuId,
          product_name: psuName?.name,
        },
        cooler: {
          ...coolerSpecs,
          product_id: coolerId,
          product_name: coolerName?.name,
        },
        case: {
          ...caseSpecs,
          product_id: caseId,
          product_name: caseName?.name,
        },
      });

      return {
        success: true,
        is_compatible: checkResults.summary.is_compatible,
        compatibility_score: checkResults.summary.compatibility_score,
        summary: checkResults.summary,
        checks: checkResults.checks,
        errors: checkResults.errors,
        warnings: checkResults.warnings,
        build_details: {
          cpu: `${cpuName?.PRODUCT_NAME} (ID: ${cpuId})`,
          mainboard: `${mainboardName?.PRODUCT_NAME} (ID: ${mainboardId})`,
          ram: `${ramName?.PRODUCT_NAME} (ID: ${ramId})`,
          gpu: gpuId ? `${gpuName?.PRODUCT_NAME} (ID: ${gpuId})` : "None",
          storage: `${storageName?.PRODUCT_NAME} (ID: ${storageId})`,
          psu: `${psuName?.PRODUCT_NAME} (ID: ${psuId})`,
          cooler: `${coolerName?.PRODUCT_NAME} (ID: ${coolerId})`,
          case: `${caseName?.PRODUCT_NAME} (ID: ${caseId})`,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get compatible replacement products for a specific component
   * @param {number} productId - Current product ID
   * @param {string} category - Component category (cpu, gpu, mainboard, etc.)
   * @returns {Promise<array>} List of compatible products
   */
  static async recommendReplacement(productId, category) {
    try {
      // Get current product specs
      const currentSpecs = await specificationModelV2.getJsonSpecsByProductId(productId);
      const productsInCategory = await specificationModelV2.getAllSpecsByCategory(category);

      // Filter based on category rules
      let compatibleProducts = [];

      if (category.toLowerCase() === "cpu") {
        // Recommend CPUs with similar or better specs
        compatibleProducts = productsInCategory.filter((p) => {
          if (p.PRODUCT_ID === productId) return false;
          const specs = JSON.parse(p.specs_json);
          // Same socket, similar or higher performance
          return specs.socket === currentSpecs.socket && specs.cores >= (currentSpecs.cores || 0);
        });
      } else if (category.toLowerCase() === "mainboard") {
        // Recommend mainboards with same socket and RAM type
        compatibleProducts = productsInCategory.filter((p) => {
          if (p.PRODUCT_ID === productId) return false;
          const specs = JSON.parse(p.specs_json);
          return (
            specs.socket === currentSpecs.socket && specs.ram_type === (currentSpecs.ram_type || specs.ram_type)
          );
        });
      } else if (category.toLowerCase() === "ram") {
        // Recommend RAM with same type and similar performance
        compatibleProducts = productsInCategory.filter((p) => {
          if (p.PRODUCT_ID === productId) return false;
          const specs = JSON.parse(p.specs_json);
          return specs.type === currentSpecs.type && specs.speed_mhz >= (currentSpecs.speed_mhz || 0);
        });
      } else if (category.toLowerCase() === "gpu") {
        // Recommend GPUs with similar VRAM
        compatibleProducts = productsInCategory.filter((p) => {
          if (p.PRODUCT_ID === productId) return false;
          const specs = JSON.parse(p.specs_json);
          return specs.memory_gb >= (currentSpecs.memory_gb || 0);
        });
      } else if (category.toLowerCase() === "cooler_cpu") {
        // Recommend coolers with better or equal TDP support
        compatibleProducts = productsInCategory.filter((p) => {
          if (p.PRODUCT_ID === productId) return false;
          const specs = JSON.parse(p.specs_json);
          return specs.max_tdp >= (currentSpecs.max_tdp || 0);
        });
      } else {
        // For other categories, just return all other products
        compatibleProducts = productsInCategory.filter((p) => p.PRODUCT_ID !== productId);
      }

      return {
        success: true,
        current_product_id: productId,
        category: category,
        recommendations_count: compatibleProducts.length,
        recommendations: compatibleProducts.slice(0, 10).map((p) => ({
          product_id: p.PRODUCT_ID,
          product_name: p.PRODUCT_NAME,
          specs: JSON.parse(p.specs_json),
        })),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get compatible products based on specifications
   * @param {object} specs - Specifications to filter by
   * @param {string} category - Component category to search in
   * @returns {Promise<array>} List of compatible products
   */
  static async getCompatibleProducts(specs, category) {
    try {
      const allProducts = await specificationModelV2.getAllSpecsByCategory(category);

      let compatibleProducts = allProducts;

      // Apply filters based on category
      if (category.toLowerCase() === "cpu") {
        if (specs.socket)
          compatibleProducts = compatibleProducts.filter((p) => {
            const s = JSON.parse(p.specs_json);
            return s.socket === specs.socket;
          });
        if (specs.min_cores)
          compatibleProducts = compatibleProducts.filter((p) => {
            const s = JSON.parse(p.specs_json);
            return s.cores >= specs.min_cores;
          });
        if (specs.max_tdp)
          compatibleProducts = compatibleProducts.filter((p) => {
            const s = JSON.parse(p.specs_json);
            return s.tdp <= specs.max_tdp;
          });
      } else if (category.toLowerCase() === "mainboard") {
        if (specs.socket)
          compatibleProducts = compatibleProducts.filter((p) => {
            const s = JSON.parse(p.specs_json);
            return s.socket === specs.socket;
          });
        if (specs.ram_type)
          compatibleProducts = compatibleProducts.filter((p) => {
            const s = JSON.parse(p.specs_json);
            return s.ram_type === specs.ram_type;
          });
        if (specs.chipset)
          compatibleProducts = compatibleProducts.filter((p) => {
            const s = JSON.parse(p.specs_json);
            return s.chipset === specs.chipset;
          });
      } else if (category.toLowerCase() === "ram") {
        if (specs.type)
          compatibleProducts = compatibleProducts.filter((p) => {
            const s = JSON.parse(p.specs_json);
            return s.type === specs.type;
          });
        if (specs.min_capacity)
          compatibleProducts = compatibleProducts.filter((p) => {
            const s = JSON.parse(p.specs_json);
            return s.capacity_gb >= specs.min_capacity;
          });
        if (specs.min_speed)
          compatibleProducts = compatibleProducts.filter((p) => {
            const s = JSON.parse(p.specs_json);
            return s.speed_mhz >= specs.min_speed;
          });
      } else if (category.toLowerCase() === "cooler_cpu") {
        if (specs.socket)
          compatibleProducts = compatibleProducts.filter((p) => {
            const s = JSON.parse(p.specs_json);
            const sockets = Array.isArray(s.supported_sockets) ? s.supported_sockets : [s.supported_sockets];
            return sockets.includes(specs.socket);
          });
        if (specs.min_tdp)
          compatibleProducts = compatibleProducts.filter((p) => {
            const s = JSON.parse(p.specs_json);
            return s.max_tdp >= specs.min_tdp;
          });
      }

      return {
        success: true,
        category: category,
        filters: specs,
        results_count: compatibleProducts.length,
        results: compatibleProducts.map((p) => ({
          product_id: p.PRODUCT_ID,
          product_name: p.PRODUCT_NAME,
          specs: JSON.parse(p.specs_json),
        })),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get compatibility summary for a single component pair
   * @param {number} productId1 - First product ID
   * @param {number} productId2 - Second product ID
   * @param {string} rule - Which rule to check (e.g., "CPU_SOCKET_MATCH")
   * @returns {Promise<object>} Detailed compatibility info
   */
  static async validatePair(productId1, productId2, rule) {
    try {
      const specs1 = await specificationModelV2.getJsonSpecsByProductId(productId1);
      const specs2 = await specificationModelV2.getJsonSpecsByProductId(productId2);
      const product1 = await productModel.getProductById(productId1);
      const product2 = await productModel.getProductById(productId2);

      let result;

      switch (rule) {
        case "CPU_SOCKET_MATCH":
          result = CompatibilityRules.checkCPUMainboardSocket(specs1, specs2);
          break;
        case "RAM_TYPE_SUPPORT":
          result = CompatibilityRules.checkRAMTypeSupport(specs1, specs2);
          break;
        case "COOLER_SOCKET_SUPPORT":
          result = CompatibilityRules.checkCoolerSocket(specs1, specs2);
          break;
        case "GPU_CASE_SIZE_FIT":
          result = CompatibilityRules.checkGPUCaseSize(specs1, specs2);
          break;
        case "COOLER_CASE_SIZE_FIT":
          result = CompatibilityRules.checkCoolerCaseSize(specs1, specs2);
          break;
        default:
          result = { valid: false, error: "Unknown rule" };
      }

      return {
        success: true,
        rule: rule,
        product1: {
          id: productId1,
          name: product1?.PRODUCT_NAME,
          specs: specs1,
        },
        product2: {
          id: productId2,
          name: product2?.PRODUCT_NAME,
          specs: specs2,
        },
        result: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get all compatibility rules info
   */
  static getAllRulesInfo() {
    return CompatibilityRules.getAllRulesInfo();
  }
}

module.exports = CompatibilityService;
