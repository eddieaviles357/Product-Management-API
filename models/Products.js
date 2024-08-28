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
        image_url AS imageURL,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM products`);

    return result.rows;
  }

  /*
  gets product using an id
  returns -> { sku, name, description, price, imageURL, createdAt }

  */
  static async findProductById(id) {
    if(typeof id !== "number" || isNaN(id)) throw new UnprocessableEntityError("ID must be a number");

    const result = await db.query(`
      SELECT
        product_id AS id,
        sku,
        product_name AS name,
        product_description AS description,
        price AS price,
        image_url AS image_url,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM products
      WHERE product_id = $1
    `, [id]);
    return (result.rows.length === 0) ? {} : result.rows[0];
  }

  /*
  adds a new product to db -> void
  */
  static async addProduct({ sku, name, description, price, imageURL }) {

    const doesProductExist = await db.query(`SELECT sku FROM products WHERE sku = $1`, [sku]);

    // throw Error if product already exists
    if( doesProductExist.length === 0 ) throw new BadRequestError(`Product already exists`);

    const result = await db.query(`
      INSERT INTO products (sku, product_name, product_description, price, image_url)
      VALUES ($1, $2, $3, $4, $5)
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
    
    // if values are empty then return an empty object {}
    if(  sku.length === 0 
      & name.length === 0 
      & description.length === 0 
      & price === 0 
      & imageURL.length === 0) {
        return {};
      }
    
    const existingProduct = JSON.stringify(await this.findProductById(id));
    const parsedProduct = JSON.parse(existingProduct);

    // check if the object has any values if not return an empty object
    if(Object.keys(parsedProduct).length === 0) return {};

    // convert to Number
    parsedProduct.price = Number(parsedProduct.price);
    // must assign values different names to avoid collisions issues
    const {
      sku: sk, 
      name: nm, 
      description: desc, 
      price: prc, 
      image_url: imgURL
    } = parsedProduct;

    const result = await db.query(`
      UPDATE products SET
        sku = COALESCE( NULLIF( $1, '' ),$6 ),
        product_name = COALESCE( NULLIF( $2, '' ),$7 ),
        product_description = COALESCE( NULLIF( $3, '' ),$8 ),
        price = COALESCE( NULLIF( $4, 0.00 ),$9 ),
        image_url = COALESCE( NULLIF( $5, '' ),$10 ),
        updated_at = NOW()
      WHERE product_id = $11
      RETURNING 
        sku, 
        product_name AS productName,
        product_description AS productDescription,
        price,
        image_url AS imageURL,
        created_at AS createdAt,
        updated_at AS updated
      `, [sku, name, description, price, imageURL, 
        sk, nm, desc, prc, imgURL, id]);

      return result.rows[0]
  }

  /*
  removes a product from db
  returns -> { product_name, success }
  */
  static async removeProduct(id) {
    if(typeof id !== "number" || isNaN(id)) throw new UnprocessableEntityError("ID must be a number");

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