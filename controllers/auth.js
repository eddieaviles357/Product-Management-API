"use strict";

const Users = require("../models/Users");
const { BadRequestError } = require("../AppError");
const createToken = require("../helpers/tokens");

// @desc      Registers a new user to the database
// @route     POST /api/v1/auth/register
// @access    Private/Admin ?????????
exports.registerUser = async (req, res, next) => {
  try {
    const body = req.body
    const newUser = await Users.register(body);
    const token = createToken(newUser);

    return res.status(201).json({ token });
    } catch(err) {
      return next(err);
    }
  };

// @desc      Creates a token when user is authorized
// @route     POST /api/v1/auth/authenticate
// @access    Private/Admin ?????????
exports.authenticateUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await Users.authenticate(username, password);
    const token = createToken(user);
    
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
}