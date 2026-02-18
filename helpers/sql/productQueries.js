
function getInsertProductQuery() {
  return `
    inserted_product AS (
      INSERT INTO products (
        sku,
        product_name,
        product_description,
        price,
        stock,
        image_url
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
          product_id AS id,
          sku,
          product_name AS "productName",
          product_description AS "productDescription",
          price,
          stock,
          image_url AS "imageURL",
          created_at AS "createdAt"
    )`;
}

function getDefaultCategoryQuery() {
  return `
    default_category AS (
      SELECT id AS category_id
      FROM categories
      WHERE category = 'none'
      LIMIT 1
    )`;
}

function getLinkCategoryQuery() {
  return `
    linked_category AS (
      INSERT INTO products_categories (product_id, category_id)
      SELECT p.id, c.category_id
      FROM inserted_product p
      CROSS JOIN default_category c
    )`;
}

function getAddProductQuery() {
  return `
    WITH
      ${getInsertProductQuery()},
      ${getDefaultCategoryQuery()},
      ${getLinkCategoryQuery()}
    SELECT * FROM inserted_product
    `;
}

/* --------------------------------------------
 * UPDATE PRODUCT QUERIES
 * -------------------------------------------- */
function getProductById() {
  return `
    SELECT
      product_id AS id,
      product_name AS name,
      product_description AS description,
      price,
      image_url,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM products 
    WHERE product_id = $1
    `;
}

function updateProduct() {
  return `
    UPDATE products 
    SET
      product_name        = COALESCE(NULLIF($1, ''), $5),
      product_description = COALESCE(NULLIF($2, ''), $6),
      price               = COALESCE(NULLIF($3, 0.00), $7),
      image_url           = COALESCE(NULLIF($4, ''), $8),
      updated_at = NOW()
    WHERE product_id = $9
    RETURNING 
      product_id AS id,
      sku, 
      product_name AS "productName",
      product_description AS "productDescription",
      price,
      image_url AS "imageURL",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    `;
} 
/* --------------------------------------------
 * UPDATE PRODUCT QUERIES END
 * -------------------------------------------- */

function getProductsPagination() {
  return `
    SELECT *
    FROM get_product_list()
    ORDER BY id DESC
    LIMIT $1 OFFSET $2
    `;
}


function updateProductStock() {
  return `
    UPDATE products 
    SET stock = stock + $1 
    WHERE product_id = $2 
    RETURNING 
    product_id AS id, 
    stock
    `;
}
function getSingleProduct() {
  return `
    SELECT *
    FROM get_product_list()
    WHERE id = $1
    LIMIT 1
    `;
}

function getProductListCount() {
  return `
    SELECT COUNT(*) as total 
    FROM get_product_list()
    `;
}


function insertToProductCategories() {
  return `
    INSERT INTO products_categories (product_id, category_id)
    VALUES ($1, $2)
    RETURNING 
    product_id AS "productId", 
    category_id AS "categoryId"
    `;
}

function deleteCategoryNone() {
  return `
    DELETE FROM products_categories 
    WHERE product_id = $1 AND category_id = 1
    `;
}

function deleteProductCategory() {
  return `
    DELETE FROM products_categories
    WHERE product_id = $1 AND category_id = $2
    RETURNING product_id AS "productId", category_id AS "categoryId"
    `;
}

function insertIntoProductCategories() {
  return `
    INSERT INTO products_categories (product_id, category_id)
    VALUES ($1, (SELECT id FROM categories WHERE category = 'none'))
  `;
}

function deleteFromProduct() {
  return `
    DELETE FROM products 
    WHERE product_id = $1
    RETURNING product_name AS "productName"
    `;
}

module.exports = {
  getAddProductQuery,
  getProductsPagination,
  getProductById,
  getSingleProduct,
  getProductListCount,
  updateProduct,
  updateProductStock,
  insertToProductCategories,
  insertIntoProductCategories,
  deleteCategoryNone,
  deleteProductCategory,
  deleteFromProduct
};