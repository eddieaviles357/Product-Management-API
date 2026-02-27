
function getCategoriesPagination() {
  return `
    SELECT id, category
    FROM categories
    ORDER BY id DESC
    LIMIT $1 OFFSET $2
    `;
}

function getCount() {
  return `
    SELECT COUNT(*) AS total
    FROM categories
  `;
}

function searchCategoryByName() {
  return `
    SELECT id, category 
    FROM categories 
    WHERE category 
    ILIKE $1`;
}

function insertIntoCategory() {
  return `
    INSERT INTO categories (category)
    VALUES ( LOWER($1) )
    RETURNING id, category
  `;
}

function doesCategoryExist() {
  return `
    SELECT id, category
    FROM categories 
    WHERE id = $1
    `;
}

function updateCategory() {
  return `
    UPDATE categories 
    SET category = LOWER($1)
    WHERE id = $2
    RETURNING id, category
    `;
}

function getCategory() {
  return `
    SELECT category 
    FROM categories 
    WHERE id = $1
    `;
}

function getAllCategoryProducts() {
  return `
  WITH all_product_id AS 
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
  GROUP BY prod.product_id
  `;
}

function getAllCategoryProductsMultipleIds() {
  return `
    WITH all_product_id AS (
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
}

function deleteCategory() {
  return `
    DELETE FROM categories 
    WHERE id = $1
    RETURNING category
  `;
}

module.exports = {
  getCount,
  getCategory,
  getAllCategoryProducts,
  getCategoriesPagination,
  getAllCategoryProductsMultipleIds,
  searchCategoryByName,
  insertIntoCategory,
  doesCategoryExist,
  updateCategory,
  deleteCategory,
}