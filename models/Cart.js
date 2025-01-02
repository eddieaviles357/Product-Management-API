"use strict";

const db = require("../db");

const {BadRequestError} = require("../AppError");

class Cart {
  static async addToCart(username, productId, quantity = 1) {
    try {
      // check if username already exists. If so, get the id reference
      const userResult = await db.query(`SELECT id FROM users WHERE username = $1`, [username]);
      if(userResult.rows.length === 0) throw new BadRequestError(`User ${username} does not exist`);
      const userId = userResult.rows[0].id;
      // add product to cart using user id and product id
      const queryStatement = `INSERT INTO cart(user_id, product_id, quantity) 
                              VALUES($1, $2, $3) 
                              RETURNING user_id, product_id, quantity`;
      const values = [userId, productId, quantity];
      const cartResult = await db.query(queryStatement, values);

      return cartResult.rows[0];
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  static async updateCartItemQty(username, productId, quantity = 0) {
    try {
      // check if username already exists. If so, get the id reference
      const userResult = await db.query(`SELECT id FROM users WHERE username = $1`, [username]);
      if(userResult.rows.length === 0) throw new BadRequestError(`User ${username} does not exist`);
      const userId = userResult.rows[0].id;

      // get cart item details, if no data exist throw error
      const currItemQty = await db.query(`SELECT quantity FROM cart WHERE user_id = $1 AND product_id = $2`, [userId, productId]);
      if(currItemQty.rows.length === 0) throw new BadRequestError(`Nothing to update`);
      const currQty = currItemQty.rows[0].quantity;
      console.log(`curr quantity ${currQty} + ${quantity}`);
      // update qty 
      const queryStatement = `UPDATE cart SET
                              quantity = $4::integer + $3
                              WHERE user_id = $1 AND product_id = $2
                              RETURNING user_id, product_id, quantity`;
                              
      const values = [userId, productId, quantity, currQty];
      const updatedResult = await db.query(queryStatement, values);

      return updatedResult.rows;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }
}

module.exports = Cart;