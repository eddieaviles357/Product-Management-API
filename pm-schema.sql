/* =========================================================
   BASE TABLES
   ========================================================= */

CREATE TABLE products (
  product_id SERIAL PRIMARY KEY,
  sku VARCHAR(8) NOT NULL UNIQUE CHECK(LENGTH(sku) > 0),
  product_name VARCHAR(30) NOT NULL CHECK(LENGTH(product_name) > 0),
  product_description VARCHAR(255) NOT NULL CHECK(LENGTH(product_description) > 0),
  price NUMERIC(7,2) NOT NULL CHECK(price > 0.00),
  stock INTEGER NOT NULL CHECK( stock >= 0 ),
  image_url VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  category VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE products_categories (
  PRIMARY KEY (product_id, category_id),
  product_id INTEGER NOT NULL REFERENCES products ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories ON DELETE CASCADE
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  username VARCHAR(20) UNIQUE NOT NULL,
  password VARCHAR(60) NOT NULL,
  join_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMP NOT NULL DEFAULT NOW(),
  email VARCHAR(50) NOT NULL CHECK (position('@' IN email) > 1),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
  address_1 VARCHAR(95) NOT NULL,
  address_2 VARCHAR(95),
  city VARCHAR(35) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zipcode VARCHAR(5) NOT NULL
);

CREATE TABLE reviews (
  PRIMARY KEY (product_id, user_id),
  product_id INTEGER NOT NULL REFERENCES products ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
  review VARCHAR(500) NOT NULL,
  rating SMALLINT NOT NULL CHECK ( rating >= 0 AND rating <= 5),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);








CREATE TABLE wishlist (
  PRIMARY KEY (user_id, product_id),
  user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products ON DELETE CASCADE
);

CREATE TABLE cart (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > -1),
  price NUMERIC(10, 2) NOT NULL CHECK(price > 0.00),
  added_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
  total_amount NUMERIC(10,2) NOT NULL CHECK(total_amount > 0.00),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE order_products (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  total_amount NUMERIC(7,2) NOT NULL CHECK(total_amount > 0.00),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE payment_details (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders ON DELETE CASCADE,
  amount NUMERIC(7,2) NOT NULL CHECK(amount > 0.00),
  status BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
/* =========================================================
   UPDATED_AT TRIGGERS
   ========================================================= */

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();


/* =========================================================
   MATERIALIZED VIEW
   ========================================================= */

CREATE MATERIALIZED VIEW mv_product_list AS
SELECT
  p.product_id AS id,
  p.sku,
  p.product_name AS "productName",
  p.product_description AS "productDescription",
  p.price,
  p.stock,
  p.image_url AS "imageURL",
  p.created_at AS "createdAt",
  p.updated_at AS "updatedAt",
  COALESCE(
    ARRAY_AGG(DISTINCT c.category)
      FILTER (WHERE c.category IS NOT NULL),
    '{}'
  ) AS categories
FROM products p
LEFT JOIN products_categories pc ON pc.product_id = p.product_id
LEFT JOIN categories c ON c.id = pc.category_id
GROUP BY
  p.product_id,
  p.sku,
  p.product_name,
  p.product_description,
  p.price,
  p.stock,
  p.image_url,
  p.created_at,
  p.updated_at
WITH DATA;

-- Required for REFRESH CONCURRENTLY
CREATE UNIQUE INDEX mv_product_list_pk
ON mv_product_list (id);


/* =========================================================
   MV REFRESH QUEUE + RATE LIMIT
   ========================================================= */

CREATE TABLE IF NOT EXISTS mv_refresh_queue (
  view_name TEXT PRIMARY KEY,
  needs_refresh BOOLEAN NOT NULL DEFAULT FALSE,
  last_refreshed_at TIMESTAMP,
  min_refresh_interval INTERVAL NOT NULL DEFAULT INTERVAL '30 seconds'
);

INSERT INTO mv_refresh_queue (view_name)
VALUES ('mv_product_list')
ON CONFLICT DO NOTHING;


/* =========================================================
   DIRTY MARKER TRIGGERS
   ========================================================= */

CREATE OR REPLACE FUNCTION mark_mv_product_list_dirty()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE mv_refresh_queue
  SET needs_refresh = TRUE
  WHERE view_name = 'mv_product_list';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mv_dirty_products
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH STATEMENT EXECUTE PROCEDURE mark_mv_product_list_dirty();

CREATE TRIGGER mv_dirty_products_categories
AFTER INSERT OR DELETE ON products_categories
FOR EACH STATEMENT EXECUTE PROCEDURE mark_mv_product_list_dirty();


/* =========================================================
   SAFE + RATE-LIMITED REFRESH FUNCTION
   ========================================================= */

CREATE OR REPLACE FUNCTION refresh_mv_product_list_safe()
RETURNS VOID AS $$
DECLARE
  last_refresh TIMESTAMP;
  min_interval INTERVAL;
BEGIN
  -- Prevent concurrent refreshes
  IF NOT pg_try_advisory_lock(hashtext('mv_product_list_refresh')) THEN
    RETURN;
  END IF;

  SELECT last_refreshed_at, min_refresh_interval
  INTO last_refresh, min_interval
  FROM mv_refresh_queue
  WHERE view_name = 'mv_product_list';

  IF EXISTS (
    SELECT 1
    FROM mv_refresh_queue
    WHERE view_name = 'mv_product_list'
      AND needs_refresh = TRUE
      AND (
        last_refresh IS NULL
        OR last_refresh < now() - min_interval
      )
  ) THEN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_product_list;

    UPDATE mv_refresh_queue
    SET needs_refresh = FALSE,
        last_refreshed_at = now()
    WHERE view_name = 'mv_product_list';
  END IF;

  PERFORM pg_advisory_unlock(hashtext('mv_product_list_refresh'));
END;
$$ LANGUAGE plpgsql;


/* =========================================================
   AUTO-REFRESH ON FIRST READ AFTER TIMEOUT
   ========================================================= */

CREATE OR REPLACE FUNCTION get_product_list()
RETURNS SETOF mv_product_list AS $$
BEGIN
  -- Auto-refresh if dirty AND timeout passed
  PERFORM refresh_mv_product_list_safe();

  RETURN QUERY
  SELECT *
  FROM mv_product_list
  ORDER BY "createdAt" DESC;
END;
$$ LANGUAGE plpgsql STABLE;
