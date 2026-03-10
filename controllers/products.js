'use strict';

const Products = require("../models/Products");
const { BadRequestError } = require("../AppError");

// @desc      Get all products with pagination
// @route     GET /api/v1/products?page=1&limit=10
// @access    Public
exports.getProducts = async (req, res, next) => {
  try {
    const result = await Products.getProducts(req.pagination.page, req.pagination.limit);

    return res.status(200).json({
      success: true,
      ...result
    });

  } catch (err) {
    return next(err);
  }
};

// @desc      Get single product by id
// @route     GET /api/v1/products/:id
// @access    Public
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Products.findProductById(req.params.id);

    if (!product || Object.keys(product).length === 0) {
      throw new BadRequestError(`Product with id ${req.params.id} not found`);
    }

    return res.status(200).json({ 
      success: true, 
      product
    });
  } catch (err) {
    return next(err);
  }
};

// @desc      Add product to db
// @route     POST /api/v1/products
// @access    Private/Admin
exports.addProduct = async (req, res, next) => {
  try {
    const productToAdd = req.body;
    const product = await Products.addProduct(productToAdd);
    
    return res.status(201).json({ 
      success: true, 
      product
    });
  } catch (err) {
    return next(err);
  }
};

// @desc      Update product
// @route     PUT /api/v1/products/:id
// @access    Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    const productBody = req.body;
    const updatedProduct = await Products.updateProduct(req.params.id, productBody);
    
    return res.status(200).json({ 
      success: true, 
      product: updatedProduct
    });
  } catch (err) {
    return next(err);
  }
};


// @desc      Add category to product
// @route     POST /api/v1/products/:productId/category/:categoryId
// @access    Private/Admin
exports.addCategoryToProduct = async (req, res, next) => {
  try {
    const result = await Products.addCategoryToProduct(req.params.productId, req.params.categoryId);

    return res.status(201).json({ 
      success: true,
      data: result
    });
  } catch (err) {
    return next(err);
  }
};

// @desc      Delete category from product
// @route     DELETE /api/v1/products/:productId/category/:categoryId
// @access    Private/Admin
exports.deleteCategoryFromProduct = async (req, res, next) => {
  try {
    const success = await Products.removeCategoryFromProduct(req.params.productId, req.params.categoryId);

    const statusCode = success ? 200 : 204;

    return res.status(statusCode).json({ 
      success
    });
  } catch (err) {
    return next(err);
  }
};


// @desc      Delete product from db
// @route     DELETE /api/v1/products/:id
// @access    Private/Admin
exports.deleteProductById = async (req, res, next) => {
  try {
    const isDeleted = await Products.removeProduct(req.params.id);

    const statusCode = isDeleted ? 200 : 204;

    return res.status(statusCode).json({ 
      success: isDeleted,
      message: isDeleted 
        ? `Product with id ${req.params.id} deleted successfully` 
        : `Product with id ${req.params.id} not found`,
    });
  } catch (err) {
    return next(err);
  }
};