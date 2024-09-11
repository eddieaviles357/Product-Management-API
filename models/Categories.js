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
    const allCategories = await db.query(`SELECT id, category FROM categories`);

    return ( allCategories.rows === 0 ) ? [] : allCategories.rows.map( c => ({id: c.id, category: c.category}) );
  }

  static async addCategory(newCategory) {
    if(typeof newCategory !== 'string') throw new Error('Must be a string');

    const result = await db.query(`
      INSERT INTO categories (category)
      VALUES ( LOWER($1) )
      `, [newCategory]);

    console.log(result)
    console.log(`Successfully added ${newCategory} to DB`);
  }

  static async getCategoryId(category) {
    if(typeof category !== 'string') throw new Error("Must be a string");

    const result = await db.query(`
      SELECT id FROM categories WHERE category = $1
      `, [category]);

      return result.rows[0]
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
      const { id, category } = catExist.rows[0];

    const result = await db.query(`
      UPDATE categories 
      SET category = COALESCE( NULLIF( $1, '' ),$2 )
      WHERE id = $3
      `, [updatedCategory, category, catId]);

  }
  
  static async getAllCategoryProducts(catId) {
    const result = await db.query(`
      SELECT 
        p.product_id AS id,
        p.sku,
        p.product_name AS "productName",
        p.product_description AS "productDescription",
        p.price,
        p.image_url AS "imageURL",
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt"
      FROM products p
      JOIN products_categories pc ON pc.product_id = p.product_id
      JOIN categories c ON c.id = pc.category_id
      WHERE c.id = $1`, [catId]);
      
    return result.rows;
  }
  
  static async removeCategory(catId) {
    console.log(catId)

    const result = await db.query(`
      DELETE FROM categories WHERE id = $1
      RETURNING category
    `, [catId]);

    return (result.rows.length === 0) 
    ? { category : `Category with id ${id} not found`, success: false } 
    : { ...result.rows[0], success: true }
  }
}

module.exports = Categories;