'use strict';

const Products = require("../models/Products");

// @desc      Get all products
// @route     GET /api/v1/products
// @access    Private/Admin ?????????
exports.getProducts = async (req, res, next) => {
  try {
    const productsList = await Products.getProducts();

    return res.status(200).json({ 
      success: true, 
      products: productsList
    });
  } catch (err) {
    return next(err);
  }
};

// @desc      Get single products by id
// @route     GET /api/v1/products/:id
// @access    Private/Admin ?????????
exports.getProductById = async (req, res, next) => {
  try {
    const id = Number(req.params.id)
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
exports.addProduct = async (req, res, next) => {
  try {
    const productToAdd = req.body;
    await Products.addProduct(productToAdd);
    
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
exports.removeProductById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { success, product_name: productName } = await Products.removeProduct(id);
    return res.status(200).json({ 
      success,
      productName
    });
  } catch (err) {
    return next(err);
  }
};