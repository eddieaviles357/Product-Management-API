const validateProductId = (productId) => {
  const id = Number(productId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new BadRequestError("Product ID must be a positive integer");
  }
  return id;
}

module.exports = validateProductId;