"use strict";

const db = require("../db.js");
const removeNonAlphabeticChars = require("../helpers/removeNonAlphabeticChars.js");
const { BadRequestError, ConflictError, NotFoundError } = require("../AppError");

class Categories {

    /** 
    * VALIDATION HELPERS 
    */
  static #validateId(id, field = "id") {
    if (!/^\d+$/.test(id)) {
      throw new BadRequestError(`${field} must be a valid number`);
    }
  }

  static #validateCategoryString(str, field = "category") {
    if (typeof str !== "string" || /^\d+$/.test(str)) {
      throw new BadRequestError(`${field} must be a string`);
    }
    if (str.length === 0) throw new BadRequestError(`${field} cannot be empty`);
    if (str.length > 20) throw new BadRequestError(`${field} must be less than 20 characters`);
    return removeNonAlphabeticChars(str);
  }

  /**
  * Retrieves all categories from the database.
  * @param {number} id - The id to limit the categories
  * @returns {array} Array of categories or empty array if no categories found
  * @throws {BadRequestError} If id is not a number or is less than 0
  * @throws {BadRequestError} If an error occurs while querying the database
  */
  static async getAllCategories(page = 1, limit = 20) {
    try {
      page = Number(page);
      limit = Number(limit);

      if (!Number.isInteger(page) || page <= 0) {
        throw new BadRequestError("Page must be a positive integer");
      }
      const MAX_LIMIT = 100;
      if (!Number.isInteger(limit) || limit <= 0 || limit > MAX_LIMIT) {
        throw new BadRequestError(`Limit must be an integer between 1 and ${MAX_LIMIT}`);
      }

      const offset = (page - 1) * limit;

      const result = await db.query(
        `SELECT id, category
         FROM categories
         ORDER BY id DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      const countRes = await db.query(`SELECT COUNT(*) AS total FROM categories`);
      const total = parseInt(countRes.rows[0].total, 10);
      const totalPages = total === 0 ? 0 : Math.max(1, Math.ceil(total / limit));

      return {
        categories: result.rows,
        pagination: {
          currentPage: page,
          pageSize: limit,
          total,
          totalPages
        }
      };

    } catch (err) {
      if (err instanceof BadRequestError) throw err;
      throw new BadRequestError('Something went wrong');
    }
  }

  /**
  * Retrieves a category by its search term.
  * @param {string} searchTerm - The search term to filter categories
  * @returns {array} Array of categories matching the search term or empty array if no categories found
  * @throws {BadRequestError} If searchTerm is not a string or is empty
  * @throws {BadRequestError} If searchTerm exceeds 20 characters
  * @throws {BadRequestError} If an error occurs while querying the database
  */
  static async searchCategory(searchTerm) {
    try {
      const term = this.#validateCategoryString(searchTerm, "searchTerm");

      const result = await db.query(
        `SELECT id, category 
        FROM categories 
        WHERE category 
        ILIKE $1`, 
        [`%${term}%`]
      );

      return result.rows;
      
    } catch (err) {
      if (err instanceof BadRequestError) throw err;
      throw new BadRequestError();
    }
  }

  /** 
  * @param {string} newCategory - The category to be added
  * @returns {object} The newly added category with id and category
  * @throws {BadRequestError} If newCategory is not a string or is empty
  * @throws {BadRequestError} If newCategory exceeds 20 characters
  * @throws {BadRequestError} If an error occurs while querying the database
  * @throws {ConflictError} If newCategory already exists in the database
  */
  static async addCategory(newCategory) {
    try {
      newCategory = this.#validateCategoryString(newCategory);
  
      const result = await db.query(
        `INSERT INTO categories (category)
        VALUES ( LOWER($1) )
        RETURNING id, category`, 
        [newCategory]
      );
  
      if (result.rows.length === 0) throw new BadRequestError("Something went wrong");

      return result.rows[0];

    } catch (err) {
      if (err.code === '23505' || err instanceof ConflictError) throw new ConflictError("Review for this product already exists");
      if (err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrong");
    }
  }

  /**
  * @param {number} catId - The id of the category to be updated
  * @param {string} updatedCategory - The new category name
  * @returns {object} The updated category with id and category
  * @throws {BadRequestError} If updatedCategory is not a string or is empty
  * @throws {BadRequestError} If updatedCategory exceeds 20 characters
  * @throws {BadRequestError} If updatedCategory doesn't exist in the database
  * @throws {BadRequestError} If updatedCategory already exists in the database
  * @throws {BadRequestError} If an error occurs while querying the database
  * @throws {BadRequestError} If category with catId is 'none'
  */
  static async updateCategory(catId, updatedCategory) {
    try {
      this.#validateId(catId, "category Id");
      updatedCategory = this.#validateCategoryString(updatedCategory, "updatedCategory");

      const existing = await db.query(
        `SELECT id, category
        FROM categories 
        WHERE id = $1`, 
        [catId]
      );

      if (existing.rows.length === 0) {
        throw new NotFoundError(`${updatedCategory} does not exist`);
      }

      const { category } = existing.rows[0];

      if (category === "none") {
        throw new BadRequestError(`Category with id ${catId} cannot be updated`);
      }

      if (category === updatedCategory) {
        throw new ConflictError(`${updatedCategory} already exists`);
      }
;
      const result = await db.query(
        `UPDATE categories 
        SET category = LOWER($1)
        WHERE id = $2
        RETURNING id, category`, 
        [updatedCategory, catId]
      );

      return result.rows[0];
      
    } catch (err) {
      if (err.code === '23505') throw new ConflictError("Category already exists");
      if (err instanceof NotFoundError) throw err;
      if (err instanceof BadRequestError) throw err;
      throw new BadRequestError('Something went wrong');
    }
  }
  
  /**
  * Retrieves all products in a category by its id.
  * @param {number} catId - The id of the category
  * @returns {array} Array of products in the category or empty array if no products found
  * @throws {BadRequestError} If catId is not a number
  * @throws {BadRequestError} If catId has falsy value
  * @throws {BadRequestError} If an error occurs while querying the database
  * @throws {NotFoundError} If the category with catId does not exist
  */
  static async getAllCategoryProducts(catId) {
    try {
      this.#validateId(catId, "category Id");

      const exist = await db.query(
        `SELECT category 
        FROM categories 
        WHERE id = $1`, 
        [catId]
      );

      if (exist.rows.length === 0) {
        throw new NotFoundError(`Category with id ${catId} not found`);
      }
      
      const queryStatement = `WITH all_product_id AS 
                                ( SELECT p.product_id 
                                  FROM products p 
                                  JOIN products_categories pc ON pc.product_id = p.product_id 
                                  JOIN categories c ON c.id = pc.category_id 
                                  WHERE c.id = $1
                                  LIMIT 20 ) 
                              SELECT 
                                prod.product_id AS id,
                                prod.sku,
                                prod.product_name AS "productName",
                                prod.product_description AS "productDescription",
                                prod.price,
                                prod.stock,
                                prod.image_url AS "imageURL",
                                prod.created_at AS "createdAt",
                                prod.updated_at AS "updatedAt",
                                ARRAY_AGG(cat.category) AS categories 
                              FROM products prod 
                              JOIN products_categories p_c ON p_c.product_id = prod.product_id 
                              JOIN categories cat ON cat.id = p_c.category_id 
                              WHERE prod.product_id IN (SELECT product_id FROM all_product_id) 
                              GROUP BY prod.product_id`;

      const result = await db.query(queryStatement, [catId]);

      return result.rows;

    } catch (err) {
      if (err instanceof BadRequestError || err instanceof NotFoundError ) throw err;
      throw new BadRequestError();
    }
  }
  
  /**
  * Deletes a category by its id.
  * @param {number} catId - The id of the category to be deleted
  * @returns {object} The deleted category and success status
  * @throws {BadRequestError} If catId is not a number
  * @throws {BadRequestError} If catId has falsy value
  * @throws {BadRequestError} If an error occurs while querying the database
  * @throws {NotFoundError} If the category with catId does not exist
  * @throws {BadRequestError} If the category with catId is 'none'
  */
  static async removeCategory(catId) {
    try {
      this.#validateId(catId, "category Id");

      const check = await db.query(
        `SELECT id, category 
        FROM categories 
        WHERE id = $1`, 
        [catId]
      );

      if (check.rows.length === 0) {
        throw new NotFoundError(`Category with id ${catId} not found`);
      }

      if (check.rows[0].category === 'none') {
        throw new BadRequestError(`Category with id ${catId} cannot be deleted`);
      }

      const result = await db.query(
        `DELETE 
        FROM categories 
        WHERE id = $1
        RETURNING category`, 
        [catId]
      );
      
      return {
        category: result.rows[0] || `Category with id ${catId} not found`,
        success: !!result.rows.length,
      };
      
    } catch (err) {
      if (err instanceof BadRequestError ||err instanceof NotFoundError) throw err;
      throw new BadRequestError();
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
      
      const queryStatement = `WITH all_product_id AS (
                                  SELECT p.product_id 
                                  FROM products p 
                                  JOIN products_categories pc ON pc.product_id = p.product_id 
                                  JOIN categories c ON c.id = pc.category_id 
                                  WHERE c.id = ANY($1::int[])  -- Accepts multiple category IDs
                              ) 
                              SELECT 
                                  prod.product_id AS id,
                                  prod.sku,
                                  prod.product_name AS "productName",
                                  prod.product_description AS "productDescription",
                                  prod.price,
                                  prod.stock,
                                  prod.image_url AS "imageURL",
                                  prod.created_at AS "createdAt",
                                  prod.updated_at AS "updatedAt",
                                  ARRAY_AGG(cat.category) AS categories 
                              FROM products prod 
                              JOIN products_categories p_c ON p_c.product_id = prod.product_id 
                              JOIN categories cat ON cat.id = p_c.category_id 
                              WHERE prod.product_id IN (SELECT product_id FROM all_product_id) 
                              GROUP BY prod.product_id;`;

      const result = await db.query(queryStatement, [idArray]);

      return result.rows;

    } catch (err) {
      if (err instanceof BadRequestError || err instanceof NotFoundError) throw err;
      throw new BadRequestError();
    }
  }
}

module.exports = Categories;