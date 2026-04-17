"use strict";

const db = require("../db");
const { BadRequestError } = require("../AppError");
const getUserId = require("../helpers/getUserId");
const Queries = require("../helpers/sql/orderQueries");
const { clearCart } = require("../helpers/sql/cartQueries");

class Orders {
  /**
   * Inserts a product into the order_products table
   * @param {number} orderId - the ID of the order to which the product belongs
   * @param {CartItem[]} cart - array of cart items - contains an array of products with productId, quantity, and price
   * @returns {void}
   */
  static async #insertOrderProducts(orderId, cart) {
    const values = [];
    const placeholders = [];

    cart.forEach( (item, i) => {
      const idx = i * 4; // 4 values per item
      placeholders.push(
        `($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4})`
      );
      values.push(orderId, item.productId, item.quantity, item.price);
    });

    const result = 
      await db.query(Queries.insertIntoOrderProducts(placeholders.join(",")), values);

    return result.rows;
  };

  /**
   * Retrieves an order by its ID
   * @param {number} orderId - the ID of the order to retrieve
   * @returns {number} - returns the total amount of the order
   */
  static async #getOrderTotalAmount(orderId) {
    const result = await db.query(Queries.getTotalAmount(), [orderId]);

    if (result.rows.length === 0) throw new BadRequestError("Order not found");

    return result.rows[0].totalAmount;
  };

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
      throw new BadRequestError(err.message);
    }
  };

  /**
   * Retrieves all orders for a given username, including the total amount and order items for each order
   * @param {string} username - the username of the user whose orders to retrieve
   * @returns {array} - returns an array of objects, each containing the total amount and an array of order items for each order
   * @throws {BadRequestError} - if there is an error in the query or if the user is not found
   */
  static async getAllOrdersByUsername(username) {
    try {
      const userId = await getUserId(username);

      const result = await db.query(Queries.getAllOrdersByUsername(), [userId]);


      return result.rows;
      
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  };

  /**
   * @typedef {object} CartItem
   * @property {number} id
   * @property {number} userId
   * @property {number} productId
   * @property {number} quantity
   * @property {string} price
   * @property {string} addedAt - ISO date string
   * @property {string} updatedAt - ISO date string
   */
  /**
   * Creates a new order in the database
   * @param {string} username - the username of the user creating the order
   * @param {CartItem[]} cart - array of cart items - contains an array of products with productId, quantity, and price
   * @returns {array} - returns an array of objects containing the inserted order and order_products
   */
  static async create(username, {cart}) {
    try {
      const userId = await getUserId(username);

      // 1. Calculate total
      const totalAmount = cart.reduce((sum, item) => {
        return sum + Number(item.price) * item.quantity;
      }, 0);

      // 2. Insert into orders table
      const orderResult = await db.query(Queries.insertIntoOrders(), [userId, totalAmount]);
      const orderId = orderResult.rows[0].id;

      // 3. Insert into order_products table
      await this.#insertOrderProducts(orderId, cart);

      // 4. clear cart
      await db.query(clearCart(), [userId]);

      return {
        id: orderId,
        totalAmount,
        products: cart
      };

    } catch (err) {
      throw new BadRequestError(err.message);
    }
  };
};

module.exports = Orders;