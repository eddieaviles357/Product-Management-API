"use strict";

const {
  getReviewsForProduct,
} = require("../controllers/reviews");
const router = require("express").Router();

// getReview
// addReview,
// updateReview,
// removeReview

router
  .route('/product/:id')
  .get(getReviewsForProduct)
//   .post()
//   .delete()

module.exports = router;