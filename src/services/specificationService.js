const Specification = require("../models/specificationModel");

exports.createSpecification = async (specData) => {
    const result = await Specification.create(specData);
    return result.recordset[0];
}

exports.getSpecificationsByProductId = async (productId) => {
    const result = await Specification.getByProductId(productId);
    return result.recordset;
}