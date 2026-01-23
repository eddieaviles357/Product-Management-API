"use strict";

const Address = require("../models/Address");

/**
 * @desc      Get user address
 * @route     GET /api/v1/address/:username
 * @access    Private
 */
exports.getAddress = async (req, res, next) => {
  try {
    const { username } = req.params;
    const address = await Address.getAddress(username);

    return res.status(200).json({ success: true, address });
  } catch (err) {
    return next(err);
  }
};

/**
 * @desc      Create or update user address
 * @route     POST /api/v1/address/:username
 * @access    Private
 */
exports.upsertAddress = async (req, res, next) => {
  try {
    const { username } = req.params;
    const addressData = req.body;
    const address = await Address.upsertAddress(username, addressData);

    return res.status(200).json({ success: true, address });
  } catch (err) {
    return next(err);
  }
};

/**
 * @desc      Delete user address
 * @route     DELETE /api/v1/address/:username
 * @access    Private
 */
exports.deleteAddress = async (req, res, next) => {
  try {
    const { username } = req.params;
    const result = await Address.deleteAddress(username);

    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
};
