const Specification = require("../models/specificationModel");

exports.createSpecification = async (specData) => {
    const result = await Specification.create(specData);
    return result.recordset[0];
}

exports.getSpecificationsByProductId = async (productId) => {
    const result = await Specification.getByProductId(productId);
    return result.recordset;
}

exports.getSpecificationById = async (specId) => {
    const result = await Specification.getById(specId);
    return result.recordset[0];
}

exports.updateSpecification = async (specId, specData) => {
    await Specification.update(specId, specData);
    return await exports.getSpecificationById(specId);
}

exports.deleteSpecification = async (specId) => {
    await Specification.delete(specId);
    return { message: 'Specification deleted successfully' };
}