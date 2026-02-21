'use strict';

const Products = require("../models/Products");
const { BadRequestError } = require("../AppError");

// @desc      Get all products with pagination
// @route     GET /api/v1/products?page=1&limit=10
// @access    Public
exports.getProducts = async (req, res, next) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    // Validate pagination parameters
    if (page < 1) {
      throw new BadRequestError("Page must be greater than 0");
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestError("Limit must be between 1 and 100");
    }

    const result = await Products.getProducts(page, limit);

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
    const id = Number(req.params.id);

    if (isNaN(id) || id <= 0) {
      throw new BadRequestError("Product id must be a positive number");
    }

    const product = await Products.findProductById(id);

    if (!product || Object.keys(product).length === 0) {
      throw new BadRequestError(`Product with id ${id} not found`);
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
    const productId = Number(req.params.id);

    if (isNaN(productId) || productId <= 0) {
      throw new BadRequestError("Product id must be a positive number");
    }

    const productBody = req.body;
    const updatedProduct = await Products.updateProduct(productId, productBody);
    
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
    const pId = Number(req.params.productId);
    const cId = Number(req.params.categoryId);

    if (isNaN(pId) || isNaN(cId) || pId <= 0 || cId <= 0) {
      throw new BadRequestError("Product id and category id must be positive numbers");
    }

    const result = await Products.addCategoryToProduct(pId, cId);

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
    const pId = Number(req.params.productId);
    const cId = Number(req.params.categoryId);

    if (isNaN(pId) || isNaN(cId) || pId <= 0 || cId <= 0) {
      throw new BadRequestError("Product id and category id must be positive numbers");
    }
    
    const success = await Products.removeCategoryFromProduct(pId, cId);

    const statusCode = success ? 200 : 204;

    return res.status(statusCode).json({ 
      success,
      message: success 
        ? `Category with id ${cId} removed from product with id ${pId}` 
        : `Category with id ${cId} not found on product with id ${pId}`,
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
    const id = Number(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      throw new BadRequestError("Product id must be a positive number");
    }

    const isDeleted = await Products.removeProduct(id);

    const statusCode = isDeleted ? 200 : 204;

    return res.status(statusCode).json({ 
      success: isDeleted,
      message: isDeleted 
        ? `Product with id ${id} deleted successfully` 
        : `Product with id ${id} not found`,
    });
  } catch (err) {
    return next(err);
  }
};