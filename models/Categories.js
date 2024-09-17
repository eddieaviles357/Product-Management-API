"use strict";

const db = require("../db.js");

class Categories {

    /*
    gets all categories, ** LIMIT TO BE SET FOR PAGINATION **
    returns [
      {id: 1, category: 'category'},
      {...}
      ]
  */
  static async getAllCategories() {
    const allCategories = await db.query(`SELECT id, category FROM categories ORDER BY id ASC`);

    return ( allCategories.rows === 0 ) ? [] : allCategories.rows.map( c => ({id: c.id, category: c.category}) );
  }

  static async addCategory(newCategory) {
    if(typeof newCategory !== 'string') throw new Error('Must be a string');

    const result = await db.query(`
      INSERT INTO categories (category)
      VALUES ( LOWER($1) )
      `, [newCategory]);

    console.log(`Successfully added ${newCategory} to DB`);
  }

  static async updateCategory(catId, updatedCategory) {
    
    // something aint right lets just return an error ❌
    if(  typeof updatedCategory !== 'string' 
      || typeof catId !== 'number'
      || updatedCategory.length === 0) {
        throw new Error('Please check inputs');
      }
    // does category exist in db 🤔
    const catExist = await db.query(`
      SELECT id, category
      FROM categories 
      WHERE id = $1
      `, [catId]);

      // doesn't exist in db lets return error ❌
      if(catExist.rows.length === 0) throw new Error(`${updatedCategory} does not exist`);
      const { category } = catExist.rows[0];

    const result = await db.query(`
      UPDATE categories 
      SET category = COALESCE( NULLIF( $1, '' ),$2 )
      WHERE id = $3
      `, [updatedCategory, category, catId]);

  }
  
  static async getAllCategoryProducts(catId) {

      const result = await db.query(`
        WITH all_product_id AS (
          SELECT p.product_id 
          FROM products p 
          JOIN products_categories pc ON pc.product_id = p.product_id 
          JOIN categories c ON c.id = pc.category_id 
          WHERE c.id = $1
          LIMIT 20
          ) 
        SELECT 
          prod.product_id AS id,
          prod.sku,
          prod.product_name AS "productName",
          prod.product_description AS "productDescription",
          prod.price,
          prod.image_url AS "imageURL",
          prod.created_at AS "createdAt",
          prod.updated_at AS "updatedAt",
          ARRAY_AGG(cat.category) AS categories 
        FROM products prod 
        JOIN products_categories p_c ON p_c.product_id = prod.product_id 
        JOIN categories cat ON cat.id = p_c.category_id 
        WHERE prod.product_id IN (SELECT product_id FROM all_product_id) 
        GROUP BY prod.product_id
        `, [catId]);

    return result.rows;
  }
  
  static async removeCategory(catId) {

    const result = await db.query(`
      DELETE FROM categories WHERE id = $1
      RETURNING category
    `, [catId]);
    
    return (result.rows.length === 0) ? false : true;
  }
}

module.exports = Categories;