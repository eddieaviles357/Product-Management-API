"use strict";

const db = require("../db");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError
} = require("../AppError.js");

class Orders {
  
  static async create(username, {orderId, productId, qty, totalAmount}) {
    try {
      // check if username exist, if so get the id reference
      const userResult = await db.query(`SELECT id FROM users WHERE username = $1`, [username]);
      if(userResult.rows.length === 0) throw new BadRequestError(`User ${username} does not exist`);
      const userId = userResult.rows[0].id;

      const queryStatement = `INSERT INTO orders(user_id, total_amount) 
                              VALUES($1, $2) 
                              RETURNING id, user_id AS "userId", total_amount AS "totalAmount"`;
      const values = [userId, total];
      const orderResult = await db.query(queryStatement, values);
      /********************************* NEEDS WORK ************************* */
      /********************************* NEEDS WORK ************************* */
      /********************************* NEEDS WORK ************************* */
      /********************************* NEEDS WORK ************************* */
      /********************************* NEEDS WORK ************************* */
      /********************************* NEEDS WORK ************************* */
      /********************************* NEEDS WORK ************************* */
      const orderProductQuery = `INSERT INTO order_products VALUES($1, $2, $3, $4)`;
      const ordProdValues = [orderId, productId, qty, totalAmount];
      const orderProductsResult = await db.query(orderProductQuery, ordProdValues);

      return orderResult.rows[0];
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }
};

module.exports = Orders;