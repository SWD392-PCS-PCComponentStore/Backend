/**
 * Auto-Build Service
 * Automatically generates PC builds based on budget and preferences
 */

const specificationModelV2 = require("../models/specificationModelV2");
const productModel = require("../models/productModel");
const CompatibilityService = require("./compatibilityService");

class AutoBuildService {
  /**
   * Budget allocation percentages for each component
   */
  static BUDGET_ALLOCATION = {
    cpu: 0.25, // 25%
    mainboard: 0.1, // 10%
    ram: 0.15, // 15%
    gpu: 0.3, // 30%
    storage: 0.08, // 8%
    psu: 0.05, // 5%
    cooler: 0.03, // 3%
    case: 0.04, // 4%
  };

  /**
   * Generate auto build based on budget and preferences
   * @param {number} budget - Total budget in currency units
   * @param {object} preferences - Build preferences
   * @returns {Promise<object>} Generated build recommendation
   */
  static async autoBuild(budget, preferences = {}) {
    try {
      const {
        purpose = "gaming",
        cpuPreference = "performance",
        gpuPreference = "performance",
        cpuBrand = null,   // "Intel" | "AMD" | null
        gpuBrand = null,   // "NVIDIA" | "AMD" | null
        storageSize = 500,
      } = preferences;

      // Calculate budget allocations
      const allocations = {};
      for (const [component, percentage] of Object.entries(this.BUDGET_ALLOCATION)) {
        allocations[component] = Math.floor(budget * percentage);
      }

      // Adjust allocations based on purpose
      if (purpose === "gaming") {
        // Chơi game - ưu tiên GPU mạnh
        allocations.cpu      = Math.floor(budget * 0.22);
        allocations.mainboard = Math.floor(budget * 0.10);
        allocations.ram      = Math.floor(budget * 0.12);
        allocations.gpu      = Math.floor(budget * 0.34);
        allocations.storage  = Math.floor(budget * 0.08);
        allocations.psu      = Math.floor(budget * 0.07);
        allocations.cooler   = Math.floor(budget * 0.04);
        allocations.case     = Math.floor(budget * 0.03);
      } else if (purpose === "workstation") {
        // Đồ họa / render / CAD - ưu tiên CPU và RAM
        allocations.cpu      = Math.floor(budget * 0.28);
        allocations.mainboard = Math.floor(budget * 0.12);
        allocations.ram      = Math.floor(budget * 0.20);
        allocations.gpu      = Math.floor(budget * 0.18);
        allocations.storage  = Math.floor(budget * 0.10);
        allocations.psu      = Math.floor(budget * 0.06);
        allocations.cooler   = Math.floor(budget * 0.03);
        allocations.case     = Math.floor(budget * 0.03);
      } else if (purpose === "office") {
        // Văn phòng / học tập - không cần GPU rời
        allocations.cpu      = Math.floor(budget * 0.25);
        allocations.mainboard = Math.floor(budget * 0.20);
        allocations.ram      = Math.floor(budget * 0.15);
        allocations.gpu      = 0;
        allocations.storage  = Math.floor(budget * 0.15);
        allocations.psu      = Math.floor(budget * 0.10);
        allocations.cooler   = Math.floor(budget * 0.05);
        allocations.case     = Math.floor(budget * 0.10);
      } else if (purpose === "gaming_workstation") {
        // Hybrid: chơi game + làm 3D/render - cân bằng GPU và CPU/RAM
        allocations.cpu      = Math.floor(budget * 0.25);
        allocations.mainboard = Math.floor(budget * 0.10);
        allocations.ram      = Math.floor(budget * 0.16);
        allocations.gpu      = Math.floor(budget * 0.28);
        allocations.storage  = Math.floor(budget * 0.09);
        allocations.psu      = Math.floor(budget * 0.06);
        allocations.cooler   = Math.floor(budget * 0.03);
        allocations.case     = Math.floor(budget * 0.03);
      } else if (purpose === "streaming") {
        // Gaming + stream - CPU mạnh để encode, GPU đủ chơi game
        allocations.cpu      = Math.floor(budget * 0.26);
        allocations.mainboard = Math.floor(budget * 0.10);
        allocations.ram      = Math.floor(budget * 0.14);
        allocations.gpu      = Math.floor(budget * 0.28);
        allocations.storage  = Math.floor(budget * 0.08);
        allocations.psu      = Math.floor(budget * 0.07);
        allocations.cooler   = Math.floor(budget * 0.04);
        allocations.case     = Math.floor(budget * 0.03);
      } else if (purpose === "editing") {
        // Chỉnh sửa video / ảnh - CPU đa nhân + RAM lớn + SSD nhanh
        allocations.cpu      = Math.floor(budget * 0.28);
        allocations.mainboard = Math.floor(budget * 0.10);
        allocations.ram      = Math.floor(budget * 0.22);
        allocations.gpu      = Math.floor(budget * 0.14);
        allocations.storage  = Math.floor(budget * 0.14);
        allocations.psu      = Math.floor(budget * 0.06);
        allocations.cooler   = Math.floor(budget * 0.03);
        allocations.case     = Math.floor(budget * 0.03);
      } else if (purpose === "ai_ml") {
        // AI / Machine Learning - GPU VRAM cao + RAM lớn
        allocations.cpu      = Math.floor(budget * 0.20);
        allocations.mainboard = Math.floor(budget * 0.10);
        allocations.ram      = Math.floor(budget * 0.18);
        allocations.gpu      = Math.floor(budget * 0.36);
        allocations.storage  = Math.floor(budget * 0.08);
        allocations.psu      = Math.floor(budget * 0.05);
        allocations.cooler   = Math.floor(budget * 0.02);
        allocations.case     = Math.floor(budget * 0.01);
      } else if (purpose === "budget") {
        // Budget tối giản - linh kiện rẻ nhất có thể dùng được
        allocations.cpu      = Math.floor(budget * 0.22);
        allocations.mainboard = Math.floor(budget * 0.18);
        allocations.ram      = Math.floor(budget * 0.15);
        allocations.gpu      = Math.floor(budget * 0.20);
        allocations.storage  = Math.floor(budget * 0.12);
        allocations.psu      = Math.floor(budget * 0.08);
        allocations.cooler   = Math.floor(budget * 0.03);
        allocations.case     = Math.floor(budget * 0.02);
      } else if (purpose === "home_server") {
        // NAS / Home server - RAM + storage lớn, không cần GPU rời
        allocations.cpu      = Math.floor(budget * 0.20);
        allocations.mainboard = Math.floor(budget * 0.15);
        allocations.ram      = Math.floor(budget * 0.25);
        allocations.gpu      = 0;
        allocations.storage  = Math.floor(budget * 0.25);
        allocations.psu      = Math.floor(budget * 0.10);
        allocations.cooler   = Math.floor(budget * 0.03);
        allocations.case     = Math.floor(budget * 0.02);
      }

      // Fetch all products by category
      const [allCpus, mainboards, rams, allGpus, storages, psus, coolers, cases] = await Promise.all([
        this.getAllProductsByCategory("cpu"),
        this.getAllProductsByCategory("mainboard"),
        this.getAllProductsByCategory("ram"),
        this.getAllProductsByCategory("gpu"),
        this.getAllProductsByCategory("storage"),
        this.getAllProductsByCategory("psu"),
        this.getAllProductsByCategory("cooler_cpu"),
        this.getAllProductsByCategory("case"),
      ]);

      // Filter by brand preference (fallback to all if no match found)
      // GPU AMD = Sapphire/XFX/PowerColor/Gigabyte RX/Radeon — match by "RX" or "Radeon" keywords
      // GPU NVIDIA = ASUS/MSI/Gigabyte RTX/GTX — match by "RTX" or "GTX" keywords
      const filterByBrand = (products, brand, category = "") => {
        if (!brand) return products;
        let keywords = [brand.toLowerCase()];
        if (category === "gpu") {
          if (brand === "AMD")    keywords = ["rx ", "radeon", " rx"];
          if (brand === "NVIDIA") keywords = ["rtx", "gtx"];
        }
        const filtered = products.filter(
          (p) => p.product_name && keywords.some(kw => p.product_name.toLowerCase().includes(kw))
        );
        return filtered.length > 0 ? filtered : products;
      };

      const cpus = filterByBrand(allCpus, cpuBrand, "cpu");
      const gpus = filterByBrand(allGpus, gpuBrand, "gpu");

      // Select best components within budget
      const selectedBuild = {
        purpose: purpose,
        budget_total: budget,
        budget_allocation: allocations,
        components: {},
      };

      // Select CPU
      const cpu = await this.selectBestComponent(cpus, allocations.cpu, "cpu", cpuPreference);
      if (cpu) {
        selectedBuild.components.cpu = cpu;
      } else {
        throw new Error("No CPU found within budget");
      }

      // Select Mainboard (compatible with CPU socket)
      const mainboard = await this.selectCompatibleMainboard(
        mainboards,
        cpu,
        allocations.mainboard
      );
      if (mainboard) {
        selectedBuild.components.mainboard = mainboard;
      } else {
        throw new Error("No compatible Mainboard found");
      }

      // Select RAM (compatible with Mainboard)
      const ram = await this.selectCompatibleRAM(rams, mainboard, allocations.ram);
      if (ram) {
        selectedBuild.components.ram = ram;
      } else {
        throw new Error("No compatible RAM found");
      }

      // Select GPU (optional, based on preference)
      if (gpuPreference !== "none") {
        const gpu = await this.selectBestComponent(gpus, allocations.gpu, "gpu", gpuPreference);
        if (gpu) {
          selectedBuild.components.gpu = gpu;
        }
      }

      // Select Storage
      const storage = await this.selectBestStorage(storages, allocations.storage, storageSize);
      if (storage) {
        selectedBuild.components.storage = storage;
      } else {
        throw new Error("No Storage found within budget");
      }

      // Select Cooler (compatible with CPU socket)
      const cooler = await this.selectCompatibleCooler(coolers, cpu, allocations.cooler);
      if (cooler) {
        selectedBuild.components.cooler = cooler;
      } else {
        throw new Error("No compatible Cooler found");
      }

      // Select PSU (sufficient wattage)
      const totalTDP = cpu.specs.tdp + (selectedBuild.components.gpu?.specs.tdp || 0);
      const requiredWattage = Math.ceil(totalTDP * 1.3);
      const psu = await this.selectSufficientPSU(psus, requiredWattage, allocations.psu);
      if (psu) {
        selectedBuild.components.psu = psu;
      } else {
        throw new Error("No suitable PSU found");
      }

      // Select Case
      const pcCase = await this.selectCompatibleCase(
        cases,
        selectedBuild.components.gpu,
        cooler,
        allocations.case
      );
      if (pcCase) {
        selectedBuild.components.case = pcCase;
      } else {
        throw new Error("No suitable Case found");
      }

      // Budget optimization: upgrade components with remaining budget
      // Priority: GPU → CPU (same socket) → RAM (same type)
      let spent = Object.values(selectedBuild.components).reduce((s, c) => s + (c?.price || 0), 0);
      let remaining = budget - spent;

      if (remaining > 0 && gpuPreference !== "none") {
        const newGpuBudget = (selectedBuild.components.gpu?.price || 0) + remaining;
        const upgradedGpu = gpus
          .filter((g) => g.price <= newGpuBudget && g.price > (selectedBuild.components.gpu?.price || 0))
          .sort((a, b) => b.price - a.price)[0];
        if (upgradedGpu) {
          remaining -= upgradedGpu.price - (selectedBuild.components.gpu?.price || 0);
          selectedBuild.components.gpu = upgradedGpu;
        }
      }

      if (remaining > 0) {
        const currentSocket = selectedBuild.components.cpu?.specs.socket;
        const newCpuBudget = (selectedBuild.components.cpu?.price || 0) + remaining;
        const upgradedCpu = cpus
          .filter((c) =>
            c.price <= newCpuBudget &&
            c.price > (selectedBuild.components.cpu?.price || 0) &&
            c.specs.socket === currentSocket
          )
          .sort((a, b) => b.price - a.price)[0];
        if (upgradedCpu) {
          remaining -= upgradedCpu.price - (selectedBuild.components.cpu?.price || 0);
          selectedBuild.components.cpu = upgradedCpu;
        }
      }

      if (remaining > 0) {
        const ramType = selectedBuild.components.mainboard?.specs.ram_type;
        const newRamBudget = (selectedBuild.components.ram?.price || 0) + remaining;
        const upgradedRam = rams
          .filter((r) =>
            r.price <= newRamBudget &&
            r.price > (selectedBuild.components.ram?.price || 0) &&
            r.specs.type === ramType
          )
          .sort((a, b) => b.price - a.price)[0];
        if (upgradedRam) {
          selectedBuild.components.ram = upgradedRam;
        }
      }

      // Calculate total cost
      selectedBuild.estimated_total_cost = Object.keys(selectedBuild.components)
        .filter((k) => k !== "gpu" || preferences.gpuPreference !== "none")
        .reduce((sum, key) => sum + (selectedBuild.components[key]?.price || 0), 0);

      selectedBuild.cost_over_budget = selectedBuild.estimated_total_cost - budget;

      // Verify compatibility
      const compatibility = await CompatibilityService.checkBuildCompatibility({
        cpuId: selectedBuild.components.cpu.product_id,
        mainboardId: selectedBuild.components.mainboard.product_id,
        ramId: selectedBuild.components.ram.product_id,
        gpuId: selectedBuild.components.gpu?.product_id || null,
        storageId: selectedBuild.components.storage.product_id,
        psuId: selectedBuild.components.psu.product_id,
        coolerId: selectedBuild.components.cooler.product_id,
        caseId: selectedBuild.components.case.product_id,
      });

      selectedBuild.compatibility = compatibility;

      return {
        success: true,
        build: selectedBuild,
      };
    } catch (error) {
      const msg = error.message || "";
      const budgetErrors = [
        "No CPU found",
        "No compatible Mainboard",
        "No compatible RAM",
        "No Storage found",
        "No compatible Cooler",
        "No suitable PSU",
        "No suitable Case",
      ];
      const isBudgetError = budgetErrors.some((e) => msg.includes(e));

      if (isBudgetError) {
        const formatted = budget.toLocaleString("vi-VN");
        return {
          success: false,
          error: msg,
          message:
            `Rất tiếc, ngân sách ${formatted}đ chưa đủ để hoàn thiện cấu hình PC. ` +
            `Bạn hãy cân nhắc thêm ngân sách một chút nhé! 💡 ` +
            `Gợi ý: thử bắt đầu từ 15–20 triệu cho build cơ bản.`,
          budget_too_low: true,
        };
      }

      return {
        success: false,
        error: msg,
      };
    }
  }

