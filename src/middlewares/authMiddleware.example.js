// EXAMPLE: Cách sử dụng authentication và authorization middleware

const express = require('express');
const {
  authenticate,
  authorize,
  requireAdmin,
  requireUser,
  optionalAuth,
} = require('./authMiddleware');

const router = express.Router();

// =============================================
// CÁC CÁCH SỬ DỤNG MIDDLEWARE
// =============================================

// 1. Route PUBLIC - Ai cũng truy cập được (không cần login)
// router.get('/products', ProductController.getAll);

// 2. Route cần LOGIN (bất kỳ user nào đã login)
// router.get('/profile', authenticate, UserController.getProfile);

// 3. Route chỉ ADMIN mới truy cập được
// router.delete('/users/:id', authenticate, authorize('admin'), UserController.delete);

// 4. Route cho ADMIN hoặc USER (không cho guest)
// router.post('/reviews', authenticate, authorize('admin', 'user'), ReviewController.create);

// 5. Sử dụng middleware kết hợp sẵn
// router.get('/admin/dashboard', requireAdmin, AdminController.dashboard);
// router.get('/my-orders', requireUser, OrderController.getMyOrders);

// 6. Optional authentication - Có token thì dùng, không có vẫn OK
// router.get('/products', optionalAuth, ProductController.getAll); // Có token -> hiện giá member, không có -> giá thường

// =============================================
// VÍ DỤ THỰC TÊ
// =============================================

/**
 * PUBLIC ROUTES - Không cần đăng nhập
 */
// router.post('/auth/register', AuthController.register);
// router.post('/auth/login', AuthController.login);
// router.get('/products', ProductController.getAll);

/**
 * AUTHENTICATED ROUTES - Cần đăng nhập
 */
// router.get('/profile', authenticate, UserController.getProfile);
// router.put('/profile', authenticate, UserController.updateProfile);
// router.post('/orders', authenticate, OrderController.create);
// router.get('/orders', authenticate, OrderController.getMyOrders);

/**
 * ADMIN ONLY ROUTES - Chỉ admin
 */
// router.get('/admin/users', requireAdmin, UserController.getAllUsers);
// router.delete('/admin/users/:id', requireAdmin, UserController.deleteUser);
// router.put('/admin/products/:id', requireAdmin, ProductController.update);

/**
 * ROLE-BASED ROUTES - Nhiều role
 */
// router.get('/orders/:id', authenticate, authorize('admin', 'user'), OrderController.getById);
// router.post('/reviews', authenticate, authorize('user'), ReviewController.create);

// =============================================
// FORMAT TOKEN KHI GỬI REQUEST
// =============================================
/**
 * Headers:
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * 
 * Sau khi login thành công, lấy token từ response và gửi kèm trong header
 */

// =============================================
// SỬ DỤNG req.user TRONG CONTROLLER
// =============================================
/**
 * Sau khi qua middleware authenticate, có thể dùng req.user
 * 
 * Example trong controller:
 * 
 * static async getProfile(req, res) {
 *   const userId = req.user.userId;  // Lấy từ token
 *   const userRole = req.user.role;   // Lấy role
 *   const userEmail = req.user.email; // Lấy email
 *   
 *   // Xử lý logic...
 * }
 */

module.exports = router;
