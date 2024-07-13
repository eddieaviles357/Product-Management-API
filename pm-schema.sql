CREATE TABLE products (
  p_id INTEGER PRIMARY KEY,
  sku VARCHAR(8) NOT NULL UNIQUE,
  p_name VARCHAR(30) NOT NULL,
  p_description VARCHAR(255) NOT NULL,
  p_price NUMERIC(7,2) NOT NULL,
  p_image_url TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  category VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE products_categories (
  PRIMARY KEY (product_id, category_id),
  product_id INTEGER NOT NULL REFERENCES products ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories ON DELETE CASCADE
);