  /**
   * Get all products by category with specs and prices
   */
  static async getAllProductsByCategory(category) {
    try {
      const products = await specificationModelV2.getAllSpecsByCategory(category);
      return products
        .map((p) => {
          try {
            return {
              product_id: p.PRODUCT_ID,
              product_name: p.PRODUCT_NAME,
              price: p.PRODUCT_PRICE || 0,
              specs: JSON.parse(p.specs_json || "{}"),
            };
          } catch {
            return null;
          }
        })
        .filter((p) => p && p.specs && Object.keys(p.specs).length > 0);
    } catch (error) {
      console.error(`Error fetching ${category} products:`, error);
      return [];
    }
  }

  /**
   * Select best component within budget
   */
  static async selectBestComponent(products, budget, category, preference = "balanced") {
    // Filter by budget
    const withinBudget = products.filter((p) => p.price <= budget && p.price > 0);

    if (withinBudget.length === 0) return null;

    let sorted = [...withinBudget];

    if (category === "cpu") {
      if (preference === "budget") {
        sorted.sort((a, b) => a.price - b.price);
      } else if (preference === "performance") {
        // Highest price = best CPU within budget
        sorted.sort((a, b) => b.price - a.price);
      } else {
        // balanced - most cores within budget, then price as tiebreak
        sorted.sort((a, b) =>
          (b.specs.cores || 0) - (a.specs.cores || 0) || b.price - a.price
        );
      }
    } else if (category === "gpu") {
      if (preference === "budget") {
        sorted.sort((a, b) => a.price - b.price);
      } else {
        // performance or balanced - highest price = best GPU
        sorted.sort((a, b) => b.price - a.price);
      }
    }

    return sorted[0];
  }

