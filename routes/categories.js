"use strict";

const {
  getCategories,
  addNewCategory,
  updateCategory,
  deleteCategory,
  // getCategoryId
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
  .route('/:categoryId')
  .put(validateUpdatedCategory, updateCategory)
  .delete(deleteCategory)
  // .get(getCategoryId)

module.exports = router;