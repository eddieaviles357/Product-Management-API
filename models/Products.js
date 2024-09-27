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
    gets all products, along with categories ** LIMIT TO BE SET FOR PAGINATION **
    returns [
      {sku, name, description, price, imageURL, createdAt}, 
      {...}
      ]
  */
  static async getProducts(id = 100000000) { // useful to use ARRAY_AGG(category)
    const result = await db.query(`
      SELECT 
        p.product_id AS id,
        p.sku,
        p.product_name AS "productName",
        p.product_description AS "productDescription",
        p.price,
        p.stock,
        p.image_url AS "imageURL",
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt",
        ARRAY_AGG(c.category) AS categories
      FROM products AS p
      JOIN products_categories AS p_c ON p.product_id = p_c.product_id
      JOIN categories AS c ON p_c.category_id = c.id
      WHERE p.product_id < $1
      GROUP BY p.product_id
      ORDER BY p.product_id DESC
      LIMIT 20
      `, [id]);
    
    return result.rows;
  }

  /*
  gets product using an id
  returns -> { sku, name, description, price, imageURL, createdAt, categories: [] }

  */
  static async findProductById(id) {
    if(typeof id !== "number" || isNaN(id)) throw new UnprocessableEntityError("ID must be a number");

    const result = await db.query(`
      SELECT
        p.product_id AS id,
        p.sku,
        p.product_name AS name,
        p.product_description AS description,
        p.price,
        p.stock,
        p.image_url,
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt",
        ARRAY_AGG(c.category) AS categories
      FROM products p
      JOIN products_categories pc ON pc.product_id = p.product_id
      JOIN categories c ON c.id = pc.category_id
      WHERE p.product_id = $1
      GROUP BY p.product_id
    `, [id]);
    
    return (result.rows.length === 0) ? {} : result.rows[0];
  }

  /*
  adds a new product to db -> void
  */
  static async addProduct({ sku, name, description, price, stock, imageURL }) {

    // const doesProductExist = await db.query(`SELECT sku FROM products WHERE sku = $1`, [sku]);

    // // throw Error if product already exists
    // if( doesProductExist.length === 0 ) throw new BadRequestError(`Product already exists`);

    // insert product and use the id to insert into products_categories table inserting default 'none' category
    const result = await db.query(`
      WITH insert_to_prod AS (
        INSERT INTO products (sku, product_name, product_description, price, stock, image_url)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING 
          product_id AS id, 
          sku, 
          product_name AS "productName", 
          product_description AS "productDescription",
          price,
          stock,
          image_url AS "imageURL",
          created_at AS "createdAt"
      ),
      inserted AS (
        INSERT INTO products_categories (product_id, category_id)
        SELECT id, 1 FROM insert_to_prod
      )
        SELECT * FROM insert_to_prod
      `, [sku, name, description, price, stock, imageURL]);
    
    return result.rows[0];
  }

  /*
  updates product
  */
  static async updateProduct(id, productBody) {
    const defVal = {
      sku: '', 
      name: '', 
      description: '', 
      price: 0, 
      stock: 0, 
      imageURL: ''
    };

    const { sku, name, description, price, stock, imageURL } = Object.assign( {}, defVal, productBody );
    
    // if values are empty then return an empty object {}
    if(  
      sku.length === 0 & 
      name.length === 0 & 
      description.length === 0 & 
      price === 0 & 
      stock === 0 &
      imageURL.length === 0
      ) return {};
      
    const prd = await db.query(`
      SELECT
        product_id AS id,
        sku,
        product_name AS name,
        product_description AS description,
        price,
        stock,
        image_url,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM products WHERE product_id = $1
      `, [id]);

    if(prd.rows.length === 0) return {};

    const existingProduct = JSON.stringify(prd.rows[0]);
    const parsedProduct = JSON.parse(existingProduct);

    // must assign values different names to avoid collisions issues
    const {
      sku: sk, 
      name: nm, 
      description: desc, 
      price: prc,
      stock: stck,
      image_url: imgURL
    } = parsedProduct;
    
    const result = await db.query(`
      UPDATE products SET
        sku =                 COALESCE( NULLIF($1, ''), $7 ),
        product_name =        COALESCE( NULLIF($2, ''), $8 ),
        product_description = COALESCE( NULLIF($3, ''), $9 ),
        price =               COALESCE( NULLIF($4, 0.00), $10 ),
        stock =               $5::integer + $11,
        image_url =           COALESCE( NULLIF($6, ''), $12 ),
        updated_at = NOW()
      WHERE product_id = $13
      RETURNING 
        product_id AS id,
        sku, 
        product_name AS "productName",
        product_description AS "productDescription",
        price,
        stock,
        image_url AS "imageURL",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `, [sku, name, description, price, stock, imageURL, 
        sk, nm, desc, prc, stck, imgURL, id]);

    return result.rows[0];
  }

  static async addCategoryToProduct(productId, categoryId) {
    const result = await db.query(`
      INSERT INTO products_categories (product_id, category_id)
      VALUES ($1, $2)
      `, [productId, categoryId]);
    
    return result.rows[0];
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