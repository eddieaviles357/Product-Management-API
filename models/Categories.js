"use strict";

const db = require("../db.js");

class Categories {

  static async getAllCategories() {
    const allCategories = await db.query(`SELECT category FROM categories`);
    console.log(allCategories)
  }
}

module.exports = Categories;