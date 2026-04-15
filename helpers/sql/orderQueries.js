'strict';

function getTotalAmount() {
  return `
    SELECT total_amount::float AS "totalAmount"
    FROM orders
    WHERE id = $1
  `;
}

function getOrderById() {
  return `
    SELECT O.id AS "orderId",  
          OP.product_id, 
          OP.quantity, 
          OP.total_amount::float AS "productTotalAmount",
          P.id,
          P."productName",
          P."productDescription",
          P.price AS "productPrice",
          P."imageURL"
    FROM orders O 
    JOIN order_products OP ON O.id = OP.order_id
    JOIN mv_product_list P ON OP.product_id = P.id
    WHERE O.id = $1
  `;
}

function insertIntoOrders() {
  return `
    INSERT INTO orders(user_id, total_amount) 
    VALUES($1, $2) 
    RETURNING id
  `;
}

function updateOrders() {
  return `
    UPDATE orders
    SET status = 'paid'
    WHERE id = $1
  `;
}

function insertIntoOrderProducts(placeholders) {
  return `
    INSERT INTO order_products(order_id, product_id, quantity, total_amount)
    VALUES${placeholders}
    RETURNING id
  `;
}

function getAllOrdersByUsername() {
  return `
    SELECT O.id AS "orderId", 
          O.total_amount::float AS "totalAmount", 
          O.created_at AS "createdAt",
          OP.product_id, 
          OP.quantity, 
          OP.total_amount::float AS "productTotalAmount",
          P.id,
          P."productName",
          P."productDescription",
          P.price AS "productPrice",
          P."imageURL"
    FROM orders O
    JOIN order_products OP ON O.id = OP.order_id
    JOIN mv_product_list P ON OP.product_id = P.id
    WHERE O.user_id = $1
    ORDER BY O.created_at DESC
  `;
};

module.exports = {
  insertIntoOrders,
  insertIntoOrderProducts,
  getTotalAmount,
  getOrderById,
  getAllOrdersByUsername,
  updateOrders,
}