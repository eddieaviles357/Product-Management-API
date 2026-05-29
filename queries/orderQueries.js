'strict';

function getTotalAmount() {
  return `
    SELECT total_amount::float AS "totalAmount"
    FROM orders
    WHERE id = $1
  `;
}

function getProductPrice() {
  return `
    SELECT product_id, price
    FROM products
    WHERE product_id = ANY($1)
    `;
}

function getOrderById() {
  return `
    SELECT O.id AS "orderId",
          O.status AS "orderStatus",
          O.total_amount::float AS "totalAmount",
          O.created_at AS "createdAt",
          O.updated_at AS "updatedAt",

          O.address_1 AS "address1",
          O.address_2 AS "address2", 
          O.city,
          O.state,
          O.zipcode,

          json_agg(
            json_build_object(
              'productId', OP.product_id,
              'quantity', OP.quantity,
              'productName', P."productName",
              'productDescription', P."productDescription",
              'productPrice', P.price,
              'imageURL', P."imageURL"
            )
          ) AS "orderItems"

    FROM orders O 

    JOIN order_products OP 
      ON O.id = OP.order_id

    JOIN mv_product_list P 
      ON OP.product_id = P.id

    WHERE O.id = $1

    GROUP BY O.id
  `;
}

// old code - not used anymore
// function insertIntoOrders() {
//   return `
//     INSERT INTO orders(user_id, total_amount, address_id) 
//     VALUES($1, $2, $3) 
//     RETURNING id, user_id AS "userId", total_amount::float AS "totalAmount", address_id AS "addressId", status
//   `;
// }

function insertIntoOrders() {
  return `
    INSERT INTO orders(user_id, address_1, address_2, city, state, zipcode, total_amount) 
    VALUES($1, $2, $3, $4, $5, $6, $7) 
    RETURNING id, user_id AS "userId", total_amount::float AS "totalAmount", 
              address_1 AS "address1", address_2 AS "address2", city, state, zipcode, status
  `;
}

function updateOrders(status) {
  return `
    UPDATE orders
    SET status = ${status}
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
    SELECT 
      O.id AS "orderId", 
      O.status AS "orderStatus",
      O.total_amount::float AS "totalAmount", 
      O.created_at AS "createdAt",
      O.updated_at AS "updatedAt",

      O.address_1 AS "address1",
      O.address_2 AS "address2",
      O.city,
      O.state,
      O.zipcode,

      json_agg(
        json_build_object(
          'productId', OP.product_id,
          'quantity', OP.quantity,
          'productTotalAmount', OP.total_amount::float,
          'productName', P."productName",
          'productDescription', P."productDescription",
          'productPrice', P.price,
          'imageURL', P."imageURL"
        )
      ) AS "orderItems"

    FROM orders O

    JOIN order_products OP 
      ON O.id = OP.order_id

    JOIN mv_product_list P 
      ON OP.product_id = P.id

    WHERE O.user_id = $1

    GROUP BY O.id

    ORDER BY O.created_at DESC
  `;
};

module.exports = {
  insertIntoOrders,
  insertIntoOrderProducts,
  getTotalAmount,
  getOrderById,
  getProductPrice,
  getAllOrdersByUsername,
  updateOrders,
}