-- =========================
-- 0) DATABASE
-- =========================
IF DB_ID(N'PCComponentStore') IS NULL
BEGIN
  CREATE DATABASE PCComponentStore;
END
GO

USE PCComponentStore;
GO

-- =========================
-- 1) MASTER TABLES
-- =========================

IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
CREATE TABLE dbo.Users (
  user_id       INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Users PRIMARY KEY,
  name          NVARCHAR(255) NOT NULL,
  email         NVARCHAR(255) NOT NULL,
  password_hash NVARCHAR(255) NOT NULL,
  phone         NVARCHAR(50) NULL,
  address       NVARCHAR(500) NULL,
  created_at    DATETIME2(0) NOT NULL CONSTRAINT DF_Users_created_at DEFAULT SYSUTCDATETIME(),
  CONSTRAINT UQ_Users_email UNIQUE (email)
);
GO

IF OBJECT_ID(N'dbo.Promotions', N'U') IS NULL
CREATE TABLE dbo.Promotions (
  promotion_id      INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Promotions PRIMARY KEY,
  code              NVARCHAR(100) NOT NULL,
  discount_percent  DECIMAL(5,2) NOT NULL,
  valid_from        DATETIME2(0) NOT NULL,
  valid_to          DATETIME2(0) NOT NULL,
  CONSTRAINT UQ_Promotions_code UNIQUE (code),
  CONSTRAINT CK_Promotions_discount CHECK (discount_percent >= 0 AND discount_percent <= 100),
  CONSTRAINT CK_Promotions_dates CHECK (valid_to > valid_from)
);
GO

IF OBJECT_ID(N'dbo.Suppliers', N'U') IS NULL
CREATE TABLE dbo.Suppliers (
  supplier_id    INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Suppliers PRIMARY KEY,
  name           NVARCHAR(255) NOT NULL,
  contact_email  NVARCHAR(255) NULL,
  address        NVARCHAR(500) NULL
);
GO

IF OBJECT_ID(N'dbo.Categories', N'U') IS NULL
CREATE TABLE dbo.Categories (
  category_id  INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Categories PRIMARY KEY,
  name         NVARCHAR(255) NOT NULL,
  description  NVARCHAR(MAX) NULL
);
GO

IF OBJECT_ID(N'dbo.Products', N'U') IS NULL
CREATE TABLE dbo.Products (
  product_id      INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Products PRIMARY KEY,
  name            NVARCHAR(255) NOT NULL,
  description     NVARCHAR(MAX) NULL,
  price           DECIMAL(12,2) NOT NULL,
  stock_quantity  INT NOT NULL CONSTRAINT DF_Products_stock DEFAULT (0),
  image_url       NVARCHAR(1000) NULL,
  supplier_id     INT NOT NULL,
  category_id     INT NOT NULL,
  CONSTRAINT CK_Products_price CHECK (price >= 0),
  CONSTRAINT CK_Products_stock CHECK (stock_quantity >= 0),
  CONSTRAINT FK_Products_Suppliers
    FOREIGN KEY (supplier_id) REFERENCES dbo.Suppliers(supplier_id)
    ON DELETE NO ACTION,
  CONSTRAINT FK_Products_Categories
    FOREIGN KEY (category_id) REFERENCES dbo.Categories(category_id)
    ON DELETE NO ACTION
);
GO

CREATE INDEX IX_Products_supplier_id ON dbo.Products(supplier_id);
CREATE INDEX IX_Products_category_id ON dbo.Products(category_id);
GO

-- =========================
-- 2) ORDERS
-- =========================

IF OBJECT_ID(N'dbo.Orders', N'U') IS NULL
CREATE TABLE dbo.Orders (
  order_id      INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Orders PRIMARY KEY,
  order_date    DATETIME2(0) NOT NULL CONSTRAINT DF_Orders_order_date DEFAULT SYSUTCDATETIME(),
  status        NVARCHAR(50) NOT NULL,
  total_amount  DECIMAL(12,2) NOT NULL CONSTRAINT DF_Orders_total DEFAULT (0),
  user_id       INT NOT NULL,
  promotion_id  INT NULL,
  CONSTRAINT CK_Orders_total CHECK (total_amount >= 0),
  CONSTRAINT FK_Orders_Users
    FOREIGN KEY (user_id) REFERENCES dbo.Users(user_id)
    ON DELETE CASCADE,
  CONSTRAINT FK_Orders_Promotions
    FOREIGN KEY (promotion_id) REFERENCES dbo.Promotions(promotion_id)
    ON DELETE SET NULL
);
GO

