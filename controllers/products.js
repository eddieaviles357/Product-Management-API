'use strict';

const Products = require("../models/Products");
const jsonSchema = require("jsonschema")
const newProductSchema = require("../schemas/newProductSchema.json");
const updateProductSchema = require("../schemas/updateProductSchema.json");

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
exports.addProduct = async (req, res, next) => { // Needs json schema validation
  try {
    const validatedSchema = jsonSchema.validate(req.body, newProductSchema);

    if(!validatedSchema.valid) {
      console.log(validatedSchema);
      return res.status(400).json({ 
        errors: validatedSchema.errors.map( errors => ({ property: errors.property.slice(9), message: errors.stack.slice(9) }))
      });
    }

    const productToAdd = req.body;
    await Products.addProduct(productToAdd);
    
    return res.status(200).json({ 
      success: true, 
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

// @desc      Delete product from db
// @route     DELETE /api/v1/products/:id
// @access    Private/Admin ?????????
exports.removeProductById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
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