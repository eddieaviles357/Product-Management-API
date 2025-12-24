"use strict";

const Categories = require("../models/Categories");
const { BadRequestError } = require("../AppError");

// @desc      Get all categories
// @route     GET /api/v1/categories
// @access    Public
exports.getCategories = async (req, res, next) => {
  try {
    // page/limit pagination to match Products and Reviews responses
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await Categories.getAllCategories(page, limit);

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
    const catId = Number(req.params.categoryId);
    const updatedCategory = req.body.category;

    if(isNaN(catId)) throw new BadRequestError("category id must be a number");

    const category = await Categories.updateCategory(catId, updatedCategory);
    
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
    const catId = Number(req.params.categoryId);

    if(isNaN(catId)) throw new BadRequestError("category id must be a number");

    const categoryProducts = await Categories.getAllCategoryProducts(catId);
    
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
    if (!req.query.ids) {
      throw new BadRequestError("Query parameter 'ids' is required");
    }

    // Split “1,2,3” → ["1","2","3"]
    const rawIds = req.query.ids.split(",");

    // Convert to integers
    const idArray = rawIds.map(id => {
      const parsed = Number(id);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new BadRequestError("Each category ID must be a positive integer");
      }
      return parsed;
    });
    const categoryProducts = await Categories.getMultipleCategoryProducts(idArray);
    
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
    const catId = Number(req.params.categoryId);

    if(isNaN(catId)) throw new BadRequestError("category id must be a number");
    
    const {success, category} = await Categories.removeCategory(catId);
    
    const statusCode = success ? 200 : 204;

    return res.status(statusCode).json({ 
      success,
      result: category
    });
  } catch (err) {
    return next(err);
  }
}