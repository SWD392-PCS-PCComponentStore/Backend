/**
 * Setup script for AI Build PC feature
 * Run: node scripts/setup-ai-build.js
 *
 * This script will:
 * 1. Ensure all 8 PC categories exist in DB
 * 2. Add specs_json column to PRODUCT if missing
 * 3. Seed sample products for all 8 categories
 * 4. Verify setup by running a test query
 */

require("dotenv").config();
const { sql, pool } = require("../src/config/db");

// ─── Category definitions ────────────────────────────────────────────────────

const CATEGORIES = [
  { name: "CPU",      description: "Bộ vi xử lý" },
  { name: "VGA",      description: "Card đồ họa" },
  { name: "Mainboard",description: "Bo mạch chủ" },
  { name: "RAM",      description: "Bộ nhớ RAM" },
  { name: "Storage",  description: "Ổ cứng / SSD" },
  { name: "PSU",      description: "Nguồn máy tính" },
  { name: "Cooler",   description: "Tản nhiệt CPU" },
  { name: "Case",     description: "Vỏ thùng máy tính" },
];

// ─── Sample products ─────────────────────────────────────────────────────────
// Defined as functions so we can inject dynamic category_ids after lookup

const getSampleProducts = (ids) => [
  // ── CPU ──
  {
    name: "Intel Core i9-14900K",
    description: "14th Gen Intel Core i9 - 24 Cores, 32 Threads, 253W TDP",
    price: 15000000,
    stock_quantity: 50,
    category_id: ids["CPU"],
    brand: "Intel",
    specs: {
      socket: "LGA1700", cores: 24, threads: 32, tdp: 253,
      generation: "14th Gen Intel", iGPU: false,
      base_clock: 3.2, boost_clock: 6.2, cache_mb: 36, series: "Core i9",
    },
  },
  {
    name: "Intel Core i5-13600K",
    description: "13th Gen Intel Core i5 - 14 Cores, 125W TDP",
    price: 8500000,
    stock_quantity: 80,
    category_id: ids["CPU"],
    brand: "Intel",
    specs: {
      socket: "LGA1700", cores: 14, threads: 20, tdp: 125,
      generation: "13th Gen Intel", iGPU: true,
      base_clock: 3.5, boost_clock: 5.1, cache_mb: 24, series: "Core i5",
    },
  },
  {
    name: "AMD Ryzen 5 7600X",
    description: "Zen 4 - 6 Cores, 105W TDP, AM5 Socket",
    price: 7200000,
    stock_quantity: 60,
    category_id: ids["CPU"],
    brand: "AMD",
    specs: {
      socket: "AM5", cores: 6, threads: 12, tdp: 105,
      generation: "Zen 4", iGPU: true,
      base_clock: 4.7, boost_clock: 5.3, cache_mb: 32, series: "Ryzen 5",
    },
  },

  // ── VGA (GPU) ──
  {
    name: "ASUS TUF RTX 4090 24GB",
    description: "Flagship Gaming GPU - 24GB GDDR6X, 575W TDP",
    price: 45000000,
    stock_quantity: 10,
    category_id: ids["VGA"],
    brand: "ASUS",
    specs: {
      memory_gb: 24, memory_type: "GDDR6X", length_mm: 336,
      power_pin: "12VHPWR", tdp: 575,
      cuda_cores: 16384, boost_clock: 2.52, ray_tracing: true,
    },
  },
  {
    name: "MSI Gaming RTX 4070 12GB",
    description: "High-performance GPU - 12GB GDDR6X, 200W TDP",
    price: 18000000,
    stock_quantity: 25,
    category_id: ids["VGA"],
    brand: "MSI",
    specs: {
      memory_gb: 12, memory_type: "GDDR6X", length_mm: 285,
      power_pin: "16-pin", tdp: 200,
      cuda_cores: 5888, boost_clock: 2.48, ray_tracing: true,
    },
  },
  {
    name: "Gigabyte RX 7600 8GB",
    description: "Budget Gaming GPU - 8GB GDDR6, 165W TDP",
    price: 7500000,
    stock_quantity: 40,
    category_id: ids["VGA"],
    brand: "Gigabyte",
    specs: {
      memory_gb: 8, memory_type: "GDDR6", length_mm: 270,
      power_pin: "8-pin", tdp: 165,
      boost_clock: 2.625, ray_tracing: true,
    },
  },

  // ── Mainboard ──
  {
    name: "ASUS ROG Z790-E Gaming WiFi",
    description: "Premium LGA1700 ATX Mainboard - DDR5, PCIe 5.0",
    price: 12000000,
    stock_quantity: 20,
    category_id: ids["Mainboard"],
    brand: "ASUS",
    specs: {
      socket: "LGA1700", chipset: "Z790", ram_type: "DDR5",
      form_factor: "ATX", ram_slots: 4, m2_slots: 5, pcie_gen: 5, usb_ports: 14,
    },
  },
  {
    name: "MSI PRO B660M-A DDR5",
    description: "Mid-range LGA1700 mATX - DDR5, PCIe 4.0",
    price: 4500000,
    stock_quantity: 35,
    category_id: ids["Mainboard"],
    brand: "MSI",
    specs: {
      socket: "LGA1700", chipset: "B660", ram_type: "DDR5",
      form_factor: "mATX", ram_slots: 2, m2_slots: 2, pcie_gen: 4, usb_ports: 8,
    },
  },
  {
    name: "ASUS ROG Crosshair X670E",
    description: "Premium AM5 ATX Mainboard - DDR5, PCIe 5.0",
    price: 14000000,
    stock_quantity: 15,
    category_id: ids["Mainboard"],
    brand: "ASUS",
    specs: {
      socket: "AM5", chipset: "X670E", ram_type: "DDR5",
      form_factor: "ATX", ram_slots: 4, m2_slots: 4, pcie_gen: 5, usb_ports: 12,
    },
  },

  // ── RAM ──
  {
    name: "Kingston Fury Beast DDR5 32GB 6000MHz",
    description: "2x16GB DDR5 Kit, CL30, 1.4V",
    price: 4500000,
    stock_quantity: 30,
    category_id: ids["RAM"],
    brand: "Kingston",
    specs: {
      type: "DDR5", capacity_gb: 32, speed_mhz: 6000,
      kit_size: "2x16", latency: 30, voltage: 1.4, rgb: false,
    },
  },
  {
    name: "G.Skill Trident Z5 RGB DDR5 32GB 7200MHz",
    description: "High-performance 2x16GB DDR5, CL34",
    price: 7200000,
    stock_quantity: 20,
    category_id: ids["RAM"],
    brand: "G.Skill",
    specs: {
      type: "DDR5", capacity_gb: 32, speed_mhz: 7200,
      kit_size: "2x16", latency: 34, voltage: 1.45, rgb: true,
    },
  },
  {
    name: "Corsair Vengeance DDR4 16GB 3200MHz",
    description: "Budget 2x8GB DDR4 Kit, CL16",
    price: 1800000,
    stock_quantity: 60,
    category_id: ids["RAM"],
    brand: "Corsair",
    specs: {
      type: "DDR4", capacity_gb: 16, speed_mhz: 3200,
      kit_size: "2x8", latency: 16, voltage: 1.35, rgb: false,
    },
  },

  // ── Storage ──
  {
    name: "Samsung 980 Pro 1TB NVMe",
    description: "PCIe 4.0 M.2 SSD - 7000MB/s Read",
    price: 3500000,
    stock_quantity: 40,
    category_id: ids["Storage"],
    brand: "Samsung",
    specs: {
      capacity_gb: 1000, type: "SSD", interface: "NVMe",
      form_factor: "M.2", speed_mbps: 7000, encrypted: false,
    },
  },
  {
    name: "WD Black SN850X 2TB NVMe",
    description: "PCIe 4.0 M.2 SSD - 7300MB/s Read",
    price: 6500000,
    stock_quantity: 25,
    category_id: ids["Storage"],
    brand: "WD",
    specs: {
      capacity_gb: 2000, type: "SSD", interface: "NVMe",
      form_factor: "M.2", speed_mbps: 7300, encrypted: false,
    },
  },
  {
    name: "Seagate Barracuda 2TB HDD",
    description: "7200RPM SATA HDD, 256MB Cache",
    price: 1600000,
    stock_quantity: 50,
    category_id: ids["Storage"],
    brand: "Seagate",
    specs: {
      capacity_gb: 2000, type: "HDD", interface: "SATA",
      form_factor: "3.5\"", speed_mbps: 200, encrypted: false,
    },
  },

  // ── PSU ──
  {
    name: "ASUS ROG Strix 850W Gold",
    description: "80+ Gold, Full Modular, 850W",
    price: 5500000,
    stock_quantity: 25,
    category_id: ids["PSU"],
    brand: "ASUS",
    specs: {
      wattage: 850, certification: "80 Plus Gold",
      modular: "Full", pcie_8pin_count: 3, pcie_12vhpwr_count: 1, fan_size: 135,
    },
  },
  {
    name: "Corsair RM750x 750W Gold",
    description: "80+ Gold, Full Modular, 750W",
    price: 4200000,
    stock_quantity: 30,
    category_id: ids["PSU"],
    brand: "Corsair",
    specs: {
      wattage: 750, certification: "80 Plus Gold",
      modular: "Full", pcie_8pin_count: 2, pcie_12vhpwr_count: 0, fan_size: 140,
    },
  },
  {
    name: "Seasonic Focus GX-650 650W Gold",
    description: "80+ Gold, Full Modular, 650W",
    price: 3200000,
    stock_quantity: 35,
    category_id: ids["PSU"],
    brand: "Seasonic",
    specs: {
      wattage: 650, certification: "80 Plus Gold",
      modular: "Full", pcie_8pin_count: 2, pcie_12vhpwr_count: 0, fan_size: 120,
    },
  },
  {
    name: "Cooler Master MWE 550W Bronze",
    description: "80+ Bronze, Semi Modular, 550W - Budget option",
    price: 1800000,
    stock_quantity: 50,
    category_id: ids["PSU"],
    brand: "Cooler Master",
    specs: {
      wattage: 550, certification: "80 Plus Bronze",
      modular: "Semi", pcie_8pin_count: 1, pcie_12vhpwr_count: 0, fan_size: 120,
    },
  },

  // ── Cooler ──
  {
    name: "Noctua NH-D15",
    description: "Premium Dual-Tower Air Cooler, 250W TDP Support",
    price: 2500000,
    stock_quantity: 35,
    category_id: ids["Cooler"],
    brand: "Noctua",
    specs: {
      type: "Air", supported_sockets: ["LGA1700", "AM5", "LGA1151", "AM4"],
      max_tdp: 250, height_mm: 160, noise_db: 25, fans: 2,
    },
  },
  {
    name: "DeepCool AK620",
    description: "Dual Tower Air Cooler - LGA1700 & AM5, 260W TDP",
    price: 1600000,
    stock_quantity: 45,
    category_id: ids["Cooler"],
    brand: "DeepCool",
    specs: {
      type: "Air", supported_sockets: ["LGA1700", "AM5", "LGA1151", "AM4"],
      max_tdp: 260, height_mm: 155, noise_db: 28, fans: 2,
    },
  },
  {
    name: "NZXT Kraken 240 AIO",
    description: "240mm AIO Liquid Cooler - LGA1700 & AM5",
    price: 3200000,
    stock_quantity: 30,
    category_id: ids["Cooler"],
    brand: "NZXT",
    specs: {
      type: "AIO", supported_sockets: ["LGA1700", "AM5", "LGA1151", "AM4"],
      max_tdp: 280, height_mm: 27, noise_db: 22, fans: 2,
    },
  },

  // ── Case ──
  {
    name: "Lian Li Lancool 216",
    description: "Mid Tower ATX - 380mm GPU, 185mm Cooler Clearance",
    price: 2800000,
    stock_quantity: 20,
    category_id: ids["Case"],
    brand: "Lian Li",
    specs: {
      form_factor: "ATX", max_gpu_length_mm: 380, max_cooler_height_mm: 185,
      fans_included: 2, dust_filters: true,
      front_io: { usb_a: 2, usb_c: 1, audio: true },
    },
  },
  {
    name: "NZXT H510 Flow",
    description: "Mid Tower ATX - 381mm GPU, 185mm Cooler",
    price: 2200000,
    stock_quantity: 25,
    category_id: ids["Case"],
    brand: "NZXT",
    specs: {
      form_factor: "ATX", max_gpu_length_mm: 381, max_cooler_height_mm: 185,
      fans_included: 2, dust_filters: true,
      front_io: { usb_a: 1, usb_c: 1, audio: true },
    },
  },
  {
    name: "Cooler Master Q300L mATX",
    description: "Compact mATX Case - 360mm GPU, 157mm Cooler",
    price: 1200000,
    stock_quantity: 40,
    category_id: ids["Case"],
    brand: "Cooler Master",
    specs: {
      form_factor: "mATX", max_gpu_length_mm: 360, max_cooler_height_mm: 157,
      fans_included: 1, dust_filters: true,
      front_io: { usb_a: 2, usb_c: 0, audio: true },
    },
  },
];

