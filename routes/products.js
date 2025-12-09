"use strict";

/** Routes for Products. */

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
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth/auth");
const validateSchema = require("../middleware/validation/validateSchema");
const newProductSchema = require("../schemas/newProductSchema.json");
const updatedProductSchema = require("../schemas/updateProductSchema.json");

router
  .route('/')
  .get(getProducts)
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

