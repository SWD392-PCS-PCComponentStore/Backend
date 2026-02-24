const jwt = require('jsonwebtoken');

/**
 * Middleware để verify JWT token
 * Sử dụng cho các route cần authentication
 */
const authenticate = (req, res, next) => {
  try {
    // Lấy token từ header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided',
      });
    }

    // Format: "Bearer TOKEN"
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Gán thông tin user vào req để sử dụng ở các middleware/controller tiếp theo
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

/**
 * Middleware để check role của user
 * @param {string[]} allowedRoles - Mảng các role được phép truy cập
 * @returns {Function} Express middleware
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Kiểm tra xem đã có thông tin user chưa (phải dùng authenticate trước)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Kiểm tra role
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions',
      });
    }

    next();
  };
};

/**
 * Middleware kết hợp: authenticate và authorize admin
 */
const requireAdmin = [authenticate, authorize('admin')];

/**
 * Middleware kết hợp: authenticate và authorize admin hoặc user
 */
const requireUser = [authenticate, authorize('admin', 'user')];

/**
 * Optional authentication - không bắt buộc phải có token
 * Nếu có token hợp lệ thì gán vào req.user, không có thì tiếp tục
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    // Nếu token không hợp lệ, vẫn tiếp tục (optional auth)
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  requireAdmin,
  requireUser,
  optionalAuth,
};
