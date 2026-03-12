USE PCComponentStore;
GO

SET XACT_ABORT ON;
SET NOCOUNT ON;
GO

BEGIN TRAN;

INSERT INTO dbo.USERS (name, email, password, role, status, phone, address)
VALUES
	(N'Alice Nguyễn', N'alice.nguyen@example.com', N'Hash@123', N'CUSTOMER', N'ACTIVE', N'0901000001', N'12 Nguyễn Trãi, Quận 1, TP.HCM'),
	(N'Brian Trần', N'brian.tran@example.com', N'Hash@123', N'CUSTOMER', N'ACTIVE', N'0901000002', N'48 Lê Lợi, Quận 1, TP.HCM'),
	(N'Chloe Lê', N'chloe.le@example.com', N'Hash@123', N'CUSTOMER', N'ACTIVE', N'0901000003', N'88 Hai Bà Trưng, Quận 3, TP.HCM'),
	(N'David Phạm', N'david.pham@example.com', N'Hash@123', N'STAFF', N'ACTIVE', N'0901000004', N'19 Võ Văn Tần, Quận 3, TP.HCM'),
	(N'Emily Hồ', N'emily.ho@example.com', N'Hash@123', N'CUSTOMER', N'INACTIVE', N'0901000005', N'101 Phan Xích Long, Phú Nhuận, TP.HCM'),
	(N'Frank Võ', N'frank.vo@example.com', N'Hash@123', N'ADMIN', N'ACTIVE', N'0901000006', N'75 Điện Biên Phủ, Bình Thạnh, TP.HCM');
GO

INSERT INTO dbo.CATEGORY (name, description)
VALUES
	(N'CPU', N'Bộ xử lý dành cho máy chơi game, văn phòng và dựng nội dung'),
	(N'GPU', N'Card đồ họa phục vụ chơi game độ phân giải 1080p và 1440p'),
	(N'Mainboard', N'Bo mạch chủ cho nền tảng AMD và Intel'),
	(N'RAM', N'Bộ nhớ DDR5 dành cho máy tính để bàn'),
	(N'SSD', N'Ổ cứng thể rắn NVMe cho tốc độ truy xuất cao');
GO

INSERT INTO dbo.PROMOTION (code, discount_percent, valid_from, valid_to)
VALUES
	(N'WELCOME5', 5.00, '2026-01-01 00:00:00', '2026-12-31 23:59:59'),
	(N'GAMER10', 10.00, '2026-02-01 00:00:00', '2026-04-30 23:59:59'),
	(N'SSD7', 7.00, '2026-03-01 00:00:00', '2026-06-30 23:59:59'),
	(N'SPRING12', 12.00, '2026-03-10 00:00:00', '2026-03-31 23:59:59'),
	(N'VIP15', 15.00, '2026-01-15 00:00:00', '2026-05-31 23:59:59');
GO

INSERT INTO dbo.AI_CONSULTATIONS (user_id, user_prompt, ai_explanation, budget_target, status, error_message)
VALUES
	(1, N'Cần một bộ PC gaming để chơi esports và game AAA ở độ phân giải 1080p.', N'Đã chọn cấu hình AM5 tập trung vào chơi game cùng GPU tầm trung.', 25000000, N'COMPLETED', NULL),
	(2, N'Tôi muốn một bộ PC làm nội dung để dựng video và stream.', N'Cân bằng CPU và GPU để hỗ trợ dựng video và phát trực tiếp ổn định.', 35000000, N'COMPLETED', NULL),
	(3, N'Hãy build một bộ PC văn phòng yên tĩnh với SSD tốc độ cao.', N'Ưu tiên độ ồn thấp, bo mạch ổn định và đủ RAM cho ứng dụng văn phòng.', 18000000, N'COMPLETED', NULL),
	(1, N'Tôi cần một bộ PC nhỏ gọn nhưng vẫn có khả năng nâng cấp về sau.', N'Đề xuất nền tảng DDR5 với lộ trình nâng cấp GPU và SSD sau này.', 30000000, N'PENDING', NULL),
	(5, N'Tôi cần một máy trạm giá tốt để lập trình và lướt web.', NULL, 20000000, N'FAILED', N'Thiếu dữ liệu benchmark cho một linh kiện được chọn.');
GO

