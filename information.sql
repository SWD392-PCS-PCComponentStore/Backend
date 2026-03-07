-- Seed data for SQL Server (T-SQL)
-- Assumption: fresh database (tables empty). This script aborts if key tables already contain data.
USE PCComponentStore;
GO

SET NOCOUNT ON;

IF EXISTS (SELECT 1 FROM dbo.Users)
	OR EXISTS (SELECT 1 FROM dbo.Admins)
	OR EXISTS (SELECT 1 FROM dbo.Categories)
	OR EXISTS (SELECT 1 FROM dbo.Suppliers)
	OR EXISTS (SELECT 1 FROM dbo.Products)
	OR EXISTS (SELECT 1 FROM dbo.Product_Specs)
	OR EXISTS (SELECT 1 FROM dbo.Product_Details)
	OR EXISTS (SELECT 1 FROM dbo.Promotions)
	OR EXISTS (SELECT 1 FROM dbo.Compatibility_Rules)
	OR EXISTS (SELECT 1 FROM dbo.Recommendations)
	OR EXISTS (SELECT 1 FROM dbo.Orders)
	OR EXISTS (SELECT 1 FROM dbo.Order_Details)
	OR EXISTS (SELECT 1 FROM dbo.Carts)
	OR EXISTS (SELECT 1 FROM dbo.Build_Items)
BEGIN
	THROW 50000, 'Seed aborted: one or more tables already contain data. Use an empty DB or clear data first.', 1;
END;

