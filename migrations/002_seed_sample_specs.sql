-- Add sample products with JSON specs
-- This script demonstrates the new chuẩn hóa approach

USE PCComponentStore;
GO

-- ==========================================================================
-- SAMPLE 1: Intel Core i9-14900K (CPU)
-- ==========================================================================
DECLARE @productId INT;

INSERT INTO PRODUCT (name, description, price, stock_quantity, image_url, category_id, status, brand)
VALUES (
    N'Intel Core i9-14900K',
    N'14th Gen Intel Core i9 - 24 Cores, 32 Threads, 253W TDP - Perfect for gaming and professional workloads',
    15000000,
    50,
    'http://example.com/intel-i9-14900k.jpg',
    1,  -- Assuming category_id 1 is CPU
    'Available',
    'Intel'
);

SET @productId = SCOPE_IDENTITY();

-- Update with JSON specs
UPDATE PRODUCT 
SET specs_json = N'{
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
}'
WHERE product_id = @productId;

PRINT 'Created: Intel Core i9-14900K with ID: ' + CAST(@productId AS VARCHAR);

-- ==========================================================================
-- SAMPLE 2: ASUS ROG Z790 (Mainboard)
-- ==========================================================================
INSERT INTO PRODUCT (name, description, price, stock_quantity, image_url, category_id, status, brand)
VALUES (
    N'ASUS ROG Z790-E Gaming WiFi',
    N'Premium LGA1700 ATX Mainboard - DDR5, PCIe 5.0, WiFi 6E',
    12000000,
    20,
    'http://example.com/asus-z790.jpg',
    3,  -- Assuming category_id 3 is Mainboard
    'Available',
    'ASUS'
);

SET @productId = SCOPE_IDENTITY();

UPDATE PRODUCT 
SET specs_json = N'{
  "socket": "LGA1700",
  "chipset": "Z790",
  "ram_type": "DDR5",
  "form_factor": "ATX",
  "ram_slots": 4,
  "m2_slots": 5,
  "pcie_gen": 5,
  "usb_ports": 14
}'
WHERE product_id = @productId;

PRINT 'Created: ASUS ROG Z790-E with ID: ' + CAST(@productId AS VARCHAR);

-- ==========================================================================
-- SAMPLE 3: ASUS RTX 4090 (GPU)
-- ==========================================================================
INSERT INTO PRODUCT (name, description, price, stock_quantity, image_url, category_id, status, brand)
VALUES (
    N'ASUS TUF RTX 4090',
    N'Flagship Gaming GPU - 24GB GDDR6X, PCIe 4.0, 575W TDP',
    45000000,
    10,
    'http://example.com/rtx-4090.jpg',
    2,  -- Assuming category_id 2 is GPU
    'Available',
    'ASUS'
);

SET @productId = SCOPE_IDENTITY();

UPDATE PRODUCT 
SET specs_json = N'{
  "memory_gb": 24,
  "memory_type": "GDDR6X",
  "length_mm": 313,
  "power_pin": "12VHPWR",
  "tdp": 575,
  "cuda_cores": 16384,
  "boost_clock": 2.52,
  "ray_tracing": true
}'
WHERE product_id = @productId;

PRINT 'Created: ASUS TUF RTX 4090 with ID: ' + CAST(@productId AS VARCHAR);

-- ==========================================================================
-- SAMPLE 4: Kingston Fury DDR5 (RAM) 
-- ==========================================================================
INSERT INTO PRODUCT (name, description, price, stock_quantity, image_url, category_id, status, brand)
VALUES (
    N'Kingston Fury Beast DDR5 32GB',
    N'Fast DDR5 Memory - 2x16GB, 6000MHz CAS Latency 30',
    4500000,
    30,
    'http://example.com/kingston-ddr5.jpg',
    5,  -- Assuming category_id 5 is RAM (adjust as needed)
    'Available',
    'Kingston'
);

SET @productId = SCOPE_IDENTITY();

