"use strict";

const db = require("../db.js");
const removeNonAlphabeticChars = require("../helpers/removeNonAlphabeticChars.js");
const { BadRequestError } = require("../AppError");

class Categories {

    /*
    gets all categories, ** LIMIT TO BE SET FOR PAGINATION **
    returns [
      {id: 1, category: 'category'},
      {...}
      ]
  */
  static async getAllCategories(id = 100000000) {
    const queryStatement = `SELECT id, category 
                          FROM categories 
                          WHERE id < $1
                          ORDER BY id DESC
                          LIMIT 20`;
      const result = await db.query(queryStatement, [id]);
      return (result.rows.length === 0) ? [] : result.rows;
  }


  /*
  gets a category,
  returns [
    {id: 1, category: 'category'}, {...}
  ]
  */
  static async searchCategory(searchTerm) {
    const term = removeNonAlphabeticChars(searchTerm);
    const queryStatement = `SELECT id, category FROM categories WHERE category ILIKE $1`;
    const result = await db.query(queryStatement, [`%${term}%`]);
    return (result.rows.length === 0) ? [] : result.rows;
  }
  
  /*
    add a category
    returns {id, category}
  */
  static async addCategory(newCategory) {
    newCategory = removeNonAlphabeticChars(newCategory);

    const queryStatement = `INSERT INTO categories (category)
                            VALUES ( LOWER($1) )
                            RETURNING id, category`;
    const result = await db.query(queryStatement, [newCategory]);

    if(result.rows.length === 0) throw new BadRequestError("Something went wrong");
    return result.rows[0];
  }

  /*
    updates a category
    returns {id, category}
  */
  static async updateCategory(catId, updatedCategory) {
    
    // something aint right lets just return an error ❌
    if(  typeof updatedCategory !== 'string' || updatedCategory.length === 0) {
        throw new BadRequestError('Please check inputs');
      }
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
  }
  
  static async getAllCategoryProducts(catId) {
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
  }
  
  static async removeCategory(catId) {
    const queryStatement = `DELETE FROM categories WHERE id = $1
                            RETURNING category`;
    const result = await db.query(queryStatement, [catId]);
    
    return (result.rows.length === 0) 
            ? { category: `Category with id ${catId} not found`, success: false } 
            : { category: result.rows[0], success: true }
  }
}

module.exports = Categories;