SWD392-PCS-PCComponentStore
Backend API – PC Component Store

==================================================
CÁCH CHẠY SERVER

CÀI NODE.JS

Yêu cầu:

Node.js >= 18

Kiểm tra:

node -v
npm -v

Nếu chưa có, tải tại:
https://nodejs.org

==================================================

CLONE PROJECT

git clone https://github.com/SWD392-PCS-PCComponentStore/Backend.git
cd Backend

==================================================

CÀI DEPENDENCIES

npm install

==================================================

TẠO FILE .env

Tạo file tên là: .env
Đặt cùng cấp với package.json

Nội dung file .env:

Giống với file .env.example

==================================================

CHẠY SERVER

Chạy development mode:

npm run dev

Hoặc:

npm start

==================================================

KIỂM TRA SERVER

Mở trình duyệt:

http://localhost:5000/

Nếu thấy:

{
"message": "API is running 🚀"
}

=> Server chạy thành công.

==================================================

SWAGGER (NẾU CÓ)

http://localhost:5000/api-docs

==================================================

NẾU BỊ LỖI

Thử:

rm -rf node_modules
npm install
npm run dev

==================================================

Chỉ cần làm đúng các bước trên là chạy được server.