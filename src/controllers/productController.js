const productService = require("../services/productService");

// TODO: Thêm validation và error handling sau khi test xong

exports.getAllProducts = async (req, res) => {
    try {
        const products = await productService.getAllProducts();
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('❌ Get all products error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error' 
        });
    }
}

exports.getProductById = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('❌ Get product by id error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error' 
        });
    }
}

exports.createProduct = async (req, res) => {
    try {
        const newProduct = await productService.createProduct(req.body);
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: newProduct
        });
    } catch (error) {
        console.error('❌ Create product error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error' 
        });
    }
}

exports.updateProduct = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ 
                success: false,
                error: 'Product not found' 
            });
        }
        const updatedProduct = await productService.updateProduct(req.params.id, req.body);
        res.json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
        });
    } catch (error) {
        console.error('❌ Update product error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error' 
        });
    }
}

exports.deleteProduct = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ 
                success: false,
                error: 'Product not found' 
            });
        }
        const result = await productService.deleteProduct(req.params.id);
        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('❌ Delete product error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error' 
        });
    }
}