INSERT INTO dbo.PRODUCT (category_id, name, description, price, stock_quantity, image_url)
VALUES
	(1, N'AMD Ryzen 5 7600', N'CPU 6 nhân nền tảng AM5 phù hợp cho chơi game và làm việc hằng ngày.', 220.00, 25, N'https://example.com/images/ryzen5-7600.jpg'),
	(1, N'Intel Core i5-14600K', N'CPU Intel 14 nhân phù hợp cho nhu cầu làm nội dung và đa nhiệm.', 320.00, 18, N'https://example.com/images/i5-14600k.jpg'),
	(2, N'NVIDIA GeForce RTX 4060', N'Card đồ họa chơi game 1080p có hỗ trợ DLSS.', 299.00, 14, N'https://example.com/images/rtx-4060.jpg'),
	(2, N'AMD Radeon RX 7700 XT', N'Card đồ họa mạnh cho chơi game 1440p với hiệu năng raster tốt.', 449.00, 10, N'https://example.com/images/rx-7700xt.jpg'),
	(3, N'Gigabyte B650M Aorus Elite', N'Bo mạch chủ Micro-ATX socket AM5 hỗ trợ RAM DDR5.', 189.00, 20, N'https://example.com/images/b650m-aorus-elite.jpg'),
	(3, N'Gigabyte Z790 Gaming X', N'Bo mạch chủ ATX cho CPU Intel thế hệ 14.', 259.00, 11, N'https://example.com/images/z790-gaming-x.jpg'),
	(4, N'Corsair Vengeance DDR5 32GB 6000', N'Bộ RAM DDR5 32GB kênh đôi dành cho chơi game và sáng tạo nội dung.', 149.00, 30, N'https://example.com/images/ddr5-32gb-6000.jpg'),
	(4, N'Kingston Fury DDR5 16GB 5600', N'Bộ RAM DDR5 16GB phù hợp cho cấu hình giá tốt và văn phòng.', 79.00, 35, N'https://example.com/images/ddr5-16gb-5600.jpg'),
	(5, N'Samsung 990 EVO 1TB', N'Ổ SSD NVMe Gen4 tốc độ cao cho hệ điều hành và ứng dụng.', 89.00, 28, N'https://example.com/images/990-evo-1tb.jpg'),
	(5, N'WD Black SN850X 2TB', N'Ổ SSD NVMe hiệu năng cao cho game và lưu trữ media.', 159.00, 16, N'https://example.com/images/sn850x-2tb.jpg');
GO

INSERT INTO dbo.PRODUCT_SPEC (product_id, spec_name, spec_value)
VALUES
	(1, N'Socket', N'AM5'),
	(2, N'Socket', N'LGA1700'),
	(3, N'VRAM', N'8GB GDDR6'),
	(4, N'VRAM', N'12GB GDDR6'),
	(5, N'Socket', N'AM5'),
	(6, N'Socket', N'LGA1700'),
	(7, N'Dung lượng', N'32GB DDR5-6000'),
	(8, N'Dung lượng', N'16GB DDR5-5600'),
	(9, N'Giao tiếp', N'PCIe 4.0 NVMe'),
	(10, N'Giao tiếp', N'PCIe 4.0 NVMe');
GO

INSERT INTO dbo.PRODUCT_BENCHMARK (product_id, benchmark_type, score_value)
VALUES
	(1, N'Điểm Cinebench R23 đa nhân', 14850),
	(2, N'Điểm Cinebench R23 đa nhân', 24300),
	(3, N'Điểm đồ họa 3DMark Time Spy', 10850),
	(4, N'Điểm đồ họa 3DMark Time Spy', 17120),
	(5, N'Điểm ổn định VRM', 88),
	(6, N'Điểm ổn định VRM', 92),
	(7, N'Tốc độ đọc RAM MBps', 65000),
	(8, N'Tốc độ đọc RAM MBps', 56000),
	(9, N'Tốc độ đọc tuần tự MBps', 5000),
	(10, N'Tốc độ đọc tuần tự MBps', 7300);
GO

INSERT INTO dbo.COMPATIBILITY_MAP (category_id_a, category_id_b, required_spec_name)
VALUES
	(1, 3, N'Socket'),
	(3, 4, N'Loại RAM DDR'),
	(3, 5, N'Giao tiếp M.2'),
	(2, 3, N'Khe PCIe'),
	(1, 4, N'Hỗ trợ bộ nhớ');
