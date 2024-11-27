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
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth/auth");
// addNewCategory,
// updateCategory,
// removeCategory

router
  .route('/')
  .get(getCategories)
  .post(ensureLoggedIn, ensureAdmin, validateNewCategory, addNewCategory)

router
  .route('/:categoryId')
  .put(ensureLoggedIn, ensureAdmin, validateUpdatedCategory, updateCategory)
  .delete(ensureLoggedIn, ensureAdmin, deleteCategory)

router
  .route('/:categoryId/products')
  .get(getCategoryProducts)

router
  .route('/search/:searchTerm')
  .get(getSearchedCategory)
module.exports = router;
