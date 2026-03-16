-- ============================================================
-- Seed mở rộng sản phẩm - Phần 2
-- Chạy sau seed_more_products.sql
-- Database: PCComponentStore
--
-- Category IDs: CPU=1, VGA=2, Mainboard=3, RAM=5,
--               Storage=6, PSU=7, Cooler=8, Case=9
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- CPU - Mở rộng dải giá và platform
-- ══════════════════════════════════════════════════════════════

-- ── Intel LGA1700 ──

-- Ultra budget văn phòng (iGPU)
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Intel Core i3-13100')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Intel Core i3-13100', N'13th Gen i3 - 4 Cores 8 Threads, 60W TDP, iGPU UHD 730', 1700000, 90, 1, N'Intel', N'Available',
  N'{"socket":"LGA1700","cores":4,"threads":8,"tdp":60,"generation":"13th Gen Intel","iGPU":true,"base_clock":3.4,"boost_clock":4.5,"cache_mb":12,"series":"Core i3"}');

-- Mid gaming LGA1700
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Intel Core i5-12600K')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Intel Core i5-12600K', N'12th Gen i5K - 10 Cores 16 Threads, 125W, iGPU UHD 770', 5200000, 50, 1, N'Intel', N'Available',
  N'{"socket":"LGA1700","cores":10,"threads":16,"tdp":125,"generation":"12th Gen Intel","iGPU":true,"base_clock":3.7,"boost_clock":4.9,"cache_mb":20,"series":"Core i5"}');

-- High-end gaming LGA1700
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Intel Core i7-14700K')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Intel Core i7-14700K', N'14th Gen i7K - 20 Cores 28 Threads, 125W TDP', 12000000, 30, 1, N'Intel', N'Available',
  N'{"socket":"LGA1700","cores":20,"threads":28,"tdp":125,"generation":"14th Gen Intel","iGPU":true,"base_clock":3.4,"boost_clock":5.6,"cache_mb":33,"series":"Core i7"}');

-- Flagship Intel
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Intel Core i9-13900K')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Intel Core i9-13900K', N'13th Gen i9K - 24 Cores 32 Threads, 125W TDP flagship', 13500000, 15, 1, N'Intel', N'Available',
  N'{"socket":"LGA1700","cores":24,"threads":32,"tdp":125,"generation":"13th Gen Intel","iGPU":true,"base_clock":3.0,"boost_clock":5.8,"cache_mb":36,"series":"Core i9"}');

-- ── AMD AM5 ──

-- Entry AM5
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'AMD Ryzen 5 7500F')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'AMD Ryzen 5 7500F', N'Zen 4 - 6 Cores 12 Threads, 65W, không iGPU, giá tốt nhất AM5', 4500000, 60, 1, N'AMD', N'Available',
  N'{"socket":"AM5","cores":6,"threads":12,"tdp":65,"generation":"Zen 4","iGPU":false,"base_clock":3.7,"boost_clock":5.0,"cache_mb":32,"series":"Ryzen 5"}');

-- Mid-high AM5
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'AMD Ryzen 7 7800X3D')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'AMD Ryzen 7 7800X3D', N'Zen 4 3D V-Cache - CPU gaming tốt nhất AM5, 8 Cores, 120W', 12000000, 20, 1, N'AMD', N'Available',
  N'{"socket":"AM5","cores":8,"threads":16,"tdp":120,"generation":"Zen 4","iGPU":true,"base_clock":4.5,"boost_clock":5.0,"cache_mb":96,"series":"Ryzen 7"}');

-- Workstation AM5
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'AMD Ryzen 9 7900X')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'AMD Ryzen 9 7900X', N'Zen 4 - 12 Cores 24 Threads, 170W, workstation / content creation', 14000000, 20, 1, N'AMD', N'Available',
  N'{"socket":"AM5","cores":12,"threads":24,"tdp":170,"generation":"Zen 4","iGPU":true,"base_clock":4.7,"boost_clock":5.6,"cache_mb":64,"series":"Ryzen 9"}');

-- ── AMD AM4 (platform cũ giá rẻ hơn) ──

IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'AMD Ryzen 5 5600')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'AMD Ryzen 5 5600', N'Zen 3 AM4 - 6 Cores 12 Threads, 65W TDP, giá tốt 2024', 3200000, 70, 1, N'AMD', N'Available',
  N'{"socket":"AM4","cores":6,"threads":12,"tdp":65,"generation":"Zen 3","iGPU":false,"base_clock":3.5,"boost_clock":4.4,"cache_mb":32,"series":"Ryzen 5"}');

IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'AMD Ryzen 7 5800X')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'AMD Ryzen 7 5800X', N'Zen 3 AM4 - 8 Cores 16 Threads, 105W TDP', 5800000, 40, 1, N'AMD', N'Available',
  N'{"socket":"AM4","cores":8,"threads":16,"tdp":105,"generation":"Zen 3","iGPU":false,"base_clock":3.8,"boost_clock":4.7,"cache_mb":32,"series":"Ryzen 7"}');

IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'AMD Ryzen 9 5900X')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'AMD Ryzen 9 5900X', N'Zen 3 AM4 - 12 Cores 24 Threads, 105W, workstation tầm trung', 8000000, 25, 1, N'AMD', N'Available',
  N'{"socket":"AM4","cores":12,"threads":24,"tdp":105,"generation":"Zen 3","iGPU":false,"base_clock":3.7,"boost_clock":4.8,"cache_mb":64,"series":"Ryzen 9"}');

-- ══════════════════════════════════════════════════════════════
-- VGA - Phủ đủ dải giá từ 1.5M đến 50M
-- ══════════════════════════════════════════════════════════════

-- Ultra budget (dùng iGPU thay thế nếu CPU có)
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Gigabyte GeForce GT 1030 2GB')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Gigabyte GeForce GT 1030 2GB', N'Entry GPU - 2GB GDDR5, 30W, không cần nguồn 6-pin, phù hợp màn hình đơn', 1500000, 60, 2, N'Gigabyte', N'Available',
  N'{"memory_gb":2,"memory_type":"GDDR5","length_mm":145,"power_pin":"None","tdp":30,"boost_clock":1.468,"ray_tracing":false}');

-- Budget gaming
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Gigabyte GeForce RTX 3050 8GB')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Gigabyte GeForce RTX 3050 8GB', N'Budget NVIDIA RTX - 8GB GDDR6, 130W TDP, Ray Tracing', 4800000, 35, 2, N'Gigabyte', N'Available',
  N'{"memory_gb":8,"memory_type":"GDDR6","length_mm":228,"power_pin":"8-pin","tdp":130,"boost_clock":1.777,"ray_tracing":true}');

-- Mid AMD
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'MSI Mech RX 6700 XT 12GB')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'MSI Mech RX 6700 XT 12GB', N'AMD mid GPU - 12GB GDDR6, 230W, 1440p gaming mạnh', 7800000, 25, 2, N'MSI', N'Available',
  N'{"memory_gb":12,"memory_type":"GDDR6","length_mm":267,"power_pin":"8-pin","tdp":230,"boost_clock":2.581,"ray_tracing":true}');

-- Mid-high NVIDIA
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'ASUS Dual RTX 3070 Ti 8GB')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'ASUS Dual RTX 3070 Ti 8GB', N'High-performance NVIDIA - 8GB GDDR6X, 290W TDP, 1440p/4K', 10500000, 20, 2, N'ASUS', N'Available',
  N'{"memory_gb":8,"memory_type":"GDDR6X","length_mm":270,"power_pin":"12-pin","tdp":290,"boost_clock":1.8,"ray_tracing":true}');

-- Workstation / AI VRAM cao
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'MSI Gaming RTX 4070 Ti Super 16GB')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'MSI Gaming RTX 4070 Ti Super 16GB', N'High-end NVIDIA - 16GB GDDR6X, 285W, AI/ML VRAM lớn', 22000000, 10, 2, N'MSI', N'Available',
  N'{"memory_gb":16,"memory_type":"GDDR6X","length_mm":310,"power_pin":"16-pin","tdp":285,"boost_clock":2.61,"ray_tracing":true}');

