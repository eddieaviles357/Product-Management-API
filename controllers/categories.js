"use strict";

const Categories = require("../models/Categories");


exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Categories.getAllCategories();

    return res.status(200).json({ 
      success: true, 
      categories
    });
  } catch (err) {
    return next(err);
  }
}

exports.addNewCategory = async (req, res, next) => {
  try {
    const { category } = req.body;
    await Categories.addCategory(category);
    return res.status(200).json({
      success: true
    });
  } catch (err) {
    return next(err);
  }
}

// exports.getCategoryId = async (req, res, next) => {
//   try {
//     const category = req.params.category;
//     console.log(category)
//     await Categories.getCategoryId(category);
//     return res.status(200).json({
//       success: true
//     });
//   } catch (err) {
//     return next(err);
//   }
// }

exports.updateCategory = async (req, res, next) => {
  try {
    const catId = Number(req.params.categoryId);
    const updatedCategory = req.body.category;

    await Categories.updateCategory(catId, updatedCategory);
    
    return res.status(200).json({
      success: true
    });
  } catch (err) {
    return next(err);
  }
}

exports.getCategoryProducts = async (req, res, next) => {
  try {
    const catId = Number(req.params.categoryId);

    const categoryProducts = await Categories.getAllCategoryProducts(catId);
    
    return res.status(200).json({
      success: true,
      categoryProducts
    })
  } catch (err) {
    return next(err);
  }
}

exports.deleteCategory = async (req, res, next) => {
  try {
    const catId = Number(req.params.categoryId);

    const { success, category } = await Categories.removeCategory(catId);
    const statusCode = success ? 200 : 204;

    return res.status(statusCode).json({ 
      success,
      category,
    });
  } catch (err) {
    return next(err);
  }
}