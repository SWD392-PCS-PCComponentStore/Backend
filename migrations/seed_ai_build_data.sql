-- ============================================================
-- SEED DATA CHO TÍNH NĂNG AI BUILD PC
-- Chạy file này SAU KHI đã chạy information.sql
-- Không cần ALTER TABLE — chỉ INSERT vào CATEGORY và PRODUCT_SPEC
-- ============================================================

USE PCComponentStore;
GO

-- ============================================================
-- BƯỚC 1: THÊM CÁC DANH MỤC CÒN THIẾU
-- information.sql đã có: CPU(1), VGA(2), Mainboard(3), PC Bộ(4)
-- ============================================================
INSERT INTO CATEGORY (name, description) VALUES
(N'RAM',     N'Bộ nhớ trong'),      -- ID 5
(N'Storage', N'Ổ cứng / SSD'),      -- ID 6
(N'PSU',     N'Nguồn máy tính'),    -- ID 7
(N'Cooler',  N'Tản nhiệt CPU'),     -- ID 8
(N'Case',    N'Vỏ máy tính');       -- ID 9
GO

-- ============================================================
-- BƯỚC 2: GÁN SPECS CHO 3 SẢN PHẨM ĐÃ CÓ (ID 1, 2, 3)
-- ============================================================
DECLARE @pid INT;

-- Product 1: Intel Core i9-14900K (CPU - category 1)
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(1, 'socket',      'LGA1700'),
(1, 'cores',       '24'),
(1, 'threads',     '32'),
(1, 'tdp',         '253'),
(1, 'generation',  '14th Gen Intel'),
(1, 'base_clock',  '3.2'),
(1, 'boost_clock', '6.2'),
(1, 'cache_mb',    '36'),
(1, 'series',      'Core i9');
PRINT 'Specs added: i9-14900K';

-- Product 2: NVIDIA RTX 4090 (VGA - category 2)
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(2, 'memory_gb',   '24'),
(2, 'memory_type', 'GDDR6X'),
(2, 'length_mm',   '336'),
(2, 'power_pin',   '12VHPWR'),
(2, 'tdp',         '450'),
(2, 'boost_clock', '2.52'),
(2, 'ray_tracing', 'true');
PRINT 'Specs added: RTX 4090';

-- Product 3: ASUS ROG Z790 (Mainboard - category 3)
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(3, 'socket',      'LGA1700'),
(3, 'chipset',     'Z790'),
(3, 'ram_type',    'DDR5'),
(3, 'form_factor', 'ATX'),
(3, 'ram_slots',   '4'),
(3, 'm2_slots',    '5');
PRINT 'Specs added: ASUS ROG Z790';
GO

-- ============================================================
-- BƯỚC 3: THÊM SẢN PHẨM MỚI VÀ SPECS
-- Bao phủ ngân sách: 10M - 60M VND
-- ============================================================
DECLARE @pid INT;

