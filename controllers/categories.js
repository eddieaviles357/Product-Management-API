"use strict";

const Categories = require("../models/Categories");
const { BadRequestError } = require("../AppError");

exports.getCategories = async (req, res, next) => {
  try {
    // we will use cursor query to retrieve more categories from db
    const { cursor } = req.query;

    if(cursor === undefined && Object.keys(req.query).length === 0) {
      const categories = await Categories.getAllCategories(cursor);

      return res.status(200).json({ 
        success: true, 
        categories
      });
    } else {
      const { cursor } = req.query;
      
      if(isNaN(cursor)) throw new BadRequestError("cursor must be a number");

      const categories = await Categories.getAllCategories(cursor);

      return res.status(200).json({ 
        success: true, 
        categories
      });
    }


  } catch (err) {
    return next(err);
  }
}

exports.addNewCategory = async (req, res, next) => {
  try {
    const { category } = req.body;

    const newCategory = await Categories.addCategory(category);

    return res.status(200).json({
      success: true,
      newCategory
    });
  } catch (err) {
    return next(err);
  }
}

exports.updateCategory = async (req, res, next) => {
  try {
    const catId = Number(req.params.categoryId);
    const updatedCategory = req.body.category;

    if(isNaN(catId)) throw new BadRequestError("category id must be a number");

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

exports.deleteCategory = async (req, res, next) => {
  try {
    const catId = Number(req.params.categoryId);

    if(isNaN(catId)) throw new BadRequest("category id must be a number");
    
    const success = await Categories.removeCategory(catId);

    success 
      ? res.status(200).json({ success }) 
      : res.status(200).json({ success, message: "Category does not exist" });

  } catch (err) {
    return next(err);
  }
}