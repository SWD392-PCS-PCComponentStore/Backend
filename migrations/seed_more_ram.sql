-- ============================================================
-- SEED THÊM RAM ĐA DẠNG DUNG LƯỢNG (DDR4 & DDR5)
-- ============================================================

USE PCComponentStore;
GO

DECLARE @id INT;

-- ============================================================
-- DDR4 - nhiều dung lượng
-- ============================================================

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'Kingston ValueRAM 8GB DDR4 2666', N'8GB DDR4 2666MHz / Tản nhiệt cơ bản', 490000, 40, 5, N'Kingston', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'type',         'DDR4'),
(@id, 'capacity_gb',  '8'),
(@id, 'speed_mhz',    '2666'),
(@id, 'kit_size',     '1x8'),
(@id, 'latency',      '19');

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'G.Skill Ripjaws V 16GB (2x8GB) DDR4 3200', N'16GB DDR4 3200MHz CL16 / Tản nhiệt đỏ', 990000, 30, 5, N'G.Skill', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'type',         'DDR4'),
(@id, 'capacity_gb',  '16'),
(@id, 'speed_mhz',    '3200'),
(@id, 'kit_size',     '2x8'),
(@id, 'latency',      '16');

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'Corsair Vengeance RGB Pro 64GB (2x32GB) DDR4 3200', N'64GB DDR4 3200MHz CL16 / RGB', 5490000, 10, 5, N'Corsair', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'type',         'DDR4'),
(@id, 'capacity_gb',  '64'),
(@id, 'speed_mhz',    '3200'),
(@id, 'kit_size',     '2x32'),
(@id, 'latency',      '16');

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'Kingston Fury Beast 128GB (4x32GB) DDR4 3200', N'128GB DDR4 3200MHz / Server / Workstation', 9990000, 5, 5, N'Kingston', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'type',         'DDR4'),
(@id, 'capacity_gb',  '128'),
(@id, 'speed_mhz',    '3200'),
(@id, 'kit_size',     '4x32'),
(@id, 'latency',      '16');

-- ============================================================
-- DDR5 - nhiều dung lượng
-- ============================================================

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'Crucial 16GB (1x16GB) DDR5 4800', N'16GB DDR5 4800MHz / Entry DDR5', 990000, 30, 5, N'Crucial', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'type',         'DDR5'),
(@id, 'capacity_gb',  '16'),
(@id, 'speed_mhz',    '4800'),
(@id, 'kit_size',     '1x16'),
(@id, 'latency',      '40');

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'TeamGroup T-Force Delta RGB 16GB (2x8GB) DDR5 5600', N'16GB DDR5 5600MHz CL36 / RGB', 1490000, 20, 5, N'TeamGroup', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'type',         'DDR5'),
(@id, 'capacity_gb',  '16'),
(@id, 'speed_mhz',    '5600'),
(@id, 'kit_size',     '2x8'),
(@id, 'latency',      '36');

INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand, status)
VALUES (N'G.Skill Trident Z5 128GB (2x64GB) DDR5 6400', N'128GB DDR5 6400MHz CL32 / Extreme workstation', 17990000, 3, 5, N'G.Skill', N'Available');
SET @id = SCOPE_IDENTITY();
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@id, 'type',         'DDR5'),
(@id, 'capacity_gb',  '128'),
(@id, 'speed_mhz',    '6400'),
(@id, 'kit_size',     '2x64'),
(@id, 'latency',      '32');

GO
PRINT N'Seed RAM đa dạng hoàn tất!';
