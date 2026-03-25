-- ============================================================
-- SEED DATA: SẢN PHẨM ĐA DẠNG SOCKET (AM4, AM5, LGA1700+DDR5)
-- Chạy file này SAU KHI đã chạy information.sql + seed_ai_build_data.sql
-- ============================================================

USE PCComponentStore;
GO

DECLARE @id INT;

-- ============================================================
-- AM4 CPUs
-- ============================================================

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'AMD Ryzen 5 5600X', N'6 Nhân 12 Luồng / 3.7GHz Boost 4.6GHz / AM4 / 65W', 3990000, 25, 1, N'AMD', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'socket',       'AM4'),
(@id, 'cores',        '6'),
(@id, 'threads',      '12'),
(@id, 'tdp',          '65'),
(@id, 'boost_clock',  '4.6'),
(@id, 'generation',   'Ryzen 5000'),
(@id, 'series',       'Ryzen 5');

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'AMD Ryzen 7 5800X3D', N'8 Nhân 16 Luồng / 3.4GHz Boost 4.5GHz / AM4 / 3D V-Cache', 7490000, 15, 1, N'AMD', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'socket',       'AM4'),
(@id, 'cores',        '8'),
(@id, 'threads',      '16'),
(@id, 'tdp',          '105'),
(@id, 'boost_clock',  '4.5'),
(@id, 'generation',   'Ryzen 5000'),
(@id, 'series',       'Ryzen 7');

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'AMD Ryzen 9 5900X', N'12 Nhân 24 Luồng / 3.7GHz Boost 4.8GHz / AM4 / 105W', 8990000, 10, 1, N'AMD', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'socket',       'AM4'),
(@id, 'cores',        '12'),
(@id, 'threads',      '24'),
(@id, 'tdp',          '105'),
(@id, 'boost_clock',  '4.8'),
(@id, 'generation',   'Ryzen 5000'),
(@id, 'series',       'Ryzen 9');

-- ============================================================
-- AM5 CPUs
-- ============================================================

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'AMD Ryzen 5 7600X', N'6 Nhân 12 Luồng / 4.7GHz Boost 5.3GHz / AM5 / 105W', 5990000, 20, 1, N'AMD', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'socket',       'AM5'),
(@id, 'cores',        '6'),
(@id, 'threads',      '12'),
(@id, 'tdp',          '105'),
(@id, 'boost_clock',  '5.3'),
(@id, 'generation',   'Ryzen 7000'),
(@id, 'series',       'Ryzen 5');

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'AMD Ryzen 7 7700X', N'8 Nhân 16 Luồng / 4.5GHz Boost 5.4GHz / AM5 / 105W', 8490000, 15, 1, N'AMD', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'socket',       'AM5'),
(@id, 'cores',        '8'),
(@id, 'threads',      '16'),
(@id, 'tdp',          '105'),
(@id, 'boost_clock',  '5.4'),
(@id, 'generation',   'Ryzen 7000'),
(@id, 'series',       'Ryzen 7');

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'AMD Ryzen 9 7900X', N'12 Nhân 24 Luồng / 4.7GHz Boost 5.6GHz / AM5 / 170W', 10990000, 10, 1, N'AMD', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'socket',       'AM5'),
(@id, 'cores',        '12'),
(@id, 'threads',      '24'),
(@id, 'tdp',          '170'),
(@id, 'boost_clock',  '5.6'),
(@id, 'generation',   'Ryzen 7000'),
(@id, 'series',       'Ryzen 9');

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'AMD Ryzen 9 7950X', N'16 Nhân 32 Luồng / 4.5GHz Boost 5.7GHz / AM5 / 170W', 16990000, 8, 1, N'AMD', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'socket',       'AM5'),
(@id, 'cores',        '16'),
(@id, 'threads',      '32'),
(@id, 'tdp',          '170'),
(@id, 'boost_clock',  '5.7'),
(@id, 'generation',   'Ryzen 7000'),
(@id, 'series',       'Ryzen 9');

-- ============================================================
-- LGA1700 High-end CPU
-- ============================================================

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'Intel Core i9-14900K', N'24 Nhân 32 Luồng / 3.2GHz Boost 6.0GHz / LGA1700 / 125W', 13990000, 8, 1, N'Intel', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'socket',       'LGA1700'),
(@id, 'cores',        '24'),
(@id, 'threads',      '32'),
(@id, 'tdp',          '125'),
(@id, 'boost_clock',  '6.0'),
(@id, 'generation',   '14th Gen Intel'),
(@id, 'series',       'Core i9');

-- ============================================================
-- AM4 Mainboards
-- ============================================================

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'MSI MAG B550 TOMAHAWK', N'AM4 / DDR4 / ATX / B550 / PCIe 4.0', 3490000, 20, 3, N'MSI', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'socket',       'AM4'),
(@id, 'chipset',      'B550'),
(@id, 'ram_type',     'DDR4'),
(@id, 'form_factor',  'ATX'),
(@id, 'ram_slots',    '4'),
(@id, 'm2_slots',     '2');

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'ASUS ROG Strix X570-F Gaming', N'AM4 / DDR4 / ATX / X570 / PCIe 4.0', 5990000, 10, 3, N'ASUS', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'socket',       'AM4'),
(@id, 'chipset',      'X570'),
(@id, 'ram_type',     'DDR4'),
(@id, 'form_factor',  'ATX'),
(@id, 'ram_slots',    '4'),
(@id, 'm2_slots',     '3');

