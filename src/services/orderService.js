const Order = require('../models/orderModel');

const attachOrderItems = async (orders) => {
    if (!Array.isArray(orders) || orders.length === 0) {
        return [];
    }

    const orderIds = orders
        .map((order) => Number(order.order_id))
        .filter((orderId) => Number.isInteger(orderId));

    if (orderIds.length === 0) {
        return orders.map((order) => ({
            ...order,
            order_items: [],
        }));
    }

    try {
        const itemResult = await Order.getItemsByOrderIds(orderIds);
        const items = itemResult.recordset || [];

        const itemsByOrderId = new Map();
        for (const item of items) {
            const key = Number(item.order_id);
            if (!itemsByOrderId.has(key)) {
                itemsByOrderId.set(key, []);
            }
            itemsByOrderId.get(key).push(item);
        }

        return orders.map((order) => ({
            ...order,
            order_items: itemsByOrderId.get(Number(order.order_id)) || [],
        }));
    } catch (error) {
        console.error('Attach order items failed, fallback to empty items:', error.message || error);
        return orders.map((order) => ({
            ...order,
            order_items: [],
        }));
    }
};

exports.getAllOrders = async () => {
    const result = await Order.getAll();
    return attachOrderItems(result.recordset || []);
};

exports.getOrderById = async (id) => {
    const result = await Order.getById(id);
    const order = result.recordset[0];
    if (!order) {
        return null;
    }

    const [orderWithItems] = await attachOrderItems([order]);
    return orderWithItems;
};

exports.getOrdersByUserId = async (userId) => {
    const result = await Order.getByUserId(userId);
    return attachOrderItems(result.recordset || []);
};

exports.createOrder = async (orderData) => {
    return await Order.create(orderData);
};

exports.updateOrder = async (id, orderData) => {
    await Order.update(id, orderData);
    return await exports.getOrderById(id);
};

exports.deleteOrder = async (id) => {
    await Order.delete(id);
    return { message: 'Order deleted successfully' };
};
