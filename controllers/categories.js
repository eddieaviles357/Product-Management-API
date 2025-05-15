"use strict";

const Categories = require("../models/Categories");
const { BadRequestError } = require("../AppError");

// @desc      Get all categories
// @route     GET /api/v1/categories
// @access    Public
exports.getCategories = async (req, res, next) => {
  try {
    let cursor = undefined;
    // we will use cursor query to retrieve more categories from db
    // if cursor is not a number or is undefined or empty object, we will set it to undefined
    // if cursor is a number, we will use it to retrieve more categories
    cursor = req.query.cursor;
    if(isNaN(cursor) || cursor === undefined || Object.keys(req.query).length === 0) cursor = undefined;
    const categories = await Categories.getAllCategories(cursor);

    return res.status(200).json({ 
      success: true, 
      categories
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