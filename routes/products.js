"use strict";

/** Routes for Products. */

// const Products = require("../models/Products");
const express = require("express");
const {
  getProducts,
  getProductById
} = require("../controllers/products");
const router = require("express").Router({mergeParams: true});


router
  .route('/', )
  .get(getProducts)

router
  .route('/:id')
  .get(getProductById)


module.exports = router;

