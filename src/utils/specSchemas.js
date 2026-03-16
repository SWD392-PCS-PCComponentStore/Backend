/**
 * Specification Schemas for PC Components
 * Define structure and validation rules for each component category
 */

const specSchemas = {
  // CPU Specifications
  CPU: {
    required: ["socket", "cores", "threads", "tdp", "generation"],
    optional: ["iGPU", "base_clock", "boost_clock", "cache_mb", "series"],
    types: {
      socket: "string",        // LGA1700, AM5, etc.
      cores: "number",
      threads: "number",
      tdp: "number",           // Watts
      generation: "string",    // 14th Gen, Ryzen 7000, etc.
      iGPU: "boolean",
      base_clock: "number",    // GHz
      boost_clock: "number",   // GHz
      cache_mb: "number",
      series: "string"         // Core i9, Ryzen 9, etc.
    },
    example: {
      "socket": "LGA1700",
      "cores": 24,
      "threads": 32,
      "tdp": 253,
      "generation": "14th Gen Intel",
      "iGPU": false,
      "base_clock": 3.2,
      "boost_clock": 6.2,
      "cache_mb": 36,
      "series": "Core i9"
    }
  },

  // Mainboard Specifications
  MAINBOARD: {
    required: ["socket", "chipset", "ram_type", "form_factor"],
    optional: ["ram_slots", "m2_slots", "pcie_gen", "usb_ports"],
    types: {
      socket: "string",        // LGA1700, AM5, etc.
      chipset: "string",       // Z790, B850, etc.
      ram_type: "string",      // DDR4, DDR5
      form_factor: "string",   // ATX, mATX, ITX
      ram_slots: "number",
      m2_slots: "number",
      pcie_gen: "number",      // 4, 5, etc.
      usb_ports: "number"
    },
    example: {
      "socket": "LGA1700",
      "chipset": "Z790",
      "ram_type": "DDR5",
      "form_factor": "ATX",
      "ram_slots": 4,
      "m2_slots": 5,
      "pcie_gen": 5,
      "usb_ports": 14
    }
  },

  // GPU Specifications
  GPU: {
    required: ["memory_gb", "memory_type", "length_mm", "power_pin"],
    optional: ["tdp", "cuda_cores", "boost_clock", "ray_tracing"],
    types: {
      memory_gb: "number",     // 8, 12, 16, 24, etc.
      memory_type: "string",   // GDDR6X, GDDR6, HBM2, etc.
      length_mm: "number",
      power_pin: "string",     // 6-pin, 8-pin, 12VHPWR, etc.
      tdp: "number",
      cuda_cores: "number",    // NVIDIA
      boost_clock: "number",   // GHz
      ray_tracing: "boolean"
    },
    example: {
      "memory_gb": 24,
      "memory_type": "GDDR6X",
      "length_mm": 313,
      "power_pin": "12VHPWR",
      "tdp": 575,
      "cuda_cores": 16384,
      "boost_clock": 2.52,
      "ray_tracing": true
    }
  },

  // RAM Specifications
  RAM: {
    required: ["type", "capacity_gb", "speed_mhz", "kit_size"],
    optional: ["latency", "voltage", "rgb"],
    types: {
      type: "string",          // DDR4, DDR5
      capacity_gb: "number",
      speed_mhz: "number",     // 3600, 6000, etc.
      kit_size: "string",      // 1x16, 2x16, 2x32, etc.
      latency: "number",       // CAS latency
      voltage: "number",
      rgb: "boolean"
    },
    example: {
      "type": "DDR5",
      "capacity_gb": 32,
      "speed_mhz": 6000,
      "kit_size": "2x16",
      "latency": 30,
      "voltage": 1.4,
      "rgb": false
    }
  },

  // Storage Specifications
  STORAGE: {
    required: ["capacity_gb", "type", "interface"],
    optional: ["form_factor", "speed_mbps", "encrypted"],
    types: {
      capacity_gb: "number",   // 500, 1000, 2000, etc.
      type: "string",          // SSD, HDD
      interface: "string",     // NVMe, SATA, M.2, etc.
      form_factor: "string",   // 2.5", 3.5", M.2, etc.
      speed_mbps: "number",    // Read/Write speed
      encrypted: "boolean"
    },
    example: {
      "capacity_gb": 1000,
      "type": "SSD",
      "interface": "NVMe",
      "form_factor": "M.2",
      "speed_mbps": 7000,
      "encrypted": false
    }
  },

  // Power Supply Specifications
  PSU: {
    required: ["wattage", "certification", "modular"],
    optional: ["pcie_8pin_count", "pcie_12vhpwr_count", "fan_size"],
    types: {
      wattage: "number",       // 550, 650, 750, 850, 1000, etc.
      certification: "string", // 80 Plus Bronze, Gold, Platinum, etc.
      modular: "string",       // Full, Semi, Non
      pcie_8pin_count: "number",
      pcie_12vhpwr_count: "number",
      fan_size: "number"       // mm
    },
    example: {
      "wattage": 850,
      "certification": "80 Plus Gold",
      "modular": "Full",
      "pcie_8pin_count": 3,
      "pcie_12vhpwr_count": 1,
      "fan_size": 135
    }
  },

  // CPU Cooler Specifications
  COOLER_CPU: {
    required: ["type", "supported_sockets", "max_tdp"],
    optional: ["height_mm", "noise_db", "fans"],
    types: {
      type: "string",          // Air, AIO, Passive
      supported_sockets: "array", // ["LGA1700", "AM5", ...]
      max_tdp: "number",
      height_mm: "number",
      noise_db: "number",
      fans: "number"
    },
    example: {
      "type": "Air",
      "supported_sockets": ["LGA1700", "AM5"],
      "max_tdp": 250,
      "height_mm": 160,
      "noise_db": 25,
      "fans": 2
    }
  },

  // Case Specifications
  CASE: {
    required: ["form_factor", "max_gpu_length_mm", "max_cooler_height_mm"],
    optional: ["fans_included", "dust_filters", "front_io"],
    types: {
      form_factor: "string",        // ATX, mATX, ITX
      max_gpu_length_mm: "number",
      max_cooler_height_mm: "number",
      fans_included: "number",
      dust_filters: "boolean",
      front_io: "array"              // ["USB3", "USB-C", ...]
    },
    example: {
      "form_factor": "ATX",
      "max_gpu_length_mm": 330,
      "max_cooler_height_mm": 185,
      "fans_included": 2,
      "dust_filters": true,
      "front_io": ["USB3.0", "USB-C"]
    }
  }
};

