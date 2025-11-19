function getPrice() {
  return `
  SELECT price 
  FROM products 
  WHERE product_id = $1
`
}

function getCartItems() {
  return `
  SELECT 
    id, 
    user_id AS "userId", 
    product_id AS "productId", 
    quantity,
    price,
    added_at AS "addedAt", 
    updated_at AS "updatedAt"
  FROM cart
  WHERE user_id = $1
`
}

function clearCart() {
  return `
  DELETE FROM cart 
  WHERE user_id = $1
  RETURNING *
`
}

function getCartItem() {
  return `
    SELECT quantity 
    FROM cart 
    WHERE user_id = $1 AND product_id = $2
  `
}

function getExistingCartItem() {
  return `
    SELECT 
      user_id AS "userId", 
      product_id AS "productId", 
      quantity, 
      price 
    FROM cart 
    WHERE user_id = $1 AND product_id = $2
  `
}

function insertCartItem() {
  return `
    INSERT INTO cart (user_id, product_id, quantity, price)
    VALUES ($1, $2, $3, $4)
    RETURNING 
      user_id AS "userId", 
      product_id AS "productId", 
      quantity, 
      price
  `
}

function updateCartItem() {
  return `
    UPDATE cart 
    SET quantity = $3, price = $4
    WHERE user_id = $1 AND product_id = $2
    RETURNING 
      user_id AS "userId", 
      product_id AS "productId", 
      quantity, 
      price
  `
}

function deleteCartItem() {
  return `
    DELETE FROM cart 
    WHERE user_id = $1 AND product_id = $2
    RETURNING product_id AS "productId"
  `
}

module.exports = {
  getPrice,
  getCartItems,
  clearCart,
  getCartItem,
  getExistingCartItem,
  insertCartItem,
  updateCartItem,
  deleteCartItem
};