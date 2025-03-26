"use strict";

const { BadRequestError } = require("../../AppError");
const jsonSchema = require("jsonschema");

const validateSchema = (schema) => (req, res, next) => {
  const validatedSchema = jsonSchema.validate(req.body, schema);
  
  if(!validatedSchema.valid) {
    return res.status(400).json({
      errors: validatedSchema.errors.map( errors => ({ property: errors.property.slice(9), message: errors.stack.slice(9) }))
    });
  };

  next();
};

module.exports = validateSchema;