/**
 * Validate specs against schema
 * @param {string} category - Product category
 * @param {object} specs - Specs to validate
 * @returns {{valid: boolean, errors: string[]}}
 */
function validateSpecs(category, specs) {
  const schema = specSchemas[category];
  
  if (!schema) {
    return {
      valid: false,
      errors: [`Unknown category: ${category}`]
    };
  }

  const errors = [];

  // Check required fields
  for (const field of schema.required) {
    if (!(field in specs)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Check field types
  for (const [field, expectedType] of Object.entries(schema.types)) {
    if (field in specs) {
      const value = specs[field];
      const actualType = Array.isArray(value) ? "array" : typeof value;

      if (expectedType === "array" && !Array.isArray(value)) {
        errors.push(`Field '${field}' must be an array, got ${actualType}`);
      } else if (expectedType !== "array" && actualType !== expectedType) {
        errors.push(`Field '${field}' must be ${expectedType}, got ${actualType}`);
      }
    }
  }

  // Check for unknown fields (warning only)
  const allowedFields = new Set([...schema.required, ...schema.optional]);
  const unknownFields = Object.keys(specs).filter(k => !allowedFields.has(k));
  if (unknownFields.length > 0) {
    errors.push(`Unknown fields: ${unknownFields.join(", ")}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get schema for a category
 */
function getSchema(category) {
  return specSchemas[category] || null;
}

/**
 * Get all category names
 */
function getAllCategories() {
  return Object.keys(specSchemas);
}

module.exports = {
  specSchemas,
  validateSpecs,
  getSchema,
  getAllCategories
};
