# PC Component Store - Tài Liệu Tính Năng Build PC bằng AI

## Mục Lục
1. [Tổng Quan Dự Án](#tổng-quan-dự-án)
2. [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
3. [Cơ Sở Dữ Liệu](#cơ-sở-dữ-liệu)
4. [Cấu Trúc Specs Linh Kiện](#cấu-trúc-specs-linh-kiện)
5. [Hướng Dẫn Thêm Sản Phẩm Mới](#hướng-dẫn-thêm-sản-phẩm-mới)
6. [Quy Tắc Kiểm Tra Tương Thích](#quy-tắc-kiểm-tra-tương-thích)
7. [API Phase 1: Sản Phẩm & Xác Thực](#api-phase-1-sản-phẩm--xác-thực)
8. [API Phase 2: Specs & Kiểm Tra Tương Thích](#api-phase-2-specs--kiểm-tra-tương-thích)
9. [API Phase 3: AI Build PC](#api-phase-3-ai-build-pc)
10. [Luồng Hoạt Động Chi Tiết: POST /api/ai/build](#luồng-hoạt-động-chi-tiết-post-apiaibuild)
11. [Dịch Vụ AI & Chế Độ Mock](#dịch-vụ-ai--chế-độ-mock)
12. [Thuật Toán Auto-Build](#thuật-toán-auto-build)
13. [Các Trường Hợp Test & Ví Dụ](#các-trường-hợp-test--ví-dụ)
14. [Cài Đặt & Chạy Dự Án](#cài-đặt--chạy-dự-án)
15. [Cấu Hình Môi Trường](#cấu-hình-môi-trường)

---

## Tổng Quan Dự Án

Backend của cửa hàng linh kiện PC - REST API được xây dựng bằng:
- **Runtime**: Node.js + Express.js (cổng 5000)
- **Cơ sở dữ liệu**: Microsoft SQL Server (database `PCComponentStore`)
- **AI**: Groq API (`llama-3.3-70b-versatile`) — miễn phí, tốc độ cao, với chế độ mock đầy đủ khi không có API key
- **Xác thực**: JWT (JSON Web Token)
- **Tài liệu API**: Swagger UI tại `/api-docs`

### Tóm Tắt Các Tính Năng
| Phase | Tính Năng |
|-------|-----------|
| Phase 1 | CRUD sản phẩm, quản lý danh mục, đăng nhập/đăng ký, đơn hàng, giỏ hàng, upload ảnh Cloudinary |
| Phase 2 | Specs JSON cho từng sản phẩm (`specs_json`), kiểm tra tương thích 7 quy tắc, tính điểm tương thích |
| Phase 3 | Build PC bằng AI (Groq Llama 3.3 + chế độ mock), engine tự động chọn linh kiện, điều phối toàn bộ quy trình |

---

## Kiến Trúc Hệ Thống

```
Yêu cầu từ Client
       │
       ▼
┌─────────────────────────────────────────────────┐
│               Express Router                    │
│  /api/auth  /api/products  /api/ai  /api/compat │
└─────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│               Controllers                       │
│  aiController  compatibilityController  ...     │
└─────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│                 Services                        │
│  aiService ──► autoBuildService                 │
│                    │                            │
│              compatibilityService               │
└─────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│                  Models                         │
│  specificationModelV2  productModel  ...        │
└─────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│           MSSQL Server Database                 │
│  PRODUCT (specs_json)  CATEGORY  ORDER  ...     │
└─────────────────────────────────────────────────┘
```

### Luồng Điều Phối AI

```
POST /api/ai/build  { query: "Build PC gaming 25 triệu" }
        │
        ▼
  aiService.orchestrateBuildPC(query)
        │
        ├─► analyzeRequest(query)
        │       │ USE_MOCK_AI=true → mockAnalyzeRequest()  (phân tích bằng regex)
        │       │ USE_MOCK_AI=false → Gọi Groq API (llama-3.3-70b-versatile)
        │       └─ trả về: { intent, buildType, budget, cpuPreference, gpuPreference, ... }
        │
        ├─► AutoBuildService.autoBuild(budget, preferences)
        │       │
        │       ├─ Tính phân bổ ngân sách theo mục đích
        │       ├─ Lấy tất cả sản phẩm từng danh mục từ DB
        │       ├─ Chọn linh kiện tốt nhất (có kiểm tra tương thích)
        │       └─ Chạy CompatibilityService.checkBuildCompatibility()
        │
        └─► generateBuildExplanation(query, build)
                │ USE_MOCK_AI=true → mockGenerateExplanation()
                │ USE_MOCK_AI=false → Gọi Groq (giải thích tiếng Việt)
                └─ trả về: chuỗi giải thích
```

---

## Cơ Sở Dữ Liệu

### Các Bảng Chính

**PRODUCT** (Sản phẩm)
```sql
product_id    INT PK AUTO_INCREMENT
name          NVARCHAR(255)
price         DECIMAL(18,2)
category_id   INT FK → CATEGORY
brand         NVARCHAR(100)
specs_json    NVARCHAR(MAX)   -- Chuỗi JSON chứa thông số kỹ thuật có cấu trúc
image_url     NVARCHAR(500)
stock         INT
```

**CATEGORY** (Danh mục)
```sql
category_id   INT PK
name          NVARCHAR(100)   -- "CPU", "VGA", "Mainboard", "RAM", "Storage", "PSU", "Cooler", "Case"
```

**CART, ORDER, ORDER_ITEM** — các bảng thương mại điện tử tiêu chuẩn

### Danh Mục ID (Môi Trường Production)
| category_id | Tên Danh Mục |
|-------------|--------------|
| 1 | CPU |
| 2 | VGA (GPU) |
| 3 | Mainboard |
| 5 | RAM |
| 6 | Storage (Ổ cứng) |
| 7 | PSU (Nguồn) |
| 8 | Cooler (Tản nhiệt) |
| 9 | Case (Vỏ case) |

---

## Cấu Trúc Specs Linh Kiện

Mỗi linh kiện lưu thông số kỹ thuật dưới dạng chuỗi JSON trong cột `PRODUCT.specs_json`.
Schema được định nghĩa trong [`src/utils/specSchemas.js`](src/utils/specSchemas.js).

> **Quan trọng:** Các trường được đánh dấu `★` là **bắt buộc** — thiếu trường này sản phẩm sẽ **không được chọn** trong quá trình Auto-Build và kiểm tra tương thích sẽ thất bại.

---

### CPU (category: "CPU")
| Trường | Kiểu | Bắt buộc | Dùng bởi | Mô tả |
|--------|------|----------|----------|-------|
| `socket` | string | ★ | Auto-Build, Tương thích | LGA1700, AM5, AM4 |
| `cores` | number | ★ | Auto-Build (chọn CPU) | Số nhân vật lý |
| `threads` | number | ★ | — | Số luồng |
| `tdp` | number | ★ | PSU calc, Cooler fit | Công suất nhiệt (W) |
| `generation` | string | ★ | — | "14th Gen Intel", "Zen 4" |
| `iGPU` | boolean | — | — | Có đồ họa tích hợp không |
| `base_clock` | number | — | — | Xung nhịp cơ bản (GHz) |
| `boost_clock` | number | — | — | Xung nhịp tối đa (GHz) |
| `cache_mb` | number | — | — | Cache L3 (MB) |
| `series` | string | — | — | "Core i5", "Ryzen 7" |

```json
{
  "socket": "LGA1700",
  "cores": 14,
  "threads": 20,
  "tdp": 125,
  "generation": "13th Gen Intel",
  "iGPU": false,
  "base_clock": 3.5,
  "boost_clock": 5.1,
  "cache_mb": 24,
  "series": "Core i5"
}
```

---

### Mainboard (category: "Mainboard")
| Trường | Kiểu | Bắt buộc | Dùng bởi | Mô tả |
|--------|------|----------|----------|-------|
| `socket` | string | ★ | Tương thích CPU | LGA1700, AM5, AM4 |
| `chipset` | string | ★ | — | H610, B760, Z790, B650, X670 |
| `ram_type` | string | ★ | Tương thích RAM | "DDR4" hoặc "DDR5" |
| `form_factor` | string | ★ | — | "ATX", "mATX", "ITX" |
| `ram_slots` | number | — | — | 2 hoặc 4 |
| `m2_slots` | number | — | — | Số khe M.2 |
| `pcie_gen` | number | — | — | 4 hoặc 5 |
| `usb_ports` | number | — | — | Tổng số cổng USB |

```json
{
  "socket": "LGA1700",
  "chipset": "B760",
  "ram_type": "DDR4",
  "form_factor": "mATX",
  "ram_slots": 2,
  "m2_slots": 1,
  "pcie_gen": 4,
  "usb_ports": 6
}
```

---

### VGA / GPU (category: "VGA")
| Trường | Kiểu | Bắt buộc | Dùng bởi | Mô tả |
|--------|------|----------|----------|-------|
| `memory_gb` | number | ★ | Auto-Build (chọn GPU) | VRAM (GB): 4, 8, 12, 16, 24 |
| `memory_type` | string | ★ | — | GDDR6, GDDR6X |
| `length_mm` | number | ★ | Tương thích Case | Chiều dài card (mm) |
| `power_pin` | string | ★ | — | "None", "8-pin", "12-pin", "16-pin" |
| `tdp` | number | — | PSU calc | Công suất nhiệt (W) |
| `boost_clock` | number | — | — | Xung nhịp tối đa (GHz) |
| `ray_tracing` | boolean | — | — | Hỗ trợ Ray Tracing |

```json
{
  "memory_gb": 12,
  "memory_type": "GDDR6X",
  "length_mm": 285,
  "power_pin": "16-pin",
  "tdp": 200,
  "boost_clock": 2.48,
  "ray_tracing": true
}
```

---

### RAM (category: "RAM")
| Trường | Kiểu | Bắt buộc | Dùng bởi | Mô tả |
|--------|------|----------|----------|-------|
| `type` | string | ★ | Tương thích Mainboard | "DDR4" hoặc "DDR5" |
| `capacity_gb` | number | ★ | Auto-Build (ưu tiên lớn) | 8, 16, 32, 64, 96 |
| `speed_mhz` | number | ★ | Auto-Build (ưu tiên nhanh) | 3200, 3600, 4800, 6000 |
| `kit_size` | string | ★ | — | "1x8", "2x8", "2x16", "2x32" |
| `latency` | number | — | — | CAS latency (16, 30, 36...) |
| `voltage` | number | — | — | 1.1, 1.2, 1.35, 1.4 |
| `rgb` | boolean | — | — | Có đèn RGB không |

```json
{
  "type": "DDR4",
  "capacity_gb": 16,
  "speed_mhz": 3200,
  "kit_size": "2x8",
  "latency": 16,
  "voltage": 1.35,
  "rgb": false
}
```

---

### Storage (category: "Storage")
| Trường | Kiểu | Bắt buộc | Dùng bởi | Mô tả |
|--------|------|----------|----------|-------|
| `capacity_gb` | number | ★ | Auto-Build (lọc theo size) | 120, 240, 480, 500, 1000, 2000 |
| `type` | string | ★ | — | "SSD" hoặc "HDD" |
| `interface` | string | ★ | — | "NVMe", "SATA" |
| `form_factor` | string | — | — | "M.2", "2.5\"", "3.5\"" |
| `speed_mbps` | number | — | Auto-Build (ưu tiên nhanh) | Tốc độ đọc (MB/s) |
| `encrypted` | boolean | — | — | Hỗ trợ mã hóa |

```json
{
  "capacity_gb": 1000,
  "type": "SSD",
  "interface": "NVMe",
  "form_factor": "M.2",
  "speed_mbps": 7000,
  "encrypted": false
}
```

---

### PSU (category: "PSU")
| Trường | Kiểu | Bắt buộc | Dùng bởi | Mô tả |
|--------|------|----------|----------|-------|
| `wattage` | number | ★ | Tương thích (PSU_WATTAGE) | Công suất (W): 400, 500, 650, 750, 850, 1000 |
| `certification` | string | ★ | — | "None", "80 Plus Bronze", "80 Plus Gold", "80 Plus Platinum", "80 Plus Titanium" |
| `modular` | string | ★ | — | "None", "Semi", "Full" |
| `pcie_8pin_count` | number | — | — | Số đầu cắm PCIe 8-pin |
| `pcie_12vhpwr_count` | number | — | — | Số đầu cắm 12VHPWR (RTX 40xx) |
| `fan_size` | number | — | — | Kích thước quạt (mm) |

```json
{
  "wattage": 750,
  "certification": "80 Plus Gold",
  "modular": "Full",
  "pcie_8pin_count": 2,
  "pcie_12vhpwr_count": 1,
  "fan_size": 140
}
```

---

### Cooler (category: "Cooler")
| Trường | Kiểu | Bắt buộc | Dùng bởi | Mô tả |
|--------|------|----------|----------|-------|
| `type` | string | ★ | — | "Air" hoặc "AIO" |
| `supported_sockets` | array | ★ | Tương thích CPU | ["LGA1700", "AM5", "AM4", "LGA1151"] |
| `max_tdp` | number | ★ | Tương thích CPU (TDP) | TDP tối đa hỗ trợ (W) |
| `height_mm` | number | — | Tương thích Case | Chiều cao tản nhiệt (mm) — **cần cho air cooler** |
| `noise_db` | number | — | — | Độ ồn (dB) |
| `fans` | number | — | — | Số quạt |

```json
{
  "type": "Air",
  "supported_sockets": ["LGA1700", "AM5", "AM4", "LGA1151"],
  "max_tdp": 180,
  "height_mm": 154,
  "noise_db": 30,
  "fans": 1
}
```

---

### Case (category: "Case")
| Trường | Kiểu | Bắt buộc | Dùng bởi | Mô tả |
|--------|------|----------|----------|-------|
| `form_factor` | string | ★ | — | "ATX", "mATX", "ITX" |
| `max_gpu_length_mm` | number | ★ | Tương thích GPU | Chiều dài GPU tối đa (mm) |
| `max_cooler_height_mm` | number | ★ | Tương thích Cooler | Chiều cao tản nhiệt tối đa (mm) |
| `fans_included` | number | — | — | Số quạt kèm theo |
| `dust_filters` | boolean | — | — | Có lưới lọc bụi không |
| `front_io` | object | — | — | `{"usb_a": 2, "usb_c": 1, "audio": true}` |

```json
{
  "form_factor": "ATX",
  "max_gpu_length_mm": 380,
  "max_cooler_height_mm": 185,
  "fans_included": 2,
  "dust_filters": true,
  "front_io": {"usb_a": 2, "usb_c": 1, "audio": true}
}
```

---

## Hướng Dẫn Thêm Sản Phẩm Mới

### Các Trường Bắt Buộc Của Bảng PRODUCT

```sql
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (N'Tên sản phẩm', N'Mô tả', giá, số_lượng, category_id, N'Hãng', N'Available', N'{"..."}')
```

| Trường | Kiểu | Bắt buộc | Lưu ý |
|--------|------|----------|-------|
| `name` | NVARCHAR(255) | ★ | Tên đầy đủ, unique để script không bị trùng |
| `price` | DECIMAL(18,2) | ★ | Đơn vị VNĐ, không có dấu phẩy |
| `stock_quantity` | INT | ★ | Số lượng tồn kho |
| `category_id` | INT | ★ | Xem bảng Category ID bên dưới |
| `brand` | NVARCHAR(100) | ★ | Intel, AMD, ASUS, Gigabyte... |
| `status` | NVARCHAR(50) | ★ | Luôn dùng `'Available'` |
| `specs_json` | NVARCHAR(MAX) | ★ | JSON hợp lệ theo schema từng loại |

### Category ID
| category_id | Tên | Schema dùng |
|-------------|-----|-------------|
| 1 | CPU | CPU schema |
| 2 | VGA | GPU schema |
| 3 | Mainboard | MAINBOARD schema |
| 5 | RAM | RAM schema |
| 6 | Storage | STORAGE schema |
| 7 | PSU | PSU schema |
| 8 | Cooler | COOLER schema |
| 9 | Case | CASE schema |

---

### Quy Tắc Validation specs_json

#### 1. Sản phẩm sẽ bị bỏ qua nếu:
- `specs_json` là NULL hoặc chuỗi rỗng
- `specs_json` không phải JSON hợp lệ (parse lỗi)
- Thiếu trường bắt buộc (★) cho từng loại

#### 2. Sản phẩm sẽ không được chọn trong Auto-Build nếu:
- **CPU**: thiếu `socket`, `cores`, hoặc `tdp`
- **Mainboard**: thiếu `socket` hoặc `ram_type` → không match được với CPU/RAM
- **RAM**: thiếu `type` → không match được với Mainboard
- **GPU**: thiếu `memory_gb` → không thể so sánh hiệu năng
- **Cooler**: thiếu `supported_sockets` hoặc `max_tdp` → không qua kiểm tra tương thích
- **PSU**: thiếu `wattage` → không qua kiểm tra công suất
- **Case**: thiếu `max_gpu_length_mm` hoặc `max_cooler_height_mm` → không qua kiểm tra kích thước

#### 3. Ràng buộc tương thích bắt buộc:

| Cặp linh kiện | Điều kiện | Ví dụ đúng |
|---------------|-----------|------------|
| CPU ↔ Mainboard | `cpu.socket === mainboard.socket` | LGA1700 ↔ LGA1700 |
| RAM ↔ Mainboard | `ram.type === mainboard.ram_type` | DDR4 ↔ DDR4 |
| Cooler ↔ CPU | `cooler.supported_sockets.includes(cpu.socket)` | ["LGA1700","AM5"] ↔ LGA1700 |
| Cooler ↔ CPU | `cooler.max_tdp >= cpu.tdp` | 180W ≥ 125W |
| GPU ↔ Case | `case.max_gpu_length_mm >= gpu.length_mm` | 360mm ≥ 285mm |
| Cooler ↔ Case | `case.max_cooler_height_mm >= cooler.height_mm` | 165mm ≥ 154mm |
| PSU ↔ Hệ thống | `psu.wattage >= (cpu.tdp + gpu.tdp) × 1.3` | 650W ≥ 345W |

#### 4. Ví dụ thêm CPU mới đúng chuẩn:

```sql
IF NOT EXISTS (SELECT 1 FROM dbo.PRODUCT WHERE name = 'Intel Core i5-14600K')
INSERT INTO dbo.PRODUCT (name, description, price, stock_quantity, category_id, brand, status, specs_json)
VALUES (
  N'Intel Core i5-14600K',
  N'14th Gen Intel Core i5 - 14 Cores 20 Threads, 125W TDP',
  7500000,        -- giá VNĐ
  50,             -- tồn kho
  1,              -- category_id = CPU
  N'Intel',
  N'Available',
  N'{"socket":"LGA1700","cores":14,"threads":20,"tdp":125,"generation":"14th Gen Intel","iGPU":true,"base_clock":3.5,"boost_clock":5.3,"cache_mb":24,"series":"Core i5"}'
);
```

#### 5. Lưu ý quan trọng khi thêm hàng loạt:

- **CPU Intel 12th/13th/14th Gen** → `socket: "LGA1700"` → cần mainboard H610/B660/B760/Z690/Z790
- **CPU AMD Ryzen 7000** → `socket: "AM5"` → cần mainboard B650/X670 + RAM **DDR5**
- **CPU AMD Ryzen 5000** → `socket: "AM4"` → cần mainboard B550/X570 + RAM **DDR4**
- **DDR4 và DDR5 không dùng chung mainboard** — phải đúng `ram_type`
- **PSU** nên có `wattage` ≥ 400W; build văn phòng cần tối thiểu 400W, gaming cần 550-850W
- **Cooler** phải có `supported_sockets` là mảng JSON: `["LGA1700","AM5","AM4"]` (không phải chuỗi)

---

## Quy Tắc Kiểm Tra Tương Thích

Hệ thống kiểm tra 7 quy tắc khi xác thực một bộ PC.

| Mã Quy Tắc | Tên | Điều Kiện | Mức Độ |
|------------|-----|-----------|--------|
| CPU_SOCKET_MATCH | Socket CPU-Mainboard | `cpu.specs.socket === mainboard.specs.socket` | LỖI |
| RAM_TYPE_SUPPORT | Loại RAM | `ram.specs.type === mainboard.specs.ram_type` | LỖI |
| PSU_WATTAGE_SUFFICIENT | Công suất nguồn | `psu.specs.wattage >= (cpu.tdp + gpu.tdp) × 1.3` | LỖI |
| COOLER_SOCKET_SUPPORT | Socket tản nhiệt | `cooler.specs.supported_sockets.includes(cpu.specs.socket)` | LỖI |
| COOLER_TDP_SUPPORT | TDP tản nhiệt | `cooler.specs.max_tdp >= cpu.specs.tdp` | CẢNH BÁO |
| GPU_CASE_SIZE_FIT | Chiều dài GPU | `case.specs.max_gpu_length_mm >= gpu.specs.length_mm` | CẢNH BÁO |
| COOLER_CASE_SIZE_FIT | Chiều cao tản nhiệt | `case.specs.max_cooler_height_mm >= cooler.specs.height_mm` | CẢNH BÁO |

### Công Thức Tính Điểm Tương Thích
```
điểm = 100 - (số_lỗi × 25) - (số_cảnh_báo × 10)
điểm = tối thiểu 0
```

---

## API Phase 1: Sản Phẩm & Xác Thực

### Xác Thực Người Dùng

#### POST /api/auth/register
Đăng ký tài khoản mới.
```json
Yêu cầu: { "username": "user1", "password": "pass123", "email": "user1@mail.com", "role": "customer" }
Phản hồi: { "success": true, "message": "User registered", "data": { "user_id": 1, "username": "user1" } }
```

#### POST /api/auth/login
Đăng nhập.
```json
Yêu cầu: { "username": "user1", "password": "pass123" }
Phản hồi: { "success": true, "token": "eyJ...", "user": { "user_id": 1, "role": "customer" } }
```

### Sản Phẩm

#### GET /api/products
Lấy danh sách sản phẩm (có phân trang).
```
GET /api/products?page=1&limit=10&category_id=1&search=i5
```

#### GET /api/products/:id
Lấy thông tin sản phẩm theo ID.

#### POST /api/products
Tạo sản phẩm mới (yêu cầu quyền Admin + JWT).
```json
{
  "name": "Intel Core i5-13400F",
  "price": 4500000,
  "category_id": 1,
  "brand": "Intel",
  "stock": 50
}
```

#### PUT /api/products/:id
Cập nhật thông tin sản phẩm.

#### DELETE /api/products/:id
Xóa sản phẩm.

### Danh Mục

#### GET /api/categories
Lấy tất cả danh mục.

#### POST /api/categories
Tạo danh mục mới.
```json
{ "name": "CPU", "description": "Bộ vi xử lý" }
```

---

## API Phase 2: Specs & Kiểm Tra Tương Thích

### Specs V2 (Dạng JSON)

#### POST /api/specs/v2/:productId
Thiết lập specs JSON cho một sản phẩm.
```json
{
  "socket": "LGA1700",
  "cores": 6,
  "threads": 12,
  "base_clock_ghz": 3.4,
  "boost_clock_ghz": 4.9,
  "tdp": 65,
  "memory_type": ["DDR4", "DDR5"],
  "integrated_graphics": true
}
```

#### GET /api/specs/v2/:productId
Lấy specs JSON của một sản phẩm.

#### GET /api/specs/v2/category/:categoryId
Lấy tất cả sản phẩm có specs theo danh mục.

### Kiểm Tra Tương Thích

#### POST /api/compatibility/check
Kiểm tra tương thích của một bộ PC hoàn chỉnh.
```json
Yêu cầu:
{
  "cpuId": 1,
  "mainboardId": 10,
  "ramId": 20,
  "gpuId": 30,
  "storageId": 40,
  "psuId": 50,
  "coolerId": 60,
  "caseId": 70
}

Phản hồi:
{
  "success": true,
  "data": {
    "compatible": true,
    "compatibility_score": 100,
    "errors": [],
    "warnings": [],
    "passed_rules": ["CPU_SOCKET_MATCH", "RAM_TYPE_SUPPORT", ...],
    "summary": "Build is fully compatible"
  }
}
```

#### POST /api/compatibility/check-pair
Kiểm tra tương thích giữa hai linh kiện cụ thể.
```json
Yêu cầu: { "component1Id": 1, "component2Id": 10 }
```

#### GET /api/compatibility/rules
Lấy danh sách tất cả các quy tắc tương thích.

---

## API Phase 3: AI Build PC

### POST /api/ai/build
**Endpoint chính** — Build PC hoàn chỉnh từ câu hỏi tự nhiên bằng tiếng Việt.

**Yêu cầu:**
```json
{ "query": "Build PC gaming 25 triệu" }
```

**Phản hồi:**
```json
{
  "success": true,
  "message": "✅ PC build generated successfully",
  "data": {
    "query": "Build PC gaming 25 triệu",
    "analysis": {
      "intent": "build_pc",
      "buildType": "gaming",
      "budget": 25000000,
      "cpuPreference": "performance",
      "gpuPreference": "performance",
      "storageSize": 500,
      "confidence": 0.9,
      "explanation": "[MOCK] Build PC gaming với ngân sách 25.000.000đ",
      "mock": true
    },
    "build": {
      "purpose": "gaming",
      "budget_total": 25000000,
      "budget_allocation": {
        "cpu": 5500000,
        "mainboard": 2000000,
        "ram": 3000000,
        "gpu": 9000000,
        "storage": 2000000,
        "psu": 1750000,
        "cooler": 1000000,
        "case": 750000
      },
      "components": {
        "cpu": {
          "product_id": 1,
          "product_name": "Intel Core i5-13400F",
          "price": 4500000,
          "specs": { "socket": "LGA1700", "cores": 6, "tdp": 65 }
        },
        "mainboard": { "..." },
        "ram": { "..." },
        "gpu": { "..." },
        "storage": { "..." },
        "psu": { "..." },
        "cooler": { "..." },
        "case": { "..." }
      },
      "estimated_total_cost": 16280000,
      "cost_over_budget": -8720000,
      "compatibility": {
        "compatible": true,
        "compatibility_score": 100,
        "errors": [],
        "warnings": []
      }
    },
    "explanation": "[MOCK] Đây là bộ PC gaming được tối ưu trong ngân sách. Tổng chi phí: 16.280.000đ. Điểm tương thích: 100/100."
  }
}
```

### POST /api/ai/analyze
Phân tích câu hỏi mà không tạo build (chỉ nhận diện ý định).
```json
Yêu cầu: { "query": "tôi muốn build PC workstation 40 triệu để render 3D" }
Phản hồi:
{
  "success": true,
  "data": {
    "intent": "build_pc",
    "buildType": "workstation",
    "budget": 40000000,
    "cpuPreference": "performance",
    "gpuPreference": "performance",
    "confidence": 0.9
  }
}
```

### POST /api/ai/recommendations
Gợi ý linh kiện chung không kèm auto-build.
```json
Yêu cầu: { "requirements": "PC gaming 1440p, ngân sách 20 triệu" }
Phản hồi:
{
  "success": true,
  "data": {
    "requirements": "PC gaming 1440p...",
    "components": [
      { "type": "CPU", "name": "Intel Core i5-13600K", "reason": "Hiệu năng tốt tầm giá" },
      { "type": "GPU", "name": "RTX 4070", "reason": "Phù hợp gaming 1440p" }
    ]
  }
}
```

### GET /api/ai/test
Kiểm tra kết nối Groq API (hoặc trạng thái chế độ mock).
```json
// Chế độ mock (USE_MOCK_AI=true):
{
  "success": true,
  "data": {
    "message": "✅ Running in MOCK mode - no real API calls",
    "mode": "MOCK",
    "timestamp": "2025-01-01T00:00:00.000Z"
  }
}

// Chế độ Groq thật (USE_MOCK_AI=false):
{
  "success": true,
  "data": {
    "message": "The Groq API is functioning as intended and is working.",
    "mode": "GROQ",
    "model": "llama-3.3-70b-versatile",
    "timestamp": "..."
  }
}
```

### GET /api/ai/auto-build/examples
Lấy các ví dụ cấu hình build mẫu.
```json
Phản hồi:
{
  "success": true,
  "data": {
    "gaming_budget": { "description": "PC gaming tầm thấp", "budget": 500, "purpose": "gaming" },
    "gaming_mid": { "description": "PC gaming tầm trung", "budget": 1000 },
    "gaming_high": { "description": "PC gaming cao cấp", "budget": 2500 },
    "workstation_budget": { "description": "Workstation tầm thấp", "budget": 800 },
    "workstation_pro": { "description": "Workstation chuyên nghiệp", "budget": 2000 },
    "office_budget": { "description": "PC văn phòng", "budget": 300 }
  }
}
```

### POST /api/ai/auto-build
Auto-build trực tiếp (bỏ qua bước phân tích AI).
```json
Yêu cầu:
{
  "budget": 25000000,
  "preferences": {
    "purpose": "gaming",
    "cpuPreference": "performance",
    "gpuPreference": "performance",
    "storageSize": 500
  }
}
```

---

## Luồng Hoạt Động Chi Tiết: POST /api/ai/build

Khi client gọi `POST /api/ai/build` với body `{ "query": "..." }`, hệ thống chạy tuần tự qua **4 lớp** sau:

```
Client → Router → Controller → Service → Model → DB
```

### Bước 0 — Router & Controller (`aiRoute.js` → `aiController.js`)

```
POST /api/ai/build
  │
  ▼
aiController.buildPC(req, res)
  │  Kiểm tra: query có rỗng không?
  │  → Rỗng: trả 400 "Query is required"
  │
  ▼
aiService.orchestrateBuildPC(query)
```

---

### Bước 1 — Phân Tích Câu Hỏi (`aiService.js` → `analyzeRequest`)

```
analyzeRequest("tôi muốn mua máy tính 15 củ để chơi game")
  │
  ├─ USE_MOCK_AI=true ?
  │     ▼ mockAnalyzeRequest(query)
  │       ├─ parseBudgetFromQuery()  → nhận "15 củ" → 15.000.000đ
  │       │   Regex: "triệu" | "tr" | "củ" | số 6+ chữ số
  │       └─ detectBuildType()       → nhận "choi game" → "gaming"
  │           Regex theo thứ tự ưu tiên:
  │           1. gaming_workstation (game + 3D/render cùng lúc)
  │           2. streaming (stream, obs, twitch)
  │           3. editing (premiere, davinci, chỉnh sửa video)
  │           4. ai_ml (pytorch, tensorflow, machine learning)
  │           5. home_server (server, nas, lưu trữ)
  │           6. budget (rẻ nhất, tiết kiệm)
  │           7. gaming (game, fps, moba)
  │           8. workstation (3d, render, đồ họa)
  │           9. office (văn phòng, học tập, word/excel)
  │
  └─ USE_MOCK_AI=false ?
        ▼ callGroq(messages, "llama-3.3-70b-versatile")
          Prompt: phân tích câu hỏi → trả về JSON
          {
            "buildType": "gaming",
            "budget": 15000000,
            "cpuPreference": "performance",
            "gpuPreference": "performance",
            "storageSize": 500,
            "confidence": 0.95
          }
          → Nếu Groq lỗi: tự động fallback về mockAnalyzeRequest()

Kết quả trả về:
{
  intent: "build_pc",
  buildType: "gaming",       ← loại build (9 loại)
  budget: 15000000,          ← ngân sách VNĐ
  cpuPreference: "performance",
  gpuPreference: "performance",
  storageSize: 500,
  confidence: 0.95
}
```

---

### Bước 2 — Map BuildType → Preferences (`aiService.js` → `orchestrateBuildPC`)

```
BUILD_TYPE_CONFIG["gaming"] = {
  purpose: "gaming",
  cpuPref: "performance",
  gpuPref: "performance"
}

preferences = {
  purpose: "gaming",
  cpuPreference: "performance",   ← AI có thể override
  gpuPreference: "performance",   ← AI có thể override
  storageSize: 500
}

→ Nếu budget = null: throw Error "Vui lòng cho biết ngân sách..."
```

---

### Bước 3 — Auto-Build Engine (`autoBuildService.js` → `autoBuild`)

```
autoBuild(15.000.000đ, { purpose: "gaming", ... })
  │
  ├─ BƯỚC 3.1: Tính phân bổ ngân sách
  │   gaming:
  │   cpu      = 15M × 22% = 3.300.000đ
  │   mainboard = 15M × 10% = 1.500.000đ  ← đủ mua H610M (1.3M)
  │   ram      = 15M × 12% = 1.800.000đ
  │   gpu      = 15M × 34% = 5.100.000đ
  │   storage  = 15M × 8%  = 1.200.000đ
  │   psu      = 15M × 7%  = 1.050.000đ
  │   cooler   = 15M × 4%  = 600.000đ
  │   case     = 15M × 3%  = 450.000đ
  │
  ├─ BƯỚC 3.2: Lấy sản phẩm từ DB (song song)
  │   specificationModelV2.getAllSpecsByCategory("cpu")
  │   specificationModelV2.getAllSpecsByCategory("mainboard")
  │   specificationModelV2.getAllSpecsByCategory("ram")
  │   specificationModelV2.getAllSpecsByCategory("gpu")
  │   specificationModelV2.getAllSpecsByCategory("storage")
  │   specificationModelV2.getAllSpecsByCategory("psu")
  │   specificationModelV2.getAllSpecsByCategory("cooler_cpu")
  │   specificationModelV2.getAllSpecsByCategory("case")
  │   → Lọc: chỉ lấy sản phẩm có specs_json IS NOT NULL
  │
  ├─ BƯỚC 3.3: Chọn CPU
  │   Lọc: price ≤ 3.300.000đ
  │   Sắp xếp (performance): giảm dần theo cores
  │   → Chọn CPU nhiều nhân nhất trong budget
  │   → Nếu không có: throw "No CPU found within budget"
  │
  ├─ BƯỚC 3.4: Chọn Mainboard
  │   Điều kiện: price ≤ 1.500.000đ VÀ socket === cpu.socket
  │   Sắp xếp: giá thấp nhất
  │   → Nếu không có: throw "No compatible Mainboard found"
  │
  ├─ BƯỚC 3.5: Chọn RAM
  │   Điều kiện: price ≤ 1.800.000đ VÀ type === mainboard.ram_type
  │   Sắp xếp: capacity_gb giảm dần → speed_mhz giảm dần
  │   → Nếu không có: throw "No compatible RAM found"
  │
  ├─ BƯỚC 3.6: Chọn GPU (bỏ qua nếu gpuPreference="none")
  │   Điều kiện: price ≤ 5.100.000đ
  │   Sắp xếp (performance): memory_gb giảm dần
  │   → Nếu không có: bỏ qua (không throw lỗi)
  │
  ├─ BƯỚC 3.7: Chọn Storage
  │   Điều kiện: price ≤ 1.200.000đ
  │   Sắp xếp: ưu tiên capacity ≥ storageSize → sau đó speed_mbps
  │   → Nếu không có: throw "No Storage found within budget"
  │
  ├─ BƯỚC 3.8: Chọn Cooler
  │   Điều kiện:
  │     price ≤ 600.000đ
  │     supported_sockets.includes(cpu.socket)
  │     max_tdp >= cpu.tdp
  │   Sắp xếp: giá thấp nhất
  │   → Nếu không có: throw "No compatible Cooler found"
  │
  ├─ BƯỚC 3.9: Chọn PSU
  │   Tính: required_wattage = (cpu.tdp + gpu.tdp) × 1.3
  │   Ví dụ: (65W + 165W) × 1.3 = 299W → cần PSU ≥ 299W
  │   Điều kiện: price ≤ 1.050.000đ VÀ wattage ≥ required_wattage
  │   Sắp xếp: giá thấp nhất
  │   → Nếu không có: throw "No suitable PSU found"
  │
  ├─ BƯỚC 3.10: Chọn Case
  │   Điều kiện:
  │     price ≤ 450.000đ
  │     max_gpu_length_mm >= gpu.length_mm  (nếu có GPU)
  │     max_cooler_height_mm >= cooler.height_mm
  │   Sắp xếp: giá thấp nhất
  │   → Nếu không có: throw "No suitable Case found"
  │
  └─ BƯỚC 3.11: Tính tổng & kiểm tra tương thích
      estimated_total_cost = tổng giá 8 linh kiện
      cost_over_budget = total - budget  (âm = dư ngân sách)
      CompatibilityService.checkBuildCompatibility({
        cpuId, mainboardId, ramId, gpuId, storageId, psuId, coolerId, caseId
      })
      → 7 quy tắc → tính điểm compatibility_score
```

---

### Bước 4 — Sinh Giải Thích (`aiService.js` → `generateBuildExplanation`)

```
generateBuildExplanation(query, build)
  │
  ├─ USE_MOCK_AI=true ?
  │     ▼ mockGenerateExplanation(build)
  │       → Template: "[MOCK] Đây là bộ PC gaming...Tổng: 12.3M. Điểm: 100/100"
  │
  └─ USE_MOCK_AI=false ?
        ▼ callGroq(messages)
          System prompt: "Bạn là chuyên gia tư vấn PC tại cửa hàng Việt Nam..."
          User message:  "Khách yêu cầu: '...'
                         Cấu hình: CPU: i3-12100 (1.9M), GPU: RX7600 (7.5M)...
                         Tổng: 12.3M | Ngân sách: 15M | Điểm: 100/100
                         Viết 3-4 câu giải thích..."
          → Groq trả về đoạn văn tiếng Việt tự nhiên
          → Nếu lỗi: fallback về mockGenerateExplanation()
```

---

### Bước 5 — Trả Về Client

```json
HTTP 200 OK
{
  "success": true,
  "message": "✅ PC build generated successfully",
  "data": {
    "query": "tôi muốn mua máy tính 15 củ để chơi game",
    "analysis": {
      "buildType": "gaming",
      "budget": 15000000,
      "cpuPreference": "performance",
      "confidence": 0.95
    },
    "build": {
      "purpose": "gaming",
      "budget_total": 15000000,
      "budget_allocation": { "cpu": 3300000, "gpu": 5100000, "..." },
      "components": {
        "cpu":      { "product_id": 42, "product_name": "Intel Core i3-12100", "price": 1900000, "specs": {...} },
        "mainboard":{ "product_id": 43, "product_name": "Gigabyte H610M S2H DDR4", "price": 1300000 },
        "ram":      { "product_id": 20, "product_name": "Corsair Vengeance 16GB DDR4", "price": 1800000 },
        "gpu":      { "product_id": 15, "product_name": "Sapphire Pulse RX 6600 8GB", "price": 5200000 },
        "storage":  { "..." },
        "cooler":   { "..." },
        "psu":      { "..." },
        "case":     { "..." }
      },
      "estimated_total_cost": 13480000,
      "cost_over_budget": -1520000,
      "compatibility": {
        "compatibility_score": 100,
        "is_compatible": true,
        "checks": [ ... 7 quy tắc ... ]
      }
    },
    "explanation": "Chúng tôi đề xuất cấu hình này vì nó đáp ứng tốt nhu cầu gaming..."
  }
}
```

### Sơ Đồ Luồng Lỗi

```
Lỗi có thể xảy ra tại:          Phản hồi trả về:
─────────────────────────────    ─────────────────────────────────────────
Bước 0: query rỗng           →  HTTP 400 "Query is required"
Bước 1: không tìm ra budget  →  HTTP 500 "Vui lòng cho biết ngân sách..."
Bước 3: không tìm ra CPU     →  HTTP 500 "No CPU found within budget"
Bước 3: không tìm mainboard  →  HTTP 500 "No compatible Mainboard found"
Bước 3: không tìm RAM        →  HTTP 500 "No compatible RAM found"
Bước 3: không tìm Storage    →  HTTP 500 "No Storage found within budget"
Bước 3: không tìm Cooler     →  HTTP 500 "No compatible Cooler found"
Bước 3: không tìm PSU        →  HTTP 500 "No suitable PSU found"
Bước 3: không tìm Case       →  HTTP 500 "No suitable Case found"
Bước 4: Groq lỗi             →  Tự động dùng mock explanation (không crash)
```

---

## Dịch Vụ AI & Chế Độ Mock

### Chế Độ Mock (`USE_MOCK_AI=true`)

Khi `USE_MOCK_AI=true` trong file `.env`, hệ thống không gọi Gemini API. Thay vào đó dùng logic regex để phân tích tiếng Việt.

**Phân Tích Ngân Sách** — `parseBudgetFromQuery(query)`:
| Cú pháp nhập | Kết quả |
|--------------|---------|
| `"25 triệu"` | 25.000.000 |
| `"25triệu"` | 25.000.000 |
| `"25tr"` | 25.000.000 |
| `"25000000"` | 25.000.000 |
| `"40,000,000"` | 40.000.000 |

**Nhận Diện Loại Build** — `detectBuildType(query)` — kiểm tra theo thứ tự ưu tiên:
| Thứ tự | Từ khóa nhận diện | Kết quả |
|--------|-------------------|---------|
| 1 | (game/gaming) + (3d/render/đồ họa) cùng lúc | `gaming_workstation` |
| 2 | stream, obs, twitch, youtube live, phat song | `streaming` |
| 3 | edit, chinh sua, premiere, davinci, photoshop | `editing` |
| 4 | ai, machine learning, pytorch, tensorflow | `ai_ml` |
| 5 | server, nas, luu tru, home server, plex | `home_server` |
| 6 | re nhat, tiet kiem, budget, gia re | `budget` |
| 7 | gaming, game, chien game, fps, moba, aaa | `gaming` |
| 8 | workstation, do hoa, render, 3d, kien truc | `workstation` |
| 9 | van phong, office, hoc, word, excel | `office` |
| 10 | (mặc định) | `gaming` |

**Ưu Tiên CPU/GPU Mặc Định Theo Loại Build:**
| Build Type | cpuPreference | gpuPreference |
|-----------|---------------|---------------|
| gaming | performance | performance |
| workstation | performance | balanced |
| gaming_workstation | performance | performance |
| streaming | performance | performance |
| editing | performance | balanced |
| ai_ml | performance | performance |
| office | balanced | **none** |
| home_server | balanced | **none** |
| budget | **budget** | **budget** |

### Chế Độ AI Thật (`USE_MOCK_AI=false`)

Yêu cầu `GROQ_API_KEY` hợp lệ trong `.env`. Dùng model `llama-3.3-70b-versatile` qua Groq API.

**analyzeRequest** — Groq phân tích câu hỏi và trả về JSON:
```json
{
  "intent": "build_pc",
  "buildType": "gaming",
  "budget": 25000000,
  "cpuPreference": "balanced",
  "gpuPreference": "performance",
  "storageSize": 500,
  "confidence": 0.95,
  "explanation": "Build PC gaming với ngân sách 25 triệu đồng"
}
```

**generateBuildExplanation** — Groq viết đoạn văn 3-4 câu tiếng Việt giải thích về bộ PC đã chọn, lý do chọn, điểm mạnh và lưu ý.

> **Tốc độ thực tế:** ~1-1.3 giây cho toàn bộ quy trình (phân tích + auto-build + giải thích).

---

## Thuật Toán Auto-Build

### Phân Bổ Ngân Sách Theo Mục Đích (9 Loại Build)

| Linh Kiện | gaming | workstation | gaming_workstation | streaming | editing | ai_ml | office | home_server | budget |
|-----------|--------|-------------|-------------------|-----------|---------|-------|--------|-------------|--------|
| CPU | 22% | 28% | 25% | 26% | 28% | 20% | 25% | 20% | 22% |
| Mainboard | 10% | 12% | 10% | 10% | 10% | 10% | 20% | 15% | 18% |
| RAM | 12% | 20% | 16% | 14% | 22% | 18% | 15% | 25% | 15% |
| GPU | **34%** | 18% | 28% | 28% | 14% | **36%** | **0%** | **0%** | 20% |
| Storage | 8% | 10% | 9% | 8% | **14%** | 8% | 15% | **25%** | 12% |
| PSU | 7% | 6% | 6% | 7% | 6% | 5% | 10% | 10% | 8% |
| Cooler | 4% | 3% | 3% | 4% | 3% | 2% | 5% | 3% | 3% |
| Case | 3% | 3% | 3% | 3% | 3% | 1% | 10% | 2% | 2% |

**In đậm** = trọng tâm phân bổ của loại build đó.

### Logic Chọn Linh Kiện

1. **CPU** — Lọc theo giá ≤ ngân sách CPU, sau đó:
   - `performance`: sắp xếp theo số nhân (nhiều nhất)
   - `budget`: sắp xếp theo giá (rẻ nhất)
   - `balanced`: sắp xếp theo tỉ lệ số nhân/giá

2. **Mainboard** — Lọc giá ≤ ngân sách VÀ `socket === cpu.specs.socket`, chọn rẻ nhất

3. **RAM** — Lọc giá ≤ ngân sách VÀ `type === mainboard.specs.ram_type`, ưu tiên dung lượng lớn, sau đó tốc độ

4. **GPU** (bỏ qua nếu văn phòng hoặc gpuPreference=none) — Lọc theo giá ≤ ngân sách:
   - `performance`: sắp xếp theo VRAM (nhiều nhất)
   - `budget`: sắp xếp theo giá (rẻ nhất)
   - `balanced`: sắp xếp theo VRAM/giá

5. **Storage** — Lọc giá ≤ ngân sách, ưu tiên dung lượng ≥ preferredSize, sau đó tốc độ đọc/ghi

6. **Tản Nhiệt** — Lọc giá ≤ ngân sách VÀ socket nằm trong `supported_sockets` VÀ `max_tdp >= cpu.tdp`

7. **PSU** — Tính `wattage_cần = (cpu.tdp + gpu.tdp) × 1.3`, lọc giá ≤ ngân sách VÀ `wattage >= wattage_cần`

8. **Case** — Lọc giá ≤ ngân sách VÀ `max_gpu_length_mm >= gpu.length_mm` VÀ `max_cooler_height_mm >= cooler.height_mm`

### Sau Khi Chọn Xong
- Tính `estimated_total_cost` (tổng giá tất cả linh kiện)
- Tính `cost_over_budget` (tổng - ngân sách; âm = còn dư ngân sách)
- Chạy `CompatibilityService.checkBuildCompatibility()` để lấy điểm tương thích cuối cùng

---

## Luồng Xử Lý

### Toàn Bộ Quy Trình Build PC bằng AI
```
Người dùng: "Build PC gaming 25 triệu"
        │
        ▼
[POST /api/ai/build]
        │
        ▼
aiService.orchestrateBuildPC("Build PC gaming 25 triệu")
        │
   ┌────▼────┐
   │ BƯỚC 1  │ analyzeRequest(query)
   │         │──► parseBudgetFromQuery → 25.000.000đ
   │         │──► detectBuildType → "gaming"
   │         │──► return { budget: 25M, buildType: "gaming", cpuPref: "performance", ... }
   └────┬────┘
        │
   ┌────▼────┐
   │ BƯỚC 2  │ AutoBuildService.autoBuild(25M, { purpose: "gaming", ... })
   │         │──► Phân bổ: cpu=5.5M gpu=9M ram=3M mainboard=2M ...
   │         │──► DB: lấy tất cả CPU, Mainboard, RAM, GPU, ...
   │         │──► Chọn CPU: i5-13400F (4.5M, 6 nhân, LGA1700) ✓
   │         │──► Chọn Mainboard: B660M DDR4 (1.8M, LGA1700) ✓
   │         │──► Chọn RAM: 16GB DDR4-3200 (1.5M) ✓
   │         │──► Chọn GPU: RTX 3060 (7.5M, 200W, 285mm) ✓
   │         │──► Chọn Storage: 500GB NVMe (800K) ✓
   │         │──► Chọn Tản nhiệt: Hyper 212 (480K, LGA1700, TDP 150W) ✓
   │         │──► PSU: wattage_cần = (65+200)×1.3 = 345W → 650W Corsair (700K) ✓
   │         │──► Case: GPU 285mm, tản nhiệt 155mm → ATX case (700K) ✓
   │         │──► Tổng: 16.280.000đ (tiết kiệm: 8.720.000đ)
   │         │──► CompatibilityService → điểm: 100/100 ✓
   └────┬────┘
        │
   ┌────▼────┐
   │ BƯỚC 3  │ generateBuildExplanation(query, build)
   │         │──► "[MOCK] Đây là bộ PC gaming được tối ưu..."
   └────┬────┘
        │
        ▼
Trả kết quả đầy đủ về cho client
```

### Luồng Kiểm Tra Tương Thích
```
POST /api/compatibility/check  { cpuId, mainboardId, ramId, gpuId, ... }
        │
        ▼
CompatibilityService.checkBuildCompatibility(componentIds)
        │
        ├─► Lấy 8 linh kiện từ DB
        │
        ├─► Quy tắc 1: CPU_SOCKET_MATCH
        │     cpu.specs.socket === mainboard.specs.socket?
        │     LGA1700 === LGA1700 → ĐẠT ✓
        │
        ├─► Quy tắc 2: RAM_TYPE_SUPPORT
        │     ram.specs.type === mainboard.specs.ram_type?
        │     DDR4 === DDR4 → ĐẠT ✓
        │
        ├─► Quy tắc 3: PSU_WATTAGE_SUFFICIENT
        │     psu.wattage >= (cpu.tdp + gpu.tdp) × 1.3?
        │     650W >= 345W → ĐẠT ✓
        │
        ├─► Quy tắc 4: COOLER_SOCKET_SUPPORT
        │     cooler.supported_sockets.includes(cpu.socket)?
        │     ["LGA1700",...].includes("LGA1700") → ĐẠT ✓
        │
        ├─► Quy tắc 5: COOLER_TDP_SUPPORT
        │     cooler.max_tdp >= cpu.tdp?
        │     150W >= 65W → ĐẠT ✓
        │
        ├─► Quy tắc 6: GPU_CASE_SIZE_FIT
        │     case.max_gpu_length_mm >= gpu.length_mm?
        │     380mm >= 285mm → ĐẠT ✓
        │
        └─► Quy tắc 7: COOLER_CASE_SIZE_FIT
              case.max_cooler_height_mm >= cooler.height_mm?
              165mm >= 155mm → ĐẠT ✓

Điểm = 100 - (0 lỗi × 25) - (0 cảnh báo × 10) = 100
```

---

## Các Trường Hợp Test & Ví Dụ

### Kịch Bản 1: PC Gaming 25 triệu
```bash
curl -X POST http://localhost:5000/api/ai/build \
  -H "Content-Type: application/json" \
  -d '{"query": "Build PC gaming 25 trieu"}'
```
**Kết quả thực tế (Groq):** budget=25M, buildType=gaming, tổng=**15.28M**, điểm=**100/100**, thời gian≈1.3s

Linh kiện được chọn:
- CPU: Intel Core i3-12100 (1.9M, LGA1700)
- Mainboard: Gigabyte H610M S2H DDR4 (1.3M)
- RAM: Corsair Vengeance 16GB DDR4 (1.8M)
- GPU: Gigabyte RX 7600 8GB (7.5M)
- Storage: Kingston NV2 500GB NVMe (950K)
- Cooler: ID-Cooling SE-214-XT (480K)
- PSU: Xigmatek FURY 400W Bronze (650K)
- Case: Deepcool MATREXX 30 SI (700K)

### Kịch Bản 2: PC Gaming 50 triệu (không dấu)
```bash
curl -X POST http://localhost:5000/api/ai/build \
  -H "Content-Type: application/json" \
  -d '{"query": "build pc chien game 50tr"}'
```
**Kết quả mong đợi:** budget=50M, buildType=gaming, tổng≈35M, điểm=100

### Kịch Bản 3: Workstation 40 triệu
```bash
curl -X POST http://localhost:5000/api/ai/build \
  -H "Content-Type: application/json" \
  -d '{"query": "PC workstation 40 trieu de render 3D"}'
```
**Kết quả mong đợi:** budget=40M, buildType=workstation, CPU/RAM được ưu tiên nhiều hơn, điểm=100

### Kịch Bản 4: PC Văn Phòng 10 triệu
```bash
curl -X POST http://localhost:5000/api/ai/build \
  -H "Content-Type: application/json" \
  -d '{"query": "PC van phong 10 trieu"}'
```
**Kết quả thực tế (Groq):** budget=10M, buildType=office, KHÔNG có GPU rời, tổng=**6.23M**, điểm=**100/100**, thời gian≈1s

### Test Kiểm Tra Tương Thích
```bash
curl -X POST http://localhost:5000/api/compatibility/check \
  -H "Content-Type: application/json" \
  -d '{
    "cpuId": 1,
    "mainboardId": 10,
    "ramId": 20,
    "gpuId": 30,
    "storageId": 40,
    "psuId": 50,
    "coolerId": 60,
    "caseId": 70
  }'
```

### Các Trường Hợp Lỗi
```bash
# Không có ngân sách
curl -X POST http://localhost:5000/api/ai/build \
  -d '{"query": "build PC gaming"}'
# Lỗi: "Vui lòng cho biết ngân sách. Ví dụ: Build PC gaming 25 triệu"

# Thiếu query
curl -X POST http://localhost:5000/api/ai/build \
  -d '{}'
# Lỗi 400: "Query is required"
```

---

## Cài Đặt & Chạy Dự Án

### Yêu Cầu Hệ Thống
- Node.js 18+
- MSSQL Server (cục bộ, cổng 1433)
- Database `PCComponentStore` đã được tạo

### Cài Đặt & Khởi Động
```bash
npm install
npm start          # ⚠️ PHẢI dùng npm start, không dùng node src/app.js
# Server chạy tại http://localhost:5000
# Swagger UI: http://localhost:5000/api-docs
```

> **Lưu ý:** Entry point thực tế là `src/server.js` (được gọi qua `npm start`). Chạy trực tiếp `node src/app.js` sẽ bị treo ở bước kết nối database.

### Seed Dữ Liệu AI Build

**Bước 1 — Script Node.js** (tạo category + sản phẩm cơ bản):
```bash
node scripts/setup-ai-build.js
```

**Bước 2 — File SQL mở rộng** (chạy trong SSMS theo thứ tự):
```sql
-- Chạy file 1 trước:
migrations/seed_more_products.sql       -- ~40 sản phẩm mới
-- Sau đó chạy file 2:
migrations/seed_extended_products.sql   -- ~65 sản phẩm bổ sung
```

Tổng sản phẩm sau khi seed đầy đủ (~130+ sản phẩm):
| Danh mục | Số sản phẩm | Dải giá |
|----------|------------|---------|
| CPU | ~15 | 150K (box cooler) → 18M (R9 7950X) |
| VGA | ~12 | 1.5M (GT 1030) → 48M (RTX 4090) |
| Mainboard | ~15 | 1.2M (H610M) → 14M (ROG Crosshair) |
| RAM | ~14 | 450K (8GB DDR4) → 12M (96GB DDR5) |
| Storage | ~14 | 350K (120GB SATA) → 6.5M (2TB NVMe) |
| PSU | ~12 | 550K (450W) → 10M (1200W Platinum) |
| Cooler | ~15 | 150K (Stock Intel) → 5.5M (AIO 360mm) |
| Case | ~15 | 400K (budget mATX) → 5M (Full Tower) |

---

## Cấu Hình Môi Trường

```env
# Server
PORT=5000

# Kết nối Database
DB_USER=sa
DB_PASSWORD=12345
DB_SERVER=127.0.0.1
DB_PORT=1433
DB_NAME=PCComponentStore

# JWT
JWT_SECRET=SieuCapMatKhau
JJWT_EXPIRES_IN=1d

# Bảo mật
BCRYPT_SALT_ROUNDS=10

# Cloudinary (upload ảnh)
CLOUDINARY_CLOUD_NAME=ten_cloud_cua_ban
CLOUDINARY_API_KEY=api_key_cua_ban
CLOUDINARY_API_SECRET=api_secret_cua_ban

# AI (Groq - miễn phí tại console.groq.com)
GROQ_API_KEY=your_groq_api_key
USE_MOCK_AI=false   # false = gọi Groq API thật (khuyến nghị)
                    # true = chế độ mock, không cần API key (dùng khi offline/dev)
```

### Chuyển Đổi Giữa Mock và AI Thật
```bash
# Môi trường phát triển / kiểm thử (không cần API key, hoạt động offline):
USE_MOCK_AI=true

# Môi trường production với AI thật (khuyến nghị):
USE_MOCK_AI=false
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
```

### Lấy Groq API Key (Miễn Phí)
1. Truy cập [console.groq.com](https://console.groq.com)
2. Đăng nhập bằng Google
3. Vào mục **API Keys** ở thanh menu bên trái
4. Click **Create API Key**, đặt tên tùy ý
5. Sao chép key (dạng `gsk_...`) vào `.env` dưới tên `GROQ_API_KEY`
6. Đặt `USE_MOCK_AI=false`

> **Giới hạn free tier Groq:** 14.400 request/ngày, ~6.000 token/phút — đủ dùng cho dự án học tập và production quy mô nhỏ.

> **Fallback tự động:** Nếu Groq gặp lỗi (hết quota, mất mạng...), hệ thống tự động chuyển sang chế độ mock — không bao giờ crash.

---

## Cấu Trúc Thư Mục

```
src/
├── app.js                          # Điểm khởi chạy
├── config/
│   └── db.js                       # Kết nối MSSQL
├── controllers/
│   ├── aiController.js             # Xử lý các endpoint AI
│   ├── compatibilityController.js  # Xử lý kiểm tra tương thích
│   ├── productController.js
│   └── ...
├── models/
│   ├── specificationModelV2.js     # CRUD specs_json + truy vấn theo danh mục
│   ├── productModel.js
│   └── ...
├── routes/
│   ├── aiRoute.js                  # /api/ai/*
│   ├── compatibilityRoute.js       # /api/compatibility/*
│   ├── specificationRouteV2.js     # /api/specs/v2/*
│   └── rootRouter.js               # Tổng hợp tất cả route
├── services/
│   ├── aiService.js                # Groq + mock, điều phối quy trình
│   ├── autoBuildService.js         # Phân bổ ngân sách + chọn linh kiện
│   └── compatibilityService.js     # Kiểm tra 7 quy tắc tương thích
└── utils/
    ├── compatibilityRules.js       # Định nghĩa các quy tắc tương thích
    └── specSchemas.js              # Schema JSON specs theo danh mục

scripts/
└── setup-ai-build.js               # Script cài đặt DB + seed dữ liệu

migrations/
└── ...                             # Các file migration SQL
```
