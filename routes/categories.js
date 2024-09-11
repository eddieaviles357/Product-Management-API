"use strict";

const {
  getCategories,
  addNewCategory,
  updateCategory,
  deleteCategory,
  getCategoryProducts,
} = require("../controllers/categories");
const router = require("express").Router({ mergeParams: true });
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
  .route('/:category')
  .get(getCategoryProducts)
  .put(validateUpdatedCategory, updateCategory)
  .delete(deleteCategory)

module.exports = router;