"use strict";

const {
  getCategories
} = require("../controllers/categories");
const router = require("express").Router({ mergeParams: true });
const validateNewCategory = require("../middleware/validateNewCategory");
cont validateUpdatedCategory = require("../middleware/validateUpdatedCategory");

// createCategory,
// updateCategory,
// removeCategory

router
  .route('/')
  .get(getCategories)
  .post(validateNewCategory, createCategory)
  .put(validateUpdatedCategory, updateCategory)

module.exports = router;