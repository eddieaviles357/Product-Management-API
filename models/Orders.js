"use strict";

const db = require("../db");

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError
} = require("../AppError.js");

const getUserId = require("../helpers/getUserId");

class Orders {
  
  // static async create(username, {orderId, productId, qty, totalAmount}) {
  static async create(username, {cart}) {
    try {
      const userId = getUserId(username);

      // returns an array of objects containing productId, quantity, and price
      // the first value of the array will always be the total amount (eg 10.99 )
      let products = cart.reduce( (accum, next) => {
        // extract important values from cart
        const { productId, quantity, price } = next;
        
        const reducedBody = { productId, quantity, price };

        accum[0] += Number(price);
        
        accum.push(reducedBody);
        return accum;
      }, [0.00]);
      console.log(products);
      

      // const getCartStatement = `SELECT 
      //                           id, 
      //                           user_id AS "userId", 
      //                           product_id AS "productId", 
      //                           quantity,
      //                           price,
      //                           added_at AS "addedAt", 
      //                           updated_at AS "updatedAt"
      //                         FROM cart
      //                         WHERE user_id = $1`;
      // const cartResult = await db.query(getCartStatement, [userId]);

      // const createOrderStatement = `INSERT INTO orders(user_id, total_amount) 
      //                         VALUES($1, $2) 
      //                         RETURNING id, user_id AS "userId", total_amount AS "totalAmount"`;
      // const values = [userId, totalAmount];
      // const orderResult = await db.query(createOrderStatement, values);

      /********************************* NEEDS WORK ************************* */
      // const orderProductQuery = `INSERT INTO order_products VALUES($1, $2, $3, $4)`;
      // const ordProdValues = [orderId, productId, qty, totalAmount];
      // const orderProductsResult = await db.query(orderProductQuery, ordProdValues);

      // return orderResult.rows[0];
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }
};

module.exports = Orders;