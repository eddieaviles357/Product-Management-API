"use strict";

const Categories = require("../models/Categories")
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