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
  
}

module.exports = Categories;