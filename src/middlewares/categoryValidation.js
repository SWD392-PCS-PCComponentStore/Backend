/**
 * Middleware validation cho Category
 */

// Validate dữ liệu khi tạo category mới
const validateCreateCategory = (req, res, next) => {
  const { name } = req.body;

  // Kiểm tra name có tồn tại không
  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Category name is required',
    });
  }

  // Kiểm tra name không được rỗng
  if (name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Category name cannot be empty',
    });
  }

  // Kiểm tra độ dài name (max 150 từ database)
  if (name.length > 150) {
    return res.status(400).json({
      success: false,
      message: 'Category name must not exceed 150 characters',
    });
  }

  // Kiểm tra name không chứa ký tự đặc biệt nguy hiểm
  const dangerousChars = /[<>\"\'%;()&+]/;
  if (dangerousChars.test(name)) {
    return res.status(400).json({
      success: false,
      message: 'Category name contains invalid characters',
    });
  }

  // Trim name để loại bỏ khoảng trắng thừa
  req.body.name = name.trim();

  next();
};

// Validate dữ liệu khi update category
const validateUpdateCategory = (req, res, next) => {
  const { name } = req.body;

  // Nếu không có name thì không cần validate (có thể update các field khác)
  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'At least one field (name) is required for update',
    });
  }

  // Kiểm tra name không được rỗng
  if (name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Category name cannot be empty',
    });
  }

  // Kiểm tra độ dài name
  if (name.length > 150) {
    return res.status(400).json({
      success: false,
      message: 'Category name must not exceed 150 characters',
    });
  }

  // Kiểm tra name không chứa ký tự đặc biệt nguy hiểm
  const dangerousChars = /[<>\"\'%;()&+]/;
  if (dangerousChars.test(name)) {
    return res.status(400).json({
      success: false,
      message: 'Category name contains invalid characters',
    });
  }

  // Trim name
  req.body.name = name.trim();

  next();
};

// Validate ID parameter
const validateCategoryId = (req, res, next) => {
  const { id } = req.params;

  // Kiểm tra id có phải số không
  if (isNaN(id) || parseInt(id) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid category ID',
    });
  }

  next();
};

module.exports = {
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryId,
};
