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
      // Multiple queries
      const orderProductsStatement = `INSERT INTO order_products(order_id, product_id, quantity, total_amount)
                                      VALUES($1, $2, $3, $4)`;
      async function insertIntoOrderProductsTable(queryValues) {
        const {productId, quantity, price} = queryValues;
        try {
          const result = db.query(orderProductsStatement, [orderId, productId, quantity, price]);
          return result.rows;
        } catch (error) {
          console.log(error)
        }
        // return new Promise((resolve) => {
        //   resolve(db.query(orderProductsStatement, [productId, quantity, price]))
        // });
      }
      console.log('hit')
      return Promise.all(
        products.map( (prodValues) => {
          insertIntoOrderProductsTable(prodValues)
        })
      ).then((val) => { console.log('complete', val); return val})

      
      // const orderProductsResult = await db.query(orderProductsStatement, [orderId, productId, quantity]);

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