"use strict";

/** Routes for Products. */

const {
  getProducts,
  addProduct,
  getProductById,
  updateProduct,
  deleteProductById,
  addCategoryToProduct,
  deleteCategoryFromProduct,
} = require("../controllers/products");
// const router = require("express").Router({mergeParams: true});
const router = require("express").Router({mergeParams: true});
const validateNewProduct = require("../middleware/validation/validateNewProduct");
const validateUpdatedProduct = require("../middleware/validation/validateUpdatedProduct");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth/auth");

router
  .route('/', )
  .get(getProducts)
  .post(ensureLoggedIn, ensureAdmin, validateNewProduct,addProduct)

router
  .route('/:id')
  .get(getProductById)
  .put(ensureLoggedIn, ensureAdmin, validateUpdatedProduct, updateProduct)
  .delete(ensureLoggedIn, ensureAdmin, deleteProductById)

router
  .route('/:productId/category/:categoryId')
  .post(ensureLoggedIn, ensureAdmin, addCategoryToProduct)
  .delete(ensureLoggedIn, ensureAdmin,deleteCategoryFromProduct,)

module.exports = router;

