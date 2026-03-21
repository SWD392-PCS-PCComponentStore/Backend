/**
 * Script fix PRODUCT_SPEC cho production
 * Chạy: node scripts/seed_specs_via_api.js
 */

const BASE_URL =
  process.env.BASE_URL ||
  "https://pccomponentstore-cne8dndef4f0gthx.southeastasia-01.azurewebsites.net";

const SPECS_DATA = [
  // ── CPU ─────────────────────────────────────────────────────────
  { product_id: 1,  category: "CPU", specs: { socket:"LGA1700", cores:24, threads:32, tdp:253, generation:"14th Gen Intel", boost_clock:6.0,  series:"Core i9" }},
  { product_id: 5,  category: "CPU", specs: { socket:"AM5",     cores:16, threads:32, tdp:170, generation:"Ryzen 9000",     boost_clock:5.7,  series:"Ryzen 9" }},
  { product_id: 6,  category: "CPU", specs: { socket:"LGA1700", cores:4,  threads:8,  tdp:58,  generation:"12th Gen Intel", boost_clock:4.3,  series:"Core i3" }},
  { product_id: 7,  category: "CPU", specs: { socket:"LGA1700", cores:6,  threads:12, tdp:65,  generation:"12th Gen Intel", boost_clock:4.4,  series:"Core i5" }},
  { product_id: 8,  category: "CPU", specs: { socket:"LGA1700", cores:10, threads:16, tdp:65,  generation:"13th Gen Intel", boost_clock:4.6,  series:"Core i5" }},
  { product_id: 9,  category: "CPU", specs: { socket:"LGA1700", cores:14, threads:20, tdp:125, generation:"14th Gen Intel", boost_clock:5.3,  series:"Core i5" }},
  { product_id: 10, category: "CPU", specs: { socket:"LGA1700", cores:20, threads:28, tdp:125, generation:"14th Gen Intel", boost_clock:5.6,  series:"Core i7" }},
  { product_id: 11, category: "CPU", specs: { socket:"LGA1700", cores:24, threads:32, tdp:253, generation:"14th Gen Intel", boost_clock:6.0,  series:"Core i9" }},
  { product_id: 12, category: "CPU", specs: { socket:"AM4",     cores:6,  threads:12, tdp:65,  generation:"Ryzen 5000",     boost_clock:4.6,  series:"Ryzen 5" }},
  { product_id: 13, category: "CPU", specs: { socket:"AM5",     cores:6,  threads:12, tdp:65,  generation:"Ryzen 7000",     boost_clock:5.1,  series:"Ryzen 5" }},
  { product_id: 14, category: "CPU", specs: { socket:"AM5",     cores:8,  threads:16, tdp:105, generation:"Ryzen 7000",     boost_clock:5.4,  series:"Ryzen 7" }},

  // ── VGA ─────────────────────────────────────────────────────────
  { product_id: 2,  category: "GPU", specs: { memory_gb:12, memory_type:"GDDR6",  length_mm:242, power_pin:"12-pin", tdp:170, ray_tracing:true }},
  { product_id: 16, category: "GPU", specs: { memory_gb:8,  memory_type:"GDDR6",  length_mm:240, power_pin:"16-pin", tdp:115, ray_tracing:true }},
  { product_id: 17, category: "GPU", specs: { memory_gb:8,  memory_type:"GDDR6",  length_mm:240, power_pin:"16-pin", tdp:165, ray_tracing:true }},
  { product_id: 18, category: "GPU", specs: { memory_gb:12, memory_type:"GDDR6X", length_mm:267, power_pin:"16-pin", tdp:200, ray_tracing:true }},
  { product_id: 20, category: "GPU", specs: { memory_gb:12, memory_type:"GDDR6X", length_mm:285, power_pin:"16-pin", tdp:285, ray_tracing:true }},
  { product_id: 21, category: "GPU", specs: { memory_gb:16, memory_type:"GDDR6X", length_mm:310, power_pin:"16-pin", tdp:320, ray_tracing:true }},
  { product_id: 22, category: "GPU", specs: { memory_gb:24, memory_type:"GDDR6X", length_mm:350, power_pin:"16-pin", tdp:450, ray_tracing:true }},
  { product_id: 23, category: "GPU", specs: { memory_gb:8,  memory_type:"GDDR6",  length_mm:240, power_pin:"8-pin",  tdp:165, ray_tracing:true }},
  { product_id: 24, category: "GPU", specs: { memory_gb:16, memory_type:"GDDR6",  length_mm:267, power_pin:"8-pin",  tdp:263, ray_tracing:true }},

  // ── MAINBOARD ────────────────────────────────────────────────────
  { product_id: 26, category: "MAINBOARD", specs: { socket:"LGA1700", chipset:"H610", ram_type:"DDR4", form_factor:"mATX", ram_slots:2, m2_slots:1 }},
  { product_id: 27, category: "MAINBOARD", specs: { socket:"LGA1700", chipset:"B760", ram_type:"DDR4", form_factor:"mATX", ram_slots:4, m2_slots:2 }},
  { product_id: 28, category: "MAINBOARD", specs: { socket:"LGA1700", chipset:"B760", ram_type:"DDR4", form_factor:"mATX", ram_slots:4, m2_slots:2 }},
  { product_id: 29, category: "MAINBOARD", specs: { socket:"AM5",     chipset:"B650", ram_type:"DDR5", form_factor:"mATX", ram_slots:4, m2_slots:2 }},
  { product_id: 30, category: "MAINBOARD", specs: { socket:"AM5",     chipset:"X870", ram_type:"DDR5", form_factor:"ATX",  ram_slots:4, m2_slots:4 }},
  { product_id: 31, category: "MAINBOARD", specs: { socket:"AM5",     chipset:"B650", ram_type:"DDR5", form_factor:"ATX",  ram_slots:4, m2_slots:3 }},
  { product_id: 32, category: "MAINBOARD", specs: { socket:"AM5",     chipset:"X670", ram_type:"DDR5", form_factor:"ATX",  ram_slots:4, m2_slots:4 }},
  { product_id: 33, category: "MAINBOARD", specs: { socket:"LGA1700", chipset:"Z790", ram_type:"DDR5", form_factor:"ATX",  ram_slots:4, m2_slots:5 }},
  { product_id: 34, category: "MAINBOARD", specs: { socket:"LGA1700", chipset:"Z790", ram_type:"DDR5", form_factor:"ATX",  ram_slots:4, m2_slots:4 }},
  { product_id: 35, category: "MAINBOARD", specs: { socket:"LGA1700", chipset:"Z790", ram_type:"DDR5", form_factor:"ATX",  ram_slots:4, m2_slots:5 }},

  // ── RAM ─────────────────────────────────────────────────────────
  { product_id: 46, category: "RAM", specs: { type:"DDR4", capacity_gb:16, speed_mhz:3200, kit_size:"2x8",  latency:16 }},
  { product_id: 47, category: "RAM", specs: { type:"DDR5", capacity_gb:16, speed_mhz:5200, kit_size:"2x8",  latency:40 }},
  { product_id: 48, category: "RAM", specs: { type:"DDR5", capacity_gb:32, speed_mhz:6000, kit_size:"2x16", latency:30 }},
  { product_id: 49, category: "RAM", specs: { type:"DDR5", capacity_gb:32, speed_mhz:5600, kit_size:"2x16", latency:36 }},
  { product_id: 50, category: "RAM", specs: { type:"DDR5", capacity_gb:32, speed_mhz:5200, kit_size:"2x16", latency:40 }},
  { product_id: 51, category: "RAM", specs: { type:"DDR5", capacity_gb:32, speed_mhz:6000, kit_size:"2x16", latency:30 }},
  { product_id: 52, category: "RAM", specs: { type:"DDR4", capacity_gb:8,  speed_mhz:3600, kit_size:"1x8",  latency:18 }},
  { product_id: 53, category: "RAM", specs: { type:"DDR5", capacity_gb:16, speed_mhz:5200, kit_size:"1x16", latency:40 }},
  { product_id: 54, category: "RAM", specs: { type:"DDR5", capacity_gb:32, speed_mhz:6400, kit_size:"2x16", latency:32 }},
  { product_id: 55, category: "RAM", specs: { type:"DDR5", capacity_gb:64, speed_mhz:6000, kit_size:"2x32", latency:32 }},

  // ── SSD (category 7 — Ổ cứng SSD) ──────────────────────────────
  { product_id: 66, category: "STORAGE", specs: { capacity_gb:1000, type:"SSD", interface:"NVMe", form_factor:"M.2", speed_mbps:7450 }},
  { product_id: 67, category: "STORAGE", specs: { capacity_gb:500,  type:"SSD", interface:"NVMe", form_factor:"M.2", speed_mbps:3500 }},
  { product_id: 69, category: "STORAGE", specs: { capacity_gb:1000, type:"SSD", interface:"NVMe", form_factor:"M.2", speed_mbps:4150 }},
  { product_id: 70, category: "STORAGE", specs: { capacity_gb:1000, type:"SSD", interface:"NVMe", form_factor:"M.2", speed_mbps:6000 }},
  { product_id: 72, category: "STORAGE", specs: { capacity_gb:1000, type:"SSD", interface:"NVMe", form_factor:"M.2", speed_mbps:5000 }},
  { product_id: 73, category: "STORAGE", specs: { capacity_gb:1000, type:"SSD", interface:"NVMe", form_factor:"M.2", speed_mbps:3500 }},
  { product_id: 74, category: "STORAGE", specs: { capacity_gb:1000, type:"SSD", interface:"NVMe", form_factor:"M.2", speed_mbps:7400 }},
  { product_id: 75, category: "STORAGE", specs: { capacity_gb:250,  type:"SSD", interface:"NVMe", form_factor:"M.2", speed_mbps:3500 }},

  // ── HDD (category 8 — Ổ cứng HDD) ──────────────────────────────
  { product_id: 76, category: "STORAGE", specs: { capacity_gb:1000, type:"HDD", interface:"SATA", form_factor:'3.5"', speed_mbps:200 }},
  { product_id: 77, category: "STORAGE", specs: { capacity_gb:2000, type:"HDD", interface:"SATA", form_factor:'3.5"', speed_mbps:180 }},
  { product_id: 81, category: "STORAGE", specs: { capacity_gb:2000, type:"HDD", interface:"SATA", form_factor:'3.5"', speed_mbps:200 }},
  { product_id: 84, category: "STORAGE", specs: { capacity_gb:2000, type:"HDD", interface:"SATA", form_factor:'3.5"', speed_mbps:190 }},

  // ── PSU (category 9 — PSD) ───────────────────────────────────────
  { product_id: 86, category: "PSU", specs: { wattage:550,  certification:"80 Plus Bronze", modular:"Non"  }},
  { product_id: 87, category: "PSU", specs: { wattage:750,  certification:"80 Plus Gold",   modular:"Semi" }},
  { product_id: 88, category: "PSU", specs: { wattage:650,  certification:"80 Plus Bronze", modular:"Non"  }},
  { product_id: 89, category: "PSU", specs: { wattage:850,  certification:"80 Plus Gold",   modular:"Semi" }},
  { product_id: 90, category: "PSU", specs: { wattage:750,  certification:"80 Plus Gold",   modular:"Full" }},
  { product_id: 91, category: "PSU", specs: { wattage:750,  certification:"80 Plus Bronze", modular:"Semi" }},
  { product_id: 92, category: "PSU", specs: { wattage:650,  certification:"80 Plus Bronze", modular:"Non"  }},
  { product_id: 93, category: "PSU", specs: { wattage:750,  certification:"80 Plus Gold",   modular:"Full" }},
  { product_id: 94, category: "PSU", specs: { wattage:850,  certification:"80 Plus Gold",   modular:"Full" }},
  { product_id: 95, category: "PSU", specs: { wattage:1000, certification:"80 Plus Gold",   modular:"Full" }},

  // ── CASE (category 10 — Vỏ máy tính) ───────────────────────────
  { product_id: 96,  category: "CASE", specs: { form_factor:"ATX", max_gpu_length_mm:365, max_cooler_height_mm:165, fans_included:1 }},
  { product_id: 97,  category: "CASE", specs: { form_factor:"ATX", max_gpu_length_mm:400, max_cooler_height_mm:185, fans_included:2 }},
  { product_id: 98,  category: "CASE", specs: { form_factor:"ATX", max_gpu_length_mm:420, max_cooler_height_mm:175, fans_included:2 }},
  { product_id: 99,  category: "CASE", specs: { form_factor:"ATX", max_gpu_length_mm:420, max_cooler_height_mm:167, fans_included:0 }},
  { product_id: 100, category: "CASE", specs: { form_factor:"ATX", max_gpu_length_mm:360, max_cooler_height_mm:185, fans_included:2 }},
  { product_id: 101, category: "CASE", specs: { form_factor:"ATX", max_gpu_length_mm:420, max_cooler_height_mm:185, fans_included:3 }},
  { product_id: 102, category: "CASE", specs: { form_factor:"ATX", max_gpu_length_mm:370, max_cooler_height_mm:190, fans_included:3 }},
  { product_id: 103, category: "CASE", specs: { form_factor:"ATX", max_gpu_length_mm:360, max_cooler_height_mm:185, fans_included:2 }},
  { product_id: 104, category: "CASE", specs: { form_factor:"ATX", max_gpu_length_mm:400, max_cooler_height_mm:180, fans_included:4 }},
  { product_id: 105, category: "CASE", specs: { form_factor:"ATX", max_gpu_length_mm:370, max_cooler_height_mm:175, fans_included:3 }},

  // ── COOLER (category 11 — Tản nhiệt CPU) ────────────────────────
  { product_id: 106, category: "COOLER_CPU", specs: { type:"Air", supported_sockets:["LGA1700","AM5","AM4","LGA1200"],           max_tdp:220, height_mm:155 }},
  { product_id: 107, category: "COOLER_CPU", specs: { type:"Air", supported_sockets:["LGA1700","AM5","AM4","LGA1200"],           max_tdp:260, height_mm:163 }},
  { product_id: 108, category: "COOLER_CPU", specs: { type:"Air", supported_sockets:["LGA1700","AM5","AM4","LGA1200","LGA1151"], max_tdp:260, height_mm:155 }},
  { product_id: 109, category: "COOLER_CPU", specs: { type:"Air", supported_sockets:["LGA1700","AM5","AM4","LGA1200","LGA1151"], max_tdp:250, height_mm:158 }},
  { product_id: 111, category: "COOLER_CPU", specs: { type:"Air", supported_sockets:["LGA1700","AM5","AM4","LGA1200"],           max_tdp:180, height_mm:159 }},
  { product_id: 112, category: "COOLER_CPU", specs: { type:"AIO", supported_sockets:["LGA1700","AM5","AM4","LGA1200"],           max_tdp:300, height_mm:50  }},
  { product_id: 114, category: "COOLER_CPU", specs: { type:"AIO", supported_sockets:["LGA1700","AM5"],                           max_tdp:350, height_mm:50  }},
];

async function run() {
  let ok = 0, fail = 0;
  console.log(`🚀 Đang fix specs cho ${SPECS_DATA.length} sản phẩm...\n`);

  for (const item of SPECS_DATA) {
    try {
      const res = await fetch(`${BASE_URL}/api/specifications-v2/json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: item.product_id, category: item.category, specs: item.specs }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        console.log(`✅ [${item.category.padEnd(10)}] product_id=${item.product_id}`);
        ok++;
      } else {
        console.log(`❌ [${item.category.padEnd(10)}] product_id=${item.product_id} — ${data.error || data.message}`);
        fail++;
      }
    } catch (err) {
      console.log(`❌ product_id=${item.product_id} — ${err.message}`);
      fail++;
    }
  }

  console.log(`\n=============================`);
  console.log(`✅ Thành công: ${ok}/${SPECS_DATA.length}`);
  if (fail > 0) console.log(`❌ Thất bại:   ${fail}/${SPECS_DATA.length}`);
  console.log(`=============================`);
}

run();
