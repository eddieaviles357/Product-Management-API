"use strict";

const validatePagination = (req, res, next) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);

  if (!Number.isInteger(page) || page < 1) {
    return next(new BadRequestError("Page must be a positive integer"));
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return next(new BadRequestError("Limit must be between 1 and 100"));
  }

  req.pagination = {
    page,
    limit,
  };

  next();
};

module.exports = validatePagination;