-- ──────────────────────────────────────────────────────────
-- CPU (category_id = 1)
-- ──────────────────────────────────────────────────────────

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'Intel Core i3-12100F', N'4 Cores / 8 Threads, LGA1700, 58W TDP', 2500000, 100, 1, 'Intel');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'socket',      'LGA1700'),
(@pid, 'cores',       '4'),
(@pid, 'threads',     '8'),
(@pid, 'tdp',         '58'),
(@pid, 'generation',  '12th Gen Intel'),
(@pid, 'base_clock',  '3.3'),
(@pid, 'boost_clock', '4.3'),
(@pid, 'series',      'Core i3');
PRINT 'Added: i3-12100F';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'Intel Core i5-12400F', N'6 Cores / 12 Threads, LGA1700, 65W TDP', 3200000, 80, 1, 'Intel');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'socket',      'LGA1700'),
(@pid, 'cores',       '6'),
(@pid, 'threads',     '12'),
(@pid, 'tdp',         '65'),
(@pid, 'generation',  '12th Gen Intel'),
(@pid, 'base_clock',  '2.5'),
(@pid, 'boost_clock', '4.4'),
(@pid, 'series',      'Core i5');
PRINT 'Added: i5-12400F';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'Intel Core i5-13600K', N'14 Cores / 20 Threads, LGA1700, 125W TDP', 5500000, 60, 1, 'Intel');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'socket',      'LGA1700'),
(@pid, 'cores',       '14'),
(@pid, 'threads',     '20'),
(@pid, 'tdp',         '125'),
(@pid, 'generation',  '13th Gen Intel'),
(@pid, 'base_clock',  '3.5'),
(@pid, 'boost_clock', '5.1'),
(@pid, 'series',      'Core i5');
PRINT 'Added: i5-13600K';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'Intel Core i7-13700K', N'16 Cores / 24 Threads, LGA1700, 125W TDP', 9500000, 40, 1, 'Intel');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'socket',      'LGA1700'),
(@pid, 'cores',       '16'),
(@pid, 'threads',     '24'),
(@pid, 'tdp',         '125'),
(@pid, 'generation',  '13th Gen Intel'),
(@pid, 'base_clock',  '3.4'),
(@pid, 'boost_clock', '5.4'),
(@pid, 'series',      'Core i7');
PRINT 'Added: i7-13700K';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'AMD Ryzen 5 7600', N'6 Cores / 12 Threads, AM5, 65W TDP', 4500000, 70, 1, 'AMD');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'socket',      'AM5'),
(@pid, 'cores',       '6'),
(@pid, 'threads',     '12'),
(@pid, 'tdp',         '65'),
(@pid, 'generation',  'Ryzen 7000'),
(@pid, 'base_clock',  '3.8'),
(@pid, 'boost_clock', '5.1'),
(@pid, 'series',      'Ryzen 5');
PRINT 'Added: Ryzen 5 7600';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'AMD Ryzen 7 7700X', N'8 Cores / 16 Threads, AM5, 105W TDP', 7000000, 50, 1, 'AMD');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'socket',      'AM5'),
(@pid, 'cores',       '8'),
(@pid, 'threads',     '16'),
(@pid, 'tdp',         '105'),
(@pid, 'generation',  'Ryzen 7000'),
(@pid, 'base_clock',  '4.5'),
(@pid, 'boost_clock', '5.4'),
(@pid, 'series',      'Ryzen 7');
PRINT 'Added: Ryzen 7 7700X';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'AMD Ryzen 9 7950X', N'16 Cores / 32 Threads, AM5, 170W TDP', 18000000, 20, 1, 'AMD');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'socket',      'AM5'),
(@pid, 'cores',       '16'),
(@pid, 'threads',     '32'),
(@pid, 'tdp',         '170'),
(@pid, 'generation',  'Ryzen 7000'),
(@pid, 'base_clock',  '4.5'),
(@pid, 'boost_clock', '5.7'),
(@pid, 'series',      'Ryzen 9');
PRINT 'Added: Ryzen 9 7950X';
GO

