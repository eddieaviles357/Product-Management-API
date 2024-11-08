"use strict";

const Users = require("../models/Users");
const { BadRequestError } = require("../AppError");

// @desc      Adds a user to the database
// @route     POST /api/v1/users
// @access    Private/Admin ?????????
exports.addUser = async (req, res, next) => {
  try {
    const body = req.body
    const result = await Users.register(body);

    return res.status(200).json({
      success: true,
      result
    });
    } catch(err) {
      return next(err);
    }
  };