-- Flagship NVIDIA
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Gigabyte Aorus RTX 4090 24GB')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Gigabyte Aorus RTX 4090 24GB', N'Flagship NVIDIA - 24GB GDDR6X, 450W, 4K ultra / AI compute', 48000000, 5, 2, N'Gigabyte', N'Available',
  N'{"memory_gb":24,"memory_type":"GDDR6X","length_mm":346,"power_pin":"16-pin","tdp":450,"boost_clock":2.535,"ray_tracing":true}');

-- AMD budget 1080p mới nhất
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Sapphire Pulse RX 7500 XT 8GB')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Sapphire Pulse RX 7500 XT 8GB', N'Budget AMD RDNA3 - 8GB GDDR6, 150W, 1080p gaming', 3800000, 45, 2, N'Sapphire', N'Available',
  N'{"memory_gb":8,"memory_type":"GDDR6","length_mm":210,"power_pin":"8-pin","tdp":150,"boost_clock":2.611,"ray_tracing":true}');

-- AMD mid-high
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'XFX Speedster RX 7700 XT 12GB')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'XFX Speedster RX 7700 XT 12GB', N'AMD RDNA3 mid GPU - 12GB GDDR6, 245W, 1440p mạnh', 9000000, 22, 2, N'XFX', N'Available',
  N'{"memory_gb":12,"memory_type":"GDDR6","length_mm":288,"power_pin":"8-pin","tdp":245,"boost_clock":2.599,"ray_tracing":true}');

-- ══════════════════════════════════════════════════════════════
-- Mainboard - AM4, AM5, LGA1700 đầy đủ
-- ══════════════════════════════════════════════════════════════

-- ── AM4 Platform (Ryzen 5000 series) ──

IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'MSI Pro B550M-VC WiFi')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'MSI Pro B550M-VC WiFi', N'Budget AM4 mATX - DDR4, PCIe 4.0, WiFi', 1700000, 50, 3, N'MSI', N'Available',
  N'{"socket":"AM4","chipset":"B550","ram_type":"DDR4","form_factor":"mATX","ram_slots":2,"m2_slots":2,"pcie_gen":4,"usb_ports":6}');

IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'ASUS TUF Gaming B550-Plus WiFi')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'ASUS TUF Gaming B550-Plus WiFi', N'Mid AM4 ATX - DDR4, PCIe 4.0, WiFi 6', 2800000, 35, 3, N'ASUS', N'Available',
  N'{"socket":"AM4","chipset":"B550","ram_type":"DDR4","form_factor":"ATX","ram_slots":4,"m2_slots":2,"pcie_gen":4,"usb_ports":10}');

IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Gigabyte X570S Aorus Pro AX')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Gigabyte X570S Aorus Pro AX', N'High-end AM4 ATX - DDR4, PCIe 4.0, WiFi 6E', 5500000, 15, 3, N'Gigabyte', N'Available',
  N'{"socket":"AM4","chipset":"X570","ram_type":"DDR4","form_factor":"ATX","ram_slots":4,"m2_slots":3,"pcie_gen":4,"usb_ports":12}');

-- ── AM5 Platform bổ sung ──

IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Gigabyte B650M DS3H DDR5')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Gigabyte B650M DS3H DDR5', N'Budget AM5 mATX - DDR5, PCIe 4.0', 2200000, 45, 3, N'Gigabyte', N'Available',
  N'{"socket":"AM5","chipset":"B650","ram_type":"DDR5","form_factor":"mATX","ram_slots":2,"m2_slots":1,"pcie_gen":4,"usb_ports":6}');

IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'ASUS ROG Strix X670E-A Gaming WiFi')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'ASUS ROG Strix X670E-A Gaming WiFi', N'Premium AM5 ATX - DDR5, PCIe 5.0, WiFi 6E', 8500000, 12, 3, N'ASUS', N'Available',
  N'{"socket":"AM5","chipset":"X670E","ram_type":"DDR5","form_factor":"ATX","ram_slots":4,"m2_slots":4,"pcie_gen":5,"usb_ports":14}');

-- ── LGA1700 bổ sung ──

IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'ASUS Prime H610M-K DDR4')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'ASUS Prime H610M-K DDR4', N'Ultra budget LGA1700 mATX - DDR4, PCIe 4.0', 1200000, 70, 3, N'ASUS', N'Available',
  N'{"socket":"LGA1700","chipset":"H610","ram_type":"DDR4","form_factor":"mATX","ram_slots":2,"m2_slots":1,"pcie_gen":4,"usb_ports":4}');

IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Gigabyte Z790 Aorus Elite AX DDR5')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Gigabyte Z790 Aorus Elite AX DDR5', N'High-end LGA1700 ATX - DDR5, PCIe 5.0, WiFi 6E, 2.5G LAN', 7000000, 15, 3, N'Gigabyte', N'Available',
  N'{"socket":"LGA1700","chipset":"Z790","ram_type":"DDR5","form_factor":"ATX","ram_slots":4,"m2_slots":5,"pcie_gen":5,"usb_ports":14}');

-- ══════════════════════════════════════════════════════════════
-- RAM - Đầy đủ DDR4 và DDR5
-- ══════════════════════════════════════════════════════════════

-- DDR4 AM4 (cho Ryzen 5000)
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'G.Skill Aegis DDR4 16GB 3000MHz')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'G.Skill Aegis DDR4 16GB 3000MHz', N'2x8GB DDR4 budget, CL16, phù hợp AM4', 1200000, 80, 5, N'G.Skill', N'Available',
  N'{"type":"DDR4","capacity_gb":16,"speed_mhz":3000,"kit_size":"2x8","latency":16,"voltage":1.35,"rgb":false}');

IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Corsair Vengeance Pro RGB DDR4 32GB 3600MHz')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Corsair Vengeance Pro RGB DDR4 32GB 3600MHz', N'2x16GB DDR4 RGB, CL18, gaming cao cấp', 3200000, 30, 5, N'Corsair', N'Available',
  N'{"type":"DDR4","capacity_gb":32,"speed_mhz":3600,"kit_size":"2x16","latency":18,"voltage":1.35,"rgb":true}');

-- DDR4 workstation 64GB
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Kingston Server Premier DDR4 64GB 3200MHz')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Kingston Server Premier DDR4 64GB 3200MHz', N'2x32GB DDR4 ECC-ready - workstation / server', 7500000, 10, 5, N'Kingston', N'Available',
  N'{"type":"DDR4","capacity_gb":64,"speed_mhz":3200,"kit_size":"2x32","latency":22,"voltage":1.2,"rgb":false}');

-- DDR5 budget
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Crucial DDR5 32GB 4800MHz')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Crucial DDR5 32GB 4800MHz', N'2x16GB DDR5 budget, CL40 - phù hợp LGA1700 / AM5 mới', 2800000, 50, 5, N'Crucial', N'Available',
  N'{"type":"DDR5","capacity_gb":32,"speed_mhz":4800,"kit_size":"2x16","latency":40,"voltage":1.1,"rgb":false}');

-- DDR5 gaming cao
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'G.Skill Trident Z5 RGB DDR5 32GB 6400MHz')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'G.Skill Trident Z5 RGB DDR5 32GB 6400MHz', N'2x16GB DDR5 gaming flagship, CL32 RGB', 5500000, 20, 5, N'G.Skill', N'Available',
  N'{"type":"DDR5","capacity_gb":32,"speed_mhz":6400,"kit_size":"2x16","latency":32,"voltage":1.4,"rgb":true}');

-- DDR5 workstation 96GB
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Corsair Dominator Platinum DDR5 96GB 5600MHz')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Corsair Dominator Platinum DDR5 96GB 5600MHz', N'2x48GB DDR5 workstation cao cấp, CL40 RGB', 12000000, 8, 5, N'Corsair', N'Available',
  N'{"type":"DDR5","capacity_gb":96,"speed_mhz":5600,"kit_size":"2x48","latency":40,"voltage":1.25,"rgb":true}');

-- ══════════════════════════════════════════════════════════════
-- Storage - Phủ đủ loại
-- ══════════════════════════════════════════════════════════════

