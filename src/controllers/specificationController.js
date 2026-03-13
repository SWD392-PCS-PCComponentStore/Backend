const specificationService = require("../services/specificationService");

exports.createSpecification = async (req, res) => {
    try {
        const { product_id, spec_name, spec_value } = req.body;
        if (!product_id || !spec_name || !spec_value) {
            return res.status(400).json({
                success: false,
                error: 'product_id, spec_name and spec_value are required'
            });
        }

        const newSpec = await specificationService.createSpecification(req.body);
        res.status(201).json({
            success: true,
            message: 'Specification created successfully',
            data: newSpec
        });
    } catch (error) {
        console.error('❌ Create specification error:', error);
        if (error.message && error.message.toLowerCase().includes('foreign key')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid product_id'
            });
        }

        res.status(500).json({ 
            success: false,
            error: 'Internal server error' 
        });
    }
}

exports.getSpecificationsByProductId = async (req, res) => {
    try {
        const specs = await specificationService.getSpecificationsByProductId(req.params.productId);
        res.json({
            success: true,
            data: specs
        });
    } catch (error) {
        console.error('❌ Get specifications by product id error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error' 
        });
    }
}

exports.updateSpecification = async (req, res) => {
    try {
        const specId = req.params.specId;
        const existingSpec = await specificationService.getSpecificationById(specId);

        if (!existingSpec) {
            return res.status(404).json({
                success: false,
                error: 'Specification not found'
            });
        }

        const payload = {
            spec_name: req.body.spec_name ?? existingSpec.spec_name,
            spec_value: req.body.spec_value ?? existingSpec.spec_value
        };

        const updatedSpec = await specificationService.updateSpecification(specId, payload);
        res.json({
            success: true,
            message: 'Specification updated successfully',
            data: updatedSpec
        });
    } catch (error) {
        console.error('❌ Update specification error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

exports.deleteSpecification = async (req, res) => {
    try {
        const specId = req.params.specId;
        const existingSpec = await specificationService.getSpecificationById(specId);

        if (!existingSpec) {
            return res.status(404).json({
                success: false,
                error: 'Specification not found'
            });
        }

        const result = await specificationService.deleteSpecification(specId);
        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('❌ Delete specification error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}