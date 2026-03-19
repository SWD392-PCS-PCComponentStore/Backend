-- ============================================================
-- Seed thêm sản phẩm cho tính năng AI Build PC
-- Chạy trên database: PCComponentStore
--
-- Category IDs (theo setup-ai-build.js):
--   CPU=1, VGA=2, Mainboard=3, RAM=5, Storage=6, PSU=7, Cooler=8, Case=9
--
-- Dùng IF NOT EXISTS để tránh trùng lặp khi chạy lại
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- CPU (category_id = 1)
-- ──────────────────────────────────────────────────────────────

-- Budget gaming LGA1700
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Intel Core i5-12400F')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'Intel Core i5-12400F',
  N'12th Gen Intel Core i5 - 6 Cores 12 Threads, 65W TDP, không iGPU',
  3500000, 80, 1, N'Intel', N'Available',
  N'{"socket":"LGA1700","cores":6,"threads":12,"tdp":65,"generation":"12th Gen Intel","iGPU":false,"base_clock":2.5,"boost_clock":4.4,"cache_mb":18,"series":"Core i5"}'
);

-- Mid-range gaming LGA1700
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Intel Core i5-13400F')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'Intel Core i5-13400F',
  N'13th Gen Intel Core i5 - 10 Cores 16 Threads, 65W TDP',
  4500000, 70, 1, N'Intel', N'Available',
  N'{"socket":"LGA1700","cores":10,"threads":16,"tdp":65,"generation":"13th Gen Intel","iGPU":false,"base_clock":2.5,"boost_clock":4.6,"cache_mb":20,"series":"Core i5"}'
);

-- High-end gaming LGA1700
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Intel Core i7-13700K')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'Intel Core i7-13700K',
  N'13th Gen Intel Core i7 - 16 Cores 24 Threads, 125W TDP',
  10000000, 40, 1, N'Intel', N'Available',
  N'{"socket":"LGA1700","cores":16,"threads":24,"tdp":125,"generation":"13th Gen Intel","iGPU":true,"base_clock":3.4,"boost_clock":5.4,"cache_mb":30,"series":"Core i7"}'
);

-- Budget AMD AM5
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'AMD Ryzen 5 7600')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'AMD Ryzen 5 7600',
  N'Zen 4 - 6 Cores 12 Threads, 65W TDP, AM5 Socket',
  5500000, 60, 1, N'AMD', N'Available',
  N'{"socket":"AM5","cores":6,"threads":12,"tdp":65,"generation":"Zen 4","iGPU":true,"base_clock":3.8,"boost_clock":5.1,"cache_mb":32,"series":"Ryzen 5"}'
);

-- Mid gaming AMD AM5
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'AMD Ryzen 7 7700X')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'AMD Ryzen 7 7700X',
  N'Zen 4 - 8 Cores 16 Threads, 105W TDP, AM5 Socket',
  9500000, 35, 1, N'AMD', N'Available',
  N'{"socket":"AM5","cores":8,"threads":16,"tdp":105,"generation":"Zen 4","iGPU":true,"base_clock":4.5,"boost_clock":5.4,"cache_mb":40,"series":"Ryzen 7"}'
);

-- Workstation AMD AM5
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'AMD Ryzen 9 7950X')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'AMD Ryzen 9 7950X',
  N'Zen 4 - 16 Cores 32 Threads, 170W TDP, AM5 Socket',
  18000000, 20, 1, N'AMD', N'Available',
  N'{"socket":"AM5","cores":16,"threads":32,"tdp":170,"generation":"Zen 4","iGPU":true,"base_clock":4.5,"boost_clock":5.7,"cache_mb":64,"series":"Ryzen 9"}'
);

-- ──────────────────────────────────────────────────────────────
-- VGA (category_id = 2)
-- ──────────────────────────────────────────────────────────────

-- Entry-level / văn phòng có GPU rời
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'MSI GeForce GTX 1650 4GB')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'MSI GeForce GTX 1650 4GB',
  N'Entry gaming GPU - 4GB GDDR6, 75W TDP, không cần nguồn 6-pin',
  2800000, 50, 2, N'MSI', N'Available',
  N'{"memory_gb":4,"memory_type":"GDDR6","length_mm":170,"power_pin":"None","tdp":75,"boost_clock":1.665,"ray_tracing":false}'
);

