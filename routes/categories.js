"use strict";

const {
  getCategories,
  getCategory,
  addNewCategory,
  updateCategory,
  deleteCategory,
  getCategoryProducts,
} = require("../controllers/categories");
const router = require("express").Router();
const validateNewCategory = require("../middleware/validateNewCategory");
const validateUpdatedCategory = require("../middleware/validateUpdatedCategory");

// addNewCategory,
// updateCategory,
// removeCategory

router
  .route('/')
  .get(getCategories)
  .post(validateNewCategory, addNewCategory)

router
  .route('/:categoryId')
  .get(getCategory)
  .put(validateUpdatedCategory, updateCategory)
  .delete(deleteCategory)

router
  .route('/:categoryId/products')
  .get(getCategoryProducts)

module.exports = router;