
function insertProduct() {
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
          price::float,
          stock,
          image_url AS "imageURL",
          created_at AS "createdAt",
          is_active AS "isActive"
    )
  `;
}

function getDefaultCategory() {
  return `
    default_category AS (
      SELECT id AS category_id
      FROM categories
      WHERE category = 'none'
      LIMIT 1
    )
  `;
}

function getLinkCategory() {
  return `
    linked_category AS (
      INSERT INTO products_categories (product_id, category_id)
      SELECT p.id, c.category_id
      FROM inserted_product p
      CROSS JOIN default_category c
    )
  `;
}

function insertIntoProduct() {
  return `
    WITH
      ${insertProduct()},
      ${getDefaultCategory()},
      ${getLinkCategory()}
    SELECT * FROM inserted_product
  `;
}

function getProductById() {
  return `
    SELECT
      product_id AS id,
      product_name AS name,
      product_description AS description,
      price,
      image_url,
      created_at AS "createdAt",
      updated_at AS "updatedAt",
      is_active AS "isActive"
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
      price::float,
      image_url AS "imageURL",
      created_at AS "createdAt",
      updated_at AS "updatedAt",
      is_active AS "isActive"
  `;
} 

function getProductsPagination() {
  return `
    SELECT *
    FROM get_product_list()
    WHERE "isActive" = TRUE
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
    WHERE id = $1 AND "isActive" = TRUE
    LIMIT 1
  `;
}

function getProductListCount() {
  return `
    SELECT COUNT(*) as total
    FROM get_product_list()
    WHERE "isActive" = TRUE
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

/*  DELETE FROM products 
**  WHERE product_id = $1
**  RETURNING product_name AS "productName"
*/
function deleteFromProduct() {
  return `
    UPDATE products
    SET is_active = FALSE
    WHERE product_id = $1
    RETURNING 
      product_id, 
      product_name, 
      is_active;
  `;
}
function checkProductOrdered() {
  return `
    SELECT 1
    FROM order_products
    WHERE product_id = $1
    LIMIT 1
  `;
}

function activateProduct() {
  return `
    UPDATE products
    SET
      is_active = TRUE,
      updated_at = NOW()
    WHERE product_id = $1
      AND is_active = FALSE
    RETURNING
      product_id AS id,
      sku,
      product_name AS "productName",
      product_description AS "productDescription",
      price::float,
      stock,
      image_url AS "imageURL",
      is_active AS "isActive",
      updated_at AS "updatedAt";
  `;
}

module.exports = {
  insertIntoProduct,
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
  deleteFromProduct,
  checkProductOrdered,
  activateProduct
};