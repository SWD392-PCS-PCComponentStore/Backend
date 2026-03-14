const promotionService = require('../services/promotionService');

const toNumber = (value) => Number(value);

const isInvalidDateRange = (validFrom, validTo) => {
    if (!validFrom || !validTo) {
        return false;
    }

    return new Date(validFrom) > new Date(validTo);
};

exports.getAllPromotions = async (req, res) => {
    try {
        const promotions = await promotionService.getAllPromotions();
        res.json({
            success: true,
            data: promotions,
        });
    } catch (error) {
        console.error('❌ Get all promotions error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

exports.getPromotionById = async (req, res) => {
    try {
        const promotion = await promotionService.getPromotionById(req.params.id);
        if (!promotion) {
            return res.status(404).json({
                success: false,
                error: 'Promotion not found',
            });
        }

        res.json({
            success: true,
            data: promotion,
        });
    } catch (error) {
        console.error('❌ Get promotion by id error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

exports.getPromotionByCode = async (req, res) => {
    try {
        const promotion = await promotionService.getPromotionByCode(req.params.code);
        if (!promotion) {
            return res.status(404).json({
                success: false,
                error: 'Promotion not found',
            });
        }

        res.json({
            success: true,
            data: promotion,
        });
    } catch (error) {
        console.error('❌ Get promotion by code error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

exports.createPromotion = async (req, res) => {
    try {
        const { code, discount_percent, valid_from, valid_to } = req.body;

        if (!code || discount_percent === undefined || discount_percent === null) {
            return res.status(400).json({
                success: false,
                error: 'code and discount_percent are required',
            });
        }

        const numericDiscount = toNumber(discount_percent);
        if (Number.isNaN(numericDiscount) || numericDiscount < 0 || numericDiscount > 100) {
            return res.status(400).json({
                success: false,
                error: 'discount_percent must be a number between 0 and 100',
            });
        }

        if (isInvalidDateRange(valid_from, valid_to)) {
            return res.status(400).json({
                success: false,
                error: 'valid_from must be less than or equal to valid_to',
            });
        }

        const newPromotion = await promotionService.createPromotion({
            code: String(code).trim(),
            discount_percent: numericDiscount,
            valid_from,
            valid_to,
        });

        res.status(201).json({
            success: true,
            message: 'Promotion created successfully',
            data: newPromotion,
        });
    } catch (error) {
        console.error('❌ Create promotion error:', error);

        if (error.message && error.message.toLowerCase().includes('unique')) {
            return res.status(400).json({
                success: false,
                error: 'Promotion code already exists',
            });
        }

        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

exports.updatePromotion = async (req, res) => {
    try {
        const existingPromotion = await promotionService.getPromotionById(req.params.id);
        if (!existingPromotion) {
            return res.status(404).json({
                success: false,
                error: 'Promotion not found',
            });
        }

        const payload = {
            code: req.body.code ? String(req.body.code).trim() : existingPromotion.code,
            discount_percent: req.body.discount_percent ?? existingPromotion.discount_percent,
            valid_from: req.body.valid_from ?? existingPromotion.valid_from,
            valid_to: req.body.valid_to ?? existingPromotion.valid_to,
        };

        const numericDiscount = toNumber(payload.discount_percent);
        if (Number.isNaN(numericDiscount) || numericDiscount < 0 || numericDiscount > 100) {
            return res.status(400).json({
                success: false,
                error: 'discount_percent must be a number between 0 and 100',
            });
        }
        payload.discount_percent = numericDiscount;

        if (isInvalidDateRange(payload.valid_from, payload.valid_to)) {
            return res.status(400).json({
                success: false,
                error: 'valid_from must be less than or equal to valid_to',
            });
        }

        const updatedPromotion = await promotionService.updatePromotion(req.params.id, payload);
        res.json({
            success: true,
            message: 'Promotion updated successfully',
            data: updatedPromotion,
        });
    } catch (error) {
        console.error('❌ Update promotion error:', error);

        if (error.message && error.message.toLowerCase().includes('unique')) {
            return res.status(400).json({
                success: false,
                error: 'Promotion code already exists',
            });
        }

        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

exports.deletePromotion = async (req, res) => {
    try {
        const existingPromotion = await promotionService.getPromotionById(req.params.id);
        if (!existingPromotion) {
            return res.status(404).json({
                success: false,
                error: 'Promotion not found',
            });
        }

        const result = await promotionService.deletePromotion(req.params.id);
        res.json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        console.error('❌ Delete promotion error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
