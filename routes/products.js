"use strict";

/** Routes for Products. */

// const express = require("express");
// const router = express.Router();
const router = require("express").Router();
const Products = require("../models/Products");

/** GET /products => { products }
 *
 * Returns { }
 *
 **/

router.get("/", async function (req, res, next) {
  
  console.log('getting products')
  try {
    const productResults = await Products.getProducts();
    return res.json({ "name": "filter product"});
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", async function (req, res, next) {
  const id = req.params.id;
  console.log('ID ', id);
  try {
    return res.json({ "id": id });
  } catch (err) {
    return next(err);
  }
});





module.exports = router;