-- Budget gaming
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Sapphire Pulse RX 6600 8GB')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'Sapphire Pulse RX 6600 8GB',
  N'Budget gaming GPU AMD - 8GB GDDR6, 132W TDP',
  5200000, 40, 2, N'Sapphire', N'Available',
  N'{"memory_gb":8,"memory_type":"GDDR6","length_mm":235,"power_pin":"8-pin","tdp":132,"boost_clock":2.491,"ray_tracing":true}'
);

-- Mid-range gaming
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'ASUS Dual RTX 3060 12GB')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'ASUS Dual RTX 3060 12GB',
  N'Mid-range gaming GPU - 12GB GDDR6, 170W TDP',
  8500000, 30, 2, N'ASUS', N'Available',
  N'{"memory_gb":12,"memory_type":"GDDR6","length_mm":242,"power_pin":"12-pin","tdp":170,"boost_clock":1.777,"ray_tracing":true}'
);

-- High-end gaming
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Gigabyte RTX 4080 Super 16GB')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'Gigabyte RTX 4080 Super 16GB',
  N'High-end gaming GPU - 16GB GDDR6X, 320W TDP',
  28000000, 12, 2, N'Gigabyte', N'Available',
  N'{"memory_gb":16,"memory_type":"GDDR6X","length_mm":338,"power_pin":"16-pin","tdp":320,"boost_clock":2.55,"ray_tracing":true}'
);

-- Flagship AMD
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Sapphire Nitro RX 7900 XTX 24GB')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'Sapphire Nitro RX 7900 XTX 24GB',
  N'Flagship AMD GPU - 24GB GDDR6, 355W TDP',
  25000000, 8, 2, N'Sapphire', N'Available',
  N'{"memory_gb":24,"memory_type":"GDDR6","length_mm":335,"power_pin":"16-pin","tdp":355,"boost_clock":2.5,"ray_tracing":true}'
);

-- ──────────────────────────────────────────────────────────────
-- Mainboard (category_id = 3)
-- ──────────────────────────────────────────────────────────────

-- Budget LGA1700 DDR4
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Gigabyte B760M DS3H DDR4')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'Gigabyte B760M DS3H DDR4',
  N'Budget LGA1700 mATX - DDR4, PCIe 4.0',
  1800000, 50, 3, N'Gigabyte', N'Available',
  N'{"socket":"LGA1700","chipset":"B760","ram_type":"DDR4","form_factor":"mATX","ram_slots":2,"m2_slots":1,"pcie_gen":4,"usb_ports":6}'
);

-- Mid LGA1700 DDR5
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'ASUS Prime B760M-A DDR5')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'ASUS Prime B760M-A DDR5',
  N'Mid-range LGA1700 mATX - DDR5, PCIe 4.0',
  2500000, 45, 3, N'ASUS', N'Available',
  N'{"socket":"LGA1700","chipset":"B760","ram_type":"DDR5","form_factor":"mATX","ram_slots":2,"m2_slots":2,"pcie_gen":4,"usb_ports":8}'
);

-- Mid LGA1700 DDR4 ATX
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'MSI Pro B660-A DDR4')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'MSI Pro B660-A DDR4',
  N'Mid-range LGA1700 ATX - DDR4, PCIe 4.0',
  2800000, 35, 3, N'MSI', N'Available',
  N'{"socket":"LGA1700","chipset":"B660","ram_type":"DDR4","form_factor":"ATX","ram_slots":4,"m2_slots":2,"pcie_gen":4,"usb_ports":8}'
);

-- High-end LGA1700 DDR5
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'MSI MAG Z790 Tomahawk DDR5')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'MSI MAG Z790 Tomahawk DDR5',
  N'High-end LGA1700 ATX - DDR5, PCIe 5.0',
  6500000, 20, 3, N'MSI', N'Available',
  N'{"socket":"LGA1700","chipset":"Z790","ram_type":"DDR5","form_factor":"ATX","ram_slots":4,"m2_slots":4,"pcie_gen":5,"usb_ports":12}'
);

-- Budget AM5 DDR5
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'MSI MAG B650M Mortar WiFi')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'MSI MAG B650M Mortar WiFi',
  N'Mid AM5 mATX - DDR5, PCIe 5.0, WiFi',
  3500000, 30, 3, N'MSI', N'Available',
  N'{"socket":"AM5","chipset":"B650","ram_type":"DDR5","form_factor":"mATX","ram_slots":4,"m2_slots":2,"pcie_gen":5,"usb_ports":10}'
);

