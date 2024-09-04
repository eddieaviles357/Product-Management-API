INSERT INTO products (sku, product_name, product_description, price, image_url)
VALUES 
('MC10SSMM', 'Shirt', 'White short sleeve medium', '10.99', 'https://image.product-management.com/1283859'),
('MC10LSLL', 'Shirt', 'White long sleeve large', '10.99', 'https://image.product-management.com/1283860'),
('MC12SLMM', 'Shirt', 'Red short sleeve medium', '10.99', 'https://image.product-management.com/1283861');


INSERT INTO categories (category)
VALUES 
('none'),
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
(4, 10),
(4, 5),
(4, 15),
(2, 10),
(2, 6),
(2, 16),
(3, 5),
(3, 12),
(3, 15);

