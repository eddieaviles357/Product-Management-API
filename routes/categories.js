"use strict";

const {
  getCategories,
  getSearchedCategory,
  addNewCategory,
  updateCategory,
  deleteCategory,
  getCategoryProducts,
} = require("../controllers/categories");
const router = require("express").Router();
const validateNewCategory = require("../middleware/validation/validateNewCategory");
const validateUpdatedCategory = require("../middleware/validation/validateUpdatedCategory");

// addNewCategory,
// updateCategory,
// removeCategory

router
  .route('/')
  .get(getCategories)
  .post(validateNewCategory, addNewCategory)

router
  .route('/:categoryId')
  .put(validateUpdatedCategory, updateCategory)
  .delete(deleteCategory)

router
  .route('/:categoryId/products')
  .get(getCategoryProducts)

router
  .route('/search/:searchTerm')
  .get(getSearchedCategory)
module.exports = router;
