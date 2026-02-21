"use strict";

const db = require("../db");
const { BadRequestError } = require("../AppError");
const getUserId = require("../helpers/getUserId");
const Queries = require("../helpers/sql/orderQueries");

class Orders {
  /**
   * Inserts a product into the order_products table
   * @param {number} orderId
   * @param {object} queryValues - contains productId, quantity, and price
   * @return {number} - returns the id of the inserted order_product
   * @throws {BadRequestError} - if there is an error in the query
   */
  static async #insertOrderProducts(orderId, queryValues) {
    try {
      const {
        productId, 
        quantity, 
        price
      } = queryValues;

      const values = [orderId, productId, quantity, price];
      
      const {result} = await db.query(Queries.insertIntoOrderProducts(), values);

      return result.rows[0].id;

    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError(err.message);
    }
  };

  /**
   * Retrieves an order by its ID
   * @param {number} orderId - the ID of the order to retrieve
   * @returns {number} - returns the total amount of the order
   * @throws {BadRequestError} - if the order is not found or if there is an error in the query
   */
  static async #getOrderTotalAmount(orderId) {
    try {
      const result = await db.query(Queries.getTotalAmount(), [orderId]);

      if (result.rows.length === 0) throw new BadRequestError("Order not found");

      return result.rows[0].totalAmount;

    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError(err.message);
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
      const totalAmount = await this.#getOrderTotalAmount(orderId);

      const result = await db.query(Queries.getOrderById(), [orderId]);
      
      if (result.rows.length === 0) throw new BadRequestError("Order not found");

      return {totalAmount, orderItems: result.rows };
      
    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError(err.message);
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
      
      const orderResult = await db.query(Queries.insertIntoOrders(), [userId, totalPrice]);

      let orderId = orderResult.rows[0].id;

      // Insert into order_products table
      // Multiple async queries
      const orderProductIds = await Promise.all( 
        products.map( 
          (prodValues) => Orders.#insertOrderProducts(orderId, prodValues) 
        )
      )
      .then( (id) => id);
      
      return orderProductIds;

    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError(err.message);
    }
  }
};

module.exports = Orders;