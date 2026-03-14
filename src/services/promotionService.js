const Promotion = require('../models/promotionModel');

exports.getAllPromotions = async () => {
    const result = await Promotion.getAll();
    return result.recordset;
};

exports.getPromotionById = async (id) => {
    const result = await Promotion.getById(id);
    return result.recordset[0];
};

exports.getPromotionByCode = async (code) => {
    const result = await Promotion.getByCode(code);
    return result.recordset[0];
};

exports.createPromotion = async (promotionData) => {
    const result = await Promotion.create(promotionData);
    return result.recordset[0];
};

exports.updatePromotion = async (id, promotionData) => {
    await Promotion.update(id, promotionData);
    return await exports.getPromotionById(id);
};

exports.deletePromotion = async (id) => {
    await Promotion.delete(id);
    return { message: 'Promotion deleted successfully' };
};
