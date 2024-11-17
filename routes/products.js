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
  .delete(deleteCategoryFromProduct,)

module.exports = router;

