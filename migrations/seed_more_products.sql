-- ============================================================
-- SEED THÊM SẢN PHẨM ĐỂ TEST NHIỀU CẤU HÌNH
-- ============================================================

USE PCComponentStore;
GO

DECLARE @id INT;

-- ============================================================
-- CPU budget (LGA1700)
-- ============================================================

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'Intel Core i3-13100F', N'4 Nhân 8 Luồng / 3.4GHz Boost 4.5GHz / LGA1700 / 58W', 1990000, 30, 1, N'Intel', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'socket',       'LGA1700'),
(@id, 'cores',        '4'),
(@id, 'threads',      '8'),
(@id, 'tdp',          '58'),
(@id, 'boost_clock',  '4.5'),
(@id, 'generation',   '13th Gen Intel'),
(@id, 'series',       'Core i3');

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'Intel Core i7-13700K', N'16 Nhân 24 Luồng / 3.4GHz Boost 5.4GHz / LGA1700 / 125W', 8990000, 12, 1, N'Intel', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'socket',       'LGA1700'),
(@id, 'cores',        '16'),
(@id, 'threads',      '24'),
(@id, 'tdp',          '125'),
(@id, 'boost_clock',  '5.4'),
(@id, 'generation',   '13th Gen Intel'),
(@id, 'series',       'Core i7');

-- ============================================================
-- CPU budget (AM4)
-- ============================================================

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'AMD Ryzen 3 4300G', N'4 Nhân 8 Luồng / 3.8GHz Boost 4.0GHz / AM4 / Tích hợp GPU', 1790000, 25, 1, N'AMD', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'socket',       'AM4'),
(@id, 'cores',        '4'),
(@id, 'threads',      '8'),
(@id, 'tdp',          '65'),
(@id, 'boost_clock',  '4.0'),
(@id, 'generation',   'Ryzen 4000'),
(@id, 'series',       'Ryzen 3');

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'AMD Ryzen 5 5500', N'6 Nhân 12 Luồng / 3.6GHz Boost 4.2GHz / AM4 / 65W', 2990000, 20, 1, N'AMD', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'socket',       'AM4'),
(@id, 'cores',        '6'),
(@id, 'threads',      '12'),
(@id, 'tdp',          '65'),
(@id, 'boost_clock',  '4.2'),
(@id, 'generation',   'Ryzen 5000'),
(@id, 'series',       'Ryzen 5');

-- ============================================================
-- AM4 Mainboard giá rẻ
-- ============================================================

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'ASUS PRIME A320M-K', N'AM4 / DDR4 / mATX / A320', 1290000, 25, 3, N'ASUS', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'socket',       'AM4'),
(@id, 'chipset',      'A320'),
(@id, 'ram_type',     'DDR4'),
(@id, 'form_factor',  'mATX'),
(@id, 'ram_slots',    '2'),
(@id, 'm2_slots',     '1');

