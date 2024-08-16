"use strict";

const router = require("express").Router({ mergeParams: true });

const {
  getCategories
} = require("../controllers/categories");

// createCategory,
// updateCategory,
// removeCategory

router
  .route('/')
  .get(getCategories)
  .post(createCategory)

module.exports = router;