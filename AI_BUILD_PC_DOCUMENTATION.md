# Tài Liệu Tính Năng Build PC Bằng AI

## Mục Lục
1. [Tổng Quan](#1-tổng-quan)
2. [Kiến Trúc Hệ Thống](#2-kiến-trúc-hệ-thống)
3. [Cơ Sở Dữ Liệu](#3-cơ-sở-dữ-liệu)
4. [Cấu Trúc Specs Từng Loại Linh Kiện](#4-cấu-trúc-specs-từng-loại-linh-kiện)
5. [Hướng Dẫn Thêm Sản Phẩm Mới](#5-hướng-dẫn-thêm-sản-phẩm-mới)
6. [Quy Tắc Tương Thích](#6-quy-tắc-tương-thích)
7. [Các Loại Build & Phân Bổ Ngân Sách](#7-các-loại-build--phân-bổ-ngân-sách)
8. [API Specs & Tương Thích](#8-api-specs--tương-thích)
9. [API AI Build PC](#9-api-ai-build-pc)
10. [Luồng Hoạt Động: POST /api/ai/build](#10-luồng-hoạt-động-post-apiaibuild)
11. [Dịch Vụ AI & Chế Độ Mock](#11-dịch-vụ-ai--chế-độ-mock)
12. [Cài Đặt & Chạy Dự Án](#12-cài-đặt--chạy-dự-án)
13. [Test Nhanh](#13-test-nhanh)

---

## 1. Tổng Quan

Backend của cửa hàng linh kiện PC — REST API xây dựng bằng:

| Thành phần | Chi tiết |
|---|---|
| Runtime | Node.js + Express.js, cổng **5000** |
| Database | Microsoft SQL Server — database `PCComponentStore` |
| AI | **Groq API** (`llama-3.3-70b-versatile`) — miễn phí, 14.400 req/ngày |
| Mock AI | Bật `USE_MOCK_AI=true` để chạy không cần API key |
| Auth | JWT (JSON Web Token) |
| API Docs | Swagger UI tại `http://localhost:5000/api-docs` |

---

## 2. Kiến Trúc Hệ Thống

```
Client Request
      │
      ▼
┌─────────────────────────────────────────┐
│            Express Router               │
│  /api/ai  /api/specifications           │
│  /api/compatibility  /api/products ...  │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│             Controllers                 │
│  aiController                           │
│  specificationControllerV2              │
│  compatibilityController                │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│              Services                   │
│  aiService ──► autoBuildService         │
│                    │                    │
│            compatibilityService         │
│                                         │
│  specificationServiceV2                 │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│               Models                   │
│  specificationModelV2                   │
│  productModel  ...                      │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│          MSSQL Server                   │
│  PRODUCT  PRODUCT_SPEC  CATEGORY  ...   │
└─────────────────────────────────────────┘
```

### Luồng AI Build PC

```
POST /api/ai/build  { query: "Build PC gaming 25 triệu" }
         │
         ▼
   aiController.buildPC()
         │
         ▼
   aiService.orchestrateBuildPC()
    ├── 1. analyzeRequest()       ← Groq phân tích query → budget, buildType
    ├── 2. autoBuildService.autoBuild()
    │        ├── Tính budget allocation theo buildType
    │        ├── Lấy sản phẩm từ PRODUCT_SPEC (8 loại song song)
    │        ├── Chọn linh kiện tốt nhất trong ngân sách
    │        └── Kiểm tra tương thích 7 quy tắc
    └── 3. generateBuildExplanation()  ← Groq viết giải thích tiếng Việt
```

---

## 3. Cơ Sở Dữ Liệu

### Bảng liên quan đến AI Build

#### PRODUCT
```sql
product_id      INT           -- PK
name            NVARCHAR(255)
description     NVARCHAR(MAX)
price           DECIMAL(18,2) -- Đơn vị: VNĐ
stock_quantity  INT
category_id     INT           -- FK → CATEGORY
brand           NVARCHAR(100)
status          NVARCHAR(50)
image_url       NVARCHAR(500)
```

#### PRODUCT_SPEC ← **Bảng chứa thông số kỹ thuật AI đọc**
```sql
spec_id     INT           -- PK, auto increment
product_id  INT           -- FK → PRODUCT
spec_name   NVARCHAR(255) -- Tên thông số (vd: "socket", "cores", "tdp")
spec_value  NVARCHAR(MAX) -- Giá trị (vd: "LGA1700", "14", "125")
```

> **Lưu ý quan trọng:**
> - Tất cả `spec_value` được lưu dạng **string** (kể cả số và boolean)
> - Code tự động convert khi đọc: `"14"` → `14`, `"true"` → `true`, `'["LGA1700","AM5"]'` → array
> - Array lưu dạng JSON string: `'["LGA1700","AM5","AM4"]'`

#### CATEGORY
```sql
category_id  INT           -- PK
name         NVARCHAR(255) -- CPU, VGA, Mainboard, RAM, Storage, PSU, Cooler, Case
description  NVARCHAR(MAX)
```

### Danh Mục Chuẩn Cho AI Build

| category_id | name | Ghi chú |
|---|---|---|
| 1 | CPU | Bộ vi xử lý |
| 2 | VGA | Card đồ họa |
| 3 | Mainboard | Bo mạch chủ |
| 4 | PC Bộ | Máy tính lắp sẵn (AI không dùng) |
| 5 | RAM | Bộ nhớ trong |
| 6 | Storage | Ổ cứng / SSD |
| 7 | PSU | Nguồn máy tính |
| 8 | Cooler | Tản nhiệt CPU |
| 9 | Case | Vỏ máy tính |

---

## 4. Cấu Trúc Specs Từng Loại Linh Kiện

Mỗi loại linh kiện yêu cầu các `spec_name` cụ thể. Các field **★ bắt buộc** — thiếu thì AI sẽ bỏ qua sản phẩm đó.

### CPU (category_id = 1)

| spec_name | Ví dụ | Bắt buộc | Dùng để |
|---|---|---|---|
| socket | `LGA1700` / `AM5` | ★ | Khớp với Mainboard |
| cores | `14` | ★ | Chọn CPU mạnh nhất |
| threads | `20` | | Thông tin |
| tdp | `125` | ★ | Tính wattage PSU + kiểm tra cooler |
| generation | `13th Gen Intel` | | Thông tin |
| base_clock | `3.5` | | Thông tin (GHz) |
| boost_clock | `5.1` | | Thông tin (GHz) |
| cache_mb | `24` | | Thông tin |
| series | `Core i5` | | Thông tin |

### VGA (category_id = 2)

| spec_name | Ví dụ | Bắt buộc | Dùng để |
|---|---|---|---|
| memory_gb | `12` | ★ | Chọn GPU mạnh nhất |
| memory_type | `GDDR6X` | ★ | Thông tin |
| length_mm | `267` | ★ | Kiểm tra vừa Case |
| power_pin | `16-pin` | ★ | Thông tin |
| tdp | `220` | ★ | Tính wattage PSU cần |
| ray_tracing | `true` | | Thông tin |
| boost_clock | `2.61` | | Thông tin (GHz) |

### Mainboard (category_id = 3)

| spec_name | Ví dụ | Bắt buộc | Dùng để |
|---|---|---|---|
| socket | `LGA1700` | ★ | Phải khớp CPU.socket |
| chipset | `B760` | ★ | Thông tin |
| ram_type | `DDR4` / `DDR5` | ★ | Phải khớp RAM.type |
| form_factor | `ATX` / `mATX` | ★ | Thông tin |
| ram_slots | `4` | | Thông tin |
| m2_slots | `2` | | Thông tin |

### RAM (category_id = 5)

| spec_name | Ví dụ | Bắt buộc | Dùng để |
|---|---|---|---|
| type | `DDR4` / `DDR5` | ★ | Phải khớp Mainboard.ram_type |
| capacity_gb | `32` | ★ | Chọn RAM lớn nhất |
| speed_mhz | `5600` | ★ | Chọn RAM nhanh nhất |
| kit_size | `2x16` | | Thông tin |
| latency | `36` | | Thông tin |
| voltage | `1.1` | | Thông tin |

### Storage (category_id = 6)

| spec_name | Ví dụ | Bắt buộc | Dùng để |
|---|---|---|---|
| capacity_gb | `1000` | ★ | Chọn đủ dung lượng |
| type | `SSD` / `HDD` | ★ | Thông tin |
| interface | `NVMe` / `SATA` | ★ | Thông tin |
| form_factor | `M.2` / `2.5"` | | Thông tin |
| speed_mbps | `5150` | ★ | Chọn ổ nhanh nhất |

### PSU (category_id = 7)

| spec_name | Ví dụ | Bắt buộc | Dùng để |
|---|---|---|---|
| wattage | `750` | ★ | Phải ≥ (CPU.tdp + GPU.tdp) × 1.3 |
| certification | `80 Plus Gold` | ★ | Thông tin |
| modular | `Full` / `Semi` / `Non` | | Thông tin |

### Cooler (category_id = 8)

| spec_name | Ví dụ | Bắt buộc | Dùng để |
|---|---|---|---|
| type | `Air` / `AIO` | ★ | Thông tin |
| supported_sockets | `["LGA1700","AM5","AM4"]` | ★ | Phải chứa CPU.socket |
| max_tdp | `220` | ★ | Phải ≥ CPU.tdp |
| height_mm | `155` | ★ | Phải ≤ Case.max_cooler_height_mm |
| noise_db | `28` | | Thông tin |
| fans | `1` | | Thông tin |

> **AIO Cooler**: `height_mm` là chiều cao pump block (~50mm), không phải radiator → luôn vừa case.

### Case (category_id = 9)

| spec_name | Ví dụ | Bắt buộc | Dùng để |
|---|---|---|---|
| form_factor | `ATX` / `mATX` | ★ | Thông tin |
| max_gpu_length_mm | `360` | ★ | Phải ≥ GPU.length_mm |
| max_cooler_height_mm | `185` | ★ | Phải ≥ Cooler.height_mm |
| fans_included | `2` | | Thông tin |

---

## 5. Hướng Dẫn Thêm Sản Phẩm Mới

### Cách thêm 1 sản phẩm đúng chuẩn

```sql
USE PCComponentStore;

DECLARE @pid INT;

-- Bước 1: INSERT vào PRODUCT
INSERT INTO PRODUCT (name, description, price, stock_quantity, category_id, brand)
VALUES (N'Intel Core i5-14600K', N'14 Cores / 20 Threads, LGA1700, 125W', 6500000, 50, 1, 'Intel');

SET @pid = SCOPE_IDENTITY();  -- Lấy ID vừa insert

-- Bước 2: INSERT specs vào PRODUCT_SPEC
INSERT INTO PRODUCT_SPEC (product_id, spec_name, spec_value) VALUES
(@pid, 'socket',      'LGA1700'),
(@pid, 'cores',       '14'),
(@pid, 'threads',     '20'),
(@pid, 'tdp',         '125'),
(@pid, 'generation',  '14th Gen Intel'),
(@pid, 'base_clock',  '3.5'),
(@pid, 'boost_clock', '5.3'),
(@pid, 'series',      'Core i5');
```

### Quy tắc bắt buộc khi thêm sản phẩm

1. **Số lưu dạng string**: `'125'` không phải `125` — code tự convert
2. **Boolean lưu dạng string**: `'true'` / `'false'`
3. **Array lưu dạng JSON string**: `'["LGA1700","AM5"]'` — ngoặc kép bên trong
4. **Sản phẩm không có specs** → AI bỏ qua hoàn toàn
5. **Thiếu field bắt buộc** → AI bỏ qua sản phẩm đó

### Kiểm tra compatibility trước khi thêm

| Cặp linh kiện | Field phải khớp |
|---|---|
| CPU ↔ Mainboard | `CPU.socket == Mainboard.socket` |
| Mainboard ↔ RAM | `Mainboard.ram_type == RAM.type` |
| GPU ↔ Case | `GPU.length_mm <= Case.max_gpu_length_mm` |
| Cooler ↔ CPU | `CPU.socket ∈ Cooler.supported_sockets` |
| Cooler ↔ CPU | `Cooler.max_tdp >= CPU.tdp` |
| Cooler ↔ Case | `Cooler.height_mm <= Case.max_cooler_height_mm` |
| PSU ↔ Build | `PSU.wattage >= (CPU.tdp + GPU.tdp) × 1.3` |

---

## 6. Quy Tắc Tương Thích

File: `src/utils/compatibilityRules.js`

| Rule ID | Tên | Mô tả | Mức độ |
|---|---|---|---|
| CPU_SOCKET_MATCH | Khớp socket | CPU.socket == Mainboard.socket | ERROR |
| RAM_TYPE_SUPPORT | Loại RAM | Mainboard.ram_type == RAM.type | ERROR |
| PSU_WATTAGE_SUFFICIENT | Đủ công suất | PSU.wattage ≥ (CPU.tdp + GPU.tdp) × 1.3 | WARNING |
| COOLER_SOCKET_SUPPORT | Cooler hỗ trợ socket | CPU.socket ∈ Cooler.supported_sockets | ERROR |
| COOLER_TDP_SUPPORT | Cooler đủ TDP | Cooler.max_tdp ≥ CPU.tdp | WARNING |
| GPU_CASE_SIZE_FIT | GPU vừa case | GPU.length_mm ≤ Case.max_gpu_length_mm | ERROR |
| COOLER_CASE_SIZE_FIT | Cooler vừa case | Cooler.height_mm ≤ Case.max_cooler_height_mm | ERROR |

### Tính điểm tương thích
```
Điểm = 100 - (số lỗi ERROR × 25) - (số cảnh báo WARNING × 10)
```

| Điểm | Đánh giá |
|---|---|
| 100 | Hoàn toàn tương thích |
| 75-99 | Có cảnh báo nhỏ |
| 50-74 | Có vấn đề cần xem xét |
| < 50 | Không tương thích, cần thay linh kiện |

---

## 7. Các Loại Build & Phân Bổ Ngân Sách

### Nhận diện loại build từ query (`detectBuildType`)

Query của người dùng được phân tích theo thứ tự ưu tiên:

| Ưu tiên | Build Type | Từ khóa nhận diện |
|---|---|---|
| 1 | `gaming_workstation` | "game" + "3d/render/đồ họa" (kết hợp) |
| 2 | `streaming` | stream, obs, twitch, content creator |
| 3 | `editing` | edit, premiere, davinci, photoshop, video clip |
| 4 | `ai_ml` | AI, machine learning, pytorch, tensorflow |
| 5 | `home_server` | server, nas, lưu trữ, plex |
| 6 | `budget` | rẻ nhất, tiết kiệm, giá rẻ, đơn giản |
| 7 | `gaming` | gaming, game, fps, moba, aaa |
| 8 | `workstation` | workstation, đồ họa, render, 3d, kiến trúc |
| 9 | `office` | văn phòng, office, học tập, word, excel |
| — | `gaming` | Mặc định nếu không khớp |

### Phân bổ ngân sách theo từng loại build (%)

| Linh kiện | gaming | workstation | office | gaming_ws | streaming | editing | ai_ml | budget | home_server |
|---|---|---|---|---|---|---|---|---|---|
| CPU | 22 | 28 | 25 | 25 | 26 | 28 | 20 | 22 | 20 |
| Mainboard | 10 | 12 | 20 | 10 | 10 | 10 | 10 | 18 | 15 |
| RAM | 12 | 20 | 15 | 16 | 14 | 22 | 18 | 15 | 25 |
| GPU | 34 | 18 | 0 | 28 | 28 | 14 | 36 | 20 | 0 |
| Storage | 8 | 10 | 15 | 9 | 8 | 14 | 8 | 12 | 25 |
| PSU | 7 | 6 | 10 | 6 | 7 | 6 | 5 | 8 | 10 |
| Cooler | 4 | 3 | 5 | 3 | 4 | 3 | 2 | 3 | 3 |
| Case | 3 | 3 | 10 | 3 | 3 | 3 | 1 | 2 | 2 |

> `office` và `home_server` không có GPU (= 0).

### Nhận diện ngân sách từ query

| Cú pháp | Ví dụ | Kết quả |
|---|---|---|
| `X triệu` | "25 triệu" | 25.000.000 VNĐ |
| `X tr` | "30tr" | 30.000.000 VNĐ |
| `X củ` | "15 củ" | 15.000.000 VNĐ |
| Số nguyên ≥ 6 chữ số | "20000000" | 20.000.000 VNĐ |

---

## 8. API Specs & Tương Thích

### Quản lý Specs (PRODUCT_SPEC)

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/specifications/json` | Thêm/cập nhật specs cho sản phẩm |
| GET | `/api/specifications/json/:product_id` | Lấy specs của 1 sản phẩm |
| PATCH | `/api/specifications/json/:product_id` | Cập nhật specs |
| DELETE | `/api/specifications/json/:product_id` | Xóa specs |
| GET | `/api/specifications/category/:category_id` | Lấy tất cả sản phẩm có specs theo danh mục |
| POST | `/api/specifications/validate` | Validate specs không lưu |
| GET | `/api/specifications/schema/:category` | Xem schema của danh mục |
| GET | `/api/specifications/schemas` | Xem tất cả schemas |

**POST /api/specifications/json** — Thêm specs:
```json
{
  "product_id": 5,
  "category": "CPU",
  "specs": {
    "socket": "LGA1700",
    "cores": 14,
    "threads": 20,
    "tdp": 125,
    "generation": "13th Gen Intel"
  }
}
```

### Kiểm Tra Tương Thích

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/compatibility/check` | Kiểm tra 1 bộ build |
| POST | `/api/compatibility/validate-pair` | Kiểm tra cặp 2 linh kiện |
| GET | `/api/compatibility/rules` | Xem 7 quy tắc tương thích |

**POST /api/compatibility/check** — Kiểm tra build:
```json
{
  "cpuId": 1,
  "mainboardId": 5,
  "ramId": 10,
  "gpuId": 3,
  "storageId": 12,
  "psuId": 15,
  "coolerId": 18,
  "caseId": 21
}
```

Response:
```json
{
  "success": true,
  "data": {
    "compatible": true,
    "compatibility_score": 90,
    "errors": [],
    "warnings": ["PSU_WATTAGE_SUFFICIENT: PSU 650W khuyến nghị 750W+ cho hệ thống này"]
  }
}
```

---

## 9. API AI Build PC

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/ai/test` | Kiểm tra kết nối Groq API |
| POST | `/api/ai/analyze` | Phân tích query (không build) |
| POST | `/api/ai/build` | **Build PC hoàn chỉnh từ query** |
| POST | `/api/ai/recommendations` | Gợi ý linh kiện chung chung |

### GET /api/ai/test

Response khi dùng Mock mode:
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "✅ Running in MOCK mode - no real API calls",
    "mode": "MOCK"
  }
}
```

### POST /api/ai/analyze

Request:
```json
{ "query": "Tôi muốn build PC gaming 25 triệu" }
```

Response:
```json
{
  "success": true,
  "data": {
    "intent": "build_pc",
    "buildType": "gaming",
    "budget": 25000000,
    "cpuPreference": "performance",
    "gpuPreference": "performance",
    "storageSize": 500,
    "confidence": 0.95,
    "explanation": "Build PC gaming với ngân sách 25 triệu đồng"
  }
}
```

### POST /api/ai/build ← **API chính**

Request:
```json
{ "query": "Build PC gaming 25 triệu" }
```

Response thành công:
```json
{
  "success": true,
  "message": "✅ PC build generated successfully",
  "data": {
    "query": "Build PC gaming 25 triệu",
    "analysis": {
      "buildType": "gaming",
      "budget": 25000000
    },
    "build": {
      "purpose": "gaming",
      "budget_total": 25000000,
      "budget_allocation": {
        "cpu": 5500000,
        "mainboard": 2500000,
        "ram": 3000000,
        "gpu": 8500000,
        "storage": 2000000,
        "psu": 1750000,
        "cooler": 1000000,
        "case": 750000
      },
      "components": {
        "cpu": {
          "product_id": 5,
          "product_name": "Intel Core i5-13600K",
          "price": 5500000,
          "specs": { "socket": "LGA1700", "cores": 14, "tdp": 125 }
        },
        "mainboard": { "..." },
        "ram": { "..." },
        "gpu": { "..." },
        "storage": { "..." },
        "psu": { "..." },
        "cooler": { "..." },
        "case": { "..." }
      },
      "estimated_total_cost": 24800000,
      "cost_over_budget": -200000,
      "compatibility": {
        "compatible": true,
        "compatibility_score": 100,
        "errors": [],
        "warnings": []
      }
    },
    "explanation": "Đây là bộ PC gaming cân bằng hiệu năng và chi phí. CPU i5-13600K với 14 nhân xử lý mạnh mẽ, kết hợp RTX 4060 8GB đủ chơi game 1080p-1440p mượt mà. Tổng chi phí nằm trong ngân sách, độ tương thích đạt 100 điểm."
  }
}
```

Response lỗi (thiếu ngân sách):
```json
{
  "success": false,
  "message": "Vui lòng cho biết ngân sách. Ví dụ: 'Build PC gaming 25 triệu' hoặc 'PC workstation 40 triệu'"
}
```

---

## 10. Luồng Hoạt Động: POST /api/ai/build

```
┌─────────────────────────────────────────────────────────┐
│ BƯỚC 1: Nhận request                                    │
│   { query: "Build PC gaming 25 triệu" }                 │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ BƯỚC 2: aiService.analyzeRequest(query)                 │
│                                                         │
│  Groq mode: Gọi Llama 3.3 phân tích → JSON             │
│  Mock mode: Regex detect budget + buildType             │
│                                                         │
│  Output: { buildType, budget, cpuPref, gpuPref }        │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ BƯỚC 3: autoBuildService.autoBuild(budget, preferences) │
│                                                         │
│  3a. Tính budget allocation theo buildType              │
│      vd: gaming → gpu=34%, cpu=22%, mainboard=10%...    │
│                                                         │
│  3b. Lấy sản phẩm từ PRODUCT_SPEC (8 loại song song)   │
│      SELECT PRODUCT JOIN PRODUCT_SPEC                   │
│      → pivot rows → { specs: { socket, cores, tdp } }  │
│                                                         │
│  3c. Chọn linh kiện theo thứ tự:                        │
│      CPU → Mainboard (khớp socket)                      │
│         → RAM (khớp ram_type)                           │
│         → GPU (nếu không phải office/home_server)       │
│         → Storage                                       │
│         → Cooler (khớp socket + tdp)                    │
│         → PSU (đủ wattage)                              │
│         → Case (vừa GPU + Cooler)                       │
│                                                         │
│  3d. Kiểm tra 7 quy tắc tương thích                     │
│      → compatibility_score                              │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ BƯỚC 4: aiService.generateBuildExplanation()            │
│                                                         │
│  Groq mode: Gọi Llama 3.3 viết 3-4 câu tiếng Việt      │
│  Mock mode: Tạo câu mẫu từ template                     │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ BƯỚC 5: Trả kết quả                                     │
│   { query, analysis, build, explanation }               │
└─────────────────────────────────────────────────────────┘
```

### Thuật Toán Chọn Linh Kiện

| Loại | Tiêu chí chọn (trong budget) |
|---|---|
| CPU `performance` | Nhiều core nhất |
| CPU `budget` | Rẻ nhất |
| CPU `balanced` | Core/giá tốt nhất |
| GPU `performance` | VRAM nhiều nhất |
| GPU `budget` | Rẻ nhất |
| Mainboard | Rẻ nhất có đúng socket |
| RAM | Capacity lớn nhất, tie-break bằng speed |
| Storage | Ưu tiên đủ dung lượng yêu cầu, tie-break bằng speed |
| PSU | Rẻ nhất có đủ wattage |
| Cooler | Rẻ nhất hỗ trợ socket + đủ TDP |
| Case | Rẻ nhất vừa GPU + Cooler |

---

## 11. Dịch Vụ AI & Chế Độ Mock

### Groq API (chế độ thực)

- Model: `llama-3.3-70b-versatile`
- Free tier: 14.400 request/ngày, 6.000 token/phút
- Tốc độ: ~1-2 giây/request

### Mock Mode (không cần API key)

Bật trong `.env`:
```
USE_MOCK_AI=true
```

Khi mock:
- `analyzeRequest()` → dùng regex detect budget + buildType
- `generateBuildExplanation()` → trả template string cố định
- Tốc độ instant, không tốn quota

### File cấu hình

| File | Mục đích |
|---|---|
| `src/services/aiService.js` | Groq client, analyzeRequest, generateExplanation, orchestrate |
| `src/services/autoBuildService.js` | Budget allocation, chọn linh kiện, kiểm tra tương thích |
| `src/models/specificationModelV2.js` | Query PRODUCT_SPEC, pivot key-value → object |
| `src/utils/compatibilityRules.js` | Định nghĩa 7 quy tắc tương thích |
| `src/services/compatibilityService.js` | Thực thi kiểm tra, tính điểm |

---

## 12. Cài Đặt & Chạy Dự Án

### Yêu cầu

- Node.js ≥ 18
- SQL Server đang chạy với database `PCComponentStore`

### Các bước

```bash
# 1. Clone về
git clone <repo-url>
cd Backend

# 2. Cài dependencies
npm install

# 3. Tạo file .env
cp .env.example .env
# Chỉnh sửa DB_SERVER, DB_USER, DB_PASSWORD, GROQ_API_KEY

# 4. Chạy SQL seed (theo thứ tự trong SSMS)
#    - information.sql
#    - migrations/seed_ai_build_data.sql

# 5. Khởi động server
npm start
```

### File .env cần thiết

```env
# Database
DB_SERVER=localhost
DB_USER=sa
DB_PASSWORD=your_password
DB_NAME=PCComponentStore

# AI
GROQ_API_KEY=your_groq_api_key_here   # Lấy tại console.groq.com
USE_MOCK_AI=false                      # Đặt true để test không cần API key

# Server
PORT=5000
JWT_SECRET=your_jwt_secret
```

### Lấy Groq API Key (miễn phí)

1. Truy cập `console.groq.com`
2. Đăng ký / đăng nhập
3. Vào **API Keys** → **Create API Key**
4. Copy key dán vào `.env`

---

## 13. Test Nhanh

### Kiểm tra server chạy

```
GET http://localhost:5000/api/ai/test
```

### Test build PC (Swagger UI)

Truy cập `http://localhost:5000/api-docs` → mục **AI** → `POST /api/ai/build`

### Các query mẫu

| Query | Build type dự kiến | Ngân sách |
|---|---|---|
| "Build PC gaming 15 triệu" | gaming | 15M |
| "PC workstation render 3D 40 triệu" | workstation | 40M |
| "Máy tính văn phòng 10 triệu" | office | 10M |
| "Build PC streaming 30 củ" | streaming | 30M |
| "PC AI machine learning 60 triệu" | ai_ml | 60M |
| "Máy tính vừa game vừa làm đồ họa 50 triệu" | gaming_workstation | 50M |
| "PC rẻ nhất có thể 8 triệu" | budget | 8M |

### Query kiểm tra DB (chạy trong SSMS)

```sql
-- Kiểm tra số sản phẩm có specs theo từng danh mục
SELECT c.name AS category, COUNT(DISTINCT p.product_id) AS products_with_specs
FROM PRODUCT p
JOIN CATEGORY c ON p.category_id = c.category_id
JOIN PRODUCT_SPEC ps ON p.product_id = ps.product_id
GROUP BY c.name
ORDER BY c.name;

-- Xem specs của 1 sản phẩm
SELECT spec_name, spec_value
FROM PRODUCT_SPEC
WHERE product_id = 1;
```
