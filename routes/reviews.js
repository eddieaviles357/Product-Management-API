"use strict";

const {
  getReviewsForProduct,
  getReview
} = require("../controllers/reviews");
const router = require("express").Router();

// getReview
// addReview,
// updateReview,
// removeReview
router
  .route("/:reviewId")
  .get(getReview)
router
  .route("/product/:id")
  .get(getReviewsForProduct)
//   .post()
//   .delete()

module.exports = router;