-- ──────────────────────────────────────────────────────────
-- VGA (category_id = 2)
-- ──────────────────────────────────────────────────────────
DECLARE @pid INT;

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'NVIDIA GTX 1660 Super 6GB', N'6GB GDDR6, 125W TDP', 3800000, 60, 2, 'ASUS');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'memory_gb',   '6'),
(@pid, 'memory_type', 'GDDR6'),
(@pid, 'length_mm',   '230'),
(@pid, 'power_pin',   '8-pin'),
(@pid, 'tdp',         '125'),
(@pid, 'ray_tracing', 'false');
PRINT 'Added: GTX 1660 Super';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'NVIDIA RTX 3060 12GB', N'12GB GDDR6, 170W TDP', 5500000, 50, 2, 'MSI');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'memory_gb',   '12'),
(@pid, 'memory_type', 'GDDR6'),
(@pid, 'length_mm',   '242'),
(@pid, 'power_pin',   '12-pin'),
(@pid, 'tdp',         '170'),
(@pid, 'ray_tracing', 'true');
PRINT 'Added: RTX 3060';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'NVIDIA RTX 4060 8GB', N'8GB GDDR6, 115W TDP', 7500000, 45, 2, 'Gigabyte');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'memory_gb',   '8'),
(@pid, 'memory_type', 'GDDR6'),
(@pid, 'length_mm',   '240'),
(@pid, 'power_pin',   '16-pin'),
(@pid, 'tdp',         '115'),
(@pid, 'ray_tracing', 'true');
PRINT 'Added: RTX 4060';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'NVIDIA RTX 4060 Ti 16GB', N'16GB GDDR6, 165W TDP', 9000000, 35, 2, 'ASUS');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'memory_gb',   '16'),
(@pid, 'memory_type', 'GDDR6'),
(@pid, 'length_mm',   '240'),
(@pid, 'power_pin',   '16-pin'),
(@pid, 'tdp',         '165'),
(@pid, 'ray_tracing', 'true');
PRINT 'Added: RTX 4060 Ti';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'NVIDIA RTX 4070 Super 12GB', N'12GB GDDR6X, 220W TDP', 14000000, 25, 2, 'ASUS');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'memory_gb',   '12'),
(@pid, 'memory_type', 'GDDR6X'),
(@pid, 'length_mm',   '267'),
(@pid, 'power_pin',   '16-pin'),
(@pid, 'tdp',         '220'),
(@pid, 'ray_tracing', 'true');
PRINT 'Added: RTX 4070 Super';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'NVIDIA RTX 4080 Super 16GB', N'16GB GDDR6X, 320W TDP', 22000000, 15, 2, 'ASUS');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'memory_gb',   '16'),
(@pid, 'memory_type', 'GDDR6X'),
(@pid, 'length_mm',   '310'),
(@pid, 'power_pin',   '16-pin'),
(@pid, 'tdp',         '320'),
(@pid, 'ray_tracing', 'true');
PRINT 'Added: RTX 4080 Super';
GO

-- ──────────────────────────────────────────────────────────
-- MAINBOARD (category_id = 3)
-- ──────────────────────────────────────────────────────────
DECLARE @pid INT;

-- Intel LGA1700 + DDR4 (rẻ — phù hợp ngân sách thấp)
INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'MSI H610M DDR4', N'LGA1700, DDR4, mATX, Chipset H610', 1400000, 80, 3, 'MSI');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'socket',      'LGA1700'),
(@pid, 'chipset',     'H610'),
(@pid, 'ram_type',    'DDR4'),
(@pid, 'form_factor', 'mATX'),
(@pid, 'ram_slots',   '2'),
(@pid, 'm2_slots',    '1');
PRINT 'Added: MSI H610M DDR4';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'MSI B760M DDR4', N'LGA1700, DDR4, mATX, Chipset B760', 2500000, 60, 3, 'MSI');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'socket',      'LGA1700'),
(@pid, 'chipset',     'B760'),
(@pid, 'ram_type',    'DDR4'),
(@pid, 'form_factor', 'mATX'),
(@pid, 'ram_slots',   '4'),
(@pid, 'm2_slots',    '2');
PRINT 'Added: MSI B760M DDR4';

-- Intel LGA1700 + DDR5
INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'ASUS PRIME B760-Plus DDR5', N'LGA1700, DDR5, ATX, Chipset B760', 3800000, 40, 3, 'ASUS');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'socket',      'LGA1700'),
(@pid, 'chipset',     'B760'),
(@pid, 'ram_type',    'DDR5'),
(@pid, 'form_factor', 'ATX'),
(@pid, 'ram_slots',   '4'),
(@pid, 'm2_slots',    '3');
PRINT 'Added: ASUS B760-Plus DDR5';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'ASUS ROG STRIX Z790-F DDR5', N'LGA1700, DDR5, ATX, Chipset Z790', 8500000, 20, 3, 'ASUS');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'socket',      'LGA1700'),
(@pid, 'chipset',     'Z790'),
(@pid, 'ram_type',    'DDR5'),
(@pid, 'form_factor', 'ATX'),
(@pid, 'ram_slots',   '4'),
(@pid, 'm2_slots',    '5');
PRINT 'Added: ASUS Z790-F DDR5';

