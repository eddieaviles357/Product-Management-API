"use strict";

const { BadRequestError } = require("../../AppError");

const validateUsername = (paramName) => (req, res, next) => {
  const value = req.params[paramName];
  // console.log(`Validating username: ${value}`);

  if (!value || value.length < 1 || value.length > 20) {
    return next(new BadRequestError(`${paramName} must be between 1 and 20 characters`));
  }

  req.params[paramName] = value;
  next();
};

module.exports = validateUsername;