CREATE INDEX IX_Orders_user_id ON dbo.Orders(user_id);
CREATE INDEX IX_Orders_promotion_id ON dbo.Orders(promotion_id);
GO

IF OBJECT_ID(N'dbo.Order_Details', N'U') IS NULL
CREATE TABLE dbo.Order_Details (
  order_detail_id     INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Order_Details PRIMARY KEY,
  quantity            INT NOT NULL,
  price_per_purchase  DECIMAL(12,2) NOT NULL,
  order_id            INT NOT NULL,
  product_id          INT NOT NULL,
  CONSTRAINT CK_Order_Details_qty CHECK (quantity > 0),
  CONSTRAINT CK_Order_Details_price CHECK (price_per_purchase >= 0),
  CONSTRAINT FK_Order_Details_Orders
    FOREIGN KEY (order_id) REFERENCES dbo.Orders(order_id)
    ON DELETE CASCADE,
  CONSTRAINT FK_Order_Details_Products
    FOREIGN KEY (product_id) REFERENCES dbo.Products(product_id)
    ON DELETE NO ACTION
);
GO

CREATE INDEX IX_Order_Details_order_id ON dbo.Order_Details(order_id);
CREATE INDEX IX_Order_Details_product_id ON dbo.Order_Details(product_id);
GO

-- =========================
-- 3) CART + BUILD ITEMS
-- =========================

IF OBJECT_ID(N'dbo.Carts', N'U') IS NULL
CREATE TABLE dbo.Carts (
  cart_id     INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Carts PRIMARY KEY,
  quantity    INT NOT NULL,
  date_added  DATETIME2(0) NOT NULL CONSTRAINT DF_Carts_date_added DEFAULT SYSUTCDATETIME(),
  user_id     INT NOT NULL,
  product_id  INT NOT NULL,
  CONSTRAINT CK_Carts_qty CHECK (quantity > 0),
  CONSTRAINT FK_Carts_Users
    FOREIGN KEY (user_id) REFERENCES dbo.Users(user_id)
    ON DELETE CASCADE,
  CONSTRAINT FK_Carts_Products
    FOREIGN KEY (product_id) REFERENCES dbo.Products(product_id)
    ON DELETE NO ACTION
);
GO

CREATE INDEX IX_Carts_user_id ON dbo.Carts(user_id);
CREATE INDEX IX_Carts_product_id ON dbo.Carts(product_id);
GO

IF OBJECT_ID(N'dbo.Build_Items', N'U') IS NULL
CREATE TABLE dbo.Build_Items (
  item_id     INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Build_Items PRIMARY KEY,
  item_name   NVARCHAR(255) NOT NULL,
  item_value  NVARCHAR(255) NOT NULL,
  created_at  DATETIME2(0) NOT NULL CONSTRAINT DF_Build_Items_created_at DEFAULT SYSUTCDATETIME(),
  cart_id     INT NOT NULL,
  CONSTRAINT FK_Build_Items_Carts
    FOREIGN KEY (cart_id) REFERENCES dbo.Carts(cart_id)
    ON DELETE CASCADE
);
GO

CREATE INDEX IX_Build_Items_cart_id ON dbo.Build_Items(cart_id);
GO

-- =========================
-- 4) PRODUCT SPECS / PRODUCT DETAILS (BOM)
-- =========================

IF OBJECT_ID(N'dbo.Product_Specs', N'U') IS NULL
CREATE TABLE dbo.Product_Specs (
  spec_id          INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Product_Specs PRIMARY KEY,
  attribute_name   NVARCHAR(255) NOT NULL,
  attribute_value  NVARCHAR(255) NOT NULL,
  unit             NVARCHAR(50) NULL,
  product_id       INT NOT NULL,
  CONSTRAINT FK_Product_Specs_Products
    FOREIGN KEY (product_id) REFERENCES dbo.Products(product_id)
    ON DELETE CASCADE
);
GO

CREATE INDEX IX_Product_Specs_product_id ON dbo.Product_Specs(product_id);
GO