GO

INSERT INTO dbo.USER_BUILDS (user_id, build_name, total_price)
VALUES
	(1, N'Cấu hình gaming tiết kiệm', 899.00),
	(2, N'Cấu hình sáng tạo nội dung tầm trung', 1249.00),
	(3, N'Cấu hình văn phòng yên tĩnh', 699.00),
	(1, N'Cấu hình sẵn sàng để stream', 1499.00),
	(5, N'Cấu hình workstation nhỏ gọn', 1099.00);
GO

INSERT INTO dbo.AI_BUILD_ITEMS (consultation_id, product_id, quantity, selection_reason, status)
VALUES
	(1, 1, 1, N'Được chọn vì cho hiệu năng chơi game 1080p tốt trong tầm giá.', N'RECOMMENDED'),
	(2, 2, 1, N'Nhiều nhân xử lý hơn giúp dựng video, render và stream tốt hơn.', N'RECOMMENDED'),
	(3, 9, 1, N'SSD tốc độ cao giúp khởi động máy và mở ứng dụng nhanh hơn.', N'RECOMMENDED'),
	(4, 7, 1, N'RAM DDR5 giúp cấu hình còn dư địa nâng cấp về sau.', N'DRAFT'),
	(5, 8, 1, N'Giữ lại như phương án dự phòng sau khi đề xuất chính bị lỗi.', N'REJECTED');
GO

INSERT INTO dbo.USER_BUILD_ITEMS (user_build_id, product_id, quantity)
VALUES
	(1, 1, 1),
	(1, 3, 1),
	(1, 5, 1),
	(2, 2, 1),
	(2, 4, 1),
	(2, 6, 1),
	(3, 8, 2),
	(3, 9, 1),
	(4, 7, 1),
	(5, 10, 1);
GO

INSERT INTO dbo.PC_BUILDS (product_id, build_name)
VALUES
	(3, N'PC gaming khởi điểm'),
	(4, N'PC gaming 1440p'),
	(9, N'PC làm việc văn phòng'),
	(2, N'PC sáng tạo nội dung'),
	(NULL, N'PC custom cơ bản');
GO

INSERT INTO dbo.PC_BUILD_ITEMS (pc_build_id, product_id, quantity)
VALUES
	(1, 1, 1),
	(1, 3, 1),
	(2, 2, 1),
	(2, 4, 1),
	(3, 8, 1),
	(3, 9, 1),
	(4, 2, 1),
	(4, 7, 1),
	(5, 5, 1),
	(5, 10, 1);
GO

INSERT INTO dbo.CART (user_id)
VALUES
	(1),
	(2),
	(3),
	(5),
	(6);
GO

INSERT INTO dbo.CART_ITEM (cart_id, product_id, user_build_id, quantity)
VALUES
	(1, 3, NULL, 1),
	(1, NULL, 1, 1),
	(2, 2, NULL, 1),
	(2, 9, NULL, 1),
	(3, NULL, 3, 1),
	(4, 10, NULL, 1),
	(5, 4, NULL, 1),
	(5, NULL, 5, 1);
GO

INSERT INTO dbo.[ORDER] (order_date, status, total_amount, user_id, shipping_address, promotion_id)
VALUES
	('2026-03-01 09:15:00', N'COMPLETED', 899.00, 1, N'12 Nguyễn Trãi, Quận 1, TP.HCM', 1),
	('2026-03-02 14:30:00', N'PAID', 1249.00, 2, N'48 Lê Lợi, Quận 1, TP.HCM', 2),
	('2026-03-03 11:00:00', N'SHIPPING', 699.00, 3, N'88 Hai Bà Trưng, Quận 3, TP.HCM', NULL),
	('2026-03-04 16:45:00', N'PROCESSING', 1499.00, 1, N'120 Cách Mạng Tháng 8, Quận 10, TP.HCM', 3),
	('2026-03-05 10:10:00', N'PENDING', 1099.00, 5, N'101 Phan Xích Long, Phú Nhuận, TP.HCM', NULL);
GO

