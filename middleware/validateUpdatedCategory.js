"use strict";

const jsonSchema = require("jsonschema")
const updatedCategorySchema = require("../schemas/updateCategorySchema.json")

const validateUpdatedCategory = (req, res, next) => {

  const validatedSchema = jsonSchema.validate(req.body, updatedCategorySchema);
  
  if(!validatedSchema.valid) {
    console.log(validatedSchema);
    return res.status(400).json({ 
      errors: validatedSchema.errors.map( errors => ({ property: errors.property.slice(9), message: errors.stack.slice(9) }))
    });
  }

  next();
}
  
module.exports = validateUpdatedCategory;