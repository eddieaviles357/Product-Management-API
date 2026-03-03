"use strict";

const { BadRequestError } = require("../../AppError");

const sanitizeCategoryIds = (req, res, next) => {
  // Split “1,2,3” → ["1","2","3"]
  const rawIds = req.query.ids.split(",");
  
  if (!Array.isArray(rawIds) || rawIds.length === 0) {
    throw new BadRequestError("Query parameter 'ids' must be a non-empty array");
  }

  // Convert to integers and validate
  req.sanitizedCategoryIds = rawIds.map(id => {
    const parsed = Number(id);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestError("Each category ID must be a positive integer");
    }
    return parsed;
  });

  next();
}


module.exports = sanitizeCategoryIds;