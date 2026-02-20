'strict';

function insertIntoOrderProducts() {
  return `
    INSERT INTO order_products(order_id, product_id, quantity, total_amount)
    VALUES($1, $2, $3, $4)
    RETURNING id
    `;
}

function getTotalAmount() {
  return `
    SELECT total_amount AS "totalAmount"
    FROM orders
    WHERE id = $1
  `;
}

function getOrderById() {
  return `
    SELECT O.id AS "orderId",  
          OP.product_id, 
          OP.quantity, OP.total_amount AS "productTotalAmount" 
    FROM orders O 
    JOIN order_products OP ON O.id = OP.order_id
    WHERE O.id = $1
    `;
}

module.exports = {
  insertIntoOrderProducts,
  getTotalAmount,
  getOrderById
}