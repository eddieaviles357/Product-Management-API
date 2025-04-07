"use strict";

const db = require("../db");
const { BadRequestError } = require("../AppError");
const getUserId = require("../helpers/getUserId");

class Orders {
  /**
   * Inserts a product into the order_products table
   * @param {number} orderId
   * @param {object} queryValues - contains productId, quantity, and price
   * @returns {object} - returns the inserted row's id
   */
  static async _insertOrderProducts(orderId, queryValues) {
    try {
      const {productId, quantity, price} = queryValues;
      const orderProductsStatement = `INSERT INTO order_products(order_id, product_id, quantity, total_amount)
                                      VALUES($1, $2, $3, $4)
                                      RETURNING id`;
      const result = await db.query(orderProductsStatement, [orderId, productId, quantity, price]);
      return result.rows[0];
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  };

  /**
   * Creates a new order in the database
   * @param {string} username - the username of the user creating the order
   * @param {object} cart - contains an array of products with productId, quantity, and price
   * @returns {array} - returns an array of objects containing the inserted order and order_products
   */
  static async create(username, {cart}) {
    try {
      const userId = await getUserId(username);

      // returns an array of objects containing productId, quantity, and price
      // the first value of the array will always be the price ( total amount int )
      let products = cart.reduce( (accum, next) => {
        // extract important values from cart
        const { productId, quantity, price } = next;
        
        const reducedBody = { productId, quantity, price };

        accum[0] += Number(price);
        
        accum.push(reducedBody);
        return accum;
      }, [0.00]);
      
      // remove first value from products which is the price and store in variable
      let totalPrice = products.shift();
      
      const createOrderStatement = `INSERT INTO orders(user_id, total_amount) 
                                    VALUES($1, $2) 
                                    RETURNING id`;
      const values = [userId, totalPrice];
      
      const orderResult = await db.query(createOrderStatement, values);
      let orderId = orderResult.rows[0].id;

      // Insert into order_products table
      // Multiple async queries
      const orderProductIds = Promise.all( products.map( (prodValues) => Orders._insertOrderProducts(orderId, prodValues) ))
      .then( (id) => id)
      .catch( (err) => { throw new BadRequestError(err.message) });

      return orderProductIds;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }
};
// SELECT O.id, O.user_id, O.total_amount, OP.id, OP.order_id, OP.product_id, OP.quantity, OP.total_amount 
// FROM orders O 
// JOIN order_products OP 
// ON O.id = OP.order_id;
module.exports = Orders;