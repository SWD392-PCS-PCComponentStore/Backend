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
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

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

exports.getProductsByCategoryId = async (req, res) => {
    try {
        const categoryId = Number(req.params.category_id);
        if (!Number.isInteger(categoryId) || categoryId <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid category_id'
            });
        }

        const products = await productService.getProductsByCategoryId(categoryId);
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('❌ Get products by category id error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

exports.createProduct = async (req, res) => {
    try {
        const { name, category_id, price } = req.body;
        if (!name || !category_id || price === undefined || price === null) {
            return res.status(400).json({
                success: false,
                error: 'name, category_id and price are required'
            });
        }

        const newProduct = await productService.createProduct(req.body);
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: newProduct
        });
    } catch (error) {
        console.error('❌ Create product error:', error);
        if (error.message && error.message.toLowerCase().includes('foreign key')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid category_id'
            });
        }

        res.status(500).json({ 
            success: false,
            error: 'Internal server error' 
        });
    }
}

exports.updateProduct = async (req, res) => {
    try {
        const existingProduct = await productService.getProductById(req.params.id);
        if (!existingProduct) {
            return res.status(404).json({ 
                success: false,
                error: 'Product not found' 
            });
        }

        // Keep current values if client sends partial update.
        const payload = {
            name: req.body.name ?? existingProduct.name,
            description: req.body.description ?? existingProduct.description,
            price: req.body.price ?? existingProduct.price,
            stock_quantity: req.body.stock_quantity ?? existingProduct.stock_quantity,
            image_url: req.body.image_url ?? existingProduct.image_url,
            status: req.body.status ?? existingProduct.status,
            brand: req.body.brand ?? existingProduct.brand,
            category_id: req.body.category_id ?? existingProduct.category_id
        };

        const updatedProduct = await productService.updateProduct(req.params.id, payload);
        res.json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
        });
    } catch (error) {
        console.error('❌ Update product error:', error);
        if (error.message && error.message.toLowerCase().includes('foreign key')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid category_id'
            });
        }

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