"use strict";

const { BadRequestError } = require("../../AppError");

const validateParamId = (paramName) => (req, res, next) => {
  const value = Number(req.params[paramName]);

  if (!/^[1-9]\d*$/.test(value) || value > 2_147_483_647 || value < 1) {
      throw new BadRequestError("Invalid order ID");
    }
  req.params[paramName] = value;
  next();
};

module.exports = validateParamId;