-- High-end AM5 DDR5
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'ASUS TUF X670-Plus WiFi')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'ASUS TUF X670-Plus WiFi',
  N'High-end AM5 ATX - DDR5, PCIe 5.0, WiFi',
  6000000, 18, 3, N'ASUS', N'Available',
  N'{"socket":"AM5","chipset":"X670","ram_type":"DDR5","form_factor":"ATX","ram_slots":4,"m2_slots":4,"pcie_gen":5,"usb_ports":12}'
);

-- ──────────────────────────────────────────────────────────────
-- RAM (category_id = 5)
-- ──────────────────────────────────────────────────────────────

-- Ultra budget DDR4
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Kingston ValueRAM DDR4 8GB 2666MHz')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'Kingston ValueRAM DDR4 8GB 2666MHz',
  N'1x8GB DDR4 budget RAM - văn phòng, học tập',
  450000, 100, 5, N'Kingston', N'Available',
  N'{"type":"DDR4","capacity_gb":8,"speed_mhz":2666,"kit_size":"1x8","latency":19,"voltage":1.2,"rgb":false}'
);

-- Budget DDR4 16GB
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Team T-Force Vulcan DDR4 16GB 3200MHz')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'Team T-Force Vulcan DDR4 16GB 3200MHz',
  N'2x8GB DDR4 gaming budget, CL16',
  1400000, 70, 5, N'Team', N'Available',
  N'{"type":"DDR4","capacity_gb":16,"speed_mhz":3200,"kit_size":"2x8","latency":16,"voltage":1.35,"rgb":false}'
);

-- Mid DDR4 32GB
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'G.Skill Ripjaws V DDR4 32GB 3600MHz')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'G.Skill Ripjaws V DDR4 32GB 3600MHz',
  N'2x16GB DDR4 gaming/workstation, CL18',
  2800000, 40, 5, N'G.Skill', N'Available',
  N'{"type":"DDR4","capacity_gb":32,"speed_mhz":3600,"kit_size":"2x16","latency":18,"voltage":1.35,"rgb":false}'
);

-- Budget DDR5 16GB
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Kingston Fury Beast DDR5 16GB 4800MHz')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'Kingston Fury Beast DDR5 16GB 4800MHz',
  N'2x8GB DDR5 budget, CL38',
  1600000, 60, 5, N'Kingston', N'Available',
  N'{"type":"DDR5","capacity_gb":16,"speed_mhz":4800,"kit_size":"2x8","latency":38,"voltage":1.1,"rgb":false}'
);

-- Mid DDR5 32GB
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Corsair Vengeance DDR5 32GB 5600MHz')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'Corsair Vengeance DDR5 32GB 5600MHz',
  N'2x16GB DDR5 gaming, CL36',
  3500000, 35, 5, N'Corsair', N'Available',
  N'{"type":"DDR5","capacity_gb":32,"speed_mhz":5600,"kit_size":"2x16","latency":36,"voltage":1.25,"rgb":false}'
);

-- High-end DDR5 64GB workstation
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'G.Skill Trident Z5 DDR5 64GB 6000MHz')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'G.Skill Trident Z5 DDR5 64GB 6000MHz',
  N'2x32GB DDR5 workstation cao cấp, CL30',
  9500000, 15, 5, N'G.Skill', N'Available',
  N'{"type":"DDR5","capacity_gb":64,"speed_mhz":6000,"kit_size":"2x32","latency":30,"voltage":1.35,"rgb":true}'
);

-- ──────────────────────────────────────────────────────────────
-- Storage (category_id = 6)
-- ──────────────────────────────────────────────────────────────

-- Ultra budget SATA SSD
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Kingston A400 240GB SATA SSD')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'Kingston A400 240GB SATA SSD',
  N'Entry-level SATA SSD, 500MB/s read - văn phòng',
  450000, 100, 6, N'Kingston', N'Available',
  N'{"capacity_gb":240,"type":"SSD","interface":"SATA","form_factor":"2.5\"","speed_mbps":500,"encrypted":false}'
);

-- Budget SATA SSD
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'WD Green 480GB SATA SSD')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'WD Green 480GB SATA SSD',
  N'Budget SATA SSD, 545MB/s read',
  650000, 80, 6, N'WD', N'Available',
  N'{"capacity_gb":480,"type":"SSD","interface":"SATA","form_factor":"2.5\"","speed_mbps":545,"encrypted":false}'
);

