const cartService = require("../services/cartService");

exports.getCart = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        const cartItems = await cartService.getCartByUserId(userId);
        const cartTotal = await cartService.getCartTotal(userId);

        // Add subtotal for each item
        const itemsWithSubtotal = cartItems.map(item => ({
            ...item,
            subtotal: parseFloat((item.price * item.quantity).toFixed(2))
        }));

        res.json({
            success: true,
            data: {
                items: itemsWithSubtotal,
                itemCount: cartTotal.itemCount,
                totalQuantity: cartTotal.totalQuantity,
                totalPrice: cartTotal.totalPrice
            }
        });
    } catch (error) {
        console.error('❌ Get cart error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

exports.addToCart = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { product_id, quantity } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        if (!product_id) {
            return res.status(400).json({
                success: false,
                error: 'Product ID is required'
            });
        }

        if (quantity && quantity < 1) {
            return res.status(400).json({
                success: false,
                error: 'Quantity must be at least 1'
            });
        }

        const result = await cartService.addToCart(userId, {
            product_id,
            quantity: quantity || 1
        });

        res.status(201).json({
            success: true,
            message: 'Product added to cart successfully',
            data: result
        });
    } catch (error) {
        console.error('❌ Add to cart error:', error);
        
        if (error.message === 'Product not found') {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        if (error.message.includes('Insufficient stock')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

exports.updateQuantity = async (req, res) => {
    try {
        const { cartId } = req.params;
        const { quantity } = req.body;

        if (!cartId) {
            return res.status(400).json({
                success: false,
                error: 'Cart ID is required'
            });
        }

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                error: 'Valid quantity is required (must be at least 1)'
            });
        }

        const updatedItem = await cartService.updateQuantity(cartId, quantity);

        res.json({
            success: true,
            message: 'Cart item quantity updated successfully',
            data: updatedItem
        });
    } catch (error) {
        console.error('❌ Update quantity error:', error);

        if (error.message === 'Cart item not found') {
            return res.status(404).json({
                success: false,
                error: 'Cart item not found'
            });
        }

        if (error.message === 'Insufficient stock') {
            return res.status(400).json({
                success: false,
                error: 'Insufficient stock for requested quantity'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

exports.removeFromCart = async (req, res) => {
    try {
        const { cartId } = req.params;

        if (!cartId) {
            return res.status(400).json({
                success: false,
                error: 'Cart ID is required'
            });
        }

        const result = await cartService.removeFromCart(cartId);

        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('❌ Remove from cart error:', error);

        if (error.message === 'Cart item not found') {
            return res.status(404).json({
                success: false,
                error: 'Cart item not found'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

exports.clearCart = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        const result = await cartService.clearUserCart(userId);

        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('❌ Clear cart error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

exports.getCartTotal = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        const cartItems = await cartService.getCartByUserId(userId);
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        res.json({
            success: true,
            data: {
                itemCount: cartItems.length,
                totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
                totalPrice: parseFloat(total.toFixed(2))
            }
        });
    } catch (error) {
        console.error('❌ Get cart total error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}
