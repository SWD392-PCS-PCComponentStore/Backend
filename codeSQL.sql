USE master;
GO

-- Xóa database cũ nếu đã tồn tại
IF EXISTS (SELECT * FROM sys.databases WHERE name = 'PCComponentStore')
BEGIN
    ALTER DATABASE PCComponentStore SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE PCComponentStore;
END
GO

CREATE DATABASE PCComponentStore;
GO

USE PCComponentStore;
GO

-- ==========================================================
-- 1. NHÓM NGƯỜI DÙNG (USERS)
-- ==========================================================
CREATE TABLE USERS (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'customer', -- customer, staff, admin
    status VARCHAR(20) DEFAULT 'active',
    phone VARCHAR(20),
    address NVARCHAR(MAX),
    avatar NVARCHAR(500), -- Bổ sung từ sơ đồ
    created_at DATETIME DEFAULT GETDATE()
);

-- ==========================================================
-- 2. NHÓM SẢN PHẨM & LOGIC TƯƠNG THÍCH
-- ==========================================================
CREATE TABLE CATEGORY (
    category_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX)
);

CREATE TABLE PRODUCT (
    product_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    price DECIMAL(18, 2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    image_url VARCHAR(500),
    category_id INT,
    status NVARCHAR(50) DEFAULT N'Available',
    brand NVARCHAR(100),
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Product_Category FOREIGN KEY (category_id) REFERENCES CATEGORY(category_id)
);

CREATE TABLE PRODUCT_SPEC (
    spec_id INT PRIMARY KEY IDENTITY(1,1),
    product_id INT,
    spec_name NVARCHAR(255), 
    spec_value NVARCHAR(255),
    CONSTRAINT FK_Spec_Product FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id)
);

CREATE TABLE PRODUCT_BENCHMARK (
    benchmark_id INT PRIMARY KEY IDENTITY(1,1),
    product_id INT,
    benchmark_type NVARCHAR(100), 
    score_value INT,
    CONSTRAINT FK_Benchmark_Product FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id)
);

CREATE TABLE COMPATIBILITY_MAP (
    map_id INT PRIMARY KEY IDENTITY(1,1),
    category_id_a INT, 
    category_id_b INT, 
    required_spec_name NVARCHAR(100), 
    CONSTRAINT FK_Map_CatA FOREIGN KEY (category_id_a) REFERENCES CATEGORY(category_id),
    CONSTRAINT FK_Map_CatB FOREIGN KEY (category_id_b) REFERENCES CATEGORY(category_id)
);

-- ==========================================================
-- 3. NHÓM CẤU HÌNH PC (BUILDS)
-- ==========================================================

-- Cấu hình của Người dùng tự build
CREATE TABLE UserBuilds (
    user_build_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    build_name NVARCHAR(255),
    total_price DECIMAL(18, 2) DEFAULT 0,
    build_source VARCHAR(50) DEFAULT 'self', 
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_UserBuild_User FOREIGN KEY (user_id) REFERENCES USERS(user_id)
);

CREATE TABLE UserBuildItems (
    user_build_item_id INT PRIMARY KEY IDENTITY(1,1),
    user_build_id INT,
    product_id INT,
    quantity INT DEFAULT 1,
    CONSTRAINT FK_Item_Build FOREIGN KEY (user_build_id) REFERENCES UserBuilds(user_build_id),
    CONSTRAINT FK_Item_Product FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id)
);

-- Cấu hình Mẫu của Cửa hàng (PC_Builds - Bổ sung mới)
CREATE TABLE PC_Builds (
    pc_build_id INT PRIMARY KEY IDENTITY(1,1),
    product_id INT NULL, 
    build_name NVARCHAR(255) NOT NULL,
    CONSTRAINT FK_PCBuild_Product FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id)
);

CREATE TABLE PC_Build_Items (
    pc_build_item_id INT PRIMARY KEY IDENTITY(1,1),
    pc_build_id INT,
    product_id INT,
    quantity INT DEFAULT 1,
    CONSTRAINT FK_PCBuildItem_Build FOREIGN KEY (pc_build_id) REFERENCES PC_Builds(pc_build_id),
    CONSTRAINT FK_PCBuildItem_Product FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id)
);

-- ==========================================================
-- 4. NHÓM TƯ VẤN (AI & STAFF)
-- ==========================================================
CREATE TABLE AI_CONSULTATIONS (
    consultation_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NULL,
    user_prompt NVARCHAR(MAX),
    ai_explanation NVARCHAR(MAX),
    budget_target DECIMAL(18,2),
    status VARCHAR(20) DEFAULT 'pending', 
    error_message NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_AI_User FOREIGN KEY (user_id) REFERENCES USERS(user_id)
);

CREATE TABLE AI_BUILD_ITEMS (
    item_id INT PRIMARY KEY IDENTITY(1,1),
    consultation_id INT,
    product_id INT,
    quantity INT DEFAULT 1,
    selection_reason NVARCHAR(MAX),
    CONSTRAINT FK_AIItem_Consult FOREIGN KEY (consultation_id) REFERENCES AI_CONSULTATIONS(consultation_id),
    CONSTRAINT FK_AIItem_Product FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id)
);

