const jsonSchema = require("jsonschema")
const newProductSchema = require("../schemas/newProductSchema.json");

const validateNewProduct = (req, res, next) => {

  const validatedSchema = jsonSchema.validate(req.body, newProductSchema);
  
  if(!validatedSchema.valid) {
    console.log(validatedSchema);
    return res.status(400).json({ 
      errors: validatedSchema.errors.map( errors => ({ property: errors.property.slice(9), message: errors.stack.slice(9) }))
    });
  }

  next();
}
  
module.exports = validateNewProduct;