const Supplier = require("../models/supplierModel");

exports.getAllSuppliers = async () => {
    const result = await Supplier.getAll();
    return result.recordset;
}

exports.getSupplierById = async (id) => {
    const result = await Supplier.getById(id);
    return result.recordset[0];
}

exports.createSupplier = async (supplierData) => {
    const result = await Supplier.create(supplierData);
    return result.recordset[0];
}

exports.updateSupplier = async (id, supplierData) => {
    await Supplier.update(id, supplierData);
    return await exports.getSupplierById(id);
}

exports.deleteSupplier = async (id) => {
    await Supplier.delete(id);
    return { message: "Supplier deleted successfully" };
}
