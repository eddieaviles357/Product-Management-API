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
    if(typeof newCategory !== 'string') return new Error('Must be a string');

    const result = await db.query(`
      INSERT INTO categories (category)
      VALUES ( LOWER($1) )
      `, [newCategory]);

    console.log(result)
    console.log(`Successfully added ${newCategory} to DB`);
  }

  static async getCategoryId(category) {
    if(typeof category !== 'string') return new Error("Must be a string");

    const result = await db.query(`
      SELECT id FROM categories WHERE category = $1
      `, [category]);

      console.log(result);

      return result.rows[0]
  }

  // static async updateCategory(category) {
    
  //   if(typeof category !== 'string') return new Error('Must be a string');

  //   const result = await db.query(`
  //     UPDATE categories 
  //     SET category = COALESCE( NULLIF( $1, '' ),$6 )
  //     WHERE category = 
  //     `, [category]);
  // }
  
}

module.exports = Categories;