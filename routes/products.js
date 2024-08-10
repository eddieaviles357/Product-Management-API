"use strict";

/** Routes for Products. */

// const Products = require("../models/Products");
const express = require("express");
const {
  getProducts,
  addProduct,
  getProductById,
  updateProduct,
  removeProductById,
} = require("../controllers/products");
const router = require("express").Router({mergeParams: true});
const validateNewProduct = require("../middleware/validateNewProduct");


router
  .route('/', )
  .get(getProducts)
  .post(validateNewProduct,addProduct)

router
  .route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(removeProductById)


module.exports = router;

