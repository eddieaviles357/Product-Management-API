'use strict';

const db = require("../db.js");
const { BadRequestError, ConflictError } = require("../AppError");
const removeNonAlphaNumericChars = require("../helpers/removeNonAlphaNumericChars.js");

// addProduct
// removeProduct
// getProducts
// findProductById

// updateProduct
// addCategoryToProduct 
// removeCategoryFromProduct
class Products {
  // static async _doesProductExist(id) {
  //   try {
  //     const result = await db.query(`SELECT product_id FROM products WHERE product_id = $1`, [id]);
  //     return (result.rows.length === 0) ? false : true;
  //   } catch (error) {
  //     throw new BadRequestError("Something went wrong retrieving product");
  //   }
  // }
  /**
   * Gets all products from the database.
   * @param {number} id - the id to use as a cursor
   * @returns {array} - returns an array of products
   * @throws {BadRequestError} - if there is a database error
   */
  static async getProducts(id = 100000000) {
    try {
      if(!id) throw new BadRequestError("Invalid id");

      const queryStatement = `SELECT 
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
                              LIMIT 20`;
      const result = await db.query(queryStatement, [id]);
      return (result.rows.length === 0) ? [] : result.rows;
    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrong");
    }
  }

  /**
   * Finds a product by id.
   * @param {number} id
   * @returns {object} - returns the product with id, sku, productName, productDescription, price, imageURL, createdAt, updatedAt
   * @throws {BadRequestError} - if there is a database error
   */
  static async findProductById(id) {
    try {
      if(!id) throw new BadRequestError("Invalid id");

      const queryStatement = `SELECT
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
                              GROUP BY p.product_id`;
      const result = await db.query(queryStatement, [id]);
      
      return (result.rows.length === 0) ? {} : result.rows[0];
    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrong");
    }
  }

  /**
   * Adds a product to the database.
   * @param {object} productBody
   * @returns {object} - returns the added product with id, sku, productName, productDescription, price, stock, imageURL, createdAt
   * @throws {BadRequestError} - if there is a database error
   */
  static async addProduct({ sku, name, description, price, stock, imageURL }) {
    try {
      sku = removeNonAlphaNumericChars(sku);
      /* 
        insert to products table, and use the return value id.
         Use return value id to our products_categories table setting default category to 'none' 
      */
      const queryStatement = `WITH insert_to_prod AS ( 
                                    INSERT INTO products ( 
                                      sku, product_name, product_description, price, stock, image_url 
                                      )
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
                                  SELECT id, (SELECT id FROM categories WHERE category = 'none') FROM insert_to_prod 
                                  )
                              SELECT * FROM insert_to_prod`;
                              // WITH insert_to_prod AS ( INSERT INTO products ( sku, product_name, product_description, price, stock, image_url ) VALUES (1234, 'tester', 'testerdesc', 13.00, 1, 'https://yah.com') RETURNING product_id AS id, sku, product_name AS "productName", product_description AS "productDescription", price, stock, image_url AS "imageURL", created_at AS "createdAt" ), inserted AS ( INSERT INTO products_categories (product_id, category_id) SELECT id, 1 FROM insert_to_prod ) SELECT * FROM insert_to_prod;
      const queryValues = [sku, name, description, price, stock, imageURL]
      const result = await db.query(queryStatement, queryValues);
  
      if(result.length === 0) throw new BadRequestError("Something went wrong");
      return result.rows[0];
    } catch (err) {
      if(err.code === '23505' || err instanceof ConflictError) throw new ConflictError("Review for this product already exists");
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrong");
    }
  }

  /**
   * Updates stock to a product in the database.
   * @param {number} id
   * @param {number} stock
   * @returns {object} - returns the updated product with id, sku, productName, productDescription, price, stock, imageURL, createdAt
   * @throws {BadRequestError} - if the product does not exist or if there is a database error
   */
  static async updateProductStock(id, stock) {
    try {
      if((id === 0 && !id) || !stock) throw new BadRequestError("Invalid id or stock");
      // const isProductExisting = await this._doesProductExist(id);
      // if(!isProductExisting) throw new BadRequestError(`Product ${id} does not exist`);

      const queryStatement = `UPDATE products 
                              SET stock = stock + $1 
                              WHERE product_id = $2 
                              RETURNING product_id AS id, stock`;
      const queryValues = [stock, id];
      const result = await db.query(queryStatement, queryValues);
  
      if(result.rows.length === 0) throw new BadRequestError("Something went wrongfff");
      return result.rows[0];
    } catch (err) {
      console.log("err", err.code);
      if(err.code === '23514') throw new BadRequestError(`Product ${id} is out of stock`);
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrongggg");
    }
  }