-- AMD AM5 + DDR5
INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'MSI MAG B650M MORTAR DDR5', N'AM5, DDR5, mATX, Chipset B650', 4000000, 50, 3, 'MSI');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'socket',      'AM5'),
(@pid, 'chipset',     'B650'),
(@pid, 'ram_type',    'DDR5'),
(@pid, 'form_factor', 'mATX'),
(@pid, 'ram_slots',   '4'),
(@pid, 'm2_slots',    '2');
PRINT 'Added: MSI B650M MORTAR';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'ASUS ROG CROSSHAIR X670E DDR5', N'AM5, DDR5, ATX, Chipset X670E', 9000000, 15, 3, 'ASUS');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'socket',      'AM5'),
(@pid, 'chipset',     'X670E'),
(@pid, 'ram_type',    'DDR5'),
(@pid, 'form_factor', 'ATX'),
(@pid, 'ram_slots',   '4'),
(@pid, 'm2_slots',    '5');
PRINT 'Added: ASUS X670E';
GO

-- ──────────────────────────────────────────────────────────
-- RAM (category_id = 5)
-- ──────────────────────────────────────────────────────────
DECLARE @pid INT;

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'Kingston Fury Beast DDR4 16GB (2x8GB) 3200MHz', N'DDR4 3200MHz, CL16', 1200000, 150, 5, 'Kingston');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'type',        'DDR4'),
(@pid, 'capacity_gb', '16'),
(@pid, 'speed_mhz',   '3200'),
(@pid, 'kit_size',    '2x8'),
(@pid, 'latency',     '16'),
(@pid, 'voltage',     '1.35');
PRINT 'Added: Kingston DDR4 16GB';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'Corsair Vengeance DDR4 32GB (2x16GB) 3200MHz', N'DDR4 3200MHz, CL16', 2500000, 100, 5, 'Corsair');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'type',        'DDR4'),
(@pid, 'capacity_gb', '32'),
(@pid, 'speed_mhz',   '3200'),
(@pid, 'kit_size',    '2x16'),
(@pid, 'latency',     '16'),
(@pid, 'voltage',     '1.35');
PRINT 'Added: Corsair DDR4 32GB';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'Kingston Fury Beast DDR5 32GB (2x16GB) 5600MHz', N'DDR5 5600MHz, CL36', 3200000, 80, 5, 'Kingston');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'type',        'DDR5'),
(@pid, 'capacity_gb', '32'),
(@pid, 'speed_mhz',   '5600'),
(@pid, 'kit_size',    '2x16'),
(@pid, 'latency',     '36'),
(@pid, 'voltage',     '1.1');
PRINT 'Added: Kingston DDR5 32GB';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'Corsair Dominator DDR5 64GB (2x32GB) 6000MHz', N'DDR5 6000MHz, CL30', 6500000, 30, 5, 'Corsair');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'type',        'DDR5'),
(@pid, 'capacity_gb', '64'),
(@pid, 'speed_mhz',   '6000'),
(@pid, 'kit_size',    '2x32'),
(@pid, 'latency',     '30'),
(@pid, 'voltage',     '1.4');
PRINT 'Added: Corsair DDR5 64GB';
GO

-- ──────────────────────────────────────────────────────────
-- STORAGE (category_id = 6)
-- ──────────────────────────────────────────────────────────
DECLARE @pid INT;

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'Kingston A400 480GB SATA SSD', N'SATA III, 500MB/s đọc', 800000, 200, 6, 'Kingston');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'capacity_gb', '480'),
(@pid, 'type',        'SSD'),
(@pid, 'interface',   'SATA'),
(@pid, 'form_factor', '2.5"'),
(@pid, 'speed_mbps',  '500');
PRINT 'Added: Kingston A400 480GB';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'Samsung 870 EVO 1TB SATA SSD', N'SATA III, 560MB/s đọc', 1800000, 100, 6, 'Samsung');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'capacity_gb', '1000'),
(@pid, 'type',        'SSD'),
(@pid, 'interface',   'SATA'),
(@pid, 'form_factor', '2.5"'),
(@pid, 'speed_mbps',  '560');
PRINT 'Added: Samsung 870 EVO 1TB';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'WD Black SN770 1TB NVMe SSD', N'PCIe 4.0 NVMe, 5150MB/s đọc', 2000000, 80, 6, 'WD');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'capacity_gb', '1000'),
(@pid, 'type',        'SSD'),
(@pid, 'interface',   'NVMe'),
(@pid, 'form_factor', 'M.2'),
(@pid, 'speed_mbps',  '5150');
PRINT 'Added: WD SN770 1TB';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'Samsung 990 Pro 2TB NVMe SSD', N'PCIe 4.0 NVMe, 7450MB/s đọc', 4500000, 50, 6, 'Samsung');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'capacity_gb', '2000'),
(@pid, 'type',        'SSD'),
(@pid, 'interface',   'NVMe'),
(@pid, 'form_factor', 'M.2'),
(@pid, 'speed_mbps',  '7450');
PRINT 'Added: Samsung 990 Pro 2TB';
GO