-- Ultra budget SSD SATA
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Adata SU650 120GB SATA SSD')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Adata SU650 120GB SATA SSD', N'Ultra budget SATA SSD chỉ cài OS', 350000, 120, 6, N'Adata', N'Available',
  N'{"capacity_gb":120,"type":"SSD","interface":"SATA","form_factor":"2.5\"","speed_mbps":520,"encrypted":false}');

-- Budget NVMe PCIe 3.0
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Kingston NV2 1TB NVMe PCIe 3.0')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Kingston NV2 1TB NVMe PCIe 3.0', N'Budget NVMe 1TB, 3500MB/s read', 1100000, 80, 6, N'Kingston', N'Available',
  N'{"capacity_gb":1000,"type":"SSD","interface":"NVMe","form_factor":"M.2","speed_mbps":3500,"encrypted":false}');

-- Mid NVMe PCIe 4.0
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Crucial P5 Plus 1TB NVMe PCIe 4.0')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Crucial P5 Plus 1TB NVMe PCIe 4.0', N'Mid-range PCIe 4.0 NVMe 1TB, 6600MB/s read', 2000000, 45, 6, N'Crucial', N'Available',
  N'{"capacity_gb":1000,"type":"SSD","interface":"NVMe","form_factor":"M.2","speed_mbps":6600,"encrypted":false}');

-- Workstation NVMe 2TB PCIe 4.0
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Seagate FireCuda 530 2TB NVMe PCIe 4.0')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Seagate FireCuda 530 2TB NVMe PCIe 4.0', N'Workstation NVMe 2TB, 7300MB/s read, heatsink', 4500000, 20, 6, N'Seagate', N'Available',
  N'{"capacity_gb":2000,"type":"SSD","interface":"NVMe","form_factor":"M.2","speed_mbps":7300,"encrypted":false}');

-- HDD lưu trữ lớn 4TB
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'WD Blue 4TB HDD SATA')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'WD Blue 4TB HDD SATA', N'4TB HDD 5400RPM SATA - lưu trữ phim, game, data', 2800000, 40, 6, N'WD', N'Available',
  N'{"capacity_gb":4000,"type":"HDD","interface":"SATA","form_factor":"3.5\"","speed_mbps":180,"encrypted":false}');

-- NAS HDD
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Seagate IronWolf 8TB NAS HDD')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Seagate IronWolf 8TB NAS HDD', N'8TB NAS HDD chuyên dụng, 7200RPM, CMR', 5500000, 15, 6, N'Seagate', N'Available',
  N'{"capacity_gb":8000,"type":"HDD","interface":"SATA","form_factor":"3.5\"","speed_mbps":210,"encrypted":false}');

-- High-end NVMe PCIe 5.0
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Samsung 990 Pro 1TB NVMe PCIe 4.0')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Samsung 990 Pro 1TB NVMe PCIe 4.0', N'Flagship Samsung NVMe 1TB, 7450MB/s read', 3000000, 30, 6, N'Samsung', N'Available',
  N'{"capacity_gb":1000,"type":"SSD","interface":"NVMe","form_factor":"M.2","speed_mbps":7450,"encrypted":false}');

-- ══════════════════════════════════════════════════════════════
-- PSU - Phủ đủ wattage từ 400W đến 1200W
-- ══════════════════════════════════════════════════════════════

-- Ultra budget 450W
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Xigmatek X-Power III 450W')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Xigmatek X-Power III 450W', N'Ultra budget 450W - phù hợp PC văn phòng không GPU', 550000, 100, 7, N'Xigmatek', N'Available',
  N'{"wattage":450,"certification":"None","modular":"None","pcie_8pin_count":0,"pcie_12vhpwr_count":0,"fan_size":120}');

-- Budget Gold 650W
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'DeepCool PQ650M 650W Gold')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'DeepCool PQ650M 650W Gold', N'80+ Gold Semi Modular 650W - gaming tầm thấp', 1900000, 45, 7, N'DeepCool', N'Available',
  N'{"wattage":650,"certification":"80 Plus Gold","modular":"Semi","pcie_8pin_count":2,"pcie_12vhpwr_count":0,"fan_size":120}');

