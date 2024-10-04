'use strict';

const Products = require("../models/Products");
const { BadRequestError } = require("../AppError");

// @desc      Get all products
// @route     GET /api/v1/products || /api/v1/products?cursor=id
// @access    Private/Admin ?????????
exports.getProducts = async (req, res, next) => {
  try {
    // we will use cursor query to retrieve more products from db
    const { cursor } = req.query;

    if(cursor === undefined && Object.keys(req.query).length === 0) {
      const productsList = await Products.getProducts(cursor);

      return res.status(200).json({
        success: true,
        products: productsList
      });
    } else {
      const { cursor } = req.query;

      const productsList = await Products.getProducts(cursor);
      
      if(isNaN(cursor))throw new BadRequestError("cursor must be a number");

      return res.status(200).json({
        success: true,
        products: productsList
      });
    };

  } catch (err) {
    return next(err);
  }
};

// @desc      Get single product by id
// @route     GET /api/v1/products/:id
// @access    Private/Admin ?????????
exports.getProductById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if(isNaN(id)) throw new BadRequestError("id must be a number");

    const product = await Products.findProductById(id);

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
// @access    Private/Admin ?????????
exports.addProduct = async (req, res, next) => { // Needs json schema validation
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
// @access    Private/Admin ?????????
exports.updateProduct = async (req, res, next) => { // Needs json schema validation
  try {
    const productId = Number(req.params.id);
    const productBody = req.body;
    const updatedProduct = await Products.updateProduct(productId, productBody);
    
    return res.status(200).json({ 
      success: true, 
      updatedProduct
    });
  } catch (err) {
    return next(err);
  }
};


// @desc      Add category to product
// @route     POST /api/v1/products/:productId/category/:categoryId
// @access    Private/Admin ?????????
exports.addCategoryToProduct = async (req, res, next) => { // Needs json schema validation
  try {
    const pId = Number(req.params.productId);
    const cId = Number(req.params.categoryId);
    if(isNaN(pId) || isNaN(cId)) throw new BadRequestError("ids must be a number")

    const result = await Products.addCategoryToProduct(pId, cId);

    return res.status(200).json({ 
      success: true,
    });
  } catch (err) {
    return next(err);
  }
};


// @desc      Delete product from db
// @route     DELETE /api/v1/products/:id
// @access    Private/Admin ?????????
exports.deleteProductById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    
    if(isNaN(id)) throw new BadRequestError("id must be a number");

    const { success, product_name: productName } = await Products.removeProduct(id);

    const statusCode = success ? 200 : 204;

    return res.status(statusCode).json({ 
      success,
      productName
    });
  } catch (err) {
    return next(err);
  }
};