const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

// Lấy giá của 1 item (product_price nếu là sản phẩm, build_price nếu là build)
const itemUnitPrice = (item) =>
    item.product_id ? (item.product_price || 0) : (item.build_price || 0);

// Tính subtotal (đơn giá × số lượng) cho 1 item
const computeSubtotal = (item) =>
    parseFloat((itemUnitPrice(item) * item.quantity).toFixed(2));

// Tính cart summary từ danh sách items đã có subtotal
const computeCartSummary = (items) => {
    const itemCount = items.length;
    const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);
    const totalPrice = parseFloat(
        items.reduce((s, i) => s + (i.subtotal || computeSubtotal(i)), 0).toFixed(2)
    );
    return { itemCount, totalQuantity, totalPrice };
};

exports.getCartByUserId = async (userId) => {
    const result = await Cart.getCartByUserId(userId);
    return result.recordset;
};

exports.getCartItemById = async (cartItemId) => {
    const result = await Cart.getCartItemById(cartItemId);
    return result.recordset[0];
};

// Thêm sản phẩm vào giỏ hàng
// - Nếu user chưa có giỏ sẽ tự tạo mới
// - Nếu sản phẩm đã có trong giỏ thì cộng dồn số lượng
// - Kiểm tra tồn kho trước khi thêm
// Trả về: item được thêm/cập nhật (kèm subtotal) + cartSummary (tổng toàn giỏ)
exports.addProductToCart = async (userId, productId, quantity = 1) => {
    // Kiểm tra sản phẩm tồn tại
    const productResult = await Product.getById(productId);
    const product = productResult.recordset[0];
    if (!product) throw new Error('Product not found');

    // Kiểm tra sản phẩm đã có trong giỏ chưa
    const existing = await Cart.getCartItemByUserAndProduct(userId, productId);
    const existingItem = existing.recordset[0];

    let cartItemId;
    if (existingItem) {
        // Đã có → cộng dồn số lượng
        const newQty = existingItem.quantity + quantity;
        if (product.stock_quantity < newQty) {
            throw new Error(`Insufficient stock. Available: ${product.stock_quantity}`);
        }
        await Cart.updateQuantity(existingItem.cart_item_id, newQty);
        cartItemId = existingItem.cart_item_id;
    } else {
        // Chưa có → kiểm tra tồn kho rồi thêm mới
        if (product.stock_quantity < quantity) {
            throw new Error(`Insufficient stock. Available: ${product.stock_quantity}`);
        }
        cartItemId = await Cart.addProductToCart(userId, productId, quantity);
    }

    // Lấy item đã lưu kèm thông tin đầy đủ
    const savedItem = await exports.getCartItemById(cartItemId);
    const itemWithSubtotal = { ...savedItem, subtotal: computeSubtotal(savedItem) };

    // Tính lại tổng toàn bộ giỏ hàng
    const allItems = await exports.getCartByUserId(userId);
    const cartSummary = computeCartSummary(
        allItems.map(i => ({ ...i, subtotal: computeSubtotal(i) }))
    );

    return { item: itemWithSubtotal, cartSummary };
};

// Thêm build vào giỏ hàng (tương tự addProductToCart)
exports.addBuildToCart = async (userId, userBuildId, quantity = 1) => {
    const existing = await Cart.getCartItemByUserAndBuild(userId, userBuildId);
    const existingItem = existing.recordset[0];

    let cartItemId;
    if (existingItem) {
        await Cart.updateQuantity(existingItem.cart_item_id, existingItem.quantity + quantity);
        cartItemId = existingItem.cart_item_id;
    } else {
        cartItemId = await Cart.addBuildToCart(userId, userBuildId, quantity);
    }

    const savedItem = await exports.getCartItemById(cartItemId);
    const itemWithSubtotal = { ...savedItem, subtotal: computeSubtotal(savedItem) };

    const allItems = await exports.getCartByUserId(userId);
    const cartSummary = computeCartSummary(
        allItems.map(i => ({ ...i, subtotal: computeSubtotal(i) }))
    );

    return { item: itemWithSubtotal, cartSummary };
};

exports.updateQuantity = async (cartItemId, quantity) => {
    const cartItem = await exports.getCartItemById(cartItemId);
    if (!cartItem) throw new Error('Cart item not found');

    if (cartItem.product_id && cartItem.stock_quantity < quantity) {
        throw new Error('Insufficient stock');
    }

    await Cart.updateQuantity(cartItemId, quantity);
    return await exports.getCartItemById(cartItemId);
};

exports.removeFromCart = async (cartItemId) => {
    const cartItem = await exports.getCartItemById(cartItemId);
    if (!cartItem) throw new Error('Cart item not found');

    await Cart.removeFromCart(cartItemId);
    return { message: 'Item removed from cart successfully' };
};

exports.clearUserCart = async (userId) => {
    await Cart.clearUserCart(userId);
    return { message: 'Cart cleared successfully' };
};

// Lấy toàn bộ giỏ hàng kèm subtotal mỗi item và tổng toàn giỏ
exports.getCartSummary = async (userId) => {
    const items = await exports.getCartByUserId(userId);
    const itemsWithSubtotal = items.map(i => ({ ...i, subtotal: computeSubtotal(i) }));
    return {
        items: itemsWithSubtotal,
        ...computeCartSummary(itemsWithSubtotal)
    };
};
