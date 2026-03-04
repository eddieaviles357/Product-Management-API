"use strict";

const validateParamId = (paramName) => (req, res, next) => {
  const value = Number(req.params[paramName]);

  if (!Number.isInteger(value) || value <= 0) {
    return next(new BadRequestError(`${paramName} must be a positive integer`));
  }

  req.params[paramName] = value;
  next();
};

module.exports = validateParamId;