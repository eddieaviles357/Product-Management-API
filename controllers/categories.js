"use strict";

const Categories = require("../models/Categories");
const { BadRequestError } = require("../AppError");

// @desc      Get all categories
// @route     GET /api/v1/categories
// @access    Public
exports.getCategories = async (req, res, next) => {
  try {
    const result = await Categories.getAllCategories(req.pagination.page, req.pagination.limit);

    return res.status(200).json({
      success: true,
      ...result
    });


  } catch (err) {
    return next(err);
  }
}

// @desc      Get searched category
// @route     GET /api/v1/categories/search/:searchTerm
// @access    Public
exports.getSearchedCategory = async (req, res, next) => {
  try {
    const { searchTerm } = req.params;
    const categories = await Categories.searchCategory(searchTerm);

    return res.status(200).json({
      success: true,
      categories
    })
  } catch (err) {
    return next(err);
  }
}

// @desc      Add new category
// @route     POST /api/v1/categories
// @access    Private
// @access    Admin
exports.addNewCategory = async (req, res, next) => {
  try {
    const { category } = req.body;

    const newCategory = await Categories.addCategory(category);

    return res.status(201).json({
      success: true,
      newCategory
    });
  } catch (err) {
    return next(err);
  }
}

// @desc      Update category
// @route     PUT /api/v1/categories/:categoryId
// @access    Private
// @access    Admin
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Categories.updateCategory(req.params.categoryId, req.body.category);
    
    return res.status(200).json({
      success: true,
      category
    });
  } catch (err) {
    return next(err);
  }
}

// @desc      Get all products in a category
// @route     GET /api/v1/categories/:categoryId/products
// @access    Public
exports.getCategoryProducts = async (req, res, next) => {
  try {
    const categoryProducts = await Categories.getAllCategoryProducts(req.params.categoryId);
    
    return res.status(200).json({
      success: true,
      categoryProducts
    })
  } catch (err) {
    return next(err);
  }
}
// @desc      Get all products in a category using multiple category ids
// @route     GET /api/v1/categories/products/filter?ids=1,2,3
// @access    Public
exports.getMultipleCategoryProducts = async (req, res, next) => {
  try {
    const categoryProducts = await Categories.getMultipleCategoryProducts(req.sanitizedCategoryIds);
    
    return res.status(200).json({
      success: true,
      categoryProducts
    })
  } catch (err) {
    return next(err);
  }
}

// @desc      Delete category
// @route     DELETE /api/v1/categories/:categoryId
// @access    Private
// @access    Admin
exports.deleteCategory = async (req, res, next) => {
  try {
    const removedCategory = await Categories.removeCategory(req.params.categoryId);
    
    const statusCode = removedCategory[0] ? 200 : 204;
    const success = removedCategory[0] ? true : false;

    return res.status(statusCode).json({ 
      success,
      result: removedCategory[0]
    });
  } catch (err) {
    return next(err);
  }
}