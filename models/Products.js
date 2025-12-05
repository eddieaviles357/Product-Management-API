'use strict';

const db = require("../db.js");
const { BadRequestError, ConflictError } = require("../AppError");
const removeNonAlphaNumericChars = require("../helpers/removeNonAlphaNumericChars");
const { 
  getAddProductQuery,
  selectProductById,
  updateProduct
 } = require("../helpers/sql/productQueries");

// addProduct
// removeProduct
// getProducts
// findProductById

// updateProduct
// addCategoryToProduct 
// removeCategoryFromProduct
class Products {
  /**
   * Gets the total count of products in the database.
   * @returns {number} - returns the total number of products
   * @throws {BadRequestError} - if there is a database error
   */
  static async getTotalProductCount() {
    try {
      const result = await db.query(
        `SELECT COUNT(*) as total FROM mv_product_list`
      );
      return parseInt(result.rows[0].total, 10);
    } catch (err) {
      throw new BadRequestError("Something went wrong fetching product count");
    }
  }

  /**
   * Gets all products from the database with pagination.
   * @param {number} id - the id to use as a cursor
   * @returns {array} - returns an array of products
   * @throws {BadRequestError} - if there is a database error
   */
  static async getProducts(page = 1, limit = 10) {
    try {
      // Validate inputs
      if (page < 1 || limit < 1) {
        throw new BadRequestError("Page and limit must be greater than 0");
      }

      const offset = (page - 1) * limit;

      // Fetch products for the current page
      const result = await db.query(
        `SELECT *
        FROM mv_product_list
        ORDER BY id DESC
        LIMIT $1 OFFSET $2`, 
        [limit, offset]
      );

      // Get total count for pagination metadata
      const totalCount = await this.getTotalProductCount();
      const totalPages = Math.ceil(totalCount / limit);

      return {
        products: result.rows,
        pagination: {
          currentPage: page,
          pageSize: limit,
          total: totalCount,
          totalPages: totalPages
        }
      };
      
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
      if (!id) {
        throw new BadRequestError("Invalid id");
      }

      const result = await db.query(
        `SELECT *
        FROM mv_product_list
        WHERE id = $1
        LIMIT 1`, 
        [id]
      );
      
      if (result.rows.length === 0) {
        return {};
      }

      return result.rows[0];

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
      const queryStatement = getAddProductQuery();
      const queryValues = [sku, name, description, price, stock, imageURL]
      const result = await db.query(queryStatement, queryValues);
  
      if(!result.rows || result.length === 0) {
        throw new BadRequestError("Something went wrong");
      }

      return result.rows[0];

    } catch (err) {
      if(err.code === '23505' || err instanceof ConflictError) {
        throw new ConflictError("This product already exists");
      }

      if(err instanceof BadRequestError) {
        throw err;
      }

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
      if ( 
        (!id && id !== 0) || 
        stock === undefined || 
        stock === null
      ) {
        throw new BadRequestError("Invalid id or stock");
      }

      const queryStatement = `UPDATE products 
                              SET stock = stock + $1 
                              WHERE product_id = $2 
                              RETURNING 
                                product_id AS id, 
                                stock`;
      const queryValues = [stock, id];
      const result = await db.query(queryStatement, queryValues);
  
      if(!result.rows || result.rows.length === 0) {
        throw new BadRequestError("Something went wrong updating stock");
      }

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
      if(!id) {
        throw new BadRequestError("Invalid id");
      }

      const existingProductQueryResults = await db.query(selectProductById(), [id]);
  
      if(existingProductQueryResults.rows.length === 0) {
        throw new BadRequestError("No products to update");
      }
      
      const defaultValues = {
        name: '', 
        description: '', 
        price: 0,
        imageURL: ''
      };

      // Merge defaults with provided values
      const { name, description, price, imageURL } = { 
        ...defaultValues, 
        ...productBody 
      };
          
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

      const result = await db.query(updateProduct(), queryValues);
  
      if (!result.rows || result.rows.length === 0) {
        throw new BadRequestError("Something went wrong");
      }
      
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
      if(!productId || !categoryId) {
        throw new BadRequestError("Invalid id");
      }

      // confirm product exists in db
      const product = await this.findProductById(productId);

      if(!product || Object.keys(product).length === 0) {
        throw new BadRequestError(`product with id ${productId} does not exist`);
      }
  
      // does product contain default category "none" if so remove from db
      if(product.categories.includes('none')) {
        await db.query(
          `DELETE FROM products_categories 
          WHERE product_id = $1 AND category_id = 1`, 
          [productId]
        );
      }

      // insert the new category
      const queryStatement = `INSERT INTO products_categories (product_id, category_id)
                              VALUES ($1, $2)
                              RETURNING 
                                product_id AS "productId", 
                                category_id AS "categoryId"`;

      const result = await db.query(queryStatement, [productId, categoryId]);
      
      if (!result.rows || result.rows.length === 0) {
        throw new BadRequestError("Unable to add category to product");
      }

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
    if (!productId || !categoryId) {
      throw new BadRequestError("Invalid id");
    }

    // Fetch product
    const product = await this.findProductById(productId);
    if (!product || !product.categories) {
      return { message: "Nothing to remove", success: false };
    }

    const initialCount = product.categories.length;

    // Delete category relation
    const deleteResult = await db.query(
      `DELETE FROM products_categories
       WHERE product_id = $1 AND category_id = $2
       RETURNING product_id AS "productId", category_id AS "categoryId"`,
      [productId, categoryId]
    );

    const removed = deleteResult.rows.length > 0;

    // If nothing removed, stop early
    if (!removed) {
      return { message: "Nothing to remove", success: false };
    }

    // Determine if we need to insert default category
    const remainingCount = initialCount - 1;

    if (remainingCount === 0) {
      await db.query(
        `INSERT INTO products_categories (product_id, category_id)
         VALUES ($1, (SELECT id FROM categories WHERE category = 'none'))`,
        [productId]
      );
    }

    return { message: "Removed category", success: true };

  } catch (err) {
    if (err instanceof BadRequestError) throw err;
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
      if (!id) {
        throw new BadRequestError("Invalid id");
      }

      // Delete product
      const result = await db.query(
        `DELETE FROM products 
        WHERE product_id = $1
        RETURNING product_name AS "productName"`,
        [id]
      );

      if (result.rows.length === 0) {
        return {
          message: `Product with id ${id} does not exist`,
          success: false
        };
      }

      return {
        message: `Removed product ${result.rows[0].productName}`,
        success: true
      };

    } catch (err) {
      if (err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrong");
    }
  }
}


module.exports = Products;