BEGIN TRY
	BEGIN TRAN;

	-- 1) Categories (6)
	INSERT INTO dbo.Categories (name, description)
	VALUES
		(N'CPU', N'Bộ xử lý trung tâm'),
		(N'Bo mạch chủ', N'Bo mạch chủ / chipset'),
		(N'RAM', N'Bộ nhớ trong'),
		(N'GPU', N'Card đồ hoạ'),
		(N'Lưu trữ', N'Ổ cứng SSD/HDD'),
		(N'Bộ máy', N'Bộ máy lắp ráp / cấu hình sẵn');

	-- 2) Suppliers (5)
	INSERT INTO dbo.Suppliers (name, contact_email, address)
	VALUES
		(N'Công ty Thiết Bị Số TechOne', N'banhang@techone.example', N'TP. Hồ Chí Minh'),
		(N'Cửa hàng GearVN', N'banhang@gearvn.example', N'Hà Nội'),
		(N'MemoryPro Việt Nam', N'lienhe@memorypro.example', N'Đà Nẵng'),
		(N'GPUHub Việt Nam', N'xincha0@gpuhub.example', N'TP. Hồ Chí Minh'),
		(N'StorageWorld Việt Nam', N'hotro@storageworld.example', N'Cần Thơ');

	-- 3) Products (10)
	-- category_id: 1 CPU, 2 Motherboard, 3 RAM, 4 GPU, 5 Storage, 6 Build
	-- supplier_id: 1..5 in insert order above
	INSERT INTO dbo.Products (name, description, price, stock_quantity, image_url, supplier_id, category_id)
	VALUES
		(N'Intel Core i5-13400F', N'10 nhân/16 luồng, socket LGA1700', 5200000, 50, N'https://example.local/p1', 1, 1),
		(N'AMD Ryzen 5 7600', N'6 nhân/12 luồng, socket AM5', 5900000, 40, N'https://example.local/p2', 1, 1),
		(N'MSI B760M', N'Chipset B760, DDR5, mATX', 3200000, 25, N'https://example.local/p3', 2, 2),
		(N'ASUS B650', N'Chipset B650, DDR5, ATX', 4200000, 20, N'https://example.local/p4', 2, 2),
		(N'Kingston Fury 16GB DDR5', N'Bus 5200MHz, 1x16GB', 1600000, 80, N'https://example.local/p5', 3, 3),
		(N'Corsair Vengeance 32GB DDR5', N'Bus 5600MHz, 2x16GB', 3200000, 60, N'https://example.local/p6', 3, 3),
		(N'NVIDIA RTX 4060 8GB', N'Card đồ hoạ cho game 1080p', 8900000, 15, N'https://example.local/p7', 4, 4),
		(N'AMD RX 7600 8GB', N'Card đồ hoạ chơi game 1080p', 8200000, 18, N'https://example.local/p8', 4, 4),
		(N'Samsung 980 1TB NVMe', N'SSD NVMe PCIe 3.0 x4', 2350000, 70, N'https://example.local/p9', 5, 5),
		(N'Bộ máy chơi game tầm trung', N'Gói cấu hình lắp ráp theo nhu cầu', 25000000, 10, N'https://example.local/p10', 2, 6);

	-- 4) Promotions (5)
	INSERT INTO dbo.Promotions (code, discount_percent, valid_from, valid_to)
	VALUES
		(N'CHAO5',   5.00,  DATEADD(DAY,-30,SYSUTCDATETIME()), DATEADD(DAY, 365, SYSUTCDATETIME())),
		(N'TIETKIEM10',10.00, DATEADD(DAY,-10,SYSUTCDATETIME()), DATEADD(DAY, 120, SYSUTCDATETIME())),
		(N'RAM7',    7.00,  DATEADD(DAY,-5, SYSUTCDATETIME()), DATEADD(DAY,  60, SYSUTCDATETIME())),
		(N'GPU3',    3.00,  DATEADD(DAY,-1, SYSUTCDATETIME()), DATEADD(DAY,  30, SYSUTCDATETIME())),
		(N'SSD8',    8.00,  DATEADD(DAY,-1, SYSUTCDATETIME()), DATEADD(DAY,  90, SYSUTCDATETIME()));

	-- 5) Users (10)
	-- Password cho tất cả users: 123456
	-- Hash: $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
	INSERT INTO dbo.Users (name, email, password_hash, phone, address)
	VALUES
		(N'Nguyễn An',       N'an.nguyen@example.com',       N'$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', N'0900000001', N'TP. Hồ Chí Minh'),
		(N'Trần Bình',       N'binh.tran@example.com',       N'$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', N'0900000002', N'Hà Nội'),
		(N'Lê Chí',          N'chi.le@example.com',          N'$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', N'0900000003', N'Đà Nẵng'),
		(N'Phạm Dũng',       N'dung.pham@example.com',       N'$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', N'0900000004', N'Cần Thơ'),
		(N'Hoàng Emi',       N'emi.hoang@example.com',       N'$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', N'0900000005', N'Huế'),
		(N'Vũ Giang',        N'giang.vu@example.com',        N'$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', N'0900000006', N'TP. Hồ Chí Minh'),
		(N'Đỗ Hiếu',         N'hieu.do@example.com',         N'$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', N'0900000007', N'Hà Nội'),
		(N'Bùi Khánh',       N'khanh.bui@example.com',       N'$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', N'0900000008', N'Đà Nẵng'),
		(N'Phan Linh',       N'linh.phan@example.com',       N'$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', N'0900000009', N'TP. Hồ Chí Minh'),
		(N'Ngô Minh',        N'minh.ngo@example.com',        N'$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', N'0900000010', N'Hải Phòng');

	-- 6) Admins (5) - map to first 5 users
	INSERT INTO dbo.Admins (role, permissions, user_id)
	VALUES
		(N'Quản trị tổng', N'{"ghi_chu":"lưu dạng chuỗi JSON","nguoi_dung":["xem","sua"],"san_pham":["xem","sua"],"don_hang":["xem","sua"]}', 1),
		(N'Quản lý danh mục', N'{"ghi_chu":"lưu dạng chuỗi JSON","san_pham":["xem","sua"],"danh_muc":["xem","sua"]}', 2),
		(N'Vận hành', N'{"ghi_chu":"lưu dạng chuỗi JSON","don_hang":["xem","sua"],"nguoi_dung":["xem"]}', 3),
		(N'Hỗ trợ', N'{"ghi_chu":"lưu dạng chuỗi JSON","nguoi_dung":["xem"],"don_hang":["xem"]}', 4),
		(N'Tiếp thị', N'{"ghi_chu":"lưu dạng chuỗi JSON","khuyen_mai":["xem","sua"],"goi_y":["xem"]}', 5);

	-- 7) Product specs (10)
	INSERT INTO dbo.Product_Specs (attribute_name, attribute_value, unit, product_id)
	VALUES
		(N'Số nhân', N'10', NULL, 1),
		(N'Số luồng', N'16', NULL, 1),
		(N'Socket', N'LGA1700', NULL, 1),
		(N'Số nhân', N'6', NULL, 2),
		(N'Socket', N'AM5', NULL, 2),
		(N'Kích thước', N'mATX', NULL, 3),
		(N'Loại RAM', N'DDR5', NULL, 3),
		(N'Dung lượng', N'16', N'GB', 5),
		(N'Dung lượng', N'32', N'GB', 6),
		(N'Dung lượng', N'1000', N'GB', 9);

	-- 8) Product details (BOM) for product_id = 10 (5 rows)
	INSERT INTO dbo.Product_Details (quantity, position, serial_number, installed_date, product_id, component_product_id)
	VALUES
		(1, N'CPU',           NULL, SYSUTCDATETIME(), 10, 1),
		(1, N'Bo mạch chủ',   NULL, SYSUTCDATETIME(), 10, 3),
		(1, N'RAM',           NULL, SYSUTCDATETIME(), 10, 5),
		(1, N'Card đồ hoạ',   NULL, SYSUTCDATETIME(), 10, 7),
		(1, N'Ổ lưu trữ',     NULL, SYSUTCDATETIME(), 10, 9);

	-- 9) Compatibility rules (5)
	INSERT INTO dbo.Compatibility_Rules (compatible_product_id, rule_type, description, category_id, product_id)
	VALUES
		(1, N'socket', N'CPU LGA1700 tương thích bo mạch chủ B760', 2, 3),
		(2, N'socket', N'CPU AM5 tương thích bo mạch chủ B650', 2, 4),
		(5, N'ram',    N'RAM DDR5 tương thích bo mạch chủ B760', 3, 3),
		(6, N'ram',    N'RAM DDR5 tương thích bo mạch chủ B650', 3, 4),
		(9, N'luu_tru',N'SSD NVMe phù hợp cho bộ máy lắp ráp', 5, 10);

	-- 10) Orders (5)
	INSERT INTO dbo.Orders (order_date, status, total_amount, user_id, promotion_id)
	VALUES
		(DATEADD(DAY,-7, SYSUTCDATETIME()), N'Đã thanh toán',  7550000,  1, 1),
		(DATEADD(DAY,-5, SYSUTCDATETIME()), N'Đã thanh toán', 14800000,  2, 2),
		(DATEADD(DAY,-3, SYSUTCDATETIME()), N'Đang xử lý',    25000000,  3, NULL),
		(DATEADD(DAY,-2, SYSUTCDATETIME()), N'Chờ thanh toán',  7400000,  4, 3),
		(DATEADD(DAY,-1, SYSUTCDATETIME()), N'Đang giao hàng', 12900000,  5, 5);

	-- 11) Order details (10)
	INSERT INTO dbo.Order_Details (quantity, price_per_purchase, order_id, product_id)
	VALUES
		(1, 5200000, 1, 1),
		(1, 2350000, 1, 9),
		(1, 5900000, 2, 2),
		(1, 8900000, 2, 7),
		(1, 25000000,3,10),
		(1, 3200000, 4, 6),
		(1, 4200000, 4, 4),
		(1, 8200000, 5, 8),
		(2, 2350000, 5, 9),
		(1, 1600000, 5, 5);

	-- 12) Carts (5) - for users 6..10
	INSERT INTO dbo.Carts (quantity, date_added, user_id, product_id)
	VALUES
		(1, DATEADD(HOUR,-12, SYSUTCDATETIME()), 6, 2),
		(1, DATEADD(HOUR,-10, SYSUTCDATETIME()), 7, 4),
		(2, DATEADD(HOUR,-8,  SYSUTCDATETIME()), 8, 5),
		(1, DATEADD(HOUR,-6,  SYSUTCDATETIME()), 9, 7),
		(1, DATEADD(HOUR,-4,  SYSUTCDATETIME()),10, 9);

	-- 13) Build items (10) - two items per cart
	INSERT INTO dbo.Build_Items (item_name, item_value, created_at, cart_id)
	VALUES
		(N'Ngân sách', N'20000000', SYSUTCDATETIME(), 1),
		(N'Nhu cầu',   N'Chơi game', SYSUTCDATETIME(), 1),
		(N'Ngân sách', N'25000000', SYSUTCDATETIME(), 2),
		(N'Nhu cầu',   N'Làm việc',  SYSUTCDATETIME(), 2),
		(N'Ngân sách', N'15000000', SYSUTCDATETIME(), 3),
		(N'Nhu cầu',   N'Học tập',   SYSUTCDATETIME(), 3),
		(N'Ngân sách', N'30000000', SYSUTCDATETIME(), 4),
		(N'Nhu cầu',   N'Chơi game', SYSUTCDATETIME(), 4),
		(N'Ngân sách', N'12000000', SYSUTCDATETIME(), 5),
		(N'Nhu cầu',   N'Văn phòng', SYSUTCDATETIME(), 5);

	-- 14) Recommendations (5)
	INSERT INTO dbo.Recommendations (score, reason, user_id, product_id)
	VALUES
		(0.950, N'CPU AM5 hiệu năng/giá tốt', 6, 2),
		(0.900, N'Bo mạch chủ cân bằng tính năng/giá', 7, 4),
		(0.880, N'Nâng cấp RAM để đa nhiệm mượt hơn', 8, 6),
		(0.920, N'GPU chơi game 1080p rất ổn', 9, 8),
		(0.870, N'SSD NVMe nhanh, đáng nâng cấp', 10, 9);

	COMMIT;
END TRY
BEGIN CATCH
	IF @@TRANCOUNT > 0 ROLLBACK;
	DECLARE @Err NVARCHAR(4000) = ERROR_MESSAGE();
	THROW 50001, @Err, 1;
END CATCH;

PRINT 'Seed completed.';