-- ============================================================
-- GPU (nhiều tầm giá)
-- ============================================================

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'Sapphire Pulse RX 6600 8GB', N'8GB GDDR6 / 132W / 1080p gaming tốt', 4990000, 20, 2, N'Sapphire', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'memory_gb',    '8'),
(@id, 'memory_type',  'GDDR6'),
(@id, 'length_mm',    '240'),
(@id, 'tdp',          '132'),
(@id, 'power_pin',    '8-pin'),
(@id, 'ray_tracing',  'false');

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'XFX Speedster MERC RX 6700 XT 12GB', N'12GB GDDR6 / 230W / 1440p gaming', 7990000, 15, 2, N'XFX', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'memory_gb',    '12'),
(@id, 'memory_type',  'GDDR6'),
(@id, 'length_mm',    '287'),
(@id, 'tdp',          '230'),
(@id, 'power_pin',    '8+8-pin'),
(@id, 'ray_tracing',  'false');

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'ASUS TUF RTX 4070 Super OC 12GB', N'12GB GDDR6X / 220W / 1440p-4K gaming', 14990000, 10, 2, N'ASUS', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'memory_gb',    '12'),
(@id, 'memory_type',  'GDDR6X'),
(@id, 'length_mm',    '305'),
(@id, 'tdp',          '220'),
(@id, 'power_pin',    '16-pin'),
(@id, 'ray_tracing',  'true');

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'Sapphire Nitro+ RX 7900 XTX 24GB', N'24GB GDDR6 / 355W / 4K gaming flagship AMD', 28990000, 5, 2, N'Sapphire', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'memory_gb',    '24'),
(@id, 'memory_type',  'GDDR6'),
(@id, 'length_mm',    '336'),
(@id, 'tdp',          '355'),
(@id, 'power_pin',    '8+8+8-pin'),
(@id, 'ray_tracing',  'true');

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'Gigabyte AORUS RTX 4080 16GB Master', N'16GB GDDR6X / 320W / 4K gaming cao cấp', 34990000, 5, 2, N'Gigabyte', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'memory_gb',    '16'),
(@id, 'memory_type',  'GDDR6X'),
(@id, 'length_mm',    '340'),
(@id, 'tdp',          '320'),
(@id, 'power_pin',    '16-pin'),
(@id, 'ray_tracing',  'true');

-- ============================================================
-- Storage thêm
-- ============================================================

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'Samsung 870 EVO 1TB SATA SSD', N'1TB SATA SSD / 560MB/s read', 1690000, 30, 6, N'Samsung', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'capacity_gb',  '1000'),
(@id, 'type',         'SSD'),
(@id, 'interface',    'SATA'),
(@id, 'form_factor',  '2.5"'),
(@id, 'speed_mbps',   '560');

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'Seagate Barracuda 2TB HDD', N'2TB 7200RPM SATA HDD / lưu trữ dữ liệu', 1390000, 30, 6, N'Seagate', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'capacity_gb',  '2000'),
(@id, 'type',         'HDD'),
(@id, 'interface',    'SATA'),
(@id, 'form_factor',  '3.5"'),
(@id, 'speed_mbps',   '190');

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'Samsung 990 Pro 2TB NVMe SSD', N'2TB PCIe 4.0 NVMe / 7450MB/s read', 3990000, 15, 6, N'Samsung', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'capacity_gb',  '2000'),
(@id, 'type',         'SSD'),
(@id, 'interface',    'NVMe'),
(@id, 'form_factor',  'M.2'),
(@id, 'speed_mbps',   '7450');

-- ============================================================
-- PSU budget (category_id = 7 ở local)
-- ============================================================

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'Cooler Master MWE 650W 80+ Bronze', N'650W / 80 Plus Bronze / Non-Modular', 1590000, 20, 7, N'Cooler Master', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'wattage',       '650'),
(@id, 'certification', '80 Plus Bronze'),
(@id, 'modular',       'Non');

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'be quiet! Pure Power 12 750W 80+ Gold', N'750W / 80 Plus Gold / Semi Modular', 2490000, 15, 7, N'be quiet!', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'wattage',       '750'),
(@id, 'certification', '80 Plus Gold'),
(@id, 'modular',       'Semi');

-- ============================================================
-- Case thêm (category_id = 9 ở local)
-- ============================================================

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'Cooler Master MasterBox Lite 5', N'ATX Mid Tower / Kính cường lực / Budget', 890000, 20, 9, N'Cooler Master', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'form_factor',           'ATX'),
(@id, 'max_gpu_length_mm',     '410'),
(@id, 'max_cooler_height_mm',  '167'),
(@id, 'fans_included',         '1');

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'NZXT H7 Flow', N'ATX Mid Tower / Airflow tốt / Mesh front panel', 2790000, 10, 9, N'NZXT', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'form_factor',           'ATX'),
(@id, 'max_gpu_length_mm',     '400'),
(@id, 'max_cooler_height_mm',  '185'),
(@id, 'fans_included',         '3');

GO
PRINT N'Seed thêm sản phẩm hoàn tất!';