INSERT INTO dbo.ORDER_DETAIL (order_id, product_id, quantity, price, user_build_id)
VALUES
	(1, 1, 1, 220.00, 1),
	(1, 3, 1, 299.00, 1),
	(2, 2, 1, 320.00, 2),
	(2, 4, 1, 449.00, 2),
	(3, 8, 2, 79.00, 3),
	(3, 9, 1, 89.00, 3),
	(4, 7, 1, 149.00, 4),
	(4, 10, 1, 159.00, 4),
	(5, 5, 1, 189.00, 5),
	(5, 10, 1, 159.00, 5);
GO

INSERT INTO dbo.PAYMENT (order_id, order_date, payment_status, total_amount, payment_method)
VALUES
	(1, '2026-03-01 09:20:00', N'PAID', 899.00, N'CARD'),
	(2, '2026-03-02 14:35:00', N'PAID', 1249.00, N'BANK_TRANSFER'),
	(3, '2026-03-03 11:05:00', N'PENDING', 699.00, N'CASH_ON_DELIVERY'),
	(4, '2026-03-04 16:50:00', N'PARTIAL', 1499.00, N'INSTALLMENT'),
	(5, '2026-03-05 10:15:00', N'PENDING', 1099.00, N'INSTALLMENT');
GO

INSERT INTO dbo.STAFF_BUILD_REQUESTS (user_id, staff_id, customer_note, budget_range, status, user_build_id, updated_at)
VALUES
	(1, 4, N'Cần FPS ổn định cho các tựa game thi đấu.', 25000000, N'COMPLETED', 1, '2026-02-21 09:00:00'),
	(2, 4, N'Ưu tiên CPU mạnh hơn để phục vụ dựng video.', 35000000, N'COMPLETED', 2, '2026-02-24 15:30:00'),
	(3, 4, N'Cần quạt êm và mức tiêu thụ điện thấp.', 18000000, N'COMPLETED', 3, '2026-02-28 13:10:00'),
	(1, 6, N'Muốn có khả năng nâng cấp GPU tốt hơn sau này.', 30000000, N'IN_PROGRESS', 4, '2026-03-07 10:45:00'),
	(5, NULL, N'Cần một workstation nhỏ gọn để lập trình hằng ngày.', 20000000, N'PENDING', NULL, NULL);
GO

INSERT INTO dbo.INSTALLMENT_PLANS (order_id, total_amount, down_payment, total_months, monthly_amount, interest_rate, status)
VALUES
	(1, 899.00, 299.00, 3, 210.00, 3.50, N'ACTIVE'),
	(2, 1249.00, 449.00, 4, 215.00, 4.50, N'ACTIVE'),
	(3, 699.00, 199.00, 3, 170.00, 4.00, N'ACTIVE'),
	(4, 1499.00, 499.00, 5, 220.00, 5.00, N'ACTIVE'),
	(5, 1099.00, 399.00, 4, 190.00, 4.50, N'PENDING');
GO

INSERT INTO dbo.INSTALLMENT_DETAILS (plan_id, installment_number, due_date, amount_to_pay, paid_date, status, payment_method)
VALUES
	(1, 1, '2026-04-01 00:00:00', 210.00, '2026-04-01 08:30:00', N'PAID', N'CARD'),
	(1, 2, '2026-05-01 00:00:00', 210.00, NULL, N'PENDING', NULL),
	(2, 1, '2026-04-02 00:00:00', 215.00, '2026-04-02 09:15:00', N'PAID', N'BANK_TRANSFER'),
	(2, 2, '2026-05-02 00:00:00', 215.00, NULL, N'PENDING', NULL),
	(3, 1, '2026-04-03 00:00:00', 170.00, '2026-04-03 10:00:00', N'PAID', N'CASH'),
	(3, 2, '2026-05-03 00:00:00', 170.00, NULL, N'PENDING', NULL),
	(4, 1, '2026-04-04 00:00:00', 220.00, '2026-04-04 14:20:00', N'PAID', N'CARD'),
	(4, 2, '2026-05-04 00:00:00', 220.00, NULL, N'PENDING', NULL),
	(5, 1, '2026-04-05 00:00:00', 190.00, NULL, N'PENDING', NULL),
	(5, 2, '2026-05-05 00:00:00', 190.00, NULL, N'PENDING', NULL);
GO

COMMIT TRAN;
GO
