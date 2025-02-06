"use strict";

const db = require("../db");
const {BadRequestError} = require("../AppError");
const getUserId = require("../helpers/getUserId");

class Cart {

  static async get(username) {
    try {
      const userId = await getUserId(username);

      const queryStatement = `SELECT 
                                id, 
                                user_id AS "userId", 
                                product_id AS "productId", 
                                quantity,
                                price,
                                added_at AS "addedAt", 
                                updated_at AS "updatedAt"
                              FROM cart
                              WHERE user_id = $1`;
      const cartResult = await db.query(queryStatement, [userId]);
      return (cartResult.rows.length === 0) ? {} : cartResult.rows;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  static async clear (username) {
    try {
      const userId = await getUserId(username);

      const removedResult = await db.query(`DELETE FROM cart WHERE user_id = $1 RETURNING *`, [userId]);
      
      return (removedResult.rows.length > 0) ? true : false; 
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  static async addToCart(username, productId, quantity = 1) {
    try {
      let price;
      const userId = await getUserId(username);

      // get price from product we will use this to total up price
      const priceResult = await db.query(`SELECT price FROM products WHERE product_id = $1`, [productId]);
      if(priceResult.rows.length === 0) throw new BadRequestError(`Item ${productId} does not exist`);
      price = Number(priceResult.rows[0].price);

      // We are only going to allow one product per cart. We will have to use updateCartItemQty to increase the quantity
      const cartItemResult = await db.query(`SELECT user_id, product_id, quantity FROM cart WHERE user_id = $1 AND product_id = $2`, [userId, productId]);
      if(cartItemResult.rows.length > 0) return cartItemResult.rows[0];

      // add product to cart using user id, product id, and price
      const queryStatement = `INSERT INTO cart(user_id, product_id, quantity, price) 
                              VALUES($1, $2, $3, $4) 
                              RETURNING user_id, product_id, quantity, price`;
      const values = [userId, productId, quantity, price];
      const cartResult = await db.query(queryStatement, values);

      return cartResult.rows[0];
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  static async updateCartItemQty(username, productId, quantity = 0) {
    try {
      let price;
      let qty;
      const userId = await getUserId(username);

      // get price from product we will use this to total up price
      const priceResult = await db.query(`SELECT price FROM products WHERE product_id = $1`, [productId]);
      if(priceResult.rows.length === 0) throw new BadRequestError(`Item ${productId} does not exist`);
      price = Number(priceResult.rows[0].price);

      // get cart item details, if no data exist throw error
      const itemResult = await db.query(`SELECT quantity FROM cart WHERE user_id = $1 AND product_id = $2`, [userId, productId]);
      if(itemResult.rows.length === 0) throw new BadRequestError(`Nothing to update`);
      // Object that contains { quantity, price}
      const { quantity: currentQty } = itemResult.rows[0];
      price = price * ( currentQty + quantity );
      qty = currentQty + quantity;
      
      if(qty <= 0) await db.query(`DELETE FROM cart WHERE user_id = $1 AND product_id = $2`, [userId, productId]);

      // update
      const queryStatement = `UPDATE cart SET
                              quantity = $3,
                              price = $4
                              WHERE user_id = $1 AND product_id = $2
                              RETURNING user_id, product_id, quantity, price`;
                              
      const values = [userId, productId, qty, price];
      const updatedResult = await db.query(queryStatement, values);

      return updatedResult.rows;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  static async removeCartItem (username, productId) {
    try {
      const userId = await getUserId(username);

      const queryStatement = `DELETE FROM cart WHERE user_id = $1 AND product_id = $2 RETURNING id`;
      const values = [userId, productId];
      const deleteResult = await db.query(queryStatement, values);

      if(deleteResult.rows.length === 0) return 'Nothing to delete';
      return deleteResult.rows;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }
}

module.exports = Cart;