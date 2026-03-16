/**
 * Compatibility Rules Engine
 * Defines all 6 PC component compatibility rules
 */

class CompatibilityRules {
  /**
   * RULE 1: CPU Socket ↔ Mainboard Socket Match
   */
  static checkCPUMainboardSocket(cpuSpecs, mainboardSpecs) {
    if (!cpuSpecs?.socket || !mainboardSpecs?.socket) {
      return {
        valid: false,
        error: "Missing socket specification",
        severity: "error",
      };
    }

    const match = cpuSpecs.socket === mainboardSpecs.socket;
    return {
      valid: match,
      cpu_socket: cpuSpecs.socket,
      motherboard_socket: mainboardSpecs.socket,
      error: match ? null : `Socket mismatch: CPU needs ${cpuSpecs.socket}, Motherboard has ${mainboardSpecs.socket}`,
      severity: "error",
      rule: "CPU_SOCKET_MATCH",
    };
  }

  /**
   * RULE 2: RAM Type ↔ Mainboard RAM Support
   */
  static checkRAMTypeSupport(ramSpecs, mainboardSpecs) {
    if (!ramSpecs?.type || !mainboardSpecs?.ram_type) {
      return {
        valid: false,
        error: "Missing RAM type specification",
        severity: "error",
      };
    }

    const match = ramSpecs.type === mainboardSpecs.ram_type;
    return {
      valid: match,
      ram_type: ramSpecs.type,
      motherboard_ram_support: mainboardSpecs.ram_type,
      error: match ? null : `RAM type mismatch: RAM is ${ramSpecs.type}, Motherboard supports ${mainboardSpecs.ram_type}`,
      severity: "error",
      rule: "RAM_TYPE_SUPPORT",
    };
  }

  /**
   * RULE 3: PSU Wattage >= Total TDP × 1.3 (Safety Headroom)
   */
  static checkPSUWattage(cpuSpecs, gpuSpecs, psuSpecs) {
    if (!cpuSpecs?.tdp || !psuSpecs?.wattage) {
      return {
        valid: false,
        error: "Missing TDP or PSU wattage specification",
        severity: "warning",
      };
    }

    const cpuTdp = cpuSpecs.tdp || 0;
    const gpuTdp = gpuSpecs?.tdp || 0;
    const totalTdp = cpuTdp + gpuTdp;
    const requiredWattage = totalTdp * 1.3; // 30% safety headroom

    const sufficient = psuSpecs.wattage >= requiredWattage;
    return {
      valid: sufficient,
      cpu_tdp: cpuTdp,
      gpu_tdp: gpuTdp,
      total_tdp: totalTdp,
      required_wattage: Math.ceil(requiredWattage),
      psu_wattage: psuSpecs.wattage,
      safety_headroom_percent: 30,
      error: sufficient
        ? null
        : `Insufficient PSU: requires at least ${Math.ceil(requiredWattage)}W for TDP ${totalTdp}W, but only ${psuSpecs.wattage}W available`,
      severity: sufficient ? "ok" : "warning",
      rule: "PSU_WATTAGE_SUFFICIENT",
    };
  }

  /**
   * RULE 4: CPU Cooler Socket Support
   */
  static checkCoolerSocket(cpuSpecs, coolerSpecs) {
    if (!cpuSpecs?.socket || !coolerSpecs?.supported_sockets) {
      return {
        valid: false,
        error: "Missing socket or cooler support specification",
        severity: "error",
      };
    }

    const sockets = Array.isArray(coolerSpecs.supported_sockets)
      ? coolerSpecs.supported_sockets
      : [coolerSpecs.supported_sockets];

    const supported = sockets.includes(cpuSpecs.socket);
    return {
      valid: supported,
      cpu_socket: cpuSpecs.socket,
      cooler_supported_sockets: sockets,
      error: supported ? null : `Cooler doesn't support ${cpuSpecs.socket}. Supports: ${sockets.join(", ")}`,
      severity: "error",
      rule: "COOLER_SOCKET_SUPPORT",
    };
  }

