"use strict";

/** Routes for Products. */

const {
  getProducts,
  addProduct,
  getProductById,
  updateProduct,
  removeProductById,
} = require("../controllers/products");
const router = require("express").Router({mergeParams: true});
const validateNewProduct = require("../middleware/validateNewProduct");
const validateUpdatedProduct = require("../middleware/validateUpdatedProduct");

router
  .route('/', )
  .get(getProducts)
  .post(validateNewProduct,addProduct)

router
  .route('/:id')
  .get(getProductById)
  .put(validateUpdatedProduct, updateProduct)
  .delete(removeProductById)


module.exports = router;

