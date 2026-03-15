const Order = require('../models/orderModel');

exports.getAllOrders = async () => {
    const result = await Order.getAll();
    return result.recordset;
};

exports.getOrderById = async (id) => {
    const result = await Order.getById(id);
    return result.recordset[0];
};

exports.getOrdersByUserId = async (userId) => {
    const result = await Order.getByUserId(userId);
    return result.recordset;
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