  /**
   * RULE 5: Cooler TDP Support
   */
  static checkCoolerTDP(cpuSpecs, coolerSpecs) {
    if (!cpuSpecs?.tdp || !coolerSpecs?.max_tdp) {
      return {
        valid: false,
        error: "Missing TDP or cooler max TDP specification",
        severity: "warning",
      };
    }

    const sufficient = coolerSpecs.max_tdp >= cpuSpecs.tdp;
    return {
      valid: sufficient,
      cpu_tdp: cpuSpecs.tdp,
      cooler_max_tdp: coolerSpecs.max_tdp,
      error: sufficient
        ? null
        : `Cooler TDP insufficient: CPU is ${cpuSpecs.tdp}W but cooler handles only ${coolerSpecs.max_tdp}W`,
      severity: sufficient ? "ok" : "warning",
      rule: "COOLER_TDP_SUPPORT",
    };
  }

  /**
   * RULE 6A: GPU Length ≤ Case GPU Clearance
   */
  static checkGPUCaseSize(gpuSpecs, caseSpecs) {
    if (!gpuSpecs?.length_mm || !caseSpecs?.max_gpu_length_mm) {
      return {
        valid: true, // Skip if specs missing
        error: null,
        severity: "info",
      };
    }

    const fits = gpuSpecs.length_mm <= caseSpecs.max_gpu_length_mm;
    return {
      valid: fits,
      gpu_length_mm: gpuSpecs.length_mm,
      case_max_gpu_length_mm: caseSpecs.max_gpu_length_mm,
      error: fits ? null : `GPU too long: ${gpuSpecs.length_mm}mm but case supports max ${caseSpecs.max_gpu_length_mm}mm`,
      severity: fits ? "ok" : "error",
      rule: "GPU_CASE_SIZE_FIT",
    };
  }

  /**
   * RULE 6B: Cooler Height ≤ Case Cooler Clearance
   */
  static checkCoolerCaseSize(coolerSpecs, caseSpecs) {
    if (!coolerSpecs?.height_mm || !caseSpecs?.max_cooler_height_mm) {
      return {
        valid: true, // Skip if specs missing
        error: null,
        severity: "info",
      };
    }

    const fits = coolerSpecs.height_mm <= caseSpecs.max_cooler_height_mm;
    return {
      valid: fits,
      cooler_height_mm: coolerSpecs.height_mm,
      case_max_cooler_height_mm: caseSpecs.max_cooler_height_mm,
      error: fits ? null : `Cooler too tall: ${coolerSpecs.height_mm}mm but case supports max ${caseSpecs.max_cooler_height_mm}mm`,
      severity: fits ? "ok" : "error",
      rule: "COOLER_CASE_SIZE_FIT",
    };
  }

  /**
   * Run all compatibility checks on a build
   */
  static runAllChecks(specs) {
    const results = {
      cpu: specs.cpu,
      mainboard: specs.mainboard,
      ram: specs.ram,
      gpu: specs.gpu || null,
      storage: specs.storage,
      psu: specs.psu,
      cooler: specs.cooler,
      case: specs.case,
      checks: [],
      errors: [],
      warnings: [],
      summary: {},
    };

    // Rule 1: CPU Socket
    const rule1 = this.checkCPUMainboardSocket(specs.cpu, specs.mainboard);
    results.checks.push(rule1);
    if (!rule1.valid) results.errors.push(rule1.error);

    // Rule 2: RAM Type
    const rule2 = this.checkRAMTypeSupport(specs.ram, specs.mainboard);
    results.checks.push(rule2);
    if (!rule2.valid) results.errors.push(rule2.error);

    // Rule 3: PSU Wattage
    const rule3 = this.checkPSUWattage(specs.cpu, specs.gpu, specs.psu);
    results.checks.push(rule3);
    if (rule3.severity === "warning") results.warnings.push(rule3.error);

    // Rule 4: Cooler Socket
    const rule4 = this.checkCoolerSocket(specs.cpu, specs.cooler);
    results.checks.push(rule4);
    if (!rule4.valid) results.errors.push(rule4.error);

    // Rule 5: Cooler TDP
    const rule5 = this.checkCoolerTDP(specs.cpu, specs.cooler);
    results.checks.push(rule5);
    if (rule5.severity === "warning") results.warnings.push(rule5.error);

    // Rule 6A: GPU Size
    const rule6a = this.checkGPUCaseSize(specs.gpu, specs.case);
    results.checks.push(rule6a);
    if (!rule6a.valid) results.errors.push(rule6a.error);

    // Rule 6B: Cooler Size
    const rule6b = this.checkCoolerCaseSize(specs.cooler, specs.case);
    results.checks.push(rule6b);
    if (!rule6b.valid) results.errors.push(rule6b.error);

    // Summary
    results.summary = {
      total_checks: results.checks.length,
      passed: results.checks.filter((c) => c.valid || c.severity === "ok" || c.severity === "info").length,
      errors_count: results.errors.length,
      warnings_count: results.warnings.length,
      is_compatible: results.errors.length === 0,
      compatibility_score: Math.max(0, 100 - results.errors.length * 25 - results.warnings.length * 10),
    };

    return results;
  }

