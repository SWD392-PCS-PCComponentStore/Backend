const Category = require('../models/categoryModel');


  exports.getAllCategories = async () => {
    const result = await Category.getAll();
    return result.recordset;
  };


exports.getCategoryById = async (id) => {
    const result = await Category.getById(id);
    return result.recordset[0];
}

exports.createCategory = async (categoryData) => {
    const result = await Category.create(categoryData);
    return result.recordset[0];
}

exports.updateCategory = async (id, categoryData) => {
    await Category.update(id, categoryData);
    return await exports.getCategoryById(id);
}

exports.deleteCategory = async (id) => {
    await Category.delete(id);
    return { message: 'Category deleted successfully' };
}
