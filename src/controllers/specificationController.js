const specificationService = require("../services/specificationService");

exports.createSpecification = async (req, res) => {
    try {
        const newSpec = await specificationService.createSpecification(req.body);
        res.status(201).json({
            success: true,
            message: 'Specification created successfully',
            data: newSpec
        });
    } catch (error) {
        console.error('❌ Create specification error:', error);
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