-- ──────────────────────────────────────────────────────────
-- PSU (category_id = 7)
-- ──────────────────────────────────────────────────────────
DECLARE @pid INT;

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'Corsair CV450 450W 80+ Bronze', N'Non-modular, 450W, 80+ Bronze', 900000, 100, 7, 'Corsair');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'wattage',         '450'),
(@pid, 'certification',   '80 Plus Bronze'),
(@pid, 'modular',         'Non');
PRINT 'Added: Corsair CV450 450W';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'Seasonic Focus GX-650 650W 80+ Gold', N'Full-modular, 650W, 80+ Gold', 1600000, 80, 7, 'Seasonic');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'wattage',         '650'),
(@pid, 'certification',   '80 Plus Gold'),
(@pid, 'modular',         'Full');
PRINT 'Added: Seasonic GX-650';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'Corsair RM750x 750W 80+ Gold', N'Full-modular, 750W, 80+ Gold', 2200000, 60, 7, 'Corsair');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'wattage',         '750'),
(@pid, 'certification',   '80 Plus Gold'),
(@pid, 'modular',         'Full');
PRINT 'Added: Corsair RM750x';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'Corsair HX1000 1000W 80+ Platinum', N'Full-modular, 1000W, 80+ Platinum', 4000000, 30, 7, 'Corsair');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'wattage',         '1000'),
(@pid, 'certification',   '80 Plus Platinum'),
(@pid, 'modular',         'Full');
PRINT 'Added: Corsair HX1000';
GO

-- ──────────────────────────────────────────────────────────
-- COOLER (category_id = 8)
-- Lưu ý: supported_sockets lưu dạng JSON array string
-- height_mm của AIO = chiều cao pump block (~50mm) — luôn vừa case
-- ──────────────────────────────────────────────────────────
DECLARE @pid INT;

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'Deepcool AK400 Air Cooler', N'Tản nhiệt khí, hỗ trợ LGA1700/AM5/AM4, TDP 220W', 500000, 120, 8, 'Deepcool');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'type',              'Air'),
(@pid, 'supported_sockets', '["LGA1700","AM5","AM4","LGA1200"]'),
(@pid, 'max_tdp',           '220'),
(@pid, 'height_mm',         '155'),
(@pid, 'noise_db',          '28'),
(@pid, 'fans',              '1');
PRINT 'Added: Deepcool AK400';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'Noctua NH-U12S Air Cooler', N'Tản nhiệt khí cao cấp, hỗ trợ LGA1700/AM5/AM4', 900000, 80, 8, 'Noctua');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'type',              'Air'),
(@pid, 'supported_sockets', '["LGA1700","AM5","AM4","LGA1200","LGA1151"]'),
(@pid, 'max_tdp',           '250'),
(@pid, 'height_mm',         '158'),
(@pid, 'noise_db',          '23'),
(@pid, 'fans',              '1');
PRINT 'Added: Noctua NH-U12S';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'Noctua NH-D15 Air Cooler', N'Tản nhiệt khí hàng đầu, dual fan, TDP 250W', 2500000, 40, 8, 'Noctua');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'type',              'Air'),
(@pid, 'supported_sockets', '["LGA1700","AM5","AM4","LGA1200","LGA1151"]'),
(@pid, 'max_tdp',           '250'),
(@pid, 'height_mm',         '165'),
(@pid, 'noise_db',          '25'),
(@pid, 'fans',              '2');
PRINT 'Added: Noctua NH-D15';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'CoolerMaster MasterLiquid 240 AIO', N'Tản nhiệt nước 240mm, hỗ trợ LGA1700/AM5/AM4', 1800000, 60, 8, 'CoolerMaster');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'type',              'AIO'),
(@pid, 'supported_sockets', '["LGA1700","AM5","AM4","LGA1200"]'),
(@pid, 'max_tdp',           '300'),
(@pid, 'height_mm',         '50'),   -- pump block height
(@pid, 'noise_db',          '27'),
(@pid, 'fans',              '2');
PRINT 'Added: MasterLiquid 240';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'NZXT Kraken X63 280mm AIO', N'Tản nhiệt nước 280mm, hỗ trợ LGA1700/AM5', 3500000, 25, 8, 'NZXT');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'type',              'AIO'),
(@pid, 'supported_sockets', '["LGA1700","AM5","AM4"]'),
(@pid, 'max_tdp',           '300'),
(@pid, 'height_mm',         '52'),   -- pump block height
(@pid, 'noise_db',          '22'),
(@pid, 'fans',              '2');
PRINT 'Added: NZXT Kraken X63';
GO

