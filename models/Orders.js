"use strict";

const db = require("../db");
const { BadRequestError } = require("../AppError");
const getUserId = require("../helpers/getUserId");

class Orders {
  /**
   * Inserts a product into the order_products table
   * @param {number} orderId
   * @param {object} queryValues - contains productId, quantity, and price
   * @return {number} - returns the id of the inserted order_product
   * @throws {BadRequestError} - if there is an error in the query
   */
  static async _insertOrderProducts(orderId, queryValues) {
    try {
      const {productId, quantity, price} = queryValues;
      const orderProductsStatement = `INSERT INTO order_products(order_id, product_id, quantity, total_amount)
                                      VALUES($1, $2, $3, $4)
                                      RETURNING id`;
      const result = await db.query(orderProductsStatement, [orderId, productId, quantity, price]);
      return result.rows[0].id;
    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrong");
    }
  };

  /**
   * Retrieves an order by its ID
   * @param {number} orderId - the ID of the order to retrieve
   * @returns {number} - returns the total amount of the order
   * @throws {BadRequestError} - if the order is not found or if there is an error in the query
   */
  static async _getOrderTotalAmount(orderId) {
    try {
      const orderTotalStatement = `SELECT total_amount AS "totalAmount" FROM orders WHERE id = $1`;
      const result = await db.query(orderTotalStatement, [orderId]);

      if (result.rows.length === 0) throw new BadRequestError("Order not found");
      return result.rows[0].totalAmount;
    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrong");
    }
  }

  /**
   * Retrieves an order by its ID, including the total amount and order items
   * @param {number} orderId - the ID of the order to retrieve
   * @returns {object} - returns an object containing the total amount and an array of order items
   * @throws {BadRequestError} - if the order is not found or if there is an error in the query
   */
  static async getOrderById(orderId) {
    try {
      const totalAmount = await this._getOrderTotalAmount(orderId);
      
      const orderStatement = `SELECT O.id AS "orderId",  
                                     OP.product_id, 
                                     OP.quantity, OP.total_amount AS "productTotalAmount" 
                               FROM orders O 
                               JOIN order_products OP ON O.id = OP.order_id
                               WHERE O.id = $1`;

      const result = await db.query(orderStatement, [orderId]);
      if (result.rows.length === 0) throw new BadRequestError("Order not found");
      return {totalAmount, orderItems: result.rows };
    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrong");
    }
  }

  /**
   * Creates a new order in the database
   * @param {string} username - the username of the user creating the order
   * @param {array} cart - contains an array of products with productId, quantity, and price
   * @returns {array} - returns an array of objects containing the inserted order and order_products
   */
  static async create(username, {cart}) {
    try {
      const userId = await getUserId(username);

      // returns an array of objects containing productId, quantity, and price
      // the first value of the array will always be the price ( total amount int )
      /* eg. [ 
              10.99, 
              { productId: 1, quantity: 2, price: 10.00 }, 
              { productId: 2, quantity: 1, price: 20.00} 
               ]
      */
      let products = cart.reduce( (accum, next) => {
        // extract important values from cart
        const { productId, quantity, price } = next;
        
        const reducedBody = { productId, quantity, price };

        accum[0] += Number(price);
        
        accum.push(reducedBody);
        return accum;
      }, [0.00]);
      
      // remove first value from products which is the price and store in variable
      let totalPrice = products.shift(); // price total
      
      const createOrderStatement = `INSERT INTO orders(user_id, total_amount) 
                                    VALUES($1, $2) 
                                    RETURNING id`;
      const values = [userId, totalPrice];
      
      const orderResult = await db.query(createOrderStatement, values);
      let orderId = orderResult.rows[0].id;

      // Insert into order_products table
      // Multiple async queries
      const orderProductIds = await Promise.all( 
        products.map( 
          (prodValues) => Orders._insertOrderProducts(orderId, prodValues) 
        )
      )
      .then( (id) => id);
      
      return orderProductIds;
    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrong");
    }
  }
};

module.exports = Orders;