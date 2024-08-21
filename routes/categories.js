"use strict";

const {
  getCategories,
  addNewCategory
} = require("../controllers/categories");
const router = require("express").Router({ mergeParams: true });
const validateNewCategory = require("../middleware/validateNewCategory");
// const validateUpdatedCategory = require("../middleware/validateUpdatedCategory");

// addNewCategory,
// updateCategory,
// removeCategory

router
  .route('/')
  .get(getCategories)
  .post(validateNewCategory, addNewCategory)
  // .put(validateUpdatedCategory, updateCategory)

module.exports = router;