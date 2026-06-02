"use strict";

const Users = require("../models/Users");
const { BadRequestError } = require("../AppError");
const createToken = require("../helpers/tokens");

// @desc      Registers a new user to the database, create a verification token, and sends verification email.
// @route     POST /api/v1/users/register
// @access    Public (but requires valid email/username/password)
exports.registerUser = async (req, res, next) => {
  try {
    const body = req.body
    const newUser = await Users.register(body);
    const token = await createToken(newUser);

    return res.status(201).json({ token });
    } catch(err) {
      return next(err);
    }
  };

// @desc      Removes a user from the database.
// @route     DELETE /api/v1/users/:username
// @access    Private (but requires valid authentication and authorization)
exports.removeUser = async (req, res, next) => {
  try {
    const { username } = req.params;
    const success = await Users.remove(username);

    return res.status(200).json({ 
      success
     });
  } catch (err) {
    return next(err);
  }
};