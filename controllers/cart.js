"use strict";

const Cart = require("../models/Cart");

exports.getCart = async (req, res, next) => {
  try {
    const {username} = req.params;
    const result = await Cart.get(username);

    return res.status(200).json({success: true, result});
  } catch (err) {
    return next(err);
  }
}

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

exports.deleteCartItem = async (req, res, next) => {
  try {
    const {username, productId} = req.params;
    
    const result = await Cart.removeCartItem(username, productId);

    return res.status(200).json({success: true, result})
  } catch (err) {
    return next(err);  
  }
}
