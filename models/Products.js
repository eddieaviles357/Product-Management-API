'use strict';

const db = require("../db.js");
const {
  AppError,
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
  ForbiddenError,
  UnprocessableEntityError
} = require("../AppError.js");

class Products {
  /*
    gets all products, ** LIMIT TO BE SET FOR PAGINATION **
    returns [
      {sku, name, description, price, imageURL, createdAt}, 
      {...}
      ]
  */
  static async getProducts() {
    const result = await db.query(`
      SELECT 
        product_id AS id,
        sku,  
        product_name AS name,
        product_description AS description,
        price AS price,
        image_url AS image_url,
        created_at AS created_at
      FROM products`);

    return (result.rows.length === 0) ? [] : result.rows;
  }

  /*
  gets product using an id
  returns -> { sku, name, description, price, imageURL, createdAt }

  */
  static async findProductById(id) {
    if(typeof id !== "number" || isNaN(id)) return new UnprocessableEntityError("ID must be a number");

    const result = await db.query(`
      SELECT
        product_id AS id,
        sku,
        product_name AS name,
        product_description AS description,
        price AS price,
        image_url AS image_url,
        created_at AS created_at
      FROM products
      WHERE product_id = $1
    `, [id]);

    return (result.rows.length === 0) ? {} : result.rows[0];
  }

  /*
  adds a new product to db -> void
  */
  static async addProduct(product) {
    const { sku, name, description, price, imageURL } = product;

    const result = await db.query(`
      INSERT INTO products (sku, product_name, product_description, price, image_url, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      `, [sku, name, description, price, imageURL]);
      
    console.log(result)
  }

  /*
  removes a product from db
  returns -> { product_name, success }
  */
  static async removeProduct(id) {
    if(typeof id !== "number" || isNaN(id)) return new UnprocessableEntityError("ID must be a number");

    const result = await db.query(`
      DELETE FROM products 
      WHERE product_id = $1
      RETURNING product_name
      `, [id]);

      return (result.rows.length === 0) 
            ? { product_name : `Product with id ${id} not found`, success: false } 
            : { ...result.rows[0], success: true }
    
  }

}

module.exports = Products;