-- Mid SATA SSD
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Crucial MX500 1TB SATA SSD')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'Crucial MX500 1TB SATA SSD',
  N'Mid-range SATA SSD, 560MB/s read',
  1500000, 50, 6, N'Crucial', N'Available',
  N'{"capacity_gb":1000,"type":"SSD","interface":"SATA","form_factor":"2.5\"","speed_mbps":560,"encrypted":false}'
);

-- Budget NVMe
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'WD Black SN770 1TB NVMe')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'WD Black SN770 1TB NVMe',
  N'Mid-range PCIe 4.0 NVMe, 5150MB/s read',
  1800000, 45, 6, N'WD', N'Available',
  N'{"capacity_gb":1000,"type":"SSD","interface":"NVMe","form_factor":"M.2","speed_mbps":5150,"encrypted":false}'
);

-- High-end NVMe 2TB
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Samsung 990 Pro 2TB NVMe')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'Samsung 990 Pro 2TB NVMe',
  N'Flagship PCIe 4.0 NVMe - 7450MB/s read',
  5500000, 20, 6, N'Samsung', N'Available',
  N'{"capacity_gb":2000,"type":"SSD","interface":"NVMe","form_factor":"M.2","speed_mbps":7450,"encrypted":false}'
);

-- ──────────────────────────────────────────────────────────────
-- PSU (category_id = 7)
-- ──────────────────────────────────────────────────────────────

-- Budget Bronze 500W
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Huntkey JUMP 500W 80 Plus Bronze')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'Huntkey JUMP 500W 80 Plus Bronze',
  N'Budget 500W Bronze - văn phòng và gaming nhẹ',
  850000, 70, 7, N'Huntkey', N'Available',
  N'{"wattage":500,"certification":"80 Plus Bronze","modular":"None","pcie_8pin_count":1,"pcie_12vhpwr_count":0,"fan_size":120}'
);

-- Mid Bronze 650W
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Cooler Master MWE 650W Bronze')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'Cooler Master MWE 650W Bronze',
  N'80+ Bronze Semi Modular 650W - gaming tầm trung',
  1600000, 50, 7, N'Cooler Master', N'Available',
  N'{"wattage":650,"certification":"80 Plus Bronze","modular":"Semi","pcie_8pin_count":2,"pcie_12vhpwr_count":0,"fan_size":120}'
);

-- Mid Gold 750W
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Seasonic Focus GX-750 750W Gold')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'Seasonic Focus GX-750 750W Gold',
  N'80+ Gold Full Modular 750W - gaming cao cấp',
  3800000, 30, 7, N'Seasonic', N'Available',
  N'{"wattage":750,"certification":"80 Plus Gold","modular":"Full","pcie_8pin_count":2,"pcie_12vhpwr_count":1,"fan_size":120}'
);

-- High-end Platinum 1000W
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Corsair HX1000 1000W Platinum')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'Corsair HX1000 1000W Platinum',
  N'80+ Platinum Full Modular 1000W - workstation / flagship build',
  7000000, 15, 7, N'Corsair', N'Available',
  N'{"wattage":1000,"certification":"80 Plus Platinum","modular":"Full","pcie_8pin_count":4,"pcie_12vhpwr_count":1,"fan_size":140}'
);

-- ──────────────────────────────────────────────────────────────
-- Cooler (category_id = 8)
-- ──────────────────────────────────────────────────────────────

-- Budget air
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Cooler Master Hyper 212 Black')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'Cooler Master Hyper 212 Black',
  N'Budget Air Cooler - LGA1700 & AM5, 150W TDP',
  650000, 80, 8, N'Cooler Master', N'Available',
  N'{"type":"Air","supported_sockets":["LGA1700","AM5","AM4","LGA1151"],"max_tdp":150,"height_mm":158,"noise_db":31,"fans":1}'
);

-- Mid air
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Arctic Freezer 34 eSports')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'Arctic Freezer 34 eSports',
  N'Mid Air Cooler - LGA1700 & AM5, 200W TDP',
  850000, 60, 8, N'Arctic', N'Available',
  N'{"type":"Air","supported_sockets":["LGA1700","AM5","AM4","LGA1151"],"max_tdp":200,"height_mm":157,"noise_db":26,"fans":1}'
);

-- High-end air
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'be quiet! Dark Rock Pro 4')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'be quiet! Dark Rock Pro 4',
  N'Premium Dual Tower Air Cooler - 250W TDP, siêu im lặng',
  2800000, 25, 8, N'be quiet!', N'Available',
  N'{"type":"Air","supported_sockets":["LGA1700","AM5","AM4","LGA1151"],"max_tdp":250,"height_mm":162,"noise_db":24,"fans":2}'
);