  /**
   * Select compatible Mainboard (same socket as CPU)
   * Falls back to cheapest compatible mainboard if nothing fits within budget
   */
  static async selectCompatibleMainboard(mainboards, cpu, budget) {
    const sameSocket = mainboards.filter((m) => m.specs.socket === cpu.specs.socket);
    const withinBudget = sameSocket.filter((m) => m.price <= budget);
    if (withinBudget.length > 0) {
      withinBudget.sort((a, b) => a.price - b.price);
      return withinBudget[0];
    }
    // Fallback: cheapest compatible mainboard regardless of budget
    if (sameSocket.length > 0) {
      sameSocket.sort((a, b) => a.price - b.price);
      return sameSocket[0];
    }
    return null;
  }

  /**
   * Select compatible RAM (same type as Mainboard)
   * Falls back to cheapest compatible RAM if nothing fits within budget
   */
  static async selectCompatibleRAM(rams, mainboard, budget) {
    const sameType = rams.filter((r) => r.specs.type === mainboard.specs.ram_type);
    const compatible = sameType.filter((r) => r.price <= budget);
    if (compatible.length === 0 && sameType.length > 0) {
      sameType.sort((a, b) => a.price - b.price);
      return sameType[0];
    }
    if (compatible.length === 0) return null;
    // Sort by capacity then speed
    compatible.sort(
      (a, b) =>
        (b.specs.capacity_gb || 0) - (a.specs.capacity_gb || 0) ||
        (b.specs.speed_mhz || 0) - (a.specs.speed_mhz || 0)
    );
    return compatible[0];
  }

