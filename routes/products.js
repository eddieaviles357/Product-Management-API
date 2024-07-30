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


router
  .route('/', )
  .get(getProducts)
  .post(addProduct)

router
  .route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(removeProductById)


module.exports = router;

