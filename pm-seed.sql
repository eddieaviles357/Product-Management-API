INSERT INTO products (sku, product_name, product_description, price, image_url, created_at)
VALUES 
('MC10SSMM', 'Shirt', 'White short sleeve medium', '10.99', 'https://image.product-management.com/1283859', NOW()),
('MC10LSLL', 'Shirt', 'White long sleeve large', '10.99', 'https://image.product-management.com/1283860', NOW()),
('MC12SLMM', 'Shirt', 'Red short sleeve medium', '10.99', 'https://image.product-management.com/1283861', NOW());


INSERT INTO categories (category)
VALUES 
('expensive'),
('inexpensive'),
('xs'),
('sm'),
('mm'),
('ll'),
('xl'),
('soft'),
('hard'),
('white'),
('black'),
('red'),
('yellow'),
('blue'),
('ss'),
('ls');

INSERT INTO products_categories (product_id, category_id)
VALUES
(1, 10),
(1, 5),
(1, 15),
(2, 10),
(2, 6),
(2, 16),
(3, 5),
(3, 12),
(3, 15);