UPDATE PRODUCT 
SET specs_json = N'{
  "type": "DDR5",
  "capacity_gb": 32,
  "speed_mhz": 6000,
  "kit_size": "2x16",
  "latency": 30,
  "voltage": 1.4,
  "rgb": false
}'
WHERE product_id = @productId;

PRINT 'Created: Kingston Fury Beast DDR5 32GB with ID: ' + CAST(@productId AS VARCHAR);

-- ==========================================================================
-- SAMPLE 5: Samsung 980 Pro (Storage)
-- ==========================================================================
INSERT INTO PRODUCT (name, description, price, stock_quantity, image_url, category_id, status, brand)
VALUES (
    N'Samsung 980 Pro 1TB NVMe SSD',
    N'High-speed NVMe M.2 SSD - 7000MB/s Read, PCIe 4.0',
    3500000,
    40,
    'http://example.com/samsung-980-pro.jpg',
    6,  -- Assuming category_id 6 is Storage (adjust as needed)
    'Available',
    'Samsung'
);

SET @productId = SCOPE_IDENTITY();

UPDATE PRODUCT 
SET specs_json = N'{
  "capacity_gb": 1000,
  "type": "SSD",
  "interface": "NVMe",
  "form_factor": "M.2",
  "speed_mbps": 7000,
  "encrypted": false
}'
WHERE product_id = @productId;

PRINT 'Created: Samsung 980 Pro 1TB with ID: ' + CAST(@productId AS VARCHAR);

-- ==========================================================================
-- SAMPLE 6: ASUS ROG Strix 850W PSU
-- ==========================================================================
INSERT INTO PRODUCT (name, description, price, stock_quantity, image_url, category_id, status, brand)
VALUES (
    N'ASUS ROG Strix 850W Gold PSU',
    N'Premium Modular Power Supply - 80+ Gold, Full Modular',
    5500000,
    25,
    'http://example.com/asus-psu-850w.jpg',
    7,  -- Assuming category_id 7 is PSU (adjust as needed)
    'Available',
    'ASUS'
);

SET @productId = SCOPE_IDENTITY();

UPDATE PRODUCT 
SET specs_json = N'{
  "wattage": 850,
  "certification": "80 Plus Gold",
  "modular": "Full",
  "pcie_8pin_count": 3,
  "pcie_12vhpwr_count": 1,
  "fan_size": 135
}'
WHERE product_id = @productId;

PRINT 'Created: ASUS ROG Strix 850W PSU with ID: ' + CAST(@productId AS VARCHAR);

-- ==========================================================================
-- SAMPLE 7: Noctua NH-D15 (CPU Cooler)
-- ==========================================================================
INSERT INTO PRODUCT (name, description, price, stock_quantity, image_url, category_id, status, brand)
VALUES (
    N'Noctua NH-D15 CPU Cooler',
    N'Premium Air Cooler - Supports LGA1700, AM5, LGA1151 - Up to 250W TDP',
    2500000,
    35,
    'http://example.com/noctua-nh-d15.jpg',
    8,  -- Assuming category_id 8 is Cooler (adjust as needed)
    'Available',
    'Noctua'
);

SET @productId = SCOPE_IDENTITY();

UPDATE PRODUCT 
SET specs_json = N'{
  "type": "Air",
  "supported_sockets": ["LGA1700", "AM5", "LGA1151"],
  "max_tdp": 250,
  "height_mm": 160,
  "noise_db": 25,
  "fans": 2
}'
WHERE product_id = @productId;

PRINT 'Created: Noctua NH-D15 CPU Cooler with ID: ' + CAST(@productId AS VARCHAR);

-- ==========================================================================
-- Display all products with JSON specs
-- ==========================================================================
PRINT '';
PRINT '=== All Products with JSON Specs ===';
SELECT 
    product_id,
    name,
    brand,
    price,
    stock_quantity,
    specs_json
FROM PRODUCT
WHERE specs_json IS NOT NULL
ORDER BY product_id;

PRINT '';
PRINT '✅ Sample data created successfully!';