CREATE TABLE STAFF_BUILD_REQUESTS (
    request_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    staff_id INT NULL, 
    customer_note NVARCHAR(MAX),
    budget_range DECIMAL(18, 2),
    status VARCHAR(50) DEFAULT 'pending', 
    user_build_id INT NULL, 
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_StaffReq_User FOREIGN KEY (user_id) REFERENCES USERS(user_id),
    CONSTRAINT FK_StaffReq_Staff FOREIGN KEY (staff_id) REFERENCES USERS(user_id),
    CONSTRAINT FK_StaffReq_Build FOREIGN KEY (user_build_id) REFERENCES UserBuilds(user_build_id)
);

-- ==========================================================
-- 5. ĐƠN HÀNG, THANH TOÁN & KHUYẾN MÃI
-- ==========================================================

-- Bảng Khuyến mãi (Bổ sung mới)
CREATE TABLE PROMOTION (
    promotion_id INT PRIMARY KEY IDENTITY(1,1),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent DECIMAL(5, 2),
    valid_from DATETIME,
    valid_to DATETIME
);

CREATE TABLE CART (
    cart_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Cart_User FOREIGN KEY (user_id) REFERENCES USERS(user_id)
);

CREATE TABLE CART_ITEM (
    cart_item_id INT PRIMARY KEY IDENTITY(1,1),
    cart_id INT,
    product_id INT NULL,
    user_build_id INT NULL,
    quantity INT DEFAULT 1,
    CONSTRAINT FK_CartItem_Cart FOREIGN KEY (cart_id) REFERENCES CART(cart_id),
    CONSTRAINT FK_CartItem_Product FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id),
    CONSTRAINT FK_CartItem_Build FOREIGN KEY (user_build_id) REFERENCES UserBuilds(user_build_id)
);

CREATE TABLE [ORDER] (
    order_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    promotion_id INT NULL, -- Bổ sung liên kết Promotion
    order_date DATETIME DEFAULT GETDATE(),
    status NVARCHAR(50) DEFAULT N'Pending',
    total_amount DECIMAL(18, 2),
    shipping_address NVARCHAR(MAX),
    payment_type VARCHAR(50) DEFAULT 'One-time', 
    CONSTRAINT FK_Order_User FOREIGN KEY (user_id) REFERENCES USERS(user_id),
    CONSTRAINT FK_Order_Promotion FOREIGN KEY (promotion_id) REFERENCES PROMOTION(promotion_id)
);

-- Bảng Thanh toán (Bổ sung mới)
CREATE TABLE Payment (
    payment_id INT PRIMARY KEY IDENTITY(1,1),
    order_id INT,
    payment_date DATETIME DEFAULT GETDATE(),
    payment_status NVARCHAR(50),
    total_amount DECIMAL(18, 2),
    payment_method NVARCHAR(50),
    CONSTRAINT FK_Payment_Order FOREIGN KEY (order_id) REFERENCES [ORDER](order_id)
);

CREATE TABLE ORDER_DETAIL (
    order_detail_id INT PRIMARY KEY IDENTITY(1,1),
    order_id INT,
    product_id INT NULL,
    user_build_id INT NULL,
    quantity INT NOT NULL,
    price DECIMAL(18, 2) NOT NULL,
    CONSTRAINT FK_Detail_Order FOREIGN KEY (order_id) REFERENCES [ORDER](order_id),
    CONSTRAINT FK_Detail_Product FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id),
    CONSTRAINT FK_Detail_Build FOREIGN KEY (user_build_id) REFERENCES UserBuilds(user_build_id)
);

-- ==========================================================
-- 6. NHÓM TRẢ GÓP (INSTALLMENTS)
-- ==========================================================
CREATE TABLE INSTALLMENT_PLANS (
    plan_id INT PRIMARY KEY IDENTITY(1,1),
    order_id INT NOT NULL,
    total_amount DECIMAL(18, 2) NOT NULL, 
    down_payment DECIMAL(18, 2) DEFAULT 0, 
    total_months INT NOT NULL, 
    monthly_amount DECIMAL(18, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) DEFAULT 0, 
    status NVARCHAR(50) DEFAULT N'Active',
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Plan_Order FOREIGN KEY (order_id) REFERENCES [ORDER](order_id)
);

CREATE TABLE INSTALLMENT_DETAILS (
    installment_detail_id INT PRIMARY KEY IDENTITY(1,1),
    plan_id INT NOT NULL,
    installment_number INT NOT NULL, 
    due_date DATE NOT NULL,          
    amount_to_pay DECIMAL(18, 2) NOT NULL,
    paid_date DATETIME NULL,         
    status NVARCHAR(50) DEFAULT N'Unpaid',
    payment_method NVARCHAR(100), -- Bổ sung từ sơ đồ
    CONSTRAINT FK_InstalDetail_Plan FOREIGN KEY (plan_id) REFERENCES INSTALLMENT_PLANS(plan_id)
);
GO