-- ──────────────────────────────────────────────────────────
-- CASE (category_id = 9)
-- ──────────────────────────────────────────────────────────
DECLARE @pid INT;

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'CoolerMaster MasterBox Q300L mATX', N'mATX Case, GPU ≤360mm, Cooler ≤159mm', 400000, 150, 9, 'CoolerMaster');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'form_factor',          'mATX'),
(@pid, 'max_gpu_length_mm',    '360'),
(@pid, 'max_cooler_height_mm', '159'),
(@pid, 'fans_included',        '1');
PRINT 'Added: Q300L';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'Antec NX200 ATX Mid Tower', N'ATX Case, GPU ≤380mm, Cooler ≤160mm', 600000, 100, 9, 'Antec');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'form_factor',          'ATX'),
(@pid, 'max_gpu_length_mm',    '380'),
(@pid, 'max_cooler_height_mm', '160'),
(@pid, 'fans_included',        '1');
PRINT 'Added: Antec NX200';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'CoolerMaster TD500 Mesh V2 ATX', N'ATX Case mesh mặt trước, GPU ≤370mm, Cooler ≤190mm', 900000, 80, 9, 'CoolerMaster');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'form_factor',          'ATX'),
(@pid, 'max_gpu_length_mm',    '370'),
(@pid, 'max_cooler_height_mm', '190'),
(@pid, 'fans_included',        '3');
PRINT 'Added: TD500 Mesh';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'Corsair 4000D Airflow ATX', N'ATX High-airflow case, GPU ≤360mm, Cooler ≤185mm', 1200000, 60, 9, 'Corsair');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'form_factor',          'ATX'),
(@pid, 'max_gpu_length_mm',    '360'),
(@pid, 'max_cooler_height_mm', '185'),
(@pid, 'fans_included',        '2');
PRINT 'Added: Corsair 4000D';

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'Lian Li Lancool 216 ATX', N'ATX Premium case, GPU ≤420mm, Cooler ≤175mm', 2000000, 30, 9, 'Lian Li');
SET @pid = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'form_factor',          'ATX'),
(@pid, 'max_gpu_length_mm',    '420'),
(@pid, 'max_cooler_height_mm', '175'),
(@pid, 'fans_included',        '2');
PRINT 'Added: Lian Li Lancool 216';
GO

PRINT '';
PRINT '=== HOÀN THÀNH SEED DATA ===';
PRINT 'Chạy query kiểm tra:';
PRINT 'SELECT c.name AS category, COUNT(*) AS products_with_specs';
PRINT 'FROM PRODUCT p';
PRINT 'JOIN CATEGORY c ON p.category_id = c.category_id';
PRINT 'JOIN PRODUCT_SPEC ps ON p.product_id = ps.product_id';
PRINT 'GROUP BY c.name ORDER BY c.name;';