-- Mid AIO 240mm
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Corsair iCUE H100i Elite 240mm AIO')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'Corsair iCUE H100i Elite 240mm AIO',
  N'240mm AIO Liquid Cooler - LGA1700 & AM5, RGB',
  3800000, 25, 8, N'Corsair', N'Available',
  N'{"type":"AIO","supported_sockets":["LGA1700","AM5","AM4","LGA1151"],"max_tdp":300,"height_mm":27,"noise_db":20,"fans":2}'
);

-- High-end AIO 360mm
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'NZXT Kraken 360 AIO')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'NZXT Kraken 360 AIO',
  N'360mm AIO Liquid Cooler - LGA1700 & AM5, flagship',
  5500000, 15, 8, N'NZXT', N'Available',
  N'{"type":"AIO","supported_sockets":["LGA1700","AM5","AM4","LGA1151"],"max_tdp":350,"height_mm":27,"noise_db":18,"fans":3}'
);

-- ──────────────────────────────────────────────────────────────
-- Case (category_id = 9)
-- ──────────────────────────────────────────────────────────────

-- Ultra budget mATX
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Sama 4702B mATX')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'Sama 4702B mATX',
  N'Vỏ case mATX giá rẻ - phù hợp văn phòng',
  550000, 80, 9, N'Sama', N'Available',
  N'{"form_factor":"mATX","max_gpu_length_mm":310,"max_cooler_height_mm":155,"fans_included":1,"dust_filters":false,"front_io":{"usb_a":2,"usb_c":0,"audio":true}}'
);

-- Budget mATX
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Fractal Design Pop Mini Air')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'Fractal Design Pop Mini Air',
  N'Budget mATX Mid Tower - luồng khí tốt',
  1500000, 40, 9, N'Fractal Design', N'Available',
  N'{"form_factor":"mATX","max_gpu_length_mm":340,"max_cooler_height_mm":160,"fans_included":2,"dust_filters":true,"front_io":{"usb_a":2,"usb_c":1,"audio":true}}'
);

-- Mid ATX gaming
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Corsair 4000D Airflow ATX')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'Corsair 4000D Airflow ATX',
  N'Mid-tower ATX - luồng khí cao cấp, 360mm GPU',
  2500000, 30, 9, N'Corsair', N'Available',
  N'{"form_factor":"ATX","max_gpu_length_mm":360,"max_cooler_height_mm":170,"fans_included":2,"dust_filters":true,"front_io":{"usb_a":1,"usb_c":1,"audio":true}}'
);

-- High-end ATX
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Lian Li O11 Dynamic EVO ATX')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'Lian Li O11 Dynamic EVO ATX',
  N'Premium Mid Tower ATX - dual chamber, RGB, 420mm GPU',
  4500000, 15, 9, N'Lian Li', N'Available',
  N'{"form_factor":"ATX","max_gpu_length_mm":420,"max_cooler_height_mm":167,"fans_included":0,"dust_filters":true,"front_io":{"usb_a":1,"usb_c":1,"audio":true}}'
);

-- Full tower workstation
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Phanteks Enthoo Pro 2 Full Tower')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'Phanteks Enthoo Pro 2 Full Tower',
  N'Full Tower ATX/EATX - workstation, dual system support, 500mm GPU',
  5000000, 10, 9, N'Phanteks', N'Available',
  N'{"form_factor":"ATX","max_gpu_length_mm":500,"max_cooler_height_mm":200,"fans_included":3,"dust_filters":true,"front_io":{"usb_a":2,"usb_c":2,"audio":true}}'
);

-- ──────────────────────────────────────────────────────────────
-- Kiểm tra kết quả sau khi seed
-- ──────────────────────────────────────────────────────────────
SELECT
  c.name AS Category,
  COUNT(p.product_id) AS Total_Products,
  COUNT(p.specs_json) AS With_Specs,
  MIN(p.price) AS Min_Price,
  MAX(p.price) AS Max_Price
FROM dbo.CATEGORY c
LEFT JOIN dbo.PRODUCT p ON p.category_id = c.category_id
WHERE c.name IN ('CPU','VGA','Mainboard','RAM','Storage','PSU','Cooler','Case')
GROUP BY c.name
ORDER BY c.name;
