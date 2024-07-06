"use strict";

/** Routes for Products. */

// const express = require("express");
// const router = express.Router();
const router = require("express").Router();

/** GET /products => { products }
 *
 * Returns { }
 *
 **/

router.get("/", async function (req, res, next) {
  console.log('PRODUcSTS ROTUE')
  try {
    return res.json({ "name": "filter product"});
  } catch (err) {
    return next(err);
  }
});



module.exports = router;