-- Mid Gold 850W
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Corsair RM850x 850W Gold')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Corsair RM850x 850W Gold', N'80+ Gold Full Modular 850W - gaming cao cấp / RTX 4080', 5000000, 20, 7, N'Corsair', N'Available',
  N'{"wattage":850,"certification":"80 Plus Gold","modular":"Full","pcie_8pin_count":3,"pcie_12vhpwr_count":1,"fan_size":140}');

-- High-end Platinum 1000W
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Seasonic Prime TX-1000 1000W Titanium')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Seasonic Prime TX-1000 1000W Titanium', N'80+ Titanium Full Modular 1000W - flagship workstation / RTX 4090', 8500000, 8, 7, N'Seasonic', N'Available',
  N'{"wattage":1000,"certification":"80 Plus Titanium","modular":"Full","pcie_8pin_count":4,"pcie_12vhpwr_count":2,"fan_size":135}');

-- Siêu cao 1200W cho dual GPU / workstation
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'ASUS ROG Thor 1200W Platinum II')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'ASUS ROG Thor 1200W Platinum II', N'80+ Platinum Full Modular 1200W OLED display - extreme build', 10000000, 5, 7, N'ASUS', N'Available',
  N'{"wattage":1200,"certification":"80 Plus Platinum","modular":"Full","pcie_8pin_count":6,"pcie_12vhpwr_count":2,"fan_size":135}');

-- ══════════════════════════════════════════════════════════════
-- Cooler - Đầy đủ loại
-- ══════════════════════════════════════════════════════════════

-- Box cooler Intel (miễn phí kèm CPU, nhưng bán riêng)
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Intel Stock Cooler LGA1700')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Intel Stock Cooler LGA1700', N'Tản nhiệt box kèm CPU Intel i3/i5 - đủ dùng cho TDP thấp', 150000, 200, 8, N'Intel', N'Available',
  N'{"type":"Air","supported_sockets":["LGA1700","LGA1200","LGA1151"],"max_tdp":65,"height_mm":60,"noise_db":38,"fans":1}');

-- Budget air AMD
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'AMD Wraith Stealth AM5')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'AMD Wraith Stealth AM5', N'Tản nhiệt box kèm Ryzen - đủ dùng 65W AM5', 200000, 150, 8, N'AMD', N'Available',
  N'{"type":"Air","supported_sockets":["AM5","AM4"],"max_tdp":65,"height_mm":55,"noise_db":36,"fans":1}');

-- Mid air 120TDP
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'DeepCool AK400 Zero Dark')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'DeepCool AK400 Zero Dark', N'Mid Air Cooler - LGA1700 & AM5, 220W TDP, siêu im', 750000, 65, 8, N'DeepCool', N'Available',
  N'{"type":"Air","supported_sockets":["LGA1700","AM5","AM4","LGA1151"],"max_tdp":220,"height_mm":155,"noise_db":27,"fans":1}');

-- High-end air
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Noctua NH-U12A')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Noctua NH-U12A', N'Premium Single Tower Air - LGA1700 & AM5, 200W TDP, cực im', 2200000, 20, 8, N'Noctua', N'Available',
  N'{"type":"Air","supported_sockets":["LGA1700","AM5","AM4","LGA1151"],"max_tdp":200,"height_mm":158,"noise_db":22,"fans":2}');

-- AIO 120mm nhỏ
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Cooler Master MasterLiquid 120L')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Cooler Master MasterLiquid 120L', N'120mm AIO - LGA1700 & AM5, compact build', 1200000, 40, 8, N'Cooler Master', N'Available',
  N'{"type":"AIO","supported_sockets":["LGA1700","AM5","AM4","LGA1151"],"max_tdp":180,"height_mm":27,"noise_db":26,"fans":1}');

-- AIO 360mm flagship
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Corsair iCUE H150i Elite 360mm AIO')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Corsair iCUE H150i Elite 360mm AIO', N'360mm AIO - LGA1700 & AM5, flagship RGB, 350W TDP support', 5200000, 12, 8, N'Corsair', N'Available',
  N'{"type":"AIO","supported_sockets":["LGA1700","AM5","AM4","LGA1151"],"max_tdp":350,"height_mm":27,"noise_db":18,"fans":3}');