  /**
   * Get rule details by ID
   */
  static getRuleInfo(ruleId) {
    const rules = {
      CPU_SOCKET_MATCH: {
        id: 1,
        name: "CPU Socket Match",
        description: "CPU socket must match Mainboard socket",
        severity: "error",
        example: "LGA1700 (Intel 14th Gen) requires LGA1700 motherboard",
      },
      RAM_TYPE_SUPPORT: {
        id: 2,
        name: "RAM Type Support",
        description: "RAM type (DDR4/DDR5) must match motherboard support",
        severity: "error",
        example: "DDR5 RAM requires DDR5-compatible motherboard",
      },
      PSU_WATTAGE_SUFFICIENT: {
        id: 3,
        name: "PSU Wattage",
        description: "PSU wattage must be >= Total TDP × 1.3 (30% safety headroom)",
        severity: "warning",
        example: "100W CPU + 300W GPU = 400W total TDP requires at least 520W PSU",
      },
      COOLER_SOCKET_SUPPORT: {
        id: 4,
        name: "CPU Cooler Socket Support",
        description: "CPU cooler must support the CPU socket",
        severity: "error",
        example: "LGA1700 CPU requires LGA1700-compatible cooler",
      },
      COOLER_TDP_SUPPORT: {
        id: 5,
        name: "CPU Cooler TDP",
        description: "Cooler max TDP must be >= CPU TDP",
        severity: "warning",
        example: "250W TDP CPU requires cooler rated for at least 250W",
      },
      GPU_CASE_SIZE_FIT: {
        id: 6,
        name: "GPU Case Size",
        description: "GPU length must fit within case max GPU length",
        severity: "error",
        example: "320mm GPU requires case with at least 320mm GPU clearance",
      },
      COOLER_CASE_SIZE_FIT: {
        id: 7,
        name: "Cooler Case Size",
        description: "Cooler height must fit within case cooler height limit",
        severity: "error",
        example: "180mm cooler requires case with at least 180mm top clearance",
      },
    };
    return rules[ruleId] || null;
  }

  /**
   * Get all rules info
   */
  static getAllRulesInfo() {
    const rules = [
      { id: 1, name: "CPU Socket Match", description: "CPU socket must match Mainboard socket", severity: "error", example: "LGA1700 (Intel 14th Gen) requires LGA1700 motherboard" },
      { id: 2, name: "RAM Type Support", description: "RAM type (DDR4/DDR5) must match motherboard support", severity: "error", example: "DDR5 RAM requires DDR5-compatible motherboard" },
      { id: 3, name: "PSU Wattage", description: "PSU wattage must be >= Total TDP × 1.3 (30% safety headroom)", severity: "warning", example: "100W CPU + 300W GPU = 400W total TDP requires at least 520W PSU" },
      { id: 4, name: "CPU Cooler Socket Support", description: "CPU cooler must support the CPU socket", severity: "error", example: "LGA1700 CPU requires LGA1700-compatible cooler" },
      { id: 5, name: "CPU Cooler TDP", description: "Cooler max TDP must be >= CPU TDP", severity: "warning", example: "250W TDP CPU requires cooler rated for at least 250W" },
      { id: 6, name: "GPU Case Size", description: "GPU length must fit within case max GPU length", severity: "error", example: "320mm GPU requires case with at least 320mm GPU clearance" },
      { id: 7, name: "Cooler Case Size", description: "Cooler height must fit within case cooler height limit", severity: "error", example: "180mm cooler requires case with at least 180mm top clearance" },
    ];
    return rules;
  }
}

module.exports = CompatibilityRules;