IF OBJECT_ID(N'dbo.Product_Details', N'U') IS NULL
CREATE TABLE dbo.Product_Details (
  detail_id             INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Product_Details PRIMARY KEY,
  quantity              INT NOT NULL,
  position              NVARCHAR(100) NULL,
  serial_number         NVARCHAR(255) NULL,
  installed_date        DATETIME2(0) NULL,
  product_id            INT NOT NULL,
  component_product_id  INT NOT NULL,
  CONSTRAINT CK_Product_Details_qty CHECK (quantity > 0),
  CONSTRAINT FK_Product_Details_Product
    FOREIGN KEY (product_id) REFERENCES dbo.Products(product_id)
    ON DELETE CASCADE,
  CONSTRAINT FK_Product_Details_Component
    FOREIGN KEY (component_product_id) REFERENCES dbo.Products(product_id)
    ON DELETE NO ACTION
);
GO

CREATE INDEX IX_Product_Details_product_id ON dbo.Product_Details(product_id);
CREATE INDEX IX_Product_Details_component_product_id ON dbo.Product_Details(component_product_id);
GO

-- =========================
-- 5) COMPATIBILITY + RECOMMENDATIONS + ADMIN
-- =========================

IF OBJECT_ID(N'dbo.Compatibility_Rules', N'U') IS NULL
CREATE TABLE dbo.Compatibility_Rules (
  rule_id               INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Compatibility_Rules PRIMARY KEY,
  compatible_product_id INT NOT NULL,
  rule_type             NVARCHAR(100) NOT NULL,
  description           NVARCHAR(MAX) NULL,
  category_id           INT NOT NULL,
  product_id            INT NOT NULL,
  CONSTRAINT FK_Rules_CompatibleProduct
    FOREIGN KEY (compatible_product_id) REFERENCES dbo.Products(product_id)
    ON DELETE NO ACTION,
  CONSTRAINT FK_Rules_Category
    FOREIGN KEY (category_id) REFERENCES dbo.Categories(category_id)
    ON DELETE NO ACTION,
  CONSTRAINT FK_Rules_Product
    FOREIGN KEY (product_id) REFERENCES dbo.Products(product_id)
    ON DELETE CASCADE
);
GO

CREATE INDEX IX_Rules_product_id ON dbo.Compatibility_Rules(product_id);
CREATE INDEX IX_Rules_compatible_product_id ON dbo.Compatibility_Rules(compatible_product_id);
CREATE INDEX IX_Rules_category_id ON dbo.Compatibility_Rules(category_id);
GO

IF OBJECT_ID(N'dbo.Recommendations', N'U') IS NULL
CREATE TABLE dbo.Recommendations (
  rec_id     INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Recommendations PRIMARY KEY,
  score      DECIMAL(6,3) NOT NULL,
  reason     NVARCHAR(500) NULL,
  user_id    INT NOT NULL,
  product_id INT NOT NULL,
  CONSTRAINT FK_Recommendations_Users
    FOREIGN KEY (user_id) REFERENCES dbo.Users(user_id)
    ON DELETE CASCADE,
  CONSTRAINT FK_Recommendations_Products
    FOREIGN KEY (product_id) REFERENCES dbo.Products(product_id)
    ON DELETE CASCADE,
  CONSTRAINT UQ_Recommendations_user_product UNIQUE (user_id, product_id)
);
GO

CREATE INDEX IX_Recommendations_user_id ON dbo.Recommendations(user_id);
CREATE INDEX IX_Recommendations_product_id ON dbo.Recommendations(product_id);
GO

IF OBJECT_ID(N'dbo.Admins', N'U') IS NULL
CREATE TABLE dbo.Admins (
  admin_id     INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Admins PRIMARY KEY,
  role         NVARCHAR(100) NOT NULL,
  permissions  NVARCHAR(MAX) NULL, -- nếu muốn JSON: thêm CHECK(ISJSON(permissions)=1)
  user_id      INT NOT NULL,
  CONSTRAINT FK_Admins_Users
    FOREIGN KEY (user_id) REFERENCES dbo.Users(user_id)
    ON DELETE CASCADE,
  CONSTRAINT UQ_Admins_user UNIQUE (user_id)
);
GO

-- (Tùy chọn) Nếu SQL Server 2016+ và bạn muốn đảm bảo permissions là JSON:
-- ALTER TABLE dbo.Admins
-- ADD CONSTRAINT CK_Admins_permissions_json CHECK (permissions IS NULL OR ISJSON(permissions) = 1);
-- GO