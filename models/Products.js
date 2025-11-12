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
  /**
   * Gets all products from the database.
   * @param {number} id - the id to use as a cursor
   * @returns {array} - returns an array of products
   * @throws {BadRequestError} - if there is a database error
   */
  static async getProducts(id = 100000000) {
    try {
      if(!id) throw new BadRequestError("Invalid id");
      const queryStatement = `SELECT *
                              FROM mv_product_list
                              WHERE id < $1`;
                              // LIMIT 20`;
                              // LIMIT $2 OFFSET $3  -- Pagination
      const result = await db.query(queryStatement, [id]);
      return (result.rows.length === 0) ? [] : result.rows;
    } catch (err) {
      console.log(err);
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

      const queryStatement = `SELECT *
                              FROM mv_product_list
                              WHERE id = $1
                              LIMIT 1`;
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
      // sanitize sku
      sku = removeNonAlphaNumericChars(sku);
      /* 
        insert to products table, and use the return value id.
         Use return value id to our products_categories table setting default category to 'none' 
      */
      const queryStatement = `WITH inserted_product AS (
                                INSERT INTO products (
                                  sku,
                                  product_name,
                                  product_description,
                                  price,
                                  stock,
                                  image_url
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
                                  default_category AS (
                                    SELECT id AS category_id
                                    FROM categories
                                    WHERE category = 'none'
                                    LIMIT 1
                                  ),
                                  linked_category AS (
                                    INSERT INTO products_categories (product_id, category_id)
                                    SELECT p.id, c.category_id
                                    FROM inserted_product p
                                    CROSS JOIN default_category c
                                  )
                                SELECT * FROM inserted_product`;
      const queryValues = [sku, name, description, price, stock, imageURL]
      const result = await db.query(queryStatement, queryValues);
  
      if(!result.rows || result.length === 0) throw new BadRequestError("Something went wrong");

      return result.rows[0];
    } catch (err) {
      if(err.code === '23505' || err instanceof ConflictError) throw new ConflictError("This product already exists");
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrong");
    }
  }

  /**
   * Updates stock to a product in the database.
   * @param {number} id - The id of the product to update.
   * @param {number} stock - The amount to add or subtract from stock.
   * @returns {object} - Returns the updated product with id and stock.
   * @throws {BadRequestError} - if the product does not exist or if there is a database error
   */
  static async updateProductStock(id, stock) {
    try {
      if((!id && id !== 0) || stock === undefined || stock === null) throw new BadRequestError("Invalid id or stock");

      const queryStatement = `UPDATE products 
                              SET stock = stock + $1 
                              WHERE product_id = $2 
                              RETURNING 
                                product_id AS id, 
                                stock`;
      const queryValues = [stock, id];
      const result = await db.query(queryStatement, queryValues);
  
      if(!result.rows || result.rows.length === 0) throw new BadRequestError("Something went wrong updating stock");
      return result.rows[0];
    } catch (err) {
      if(err.code === '23514') throw new BadRequestError(`Product ${id} is out of stock`);
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrongggg");
    }
  }

  /**
   * Updates a product in the database.
   * @param {number} - Product id
   * @param {object} productBody Product fields to update (name, description, price, imageURL)
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
                                            image_url,
                                            created_at AS "createdAt",
                                            updated_at AS "updatedAt"
                                          FROM products WHERE product_id = $1`;

      const existingProductQueryResults = await db.query(productExistQueryStatement, [id]);
  
      if(existingProductQueryResults.rows.length === 0) throw new BadRequestError("No products to update");
      
      const defaultValues = {
        name: '', 
        description: '', 
        price: 0,
        imageURL: ''
      };

      // Merge defaults with provided values
      const { name, description, price, imageURL } = { ...defaultValues, ...productBody };
          
      // if values are empty or zero, do nothing
      if (
        name.length === 0 &&
        description.length === 0 &&
        price === 0 &&
        imageURL.length === 0
      ) {
        return {};
      }

      const existingProduct = existingProductQueryResults.rows[0];

      // must assign values different names to avoid collisions issues
      const {
        name: currentName,
        description: currentDescription,
        price: currentPrice,
        image_url: currentImageURL,
      } = existingProduct;
      
      const queryStatement = `UPDATE products 
                              SET
                                product_name =        COALESCE( NULLIF($1, ''), $5 ),
                                product_description = COALESCE( NULLIF($2, ''), $6 ),
                                price =               COALESCE( NULLIF($3, 0.00), $7 ),
                                image_url =           COALESCE( NULLIF($4, ''), $8 ),
                                updated_at = NOW()
                              WHERE product_id = $9
                              RETURNING 
                                product_id AS id,
                                sku, 
                                product_name AS "productName",
                                product_description AS "productDescription",
                                price,
                                image_url AS "imageURL",
                                created_at AS "createdAt",
                                updated_at AS "updatedAt"`;
      const queryValues = [
        name,
        description,
        price,
        imageURL,
        currentName,
        currentDescription,
        currentPrice,
        currentImageURL,
        id,
      ];

      const result = await db.query(queryStatement, queryValues);
  
      if (!result.rows || result.rows.length === 0) throw new BadRequestError("Something went wrong");
      
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

      const product = await db.query(`SELECT product_id FROM products WHERE product_id = $1`, [id]);
      if(product.rows.length === 0) throw new BadRequestError(`Product with id ${id} does not exist`);

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