-- ============================================================
-- AM5 Mainboards
-- ============================================================

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'ASUS ROG Strix B650-A Gaming WiFi', N'AM5 / DDR5 / ATX / B650 / PCIe 5.0', 6490000, 15, 3, N'ASUS', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'socket',       'AM5'),
(@id, 'chipset',      'B650'),
(@id, 'ram_type',     'DDR5'),
(@id, 'form_factor',  'ATX'),
(@id, 'ram_slots',    '4'),
(@id, 'm2_slots',     '2');

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'MSI MAG X670E Tomahawk WiFi', N'AM5 / DDR5 / ATX / X670E / PCIe 5.0', 8990000, 10, 3, N'MSI', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'socket',       'AM5'),
(@id, 'chipset',      'X670E'),
(@id, 'ram_type',     'DDR5'),
(@id, 'form_factor',  'ATX'),
(@id, 'ram_slots',    '4'),
(@id, 'm2_slots',     '4');

-- ============================================================
-- LGA1700 DDR5 Mainboard
-- ============================================================

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'ASUS ROG Maximus Z790 Hero', N'LGA1700 / DDR5 / ATX / Z790 / PCIe 5.0', 12990000, 8, 3, N'ASUS', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'socket',       'LGA1700'),
(@id, 'chipset',      'Z790'),
(@id, 'ram_type',     'DDR5'),
(@id, 'form_factor',  'ATX'),
(@id, 'ram_slots',    '4'),
(@id, 'm2_slots',     '5');

-- ============================================================
-- DDR5 RAM
-- ============================================================

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'Kingston Fury Beast 32GB (2x16GB) DDR5 6000', N'32GB DDR5 6000MHz CL36', 3290000, 25, 5, N'Kingston', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'type',         'DDR5'),
(@id, 'capacity_gb',  '32'),
(@id, 'speed_mhz',    '6000'),
(@id, 'kit_size',     '2x16'),
(@id, 'latency',      '36');

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'Corsair Dominator Platinum 32GB (2x16GB) DDR5 5600', N'32GB DDR5 5600MHz CL36 / RGB', 4290000, 15, 5, N'Corsair', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'type',         'DDR5'),
(@id, 'capacity_gb',  '32'),
(@id, 'speed_mhz',    '5600'),
(@id, 'kit_size',     '2x16'),
(@id, 'latency',      '36');

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5 6400', N'64GB DDR5 6400MHz CL32 / RGB', 8990000, 10, 5, N'G.Skill', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'type',         'DDR5'),
(@id, 'capacity_gb',  '64'),
(@id, 'speed_mhz',    '6400'),
(@id, 'kit_size',     '2x32'),
(@id, 'latency',      '32');

-- ============================================================
-- PSU cao cấp hơn (category_id = 7 ở local)
-- ============================================================

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'Seasonic Focus GX-850 850W 80+ Gold', N'850W / 80 Plus Gold / Full Modular', 3490000, 15, 7, N'Seasonic', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'wattage',       '850'),
(@id, 'certification', '80 Plus Gold'),
(@id, 'modular',       'Full');

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'Corsair HX1000 1000W 80+ Platinum', N'1000W / 80 Plus Platinum / Full Modular', 4990000, 10, 7, N'Corsair', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'wattage',       '1000'),
(@id, 'certification', '80 Plus Platinum'),
(@id, 'modular',       'Full');

-- ============================================================
-- Cooler cao cấp hơn (category_id = 8 ở local)
-- ============================================================

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'Noctua NH-D15', N'Tản nhiệt khí đôi tháp / LGA1700 AM5 AM4 / 165mm', 2490000, 15, 8, N'Noctua', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'type',               'Air'),
(@id, 'supported_sockets',  '["LGA1700","AM5","AM4","LGA1200"]'),
(@id, 'max_tdp',            '250'),
(@id, 'height_mm',          '165');

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'DeepCool LS720 360mm AIO', N'AIO 360mm / LGA1700 AM5 AM4 / 3x120mm quạt', 2990000, 12, 8, N'DeepCool', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'type',               'AIO'),
(@id, 'supported_sockets',  '["LGA1700","AM5","AM4","LGA1200"]'),
(@id, 'max_tdp',            '300'),
(@id, 'height_mm',          '75');

-- ============================================================
-- Case thêm (category_id = 9 ở local)
-- ============================================================

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'Lian Li PC-O11 Dynamic EVO', N'ATX Mid Tower / Kính cường lực / GPU dài tối đa 420mm', 3490000, 12, 9, N'Lian Li', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'form_factor',           'ATX'),
(@id, 'max_gpu_length_mm',     '420'),
(@id, 'max_cooler_height_mm',  '167'),
(@id, 'fans_included',         '0');

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'Fractal Design Meshify 2', N'ATX Mid Tower / Airflow cao / GPU dài tối đa 467mm', 2990000, 10, 9, N'Fractal Design', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'form_factor',           'ATX'),
(@id, 'max_gpu_length_mm',     '467'),
(@id, 'max_cooler_height_mm',  '185'),
(@id, 'fans_included',         '3');

GO
PRINT N'Seed multi-socket products hoàn tất!';
