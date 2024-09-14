"use strict";

/** Routes for Products. */

const {
  getProducts,
  addProduct,
  getProductById,
  updateProduct,
  deleteProductById,
  addCategoryToProduct
} = require("../controllers/products");
const router = require("express").Router({mergeParams: true});
const validateNewProduct = require("../middleware/validateNewProduct");
const validateUpdatedProduct = require("../middleware/validateUpdatedProduct");
// const validateCategoryToProduct = require("../middleware/validateCategoryToProduct");

router
  .route('/', )
  .get(getProducts)
  .post(validateNewProduct,addProduct)

router
  .route('/:id')
  .get(getProductById)
  .put(validateUpdatedProduct, updateProduct)
  .delete(deleteProductById)

router
  .route('/:productId/category/:categoryId')
  .post(addCategoryToProduct)

module.exports = router;

