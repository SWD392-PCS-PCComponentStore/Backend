// EXAMPLE: Cách sử dụng validation middleware trong routes

const express = require('express');
const {
  validateGmail,
  validatePhone,
  validateEmail,
  validateGmailAndPhone,
} = require('../middlewares/validationMiddleware');

const router = express.Router();

// Ví dụ 1: Sử dụng validateGmail cho route register
// router.post('/register', validateGmail, AuthController.register);

// Ví dụ 2: Sử dụng validatePhone cho route update phone
// router.put('/update-phone', validatePhone, UserController.updatePhone);

// Ví dụ 3: Sử dụng validateGmailAndPhone cho route register (kiểm tra cả 2)
// router.post('/register', validateGmailAndPhone, AuthController.register);

// Ví dụ 4: Sử dụng validateEmail (chấp nhận mọi email, không chỉ Gmail)
// router.post('/subscribe', validateEmail, NewsletterController.subscribe);

// Ví dụ 5: Sử dụng nhiều middleware cùng lúc
// router.post('/register', 
//   validateGmail,
//   validatePhone,
//   AuthController.register
// );

/**
 * CÁC ĐỊNH DẠNG HỢP LỆ:
 * 
 * Gmail:
 * - example@gmail.com ✓
 * - user.name+tag@gmail.com ✓
 * - example@yahoo.com ✗ (không phải Gmail)
 * 
 * Số điện thoại Việt Nam: 
 * - 0912345678 ✓
 * - +84912345678 ✓
 * - 84912345678 ✓
 * - 0123456789 ✗ (đầu số không hợp lệ)
 * - 091234567 ✗ (thiếu số)
 */

module.exports = router;
