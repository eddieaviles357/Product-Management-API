"use strict";

// controllers
const {
  getReviewsForProduct,
  getReview,
  addReviewToProduct,
  updateReviewToProduct,
  deleteReviewFromProduct
} = require("../controllers/reviews");

const router = require("express").Router();

// middleware
const validateParamId = require("../middleware/validation/validateParamId");
const validateSchema = require("../middleware/validation/validateSchema");
const validateUsername = require("../middleware/validation/validateUsername");
const validatePagination = require("../middleware/validation/validatePagination");

// schemas
const newReviewSchema = require("../schemas/newReviewSchema.json");
const updateReviewSchema = require("../schemas/updateReviewSchema.json");

const {ensureLoggedIn, ensureUser, ensureUserOrAdmin} = require("../middleware/auth/auth");

// Register param validators
router.param("id", validateParamId("id"));
router.param("productId", validateParamId("productId"));
router.param("username", validateUsername("username"));

router
  .route("/product/:id")
  .get(validatePagination, getReviewsForProduct)

router
  .route("/product/:productId/:username")
  .get(getReview)
  .post(ensureLoggedIn, ensureUser, validateSchema(newReviewSchema), addReviewToProduct)
  .put(ensureLoggedIn, ensureUser, validateSchema(updateReviewSchema), updateReviewToProduct)
  .delete(ensureLoggedIn, ensureUserOrAdmin, deleteReviewFromProduct)

module.exports = router;