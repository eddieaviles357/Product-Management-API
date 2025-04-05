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
   * Create a new order with the provided username and cart details
   * @param {string} username - the username of the user
   * @param {object} cart - contains array of products with productId, quantity, and price
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
      return Promise.all(
        products.map( (prodValues) => Orders._insertOrderProducts(orderId, prodValues) )
      )
      .then( (val) => val)
      .catch( (err) => { throw new BadRequestError(err.message) });

    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }
};

module.exports = Orders;