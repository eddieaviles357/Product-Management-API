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

const validateSchema = require("../middleware/validation/validateSchema");
const newCategorySchema = require("../schemas/newCategorySchema.json");
const updatedCategorySchema = require("../schemas/updateCategorySchema.json");

const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth/auth");
// addNewCategory,
// updateCategory,
// removeCategory

router
  .route('/')
  .get(getCategories)
  .post(ensureLoggedIn, ensureAdmin, validateSchema(newCategorySchema), addNewCategory)

router
  .route('/:categoryId')
  .put(ensureLoggedIn, ensureAdmin, validateSchema(newCategorySchema), updateCategory)
  .delete(ensureLoggedIn, ensureAdmin, deleteCategory)

router
  .route('/:categoryId/products')
  .get(getCategoryProducts)

router
  .route('/search/:searchTerm')
  .get(getSearchedCategory)
module.exports = router;
