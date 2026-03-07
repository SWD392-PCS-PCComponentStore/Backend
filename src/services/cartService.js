const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

exports.getCartByUserId = async (userId) => {
    const result = await Cart.getCartByUserId(userId);
    return result.recordset;
}

exports.getCartItemById = async (cartId) => {
    const result = await Cart.getCartItemById(cartId);
    return result.recordset[0];
}

exports.addToCart = async (userId, productData) => {
    // Verify product exists
    const product = await Product.getById(productData.product_id);
    if (!product.recordset[0]) {
        throw new Error('Product not found');
    }

    // Check stock
    if (product.recordset[0].stock_quantity < productData.quantity) {
        throw new Error('Insufficient stock');
    }

    // Check if item already in cart
    const existingItem = await Cart.getCartItemByUserAndProduct(userId, productData.product_id);
    
    if (existingItem.recordset[0]) {
        // Item exists, update quantity
        const newQuantity = existingItem.recordset[0].quantity + (productData.quantity || 1);
        if (product.recordset[0].stock_quantity < newQuantity) {
            throw new Error('Insufficient stock for requested quantity');
        }
        await Cart.updateQuantity(existingItem.recordset[0].cart_id, newQuantity);
        return await exports.getCartItemById(existingItem.recordset[0].cart_id);
    } else {
        // New item, add to cart
        const result = await Cart.addToCart({
            user_id: userId,
            product_id: productData.product_id,
            quantity: productData.quantity || 1
        });
        return result.recordset[0];
    }
}

exports.updateQuantity = async (cartId, quantity) => {
    // Verify cart item exists
    const cartItem = await exports.getCartItemById(cartId);
    if (!cartItem) {
        throw new Error('Cart item not found');
    }

    // Verify stock
    if (cartItem.stock_quantity < quantity) {
        throw new Error('Insufficient stock');
    }

    await Cart.updateQuantity(cartId, quantity);
    return await exports.getCartItemById(cartId);
}

exports.removeFromCart = async (cartId) => {
    // Verify cart item exists
    const cartItem = await exports.getCartItemById(cartId);
    if (!cartItem) {
        throw new Error('Cart item not found');
    }

    await Cart.removeFromCart(cartId);
    return { message: 'Item removed from cart successfully' };
}

exports.clearUserCart = async (userId) => {
    await Cart.clearUserCart(userId);
    return { message: 'Cart cleared successfully' };
}

exports.getCartTotal = async (userId) => {
    const cartItems = await exports.getCartByUserId(userId);
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return {
        items: cartItems,
        itemCount: cartItems.length,
        totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: parseFloat(total.toFixed(2))
    };
}
