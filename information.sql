USE PCComponentStore;
GO

-- Chèn User (Admin, Staff, Customer)
INSERT INTO USERS (name, email, password, role, status, phone, avatar) VALUES 
(N'Nguyễn Admin', 'admin@pcstore.com', 'hash_pass_1', 'admin', 'active', '0901234567', 'admin_avt.png'),
(N'Trần Nhân Viên', 'staff@pcstore.com', 'hash_pass_2', 'staff', 'active', '0907778889', 'staff_avt.png'),
(N'Lê Khách Hàng', 'customer@gmail.com', 'hash_pass_3', 'customer', 'active', '0912333444', 'user_avt.png');

-- Chèn Danh mục
INSERT INTO CATEGORY (name, description) VALUES 
(N'CPU', N'Bộ vi xử lý'),
(N'VGA', N'Card đồ họa'),
(N'Mainboard', N'Bo mạch chủ'),
(N'PC Bộ', N'Máy tính lắp sẵn');

-- Chèn Sản phẩm linh kiện
INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand) VALUES 
(N'Intel Core i9-14900K', N'24 Cores, 32 Threads', 15000000, 50, 1, 'Intel'),
(N'NVIDIA RTX 4090', N'24GB GDDR6X', 45000000, 10, 2, 'ASUS'),
(N'ASUS ROG Z790', N'LGA 1700, DDR5', 12000000, 20, 3, 'ASUS');

-- Chèn Khuyến mãi
INSERT INTO PROMOTION (code, discount_percent, valid_from, valid_to) VALUES 
('UUDAI2026', 10.00, '2026-01-01', '2026-12-31');

-- Chèn PC mẫu của cửa hàng (PC_Builds)
INSERT INTO PC_Builds (build_name) VALUES (N'PC Gaming Ultra 2026');

-- Chèn chi tiết cho PC mẫu (PC_Build_Items)
INSERT INTO PC_Build_Items (pc_build_id, product_id, quantity) VALUES 
(1, 1, 1), -- i9-14900K
(1, 2, 1), -- RTX 4090
(1, 3, 1); -- Z790

-- Tạo Đơn hàng
INSERT INTO [ORDER] (user_id, promotion_id, total_amount, shipping_address, payment_type) VALUES 
(3, 1, 72000000, N'123 Đường ABC, Quận 1, HCM', 'Installment');

-- Tạo chi tiết Đơn hàng (Mua bộ PC mẫu)
INSERT INTO ORDER_DETAIL (order_id, product_id, quantity, price) VALUES 
(1, NULL, 1, 72000000); -- Giả sử đây là giá của bộ build

-- Chèn thông tin Thanh toán
INSERT INTO Payment (order_id, payment_status, total_amount, payment_method) VALUES 
(1, N'Partial', 20000000, N'Banking');

-- Kế hoạch trả góp
INSERT INTO INSTALLMENT_PLANS (order_id, total_amount, down_payment, total_months, monthly_amount, interest_rate) VALUES 
(1, 72000000, 20000000, 12, 4500000, 2.5);

-- Chi tiết các kỳ trả góp
INSERT INTO INSTALLMENT_DETAILS (plan_id, installment_number, due_date, amount_to_pay, status) VALUES 
(1, 1, '2026-04-13', 4500000, N'Unpaid'),
(1, 2, '2026-05-13', 4500000, N'Unpaid');

-- 1. Giả lập một phiên tư vấn với AI
INSERT INTO AI_CONSULTATIONS (user_id, user_prompt, ai_explanation, budget_target, status) VALUES 
(3, N'Tôi muốn build PC chơi game Black Myth Wukong mượt ở 2K', 
    N'Dựa trên yêu cầu, tôi đề xuất cấu hình sử dụng RTX 4090 và i9-14900K để đạt hiệu năng tối ưu.', 
    70000000, 'completed');

-- Chi tiết các món AI gợi ý (Liên kết với phiên tư vấn ID 1)
INSERT INTO AI_BUILD_ITEMS (consultation_id, product_id, quantity, selection_reason) VALUES 
(1, 1, 1, N'CPU mạnh nhất hiện tại để tránh nghẽn cổ chai'),
(1, 2, 1, N'GPU hỗ trợ DLSS 3 cực tốt cho game nặng');

-- 2. Giả lập một cấu hình do Người dùng tự tạo (UserBuilds)
-- Ví dụ: Sau khi nghe AI tư vấn, khách tự lưu một bản build
INSERT INTO UserBuilds (user_id, build_name, total_price, build_source) VALUES 
(3, N'Dàn máy chiến Wukong của tôi', 60000000, 'ai');

INSERT INTO UserBuildItems (user_build_id, product_id, quantity) VALUES 
(1, 1, 1),
(1, 3, 1);

-- 3. Giả lập Yêu cầu Nhân viên Build giúp (Staff Build Request)
-- Khách (ID 3) gửi yêu cầu cho Nhân viên (ID 2)
INSERT INTO STAFF_BUILD_REQUESTS (user_id, staff_id, customer_note, budget_range, status, user_build_id) VALUES 
(3, 2, N'Nhờ shop cân đối lại giúp tôi bộ này sao cho tối ưu tản nhiệt nhất', 65000000, 'processing', 1);