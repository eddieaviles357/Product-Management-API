"use strict";

const Cart = require("../models/Cart");

  /**
  * Retrieves cart items.
  * @param {string} username - username of the user
  * @returns {object} - JSON object with success status and cart items array
  * @throws {Error} - Throws an error if the cart retrieval fails
  */
exports.getCart = async (req, res, next) => {
  try {
    const {username} = req.params;
    const result = await Cart.get(username);

    return res.status(200).json({success: true, result});
  } catch (err) {
    return next(err);
  }
}

/**
 * Clears the cart for a given username.
 * @param {string} username - username of the user
 * @returns {object} - JSON object with success status and message
 * @throws {Error} - Throws an error if the cart clearing fails
 */
exports.clearCart = async (req, res, next) => {
  try {
    const {username} = req.params;
    const success = await Cart.clear(username);

    const message = success ? "Cart cleared" : "Nothing to remove";

    return res.status(200).json({ success, message });
  } catch (err) {
    return next(err);
  }
}

/**
 * Adds a product to the cart for a given user.
 * @param {string} username - username of the user
 * @param {number} productId - ID of the product to add
 * @param {number} quantity - quantity of the product to add
 * @returns {object} - JSON object with success status and result
 * @throws {Error} - Throws an error if the addition fails
 */
exports.addToCart = async (req, res, next) => {
  try {
    const {username, productId} = req.params;
    const {quantity} = req?.body;
    const result = await Cart.addToCart(username, productId, quantity);

    return res.status(201).json({success: true, result})
  } catch (err) {
    return next(err);
  }
}

/**
 * Updates the quantity of a product in the cart for a given user.
 * @param {string} username - username of the user
 * @param {number} productId - ID of the product to update
 * @param {number} quantity - new quantity of the product
 * @returns {object} - JSON object with success status and result
 * @throws {Error} - Throws an error if the update fails
 */
exports.updateCartItemQty = async (req, res, next) => {
  try {
    const {username, productId} = req.params;
    const {quantity} = req?.body;

    const result = await Cart.updateCartItemQty(username, productId, quantity);

    return res.status(200).json({success: true, result})
  } catch (err) {
    return next(err);
  }
}

/**
 * Deletes a product from the cart for a given user.
 * @param {string} username - username of the user
 * @param {number} productId - ID of the product to delete
 * @returns {object} - JSON object with success status and result
 * @throws {Error} - Throws an error if the deletion fails
 */
exports.deleteCartItem = async (req, res, next) => {
  try {
    const {username, productId} = req.params;
    
    const result = await Cart.removeCartItem(username, productId);

    return res.status(200).json({success: true, result})
  } catch (err) {
    return next(err);  
  }
}
