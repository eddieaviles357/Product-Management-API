"use strict";

const jsonSchema = require("jsonschema")
const userAuthSchema = require("../schemas/userAuthSchema.json");
const { BadRequestError } = require("../AppError");

const validateUserAuth = (req, res, next) => {
  const validatedSchema = jsonSchema.validate(req.body, userAuthSchema);
  
  if(!validatedSchema.valid) {
    // console.log(validatedSchema);
    const errors = validatedSchema.errors.map( e => ({ property: e.property.slice(9), message: e.stack.slice(9) }))
    
    throw new BadRequestError(errors);
  };

  next();
}
  
module.exports = validateUserAuth;