-- ══════════════════════════════════════════════════════════════
-- Case - Phủ đủ kích thước và phân khúc
-- ══════════════════════════════════════════════════════════════

-- Ultra budget mATX
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Vitra M20 mATX')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Vitra M20 mATX', N'Vỏ case mATX siêu rẻ - phù hợp PC văn phòng, học tập', 400000, 150, 9, N'Vitra', N'Available',
  N'{"form_factor":"mATX","max_gpu_length_mm":300,"max_cooler_height_mm":150,"fans_included":1,"dust_filters":false,"front_io":{"usb_a":2,"usb_c":0,"audio":true}}');

-- Budget ATX
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Antec NX200 ATX')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Antec NX200 ATX', N'Budget ATX Mid Tower - luồng khí cơ bản, giá rẻ', 900000, 60, 9, N'Antec', N'Available',
  N'{"form_factor":"ATX","max_gpu_length_mm":340,"max_cooler_height_mm":165,"fans_included":2,"dust_filters":true,"front_io":{"usb_a":2,"usb_c":0,"audio":true}}');

-- Mid ATX gaming kính cường lực
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'NZXT H7 Flow ATX')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'NZXT H7 Flow ATX', N'Mid Tower ATX kính cường lực - 400mm GPU, 185mm Cooler', 3200000, 20, 9, N'NZXT', N'Available',
  N'{"form_factor":"ATX","max_gpu_length_mm":400,"max_cooler_height_mm":185,"fans_included":2,"dust_filters":true,"front_io":{"usb_a":1,"usb_c":1,"audio":true}}');

-- Premium ATX
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Fractal Design Define 7 ATX')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Fractal Design Define 7 ATX', N'Premium silent ATX - cách âm, 460mm GPU, 185mm Cooler', 4200000, 15, 9, N'Fractal Design', N'Available',
  N'{"form_factor":"ATX","max_gpu_length_mm":460,"max_cooler_height_mm":185,"fans_included":3,"dust_filters":true,"front_io":{"usb_a":2,"usb_c":1,"audio":true}}');

-- Compact ITX (nhỏ gọn)
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Cooler Master NR200P Mini-ITX')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Cooler Master NR200P Mini-ITX', N'Mini-ITX compact - 330mm GPU, 153mm Cooler, siêu nhỏ gọn', 2000000, 25, 9, N'Cooler Master', N'Available',
  N'{"form_factor":"mATX","max_gpu_length_mm":330,"max_cooler_height_mm":153,"fans_included":1,"dust_filters":true,"front_io":{"usb_a":1,"usb_c":1,"audio":true}}');

-- RGB showcase build
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Lian Li Lancool III ATX')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json) VALUES (
  N'Lian Li Lancool III ATX', N'Premium RGB ATX - 480mm GPU, 190mm Cooler, luồng khí xuất sắc', 3800000, 15, 9, N'Lian Li', N'Available',
  N'{"form_factor":"ATX","max_gpu_length_mm":480,"max_cooler_height_mm":190,"fans_included":3,"dust_filters":true,"front_io":{"usb_a":2,"usb_c":1,"audio":true}}');

-- ══════════════════════════════════════════════════════════════
-- Kiểm tra kết quả
-- ══════════════════════════════════════════════════════════════
SELECT
  c.name         AS Category,
  COUNT(p.product_id) AS Total,
  COUNT(p.specs_json) AS With_Specs,
  FORMAT(MIN(p.price), 'N0') AS Min_Price_VND,
  FORMAT(MAX(p.price), 'N0') AS Max_Price_VND,
  FORMAT(AVG(p.price), 'N0') AS Avg_Price_VND
FROM dbo.CATEGORY c
LEFT JOIN dbo.PRODUCT p
  ON p.category_id = c.category_id AND p.specs_json IS NOT NULL
WHERE c.name IN ('CPU','VGA','Mainboard','RAM','Storage','PSU','Cooler','Case')
GROUP BY c.name
ORDER BY c.name;
