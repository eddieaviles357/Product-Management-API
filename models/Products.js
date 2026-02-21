'use strict';

const db = require("../db.js");
const { BadRequestError, ConflictError } = require("../AppError");
const removeNonAlphaNumericChars = require("../helpers/removeNonAlphaNumericChars");
const sanitizePagination = require("../helpers/sanitizePagination");
const Queries = require("../helpers/sql/productQueries");

class Products {
  /**
   * Gets the total count of products in the database.
   * @returns {number} - returns the total number of products
   * @throws {BadRequestError} - if there is a database error
   */
  static async #getTotalProductCount() {
    try {
      const result = await db.query(Queries.getProductListCount());
      return parseInt(result.rows[0].total, 10);
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  /**
   * Gets all products from the database with pagination.
   * @param {number} page - the page number
   * @param {number} limit - items per page
   * @returns {object} - returns { products: [], pagination: {...} }
   * @throws {BadRequestError} - if there is a database error
   */
  static async getProducts(page = 1, limit = 10) {
    try {
      const {
        page: currentPage,
        limit: pageSize,
        offset
      } = sanitizePagination(page, limit);

      const result = await db.query(Queries.getProductsPagination(), [limit, offset]);

      const data = result.rows;
      const totalCount = await this.#getTotalProductCount();
      const totalPages = Math.ceil(totalCount / limit);

      return {
        data,
        pagination: {
          currentPage,
          pageSize,
          total: totalCount,
          totalPages
        }
      };

    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError(err.message);
    }
  }

  /**
   * Finds a product by id.
   * @param {number} id
   * @returns {object} - returns product object or empty object if not found
   * @throws {BadRequestError} - if there is a database error
   */
  static async findProductById(id) {
    try {
      if (!id || id <= 0) {
        throw new BadRequestError("Product id must be a positive number");
      }

      const result = await db.query(Queries.getSingleProduct(), [id]);
      
      return result.rows.length > 0 ? result.rows[0] : {};

    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError(err.message);
    }
  }

  /**
   * @typedef {object} productBody
   * @property {string} sku
   * @property {string} name
   * @property {string} description
   * @property {number} price
   * @property {number} stock
   * @property {string} imageURL
   */
  /**
   * Adds a product to the database.
   * @param {productBody} productBody
   * @returns {object} - returns the created product
   * @throws {BadRequestError} - if there is a database error
   * @throws {ConflictError} - if product with same SKU already exists
   */
  static async addProduct({ sku, name, description, price, stock, imageURL }) {
    try {
      sku = removeNonAlphaNumericChars(sku);
      
      const queryValues = [sku, name, description, price, stock, imageURL]
      const result = await db.query(Queries.getAddProductQuery(), queryValues);
  
      if(!result.rows || result.rows.length === 0) {
        throw new BadRequestError("Failed to create product");
      }

      return result.rows[0];

    } catch (err) {
      if(err.code === '23505' || err instanceof ConflictError) {
        throw new ConflictError("Product with this SKU already exists");
      }
      throw new BadRequestError(err.message);
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

      const result = await db.query(Queries.updateProductStock(), [stock, id]);
  
      if(result.rows.length === 0) {
        throw new BadRequestError("Something went wrong updating stock");
      }

      return result.rows[0];

    } catch (err) {
      if(err.code === '23514') throw new BadRequestError(`Product ${id} is out of stock`);
      throw new BadRequestError(err.message);
    }
  }

  /**
   * Updates a product in the database.
   * @param {number} id - Product id
   * @param {object} productBody - Product fields to update
   * @returns {object} - returns the updated product
   * @throws {BadRequestError} - if the product does not exist or database error
   */
  static async updateProduct(id, productBody) {
    try {  
      if(!id || id <= 0) {
        throw new BadRequestError("Product id must be a positive number");
      }

      const existingProductQueryResults = await db.query(getProductById(), [id]);
  
      if(existingProductQueryResults.rows.length === 0) {
        throw new BadRequestError(`Product with id ${id} not found`);
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
        throw new BadRequestError("Failed to update product");
      }
      
      return result.rows[0];

    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  /**
   * Adds a category to a product.
   * @param {number} productId
   * @param {number} categoryId
   * @returns {object} - returns { productId, categoryId }
   * @throws {BadRequestError} - if product or category does not exist
   */
  static async addCategoryToProduct(productId, categoryId) {
    try {
      if(!productId || !categoryId || productId <= 0 || categoryId <= 0) {
        throw new BadRequestError("Product id and category id must be positive numbers");
      }

      // confirm product exists in db
      const product = await this.findProductById(productId);

      if(!product || Object.keys(product).length === 0) {
        throw new BadRequestError(`Product with id ${productId} not found`);
      }
  
      // does product contain default category "none" if so remove from db
      if(product.categories.includes('none')) {
        await db.query(Queries.deleteCategoryNone(), [productId]);
      }

      // insert the new category
      const result = await db.query(Queries.insertToProductCategories(), [productId, categoryId]);
      
      if (result.rows.length === 0) {
        throw new BadRequestError("Failed to add category to product");
      }

      return result.rows[0];

    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  /**
   * Removes a category from a product.
   * @param {number} productId
   * @param {number} categoryId
   * @returns {object} - { message, success }
   * @throws {BadRequestError} - if database error occurs
   */
  static async removeCategoryFromProduct(productId, categoryId) {
    try {
      if (!productId || !categoryId || productId <= 0 || categoryId <= 0) {
        throw new BadRequestError("Product id and category id must be positive numbers");
      }

      const product = await this.findProductById(productId);
      if (!product || !product.categories) {
        return { message: "Nothing to remove", success: false };
      }

      const initialCount = product.categories.length;

      const deleteResult = await db.query(Queries.deleteProductCategory(), [productId, categoryId]);

      const removed = deleteResult.rows.length > 0;

      if (!removed) {
        return false;
      }

      const remainingCount = initialCount - 1;

      if (remainingCount === 0) {
        await db.query(Queries.insertIntoProductCategories(), [productId]);
      }

      return true;

    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  /**
   * Removes a product from the database.
   * @param {number} id
   * @returns {object} - { message, success }
   * @throws {BadRequestError} - if database error occurs
   */
  static async removeProduct(id) {
    try {
      if (!id || id <= 0) {
        throw new BadRequestError("Product id must be a positive number");
      }

      // Delete product
      const result = await db.query(Queries.deleteFromProduct(), [id]);

      return (result.rows.length > 0);

    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }
}

module.exports = Products;