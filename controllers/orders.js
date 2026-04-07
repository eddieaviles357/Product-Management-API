'use strict';

const Orders = require("../models/Orders");
const { BadRequestError } = require("../AppError");


// @desc      Create a new Order
// @route     POST /api/v1/checkout/createorder/:username/
// @access    Private/Admin ?????????
exports.createOrder = async (req, res, next) => {
  try {
    const cartOrder = req.body || {};
    const order = await Orders.create(req.params.username, cartOrder);

    return res.status(200).json({success: order});
  } catch (err) {
    return next(err);
  }
};

// @desc      Get Order by ID
// @route     GET /api/v1/checkout/getorder/:username/:orderId
// @access    Private/Admin ?????????
exports.getOrdersById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    
    const order = await Orders.getOrderById(orderId);

    if (!order || order.length === 0) {
      throw new BadRequestError("Order not found");
    }

    return res.status(200).json({success: order});
  } catch (err) {
    return next(err);
  }
};

// @desc      Get Orders by Username
// @route     GET /api/v1/checkout/getallorders/:username
// @access    Private/Admin ?????????
exports.getAllOrders = async (req, res, next) => {
  try {
    const { username } = req.params;
    const orders = await Orders.getAllOrdersByUsername(username);

    return res.status(200).json({success: orders});
  } catch (err) {
    return next(err);
  }
};