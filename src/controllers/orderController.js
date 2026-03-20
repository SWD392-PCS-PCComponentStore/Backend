const orderService = require('../services/orderService');

const toNumber = (value) => Number(value);

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await orderService.getAllOrders();
        res.json({
            success: true,
            data: orders,
        });
    } catch (error) {
        console.error('❌ Get all orders error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await orderService.getOrderById(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found',
            });
        }

        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error('❌ Get order by id error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

exports.getOrdersByUserId = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                success: false,
                error: 'userId must be a positive integer',
            });
        }

        if (req.user?.role !== 'admin' && Number(req.user?.userId) !== userId) {
            return res.status(403).json({
                success: false,
                error: 'You are not allowed to access this resource',
            });
        }

        const orders = await orderService.getOrdersByUserId(userId);
        res.json({
            success: true,
            data: orders,
        });
    } catch (error) {
        console.error('❌ Get orders by user id error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const userId = Number(req.user?.userId);
        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized user',
            });
        }

        const orders = await orderService.getOrdersByUserId(userId);
        res.json({
            success: true,
            data: orders,
        });
    } catch (error) {
        console.error('❌ Get my orders error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const userId = Number(req.user?.userId);
        const {
            cart_item_ids,
            shipping_address,
            phone,
            promotion_code,
            payment_method
        } = req.body;

        if (!userId || Number.isNaN(userId)) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized user',
            });
        }

        if (!Array.isArray(cart_item_ids) || cart_item_ids.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'cart_item_ids is required and must be a non-empty array',
            });
        }

        const hasInvalidCartItemId = cart_item_ids.some((id) => !Number.isInteger(Number(id)) || Number(id) <= 0);
        if (hasInvalidCartItemId) {
            return res.status(400).json({
                success: false,
                error: 'cart_item_ids must contain positive integers only',
            });
        }

        if (!shipping_address || !String(shipping_address).trim()) {
            return res.status(400).json({
                success: false,
                error: 'shipping_address is required',
            });
        }

        if (!phone || !String(phone).trim()) {
            return res.status(400).json({
                success: false,
                error: 'phone is required',
            });
        }

        if (!payment_method || !String(payment_method).trim()) {
            return res.status(400).json({
                success: false,
                error: 'payment_method is required',
            });
        }

        const newOrder = await orderService.createOrder({
            user_id: userId,
            cart_item_ids,
            shipping_address: String(shipping_address).trim(),
            phone: String(phone).trim(),
            promotion_code: promotion_code ? String(promotion_code).trim() : null,
            payment_method: String(payment_method).trim(),
        });

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: newOrder,
        });
    } catch (error) {
        console.error('❌ Create order error:', error);

        if (
            error.message === 'No cart items selected' ||
            error.message === 'Selected cart items not found' ||
            error.message === 'Some selected cart items are invalid or do not belong to user' ||
            error.message === 'Invalid cart item price' ||
            error.message === 'Cart total amount is invalid' ||
            error.message === 'Invalid promotion code or promotion has expired' ||
            error.message.startsWith('Insufficient stock') ||
            error.message.startsWith('Product not found') ||
            error.message.startsWith('Unsupported payment_method')
        ) {
            return res.status(400).json({
                success: false,
                error: error.message,
            });
        }

        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const existingOrder = await orderService.getOrderById(req.params.id);
        if (!existingOrder) {
            return res.status(404).json({
                success: false,
                error: 'Order not found',
            });
        }

        const payload = {
            user_id: req.body.user_id ?? existingOrder.user_id,
            promotion_id: req.body.promotion_id !== undefined
                ? req.body.promotion_id
                : existingOrder.promotion_id,
            status: req.body.status ?? existingOrder.status,
            total_amount: req.body.total_amount ?? existingOrder.total_amount,
            shipping_address: req.body.shipping_address ?? existingOrder.shipping_address,
            payment_type: req.body.payment_type ?? existingOrder.payment_type,
        };

        const numericTotal = toNumber(payload.total_amount);
        if (Number.isNaN(numericTotal) || numericTotal < 0) {
            return res.status(400).json({
                success: false,
                error: 'total_amount must be a valid number greater than or equal to 0',
            });
        }

        payload.total_amount = numericTotal;
        payload.user_id = Number(payload.user_id);

        const updatedOrder = await orderService.updateOrder(req.params.id, payload);
        res.json({
            success: true,
            message: 'Order updated successfully',
            data: updatedOrder,
        });
    } catch (error) {
        console.error('❌ Update order error:', error);

        if (error.message && error.message.toLowerCase().includes('foreign key')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user_id or promotion_id',
            });
        }

        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const orderId = Number(req.params.id);
        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Order id must be a positive integer',
            });
        }

        const result = await orderService.deleteOrder(orderId);
        res.json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        console.error('❌ Delete order error:', error);

        if (error.message === 'Order not found') {
            return res.status(404).json({
                success: false,
                error: error.message,
            });
        }

        if (error.message && error.message.toLowerCase().includes('foreign key')) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete order due to related data constraints',
            });
        }

        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
