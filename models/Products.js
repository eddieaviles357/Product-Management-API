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
      
  }

  /*
  updates product
  */
  static async updateProduct(id, product) {
    const { 
      sku, 
      name, 
      description, 
      price, 
      imageURL 
    } = product;

    const productInDb = JSON.stringify(await this.findProductById(id));
    const parsedProduct = JSON.parse(productInDb);

    if(Object.keys(parsedProduct).length === 0) return {};
    const {
      sku: sk, 
      name: nm, 
      description: desc, 
      price: prc, 
      image_url: imgURL
    } = parsedProduct;
    console.log("IMAGEURL",imgURL)
    
    const result = await db.query(`
      UPDATE products SET
        sku = COALESCE( NULLIF( $1, '' ),$6 ),
        product_name = COALESCE( NULLIF( $2, '' ),$7 ),
        product_description = COALESCE( NULLIF( $3, '' ),$8 ),
        price = COALESCE( NULLIF( $4, 0.00 ),$9 ),
        image_url = COALESCE( NULLIF( $5, '' ),$10 )
      WHERE product_id = $11
      RETURNING 
        sku, 
        product_name AS productName,
        product_description AS productDescription,
        price,
        image_url AS imageURL
      `, [sku, name, description, Number(price), imageURL, 
        sk, nm, desc, prc, imgURL, id]);

      return result.rows[0]
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