"use strict";

const db = require("../db");
const { NotFoundError } = require("../AppError");

const ensureProductExistInDB = async (productId) => {
  const prod = await db.query(`SELECT 1 FROM products WHERE product_id = $1 LIMIT 1`, [productId]);
  if (prod.rows.length === 0) throw new NotFoundError("Product not found");
}

module.exports = ensureProductExistInDB;