  /**
   * Updates a product in the database.
   * @param {number} id
   * @param {object} productBody
   * @returns {object} - returns the updated product with id, sku, productName, productDescription, price, stock, imageURL, createdAt
   * @throws {BadRequestError} - if the product does not exist or if there is a database error
   */
  static async updateProduct(id, productBody) {
    try {  
      if(!id) throw new BadRequestError("Invalid id");

      const productExistQueryStatement = `SELECT
                                            product_id AS id,
                                            product_name AS name,
                                            product_description AS description,
                                            price,
                                            stock,
                                            image_url,
                                            created_at AS "createdAt",
                                            updated_at AS "updatedAt"
                                          FROM products WHERE product_id = $1`;
      const existingProductQueryResults = await db.query(productExistQueryStatement, [id]);
  
      if(existingProductQueryResults.rows.length === 0) throw new BadRequestError("No products to update");
      
      const defVal = {
        name: '', 
        description: '', 
        price: 0, 
        stock: 0, 
        imageURL: ''
      };
  
      // set default values if no values are given
      let { 
        name, 
        description, 
        price, 
        stock, 
        imageURL 
        } = Object.assign( {}, defVal, productBody );
        
      // if values are empty then return an empty object {}
      if(  
        name.length === 0 & 
        description.length === 0 & 
        price === 0 & 
        stock === 0 &
        imageURL.length === 0
        ) return {};

      const existingProduct = JSON.stringify(existingProductQueryResults.rows[0]);
      const parsedProduct = JSON.parse(existingProduct);

      // must assign values different names to avoid collisions issues
      const {
        name: nm, 
        description: desc, 
        price: prc,
        stock: stck,
        image_url: imgURL
      } = parsedProduct;
      
      const queryStatement = `UPDATE products SET
                                product_name =        COALESCE( NULLIF($1, ''), $6 ),
                                product_description = COALESCE( NULLIF($2, ''), $7 ),
                                price =               COALESCE( NULLIF($3, 0.00), $8 ),
                                stock =               $4::integer + $9,
                                image_url =           COALESCE( NULLIF($5, ''), $10 ),
                                updated_at = NOW()
                              WHERE product_id = $11
                              RETURNING 
                                product_id AS id,
                                sku, 
                                product_name AS "productName",
                                product_description AS "productDescription",
                                price,
                                stock,
                                image_url AS "imageURL",
                                created_at AS "createdAt",
                                updated_at AS "updatedAt"`;
      const queryValues = [name, description, price, stock, imageURL, nm, desc, prc, stck, imgURL, id];
      const result = await db.query(queryStatement, queryValues);
  
      if(result.rows.length === 0) throw new BadRequestError("Something went wrong");
      return result.rows[0];
    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrong");
    }
  }

  /**
   * Adds a category to a product.
   * @param {number} productId
   * @param {number} categoryId
   * @returns {object} - returns the added category with productId and categoryId
   * @throws {BadRequestError} - if the product does not exist or if there is a database error
   */
  static async addCategoryToProduct(productId, categoryId) {
    try {
      if(!productId || !categoryId) throw new BadRequestError("Invalid id");
      // check if product exist in db
      const product = await this.findProductById(productId);
      if(Object.keys(product).length === 0) throw new BadRequestError(`product with id ${productId} does not exist`);
  
      // does product contain default category "none" if so remove from db
      const hasDefaultCategory = product.categories.includes('none');
      if(hasDefaultCategory) await db.query(`DELETE FROM products_categories WHERE product_id = $1 AND category_id = 1`, [productId]);
  
      // insert category to product
      const queryStatement = `INSERT INTO products_categories (product_id, category_id)
                              VALUES ($1, $2)
                              RETURNING 
                                product_id AS "productId", 
                                category_id AS "categoryId"`;
      const queryValues = [productId, categoryId]
      const result = await db.query(queryStatement, queryValues);
      
      if(result.rows.length === 0) throw new BadRequestError("Something went wrong");
      return  result.rows[0];
    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrong");
    }
  }

    /**
     * Removes a category from a product.
     * @param {number} productId
     * @param {number} categoryId
     * @returns {object} - returns the removed category with productId and categoryId
     * @throws {BadRequestError} - if the product does not exist or if there is a database error
     */
    static async removeCategoryFromProduct(productId, categoryId) {
      try {
        if(!productId || !categoryId) throw new BadRequestError("Invalid id");

        let categoryCount;
        // check if product exist in db
        const product = await this.findProductById(productId);

        if(Object.keys(product).length === 0) return { message : "Nothing to remove", success: false };

        categoryCount = product.categories.length;
  
  
        const queryStatement = `DELETE FROM products_categories 
                                WHERE product_id = $1 AND category_id = $2
                                RETURNING
                                  product_id AS "productId", 
                                  category_id AS "categoryId"`;
        const queryValues = [productId, categoryId];
        
        const result = await db.query(queryStatement, queryValues);
        
        // if delete query was successful then we subtract from categoryCount
        if(result.rows.length > 0) --categoryCount;
        // if there are no categories then we add our default category "none"
        if(categoryCount === 0) {
          const insertQueryStatement = `INSERT INTO products_categories (product_id, category_id)
                                        VALUES ($1, (SELECT id FROM categories WHERE category = 'none'))`;
          await db.query(insertQueryStatement, [productId]);
        }
        
        return (result.rows.length === 0) 
        ? { message : "Nothing to remove", success: false } 
        : { message : "Removed category", success: true };
      } catch (err) {
        if(err instanceof BadRequestError) throw err;
        throw new BadRequestError("Something went wrong");
      }
    }

  /**
   * Removes a product from the database.
   * @param {number} id
   * @returns {object} - returns the removed product with productName and success status
   * @throws {BadRequestError} - if the product does not exist or if there is a database error
   */
  static async removeProduct(id) {
    try {
      if(!id) throw new BadRequestError("Invalid id");

      const queryStatement = `DELETE FROM products 
                              WHERE product_id = $1
                              RETURNING product_name AS "productName"`;
      const result = await db.query(queryStatement, [id]);
      return (result.rows.length === 0) 
            ? { message : `Product with id ${id} not found`, success: false } 
            : { message : `Removed product ${result.rows[0].productName}`, success: true };
    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrong");
    }
  }
}

module.exports = Products;