  /**
   * Select compatible Cooler (supports CPU socket and TDP)
   * Falls back to cheapest compatible cooler if nothing fits within budget
   */
  static async selectCompatibleCooler(coolers, cpu, budget) {
    const isCompatible = (c) => {
      const sockets = Array.isArray(c.specs.supported_sockets)
        ? c.specs.supported_sockets
        : [c.specs.supported_sockets];
      return sockets.includes(cpu.specs.socket) && (c.specs.max_tdp || 9999) >= cpu.specs.tdp;
    };

    const withinBudget = coolers.filter((c) => c.price <= budget && isCompatible(c));
    if (withinBudget.length > 0) {
      withinBudget.sort((a, b) => a.price - b.price);
      return withinBudget[0];
    }

    // Fallback: cheapest compatible cooler regardless of budget
    const anyCompatible = coolers.filter(isCompatible);
    if (anyCompatible.length > 0) {
      anyCompatible.sort((a, b) => a.price - b.price);
      return anyCompatible[0];
    }

    return null;
  }

  /**
   * Select storage within budget and size
   */
  static async selectBestStorage(storages, budget, preferredSize = 500) {
    const compatible = storages.filter((s) => s.price <= budget);
    if (compatible.length === 0) return null;
    // Sort by capacity (prefer at least preferred size, then by speed)
    compatible.sort((a, b) => {
      const aCapacity = a.specs.capacity_gb || 0;
      const bCapacity = b.specs.capacity_gb || 0;
      if (aCapacity >= preferredSize && bCapacity < preferredSize) return -1;
      if (bCapacity >= preferredSize && aCapacity < preferredSize) return 1;
      return (b.specs.speed_mbps || 0) - (a.specs.speed_mbps || 0);
    });
    return compatible[0];
  }

