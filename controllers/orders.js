'use strict';

const Orders = require("../models/Orders");
const { BadRequestError } = require("../AppError");
const { getExpectedStatus } = require("../services/orderStatus");


// @desc      Create a new Order
// @route     POST /api/v1/orders/:username/createorder
// @access    Private/Admin ?????????
exports.createOrder = async (req, res, next) => {
  try {
    const userData = req.body || {};
    const order = await Orders.create(req.params.username, userData);

    return res.status(200).json({success: true, data: order});
  } catch (err) {
    return next(err);
  }
};

// @desc      Get Order by ID
// @route     GET /api/v1/orders/:username/getorder/:orderId
// @access    Private/Admin ?????????
exports.getOrdersById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    
    const order = await Orders.getOrderById(orderId);

    if (!order || order.length === 0) {
      throw new BadRequestError("Order not found");
    }

    return res.status(200).json({success: true, data: order});
  } catch (err) {
    return next(err);
  }
};

/******************** NEEDS PAGINATION **************** */

// @desc      Get Orders by Username
// @route     GET /api/v1/orders/:username
// @access    Private/Admin ?????????
exports.getAllOrders = async (req, res, next) => {
  try {
    const { username } = req.params;
    const orders = await Orders.getAllOrdersByUsername(username);

    return res.status(200).json({success: true, count: orders.length, data: orders});
  } catch (err) {
    return next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body ?? {};

    const expectedStatus = getExpectedStatus(status);

    if (!expectedStatus) {
      throw new BadRequestError("Status must be paid, shipped, delivered, cancelled, or refunded");
    }

    const order = await Orders.updateStatus(orderId, expectedStatus, status);

    if (!order) {
      return res.status(409).json({
        error: {
          message: `No order matched this ID with status "${expectedStatus}"`,
          status: 409,
        },
      });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (err) {
    return next(err);
  }
};