const Product = require("../models/productModel");

exports.getAllProducts = async () => {
    const result = await Product.getAll();
    return result.recordset;
}

exports.getProductById = async (id) => {
    const result = await Product.getById(id);
    return result.recordset[0];
}

exports.getProductsByCategoryId = async (categoryId) => {
    const result = await Product.getByCategoryId(categoryId);
    return result.recordset;
}

exports.createProduct = async (productData) => {
    const result = await Product.create(productData);
    return result.recordset[0];
}

exports.updateProduct = async (id, productData) => {
    await Product.update(id, productData);
    return await exports.getProductById(id);
}

exports.deleteProduct = async (id) => {
    await Product.delete(id);
    return { message: 'Product deleted successfully' };
}