  /**
   * Select PSU with sufficient wattage
   * Falls back to cheapest sufficient PSU if nothing fits within budget
   */
  static async selectSufficientPSU(psus, requiredWattage, budget) {
    const hasSufficientWattage = (p) => (p.specs.wattage || 0) >= requiredWattage;

    const withinBudget = psus.filter((p) => p.price <= budget && hasSufficientWattage(p));
    if (withinBudget.length > 0) {
      withinBudget.sort((a, b) => a.price - b.price);
      return withinBudget[0];
    }

    // Fallback: cheapest PSU with sufficient wattage regardless of budget
    const anySufficient = psus.filter(hasSufficientWattage);
    if (anySufficient.length > 0) {
      anySufficient.sort((a, b) => a.price - b.price);
      return anySufficient[0];
    }

    // Last resort: highest wattage available
    if (psus.length > 0) {
      return psus.slice().sort((a, b) => (b.specs.wattage || 0) - (a.specs.wattage || 0))[0];
    }

    return null;
  }

  /**
   * Select compatible Case (fits GPU and Cooler)
   * Falls back to cheapest compatible case if nothing fits within budget
   */
  static async selectCompatibleCase(cases, gpu, cooler, budget) {
    const gpuLength = gpu?.specs.length_mm || 0;
    const coolerHeight = cooler?.specs.height_mm || 0;

    const fitsPhysically = (c) =>
      (!gpu || (c.specs.max_gpu_length_mm || 9999) >= gpuLength) &&
      (!cooler || (c.specs.max_cooler_height_mm || 9999) >= coolerHeight);

    // Try within budget first
    const withinBudget = cases.filter((c) => c.price <= budget && fitsPhysically(c));
    if (withinBudget.length > 0) {
      withinBudget.sort((a, b) => a.price - b.price);
      return withinBudget[0];
    }

    // Fallback: cheapest physically-compatible case regardless of budget
    const anyCompatible = cases.filter(fitsPhysically);
    if (anyCompatible.length > 0) {
      anyCompatible.sort((a, b) => a.price - b.price);
      return anyCompatible[0];
    }

    // Last resort: cheapest case available
    if (cases.length > 0) {
      return cases.slice().sort((a, b) => a.price - b.price)[0];
    }

    return null;
  }

