"use strict";

const db = require("../db.js");
const removeNonAlphabeticChars = require("../helpers/removeNonAlphabeticChars.js");
const { BadRequestError, ConflictError } = require("../AppError");

class Categories {

  /**
  * Retrieves all categories from the database.
  * @param {number} id - The id to limit the categories
  * @returns {array} Array of categories or empty array if no categories found
  * @throws {BadRequestError} If id is not a number or is less than 0
  * @throws {BadRequestError} If an error occurs while querying the database
  */
  static async getAllCategories(id = 100000000) {
    try {
      if(id === null || id === undefined || id < 0) throw new BadRequestError("id must be a number greater than 0");
      const queryStatement = `SELECT id, category 
                            FROM categories 
                            WHERE id < $1
                            ORDER BY id DESC
                            LIMIT 20`;
      const result = await db.query(queryStatement, [id]);
      return (result.rows.length === 0) ? [] : result.rows;
    } catch (err) {
      throw new BadRequestError();
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
      if(typeof searchTerm !== 'string' || searchTerm.length === 0) throw new BadRequestError('Please check inputs');
      if(searchTerm.length > 20) throw new BadRequestError('Search term must be less than 20 characters');

      const term = removeNonAlphabeticChars(searchTerm);
      const queryStatement = `SELECT id, category FROM categories WHERE category ILIKE $1`;
      const result = await db.query(queryStatement, [`%${term}%`]);
      return (result.rows.length === 0) ? [] : result.rows;
    } catch (err) {
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
      if(typeof newCategory !== 'string' || newCategory.length === 0) throw new BadRequestError('Please check inputs');
      if(newCategory.length > 20) throw new BadRequestError('Category must be less than 20 characters');
      if(!newCategory && newCategory.length === 0) throw new BadRequestError('Please check inputs');

      newCategory = removeNonAlphabeticChars(newCategory);
  
      const queryStatement = `INSERT INTO categories (category)
                              VALUES ( LOWER($1) )
                              RETURNING id, category`;
      const result = await db.query(queryStatement, [newCategory]);
  
      if(result.rows.length === 0) throw new BadRequestError("Something went wrong");
      return result.rows[0];
    } catch (err) {
      if(err.code === '23505') throw new ConflictError("Review for this product already exists");
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
  */
  static async updateCategory(catId, updatedCategory) {
    try {
      // something aint right lets just return an error ❌
      if(typeof updatedCategory !== 'string' || updatedCategory.length === 0) throw new BadRequestError('Please check inputs');
      if(updatedCategory.length > 20) throw new BadRequestError('Category must be less than 20 characters');

      updatedCategory = removeNonAlphabeticChars(updatedCategory);
  
      // does category exist in db 🤔
      const doesCategoryExistStatement = `SELECT id, category
                                          FROM categories 
                                          WHERE id = $1`
      const categoryExistQuery = await db.query(doesCategoryExistStatement, [catId]);
  
      // doesn't exist in db lets return error ❌
      if(categoryExistQuery.rows.length === 0) throw new BadRequestError(`${updatedCategory} does not exist`);
      const { category } = categoryExistQuery.rows[0];
  
      if(category === updatedCategory) throw new BadRequestError(`${updatedCategory} already exists`);
      const updateQueryStatement = `UPDATE categories 
                                    SET category = COALESCE(NULLIF($1, ''), $2)
                                    WHERE id = $3
                                    RETURNING id, category`;
      const updateQueryValues = [updatedCategory, category, catId];
      const result = await db.query(updateQueryStatement, updateQueryValues);
  
      return result.rows[0];
    } catch (err) {
      throw new BadRequestError();
    }
  }
  
  /**
  * Retrieves all products in a category by its id.
  * @param {number} catId - The id of the category
  * @returns {array} Array of products in the category or empty array if no products found
  * @throws {BadRequestError} If catId is not a number
  * @throws {BadRequestError} If catId has falsy value
  * @throws {BadRequestError} If an error occurs while querying the database
  */
  static async getAllCategoryProducts(catId) {
    try {
      if(!catId) throw new BadRequestError("catId must be a number");

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
      return (result.rows.length === 0) ? [] : result.rows;
    } catch (err) {
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
  */
  static async removeCategory(catId) {
    try {
      if(!catId) throw new BadRequestError("catId must be a number");

      const queryStatement = `DELETE FROM categories WHERE id = $1
                              RETURNING category`;
      const result = await db.query(queryStatement, [catId]);
      
      return (result.rows.length === 0) 
              ? { category: `Category with id ${catId} not found`, success: false } 
              : { category: result.rows[0], success: true };
    } catch (err) {
      throw new BadRequestError();
    }
  }
}

module.exports = Categories;