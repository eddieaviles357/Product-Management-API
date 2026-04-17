"use strict";

const db = require("../db.js");
const removeNonAlphabeticChars = require("../helpers/removeNonAlphabeticChars.js");
const { BadRequestError, ConflictError, NotFoundError } = require("../AppError");
const sanitizePagination = require("../helpers/sanitizePagination.js");
const Queries = require("../helpers/sql/categoryQueries.js");

class Categories {

  /** 
   * @param {string} id - The id to validate
   * @param {string} field - The name of the field being validated (for error messages)
   * @throws {BadRequestError} If id is not a valid number
  */
  static #validateId(id, field = "id") {
    if (!/^\d+$/.test(id)) {
      throw new BadRequestError(`${field} must be a valid number`);
    }
  }

  /**
   * 
   * @param {string} category - The category name to validate
   * @throws {BadRequestError} If the category is 'none'
   */

  static async #validateIfNoneCategory(catId) {
    const isNoneCategory = await db.query(Queries.getCategory(), [catId]);
    return isNoneCategory.rows[0]?.category?.toLowerCase() === "none";
  }

/**
  * Validates a category string.
  * @param {string} str - The category string to validate
  * @param {string} field - The name of the field being validated (for error messages)
  * @returns {string} The sanitized category string with non-alphabetic characters removed
  * @throws {BadRequestError} If newCategory is not a string or is empty
  * @throws {BadRequestError} If newCategory exceeds 20 characters
  */
  static #validateCategoryString(str, field = "category") {
    if (typeof str !== "string" || /^\d+$/.test(str)) {
      throw new BadRequestError(`${field} must be a string`);
    }
    if (str.length === 0) throw new BadRequestError(`${field} cannot be empty`);
    if (str.length > 20) throw new BadRequestError(`${field} must be less than 20 characters`);
    return removeNonAlphabeticChars(str);
  }

    /**
   * Gets the total count of categories in the database.
   * @returns {number} - returns the total number of categories
   * @throws {BadRequestError} - if there is a database error
   */
  static async #getTotalCategoryCount() {
    try {
      const result = await db.query(Queries.getCount());
      return parseInt(result.rows[0].total, 10);
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  /**
  * Retrieves a paginated list of categories from the database.
  * @param {number} page - The page number
  * @param {number} limit - The number of categories
  * @returns {object} - Returns an object with data and pagination info
  * @throws {BadRequestError} - If there is a database error
  */ 
  static async getAllCategories(page = 1, limit = 10) {
    try {
      const {
        page: currentPage,
        limit: pageSize,
        offset
      } = sanitizePagination(page, limit);

      const result = await db.query(Queries.getCategoriesPagination(),[limit, offset]);

      const data = result.rows;
      const total = await this.#getTotalCategoryCount();
      const totalPages = Math.ceil(total / limit);

      return {
        data,
        pagination: {
          currentPage,
          pageSize,
          total,
          totalPages
        }
      };

    } catch (err) {
      if (err instanceof BadRequestError) throw err;
      throw new BadRequestError(err.message);
    }
  }

  /**
  * Retrieves a category by its search term.
  * @param {string} searchTerm - The search term to filter categories
  * @returns {array} Array of categories matching the search term or empty array if no categories found
  * @throws {BadRequestError} If an error occurs while querying the database
  */
  static async searchCategory(searchTerm) {
    try {
      const term = this.#validateCategoryString(searchTerm, "searchTerm");

      const result = await db.query(Queries.searchCategoryByName(), [`%${term}%`]);

      return result.rows;
      
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  /** 
  * @param {string} newCategory - The category to be added
  * @returns {object} The newly added category with id and category
  * @throws {BadRequestError} If an error occurs while querying the database
  * @throws {ConflictError} If newCategory already exists in the database
  */
  static async addCategory(newCategory) {
    try {
      newCategory = this.#validateCategoryString(newCategory);
  
      const result = await db.query(Queries.insertIntoCategory(), [newCategory]);
  
      if (result.rows.length === 0) throw new BadRequestError("Something went wrong");

      return result.rows[0];

    } catch (err) {
      if (err.code === '23505' || err instanceof ConflictError) throw new ConflictError("Category already exists");
      throw new BadRequestError(err.message);
    }
  }

  /**
  * @param {number} catId - The id of the category to be updated
  * @param {string} updatedCategory - The new category name
  * @returns {object} The updated category with id and category
  * @throws {BadRequestError} If updatedCategory doesn't exist in the database
  * @throws {BadRequestError} If updatedCategory is none
  * @throws {BadRequestError} If an error occurs while querying the database
  * @throws {BadRequestError} If category with catId is 'none'
  */
  static async updateCategory(catId, updatedCategory) {
    try {
      this.#validateId(catId, "category Id");
      updatedCategory = this.#validateCategoryString(updatedCategory, "updatedCategory");

      const isNoneCategory = await this.#validateIfNoneCategory(catId);

      if (isNoneCategory) {
        throw new BadRequestError(`"None" category cannot be updated`);
      }

      const existing = await db.query(Queries.doesCategoryExist(),[catId]);

      if (existing.rows.length === 0) {
        throw new NotFoundError(`Category with id ${catId} does not exist`);
      }

      const { category } = existing.rows[0];

      // Return existing category if the name is the same to avoid unnecessary database query
      if (category === updatedCategory) {
        return existing.rows[0]; 
      }
;
      const result = await db.query(Queries.updateCategory(), [updatedCategory, catId]);
      
      return result.rows[0];
      
    } catch (err) {
      if (err.code === '23505') throw new ConflictError("Category already exists");
      throw new BadRequestError(err.message);
    }
  }
  
  /**
  * Retrieves all products in a category by its id.
  * @param {number} catId - The id of the category
  * @returns {array} Array of products in the category or empty array if no products found
  * @throws {BadRequestError} If an error occurs while querying the database
  */
  static async getAllCategoryProducts(catId) {
    try {
      this.#validateId(catId, "category Id");

      const result = await db.query(Queries.getAllCategoryProducts(), [catId]);

      return result.rows;

    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }
  
  /**
  * Deletes a category by its id.
  * @param {number} catId - The id of the category to be deleted
  * @returns {object} The deleted category and success status
  * @throws {BadRequestError} If an error occurs while querying the database
  * @throws {NotFoundError} If the category with catId does not exist
  * @throws {BadRequestError} If the category with catId is 'none'
  */
  static async removeCategory(catId) {
    try {
      this.#validateId(catId, "category Id");

      const isNoneCategory = await this.#validateIfNoneCategory(catId);

      if (isNoneCategory) {
        throw new BadRequestError(`"None" category cannot be deleted`);
      }

      const result = await db.query(Queries.deleteCategory(), [catId]);
      
      return result.rows;
      
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  /**
   * Retrieves products associated with multiple category IDs.
   * @param {number[]} idArray - An array of category IDs.
   * @returns {array} Array of products associated with the given category IDs or empty array if no products found.
   * @throws {BadRequestError} If idArray is not an array or contains non-numeric values.
   * @throws {BadRequestError} If an error occurs while querying the database.
   * @throws {NotFoundError} If no products are found for the given category IDs.
   */
  static async getMultipleCategoryProducts(idArray) {
    try {
      if (!Array.isArray(idArray) || idArray.length === 0) {
        throw new BadRequestError("idArray must be a non-empty array");
      }

      idArray.forEach(id => this.#validateId(id, "category Id"));

      const result = await db.query(Queries.getAllCategoryProductsMultipleIds(), [idArray]);

      return result.rows;

    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }
}

module.exports = Categories;