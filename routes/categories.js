"use strict";

// Controllers
const {
  getCategories,
  getSearchedCategory,
  addNewCategory,
  updateCategory,
  deleteCategory,
  getCategoryProducts,
  getMultipleCategoryProducts
} = require("../controllers/categories");
const router = require("express").Router();

// Middleware
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth/auth");
const validateSchema = require("../middleware/validation/validateSchema");
const sanitizeCategoryIds = require("../middleware/validation/sanitizeCategoryIds");
const validateParamId = require("../middleware/validation/validateParamId");
const validatePagination = require("../middleware/validation/validatePagination");

// Schemas
const newCategorySchema = require("../schemas/newCategorySchema.json");
const updatedCategorySchema = require("../schemas/updateCategorySchema.json");

router
  .route('/')
  .get(validatePagination, getCategories)
  .post(ensureLoggedIn, ensureAdmin, validateSchema(newCategorySchema), addNewCategory)

router
  .route('/:categoryId')
  .put(ensureLoggedIn, ensureAdmin, validateParamId("categoryId"), validateSchema(updatedCategorySchema), updateCategory)
  .delete(ensureLoggedIn, ensureAdmin, validateParamId("categoryId"), deleteCategory)

router
  .route('/:categoryId/products')
  .get(validateParamId("categoryId"), getCategoryProducts)

router
  .route('/search/:searchTerm')
  .get(getSearchedCategory)

router
  .route('/products/filter')
  .get(sanitizeCategoryIds, getMultipleCategoryProducts)

module.exports = router;