  /**
   * Get build recommendation examples
   */
  static getBuildExamples() {
    return {
      gaming_budget: {
        description: "Budget gaming PC - 1080p gaming",
        budget: 500,
        purpose: "gaming",
        preferences: { cpuPreference: "balanced", gpuPreference: "performance" },
      },
      gaming_mid: {
        description: "Mid-range gaming PC - 1440p gaming",
        budget: 1000,
        purpose: "gaming",
        preferences: { cpuPreference: "performance", gpuPreference: "performance" },
      },
      gaming_high: {
        description: "High-end gaming PC - 4K gaming",
        budget: 2500,
        purpose: "gaming",
        preferences: { cpuPreference: "performance", gpuPreference: "high-end" },
      },
      workstation_budget: {
        description: "Budget workstation - light tasks",
        budget: 800,
        purpose: "workstation",
        preferences: { cpuPreference: "balanced", gpuPreference: "budget" },
      },
      workstation_pro: {
        description: "Professional workstation - heavy tasks",
        budget: 2000,
        purpose: "workstation",
        preferences: { cpuPreference: "performance", gpuPreference: "performance" },
      },
      office_budget: {
        description: "Office PC - basic tasks",
        budget: 300,
        purpose: "office",
        preferences: { cpuPreference: "budget", gpuPreference: "none" },
      },
    };
  }
}

module.exports = AutoBuildService;
