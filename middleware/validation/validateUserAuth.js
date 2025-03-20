"use strict";

const { BadRequestError } = require("../../AppError");
const jsonSchema = require("jsonschema")
const userAuthSchema = require("../../schemas/userAuthSchema.json");

const validateUserAuth = (req, res, next) => {
  const validatedSchema = jsonSchema.validate(req.body, userAuthSchema);
  
  if(!validatedSchema.valid) {
    return res.status(400).json({
      errors: validatedSchema.errors.map( errors => ({ property: errors.property.slice(9), message: errors.stack.slice(9) }))
    });
  };

  next();
}
  
module.exports = validateUserAuth;