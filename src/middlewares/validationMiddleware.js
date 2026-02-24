// Middleware để kiểm tra Gmail hợp lệ
const validateGmail = (req, res, next) => {
  const { email } = req.body;

  // Kiểm tra email có tồn tại không
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  // Regex để kiểm tra Gmail hợp lệ
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

  if (!gmailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Gmail address. Please use a valid Gmail account",
    });
  }

  next();
};

// Middleware để kiểm tra số điện thoại hợp lệ
const validatePhone = (req, res, next) => {
  const { phone } = req.body;

  // Kiểm tra phone có tồn tại không
  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "Phone number is required",
    });
  }

  // Regex để kiểm tra số điện thoại Việt Nam hợp lệ
  // Hỗ trợ: 0912345678, +84912345678, 84912345678
  const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)\d{8}$/;

  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      success: false,
      message: "Invalid phone number. Please use a valid Vietnamese phone number",
    });
  }

  next();
};

// Middleware để kiểm tra email chung (không chỉ Gmail)
const validateEmail = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  // Regex để kiểm tra email hợp lệ (tất cả loại email)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email address",
    });
  }

  next();
};

// Middleware kết hợp: kiểm tra cả Gmail và Phone
const validateGmailAndPhone = (req, res, next) => {
  const { email, phone } = req.body;
  const errors = [];

  // Kiểm tra Gmail
  if (!email) {
    errors.push("Email is required");
  } else {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      errors.push("Invalid Gmail address");
    }
  }

  // Kiểm tra Phone
  if (!phone) {
    errors.push("Phone number is required");
  } else {
    const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)\d{8}$/;
    if (!phoneRegex.test(phone)) {
      errors.push("Invalid phone number");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors,
    });
  }

  next();
};

module.exports = {
  validateGmail,
  validatePhone,
  validateEmail,
  validateGmailAndPhone,
};