// ─── Setup runner ─────────────────────────────────────────────────────────────

async function run() {
  console.log("\n🔧 Starting AI Build PC Setup...\n");
  const conn = await pool;

  // ── Step 1: Add specs_json column ──────────────────────────────────────────
  console.log("📋 Step 1: Ensuring specs_json column exists...");
  try {
    await conn.request().query(`
      IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'PRODUCT' AND COLUMN_NAME = 'specs_json'
      )
      BEGIN
        ALTER TABLE dbo.PRODUCT ADD specs_json NVARCHAR(MAX);
        PRINT 'Added specs_json column';
      END
    `);
    console.log("  ✅ specs_json column ready\n");
  } catch (e) {
    console.error("  ❌ Failed to add column:", e.message);
    process.exit(1);
  }

  // ── Step 2: Ensure all categories exist ───────────────────────────────────
  console.log("📋 Step 2: Ensuring all 8 categories exist...");
  const categoryIds = {};

  for (const cat of CATEGORIES) {
    const existing = await conn
      .request()
      .input("name", sql.NVarChar(255), cat.name)
      .query("SELECT category_id FROM dbo.CATEGORY WHERE name = @name");

    if (existing.recordset.length > 0) {
      categoryIds[cat.name] = existing.recordset[0].category_id;
      console.log(`  ✅ ${cat.name} (id: ${categoryIds[cat.name]}) - already exists`);
    } else {
      const created = await conn
        .request()
        .input("name", sql.NVarChar(255), cat.name)
        .input("description", sql.NVarChar(sql.MAX), cat.description)
        .query(
          "INSERT INTO dbo.CATEGORY (name, description) OUTPUT INSERTED.category_id VALUES (@name, @description)"
        );
      categoryIds[cat.name] = created.recordset[0].category_id;
      console.log(`  ✅ ${cat.name} (id: ${categoryIds[cat.name]}) - created`);
    }
  }
  console.log();

  // ── Step 3: Seed sample products ──────────────────────────────────────────
  console.log("📋 Step 3: Seeding sample products...");
  const products = getSampleProducts(categoryIds);
  let created = 0;
  let skipped = 0;

  for (const p of products) {
    // Check if product with same name already exists
    const existing = await conn
      .request()
      .input("name", sql.NVarChar(255), p.name)
      .query("SELECT product_id FROM dbo.PRODUCT WHERE name = @name");

    if (existing.recordset.length > 0) {
      // Update specs_json only
      const productId = existing.recordset[0].product_id;
      await conn
        .request()
        .input("product_id", sql.Int, productId)
        .input("specs_json", sql.NVarChar(sql.MAX), JSON.stringify(p.specs))
        .query("UPDATE dbo.PRODUCT SET specs_json = @specs_json WHERE product_id = @product_id");
      console.log(`  ♻️  Updated specs: ${p.name} (id: ${productId})`);
      skipped++;
    } else {
      // Insert new product
      const result = await conn
        .request()
        .input("name", sql.NVarChar(255), p.name)
        .input("description", sql.NVarChar(sql.MAX), p.description)
        .input("price", sql.Decimal(18, 2), p.price)
        .input("stock_quantity", sql.Int, p.stock_quantity)
        .input("category_id", sql.Int, p.category_id)
        .input("brand", sql.NVarChar(100), p.brand)
        .input("status", sql.NVarChar(50), "Available")
        .input("specs_json", sql.NVarChar(sql.MAX), JSON.stringify(p.specs))
        .query(`
          INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
          OUTPUT INSERTED.product_id
          VALUES (@name, @description, @price, @stock_quantity, @category_id, @brand, @status, @specs_json)
        `);
      const newId = result.recordset[0].product_id;
      console.log(`  ✅ Created: ${p.name} (id: ${newId}, price: ${p.price.toLocaleString()}đ)`);
      created++;
    }
  }
  console.log(`\n  Total: ${created} created, ${skipped} specs updated\n`);

  // ── Step 4: Verify ─────────────────────────────────────────────────────────
  console.log("📋 Step 4: Verifying data...");
  for (const cat of CATEGORIES) {
    const result = await conn
      .request()
      .input("category_id", sql.Int, categoryIds[cat.name])
      .query(
        "SELECT COUNT(*) AS cnt FROM dbo.PRODUCT WHERE category_id = @category_id AND specs_json IS NOT NULL"
      );
    const count = result.recordset[0].cnt;
    const status = count > 0 ? "✅" : "❌";
    console.log(`  ${status} ${cat.name}: ${count} product(s) with specs`);
  }

  // ── Step 5: Print category → id mapping ───────────────────────────────────
  console.log("\n📋 Step 5: Category ID Mapping (for AutoBuildService):");
  console.log("  CPU       →", categoryIds["CPU"]);
  console.log("  VGA/GPU   →", categoryIds["VGA"]);
  console.log("  Mainboard →", categoryIds["Mainboard"]);
  console.log("  RAM       →", categoryIds["RAM"]);
  console.log("  Storage   →", categoryIds["Storage"]);
  console.log("  PSU       →", categoryIds["PSU"]);
  console.log("  Cooler    →", categoryIds["Cooler"]);
  console.log("  Case      →", categoryIds["Case"]);

  console.log("\n✅ Setup complete! You can now test:\n");
  console.log("  POST http://localhost:5000/api/ai/build");
  console.log('  Body: { "query": "Build PC gaming 25 trieu" }\n');

  process.exit(0);
}

run().catch((err) => {
  console.error("\n❌ Setup failed:", err.message);
  process.exit(1);
});
