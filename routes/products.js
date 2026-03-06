"use strict";

// Controllers
const {
  getProducts,
  addProduct,
  getProductById,
  updateProduct,
  deleteProductById,
  addCategoryToProduct,
  deleteCategoryFromProduct,
} = require("../controllers/products");

const router = require("express").Router({mergeParams: true});

// Middleware
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth/auth");
const validateSchema = require("../middleware/validation/validateSchema");
const validatePagination = require("../middleware/validation/validatePagination");
const validateParamId = require("../middleware/validation/validateParamId");

// Schemas
const newProductSchema = require("../schemas/newProductSchema.json");
const updatedProductSchema = require("../schemas/updateProductSchema.json");

// Register param validators
router.param("id", validateParamId("id"));
router.param("productId", validateParamId("productId"));
router.param("categoryId", validateParamId("categoryId"));

router
  .route('/')
  .get(validatePagination,getProducts)
  .post(ensureLoggedIn, ensureAdmin, validateSchema(newProductSchema), addProduct)

router
  .route('/:id')
  .get(getProductById)
  .put(ensureLoggedIn, ensureAdmin, validateSchema(updatedProductSchema), updateProduct)
  .delete(ensureLoggedIn, ensureAdmin, deleteProductById)

router
  .route('/:productId/category/:categoryId')
  .post(ensureLoggedIn, ensureAdmin, addCategoryToProduct)
  .delete(ensureLoggedIn, ensureAdmin, deleteCategoryFromProduct)

module.exports = router;

