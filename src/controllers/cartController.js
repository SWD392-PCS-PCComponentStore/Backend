const cartService = require("../services/cartService");

exports.getCart = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        const cart = await cartService.getCartSummary(userId);

        res.json({
            success: true,
            data: {
                items: cart.items,           // mỗi item có trường subtotal = đơn giá × số lượng
                itemCount: cart.itemCount,
                totalQuantity: cart.totalQuantity,
                totalPrice: cart.totalPrice  // tổng tiền toàn bộ giỏ hàng
            }
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { product_id, user_build_id, quantity } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }
        if (!product_id && !user_build_id) {
            return res.status(400).json({ success: false, error: 'product_id or user_build_id is required' });
        }
        if (product_id && user_build_id) {
            return res.status(400).json({ success: false, error: 'Provide either product_id or user_build_id, not both' });
        }
        if (quantity !== undefined && quantity < 1) {
            return res.status(400).json({ success: false, error: 'Quantity must be at least 1' });
        }

        const qty = quantity || 1;
        const result = product_id
            ? await cartService.addProductToCart(userId, product_id, qty)
            : await cartService.addBuildToCart(userId, user_build_id, qty);

        res.status(201).json({
            success: true,
            message: 'Item added to cart successfully',
            data: {
                item: result.item,           // item vừa thêm/cập nhật (có subtotal)
                cartSummary: result.cartSummary  // tổng toàn bộ giỏ sau khi thêm
            }
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        if (error.message === 'Product not found') {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        if (error.message.startsWith('Insufficient stock')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

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
            return res.status(400).json({ success: false, error: 'Valid quantity is required (must be at least 1)' });
        }

        const updatedItem = await cartService.updateQuantity(cartId, quantity);

        res.json({
            success: true,
            message: 'Cart item quantity updated successfully',
            data: updatedItem
        });
    } catch (error) {
        console.error('Update quantity error:', error);
        if (error.message === 'Cart item not found') {
            return res.status(404).json({ success: false, error: 'Cart item not found' });
        }
        if (error.message === 'Insufficient stock') {
            return res.status(400).json({ success: false, error: 'Insufficient stock for requested quantity' });
        }
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const { cartId } = req.params;
        if (!cartId) {
            return res.status(400).json({ success: false, error: 'Cart item ID is required' });
        }

        const result = await cartService.removeFromCart(cartId);
        res.json({ success: true, message: result.message });
    } catch (error) {
        console.error('Remove from cart error:', error);
        if (error.message === 'Cart item not found') {
            return res.status(404).json({ success: false, error: 'Cart item not found' });
        }
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        const result = await cartService.clearUserCart(userId);
        res.json({ success: true, message: result.message });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

exports.getCartTotal = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        const cart = await cartService.getCartSummary(userId);
        res.json({
            success: true,
            data: {
                itemCount: cart.itemCount,
                totalQuantity: cart.totalQuantity,
                totalPrice: cart.totalPrice
            }
        });
    } catch (error) {
        console.error('Get cart total error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
