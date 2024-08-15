"use strict";

const router = require("express").Router({ mergeParams: true });

const {
  getAllCategories
} = require("../models/categories");

// createCategory,
// updateCategory,
// removeCategory

router
  .route('/')
  .get(getAllCategories)

module.exports = router;