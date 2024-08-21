"use strict";

const db = require("../db.js");

class Categories {

    /*
    gets all categories, ** LIMIT TO BE SET FOR PAGINATION **
    returns [
      {category: 'category'},
      {...}
      ]
  */
  static async getAllCategories() {
    const allCategories = await db.query(`SELECT category FROM categories`);

    return ( allCategories.rows === 0 ) ? [] : allCategories.rows.map( c => c.category );
  }

  static async addCategory(newCategory) {
    if(typeof newCategory !== 'string') return new Error('Must be a string');

    const result = await db.query(`
      INSERT INTO categories (category)
      VALUES ($1)
      `, [newCategory])
    console.log(result)
    console.log(`Successfully added ${newCategory} to DB`);
  }
  
}

module.exports = Categories;