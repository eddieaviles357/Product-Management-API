"use strict";

/** Routes for Products. */

// const express = require("express");
// const router = express.Router();
const router = require("express").Router();
const Products = require("../models/Products");

/** GET /products => { products }
 *
 * Returns { "products": [ {sku, name, description, price, imageURL, createdAt} ] }
 *
 **/

router.get("/", async function (req, res, next) {
  
  try {
    const productsList = await Products.getProducts();
    return res.json({"products": productsList});
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", async function (req, res, next) {
  const id = req.params.id;
  const product = await Products.findProductById(id);

  try {
    return res.json({ product });
  } catch (err) {
    return next(err);
  }
});





module.exports = router;