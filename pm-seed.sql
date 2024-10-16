INSERT INTO products (sku, product_name, product_description, price, stock, image_url)
VALUES 
('MC10SSMM', 'Shirt', 'White short sleeve medium', '10.99', '3', 'https://image.product-management.com/1283859'),
('MC10LSLL', 'Shirt', 'White long sleeve large', '10.99', '3', 'https://image.product-management.com/1283860'),
('XKDFQKEL', 'Shirt', 'White long sleeve large', '10.99', '3', 'https://image.product-management.com/1283811'),
('AABBCCDD', 'Shirt', 'White long sleeve large', '10.99', '3', 'https://image.product-management.com/1283812'),
('BBCCDDEE', 'Shirt', 'White long sleeve large', '10.99', '4', 'https://image.product-management.com/1283813'),
('CCDDEEFF', 'Shirt', 'White long sleeve large', '10.99', '4', 'https://image.product-management.com/1283814'),
('DDEEFFGG', 'Shirt', 'White long sleeve large', '10.99', '4', 'https://image.product-management.com/1283815'),
('MC10XXXX', 'Pants', 'Blue athletic cotton large', '20.99', '4', 'https://image.product-management.com/1283861'),
('YC10LSLS', 'Pants', 'Blue athletic cotton large', '20.99', '4', 'https://image.product-management.com/1283863'),
('YC10LXYS', 'Pants', 'Blue athletic cotton large', '20.99', '4', 'https://image.product-management.com/1283865'),
('DC09LLVS', 'Pants', 'Blue athletic cotton large', '20.99', '4', 'https://image.product-management.com/1283866'),
('DC10VX03', 'Pants', 'Blue athletic cotton large', '20.99', '3', 'https://image.product-management.com/1283869'),
('ABDDFFEE', 'Pants', 'Blue athletic cotton large', '20.99', '3', 'https://image.product-management.com/1283868'),
('FFGGHHII', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'https://image.product-management.com/1283801'),
('GGHHIIJJ', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'https://image.product-management.com/1283802'),
('HHIIJJKK', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'https://image.product-management.com/1283803'),
('IIJJKKLL', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'https://image.product-management.com/1283804'),
('JJKKLLMM', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'https://image.product-management.com/1283805'),
('KKLLMMNN', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'https://image.product-management.com/1283868'),
('LLMMNNOO', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'https://image.product-management.com/1283806'),
('MMNNOOPP', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'https://image.product-management.com/1283807'),
('NNOOPPQQ', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'https://image.product-management.com/1283808'),
('OOPPQQRR', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'https://image.product-management.com/1283809'),
('MCXXLSXL', 'Shirt', 'Red short sleeve medium', '10.99', '2', 'https://image.product-management.com/1283862');


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
(1, 10),
(1, 5),
(1, 15),
(2, 10),
(2, 6),
(2, 16),
(3, 5),
(4, 12),
(5, 15),
(6, 15),
(7, 15),
(8, 15),
(9, 15),
(10, 15),
(11, 15),
(12, 15),
(13, 15),
(14, 15),
(15, 15),
(16, 1),
(17, 1),
(18, 1),
(19, 1),
(20, 1),
(21, 1),
(22, 1),
(23, 1),
(24, 1);

INSERT INTO users (first_name, last_name, username, password, join_at, last_login_at, email)
VALUES 
('west', 'wes', 'west123', '$2a$12$S8vO5lapyxXiUUVk2e5WXeQQCyugjUo5J9DWD9mTmfefkbQSdQc9q', NOW(), NOW(), 'west123@123.com'),
('north', 'nor', 'nor123', '$2a$12$S8vO5lapyxXiUUVk2e5WXeQQCyugjUo5J9DWD9mTmfefkbQSdQc9q', NOW(), NOW(), 'nor123@123.com'),
('east', 'eas', 'eas123', '$2a$12$S8vO5lapyxXiUUVk2e5WXeQQCyugjUo5J9DWD9mTmfefkbQSdQc9q', NOW(), NOW(), 'eas123@123.com'),
('south', 'sou', 'sou123', '$2a$12$S8vO5lapyxXiUUVk2e5WXeQQCyugjUo5J9DWD9mTmfefkbQSdQc9q', NOW(), NOW(), 'sou123@123.com'),
('center', 'cen', 'cen123', '$2a$12$S8vO5lapyxXiUUVk2e5WXeQQCyugjUo5J9DWD9mTmfefkbQSdQc9q', NOW(), NOW(), 'cen123@123.com');

INSERT INTO addresses (user_id, address_1, address_2, city, state, zipcode)
VALUES
(1, '101 dolly', '', 'dalmation', 'MI', '01234'),
(2, '201 disney st', '', 'dalmation', 'MI', '01234'),
(3, '10201 storm blvd', '', 'dalmation', 'MI', '01234'),
(4, '2004 godville ave', '', 'dalmation', 'MI', '01234'),
(5, '690 richard st', '', 'dalmation', 'MI', '01234');

INSERT INTO reviews (product_id, user_id, review)
VALUES
(2, 2, 'nice item'),
(2, 3, 'nice item'),
(2, 4, 'nice item'),
(2, 5, 'horrible'),
(3, 2, 'horrible'),
(3, 3, 'horrible'),
(3, 4, 'best item'),
(4, 2, 'best item'),
(4, 3, 'best item'),
(4, 4, 'useless'),
(5, 2, 'useless'),
(5, 3, 'useless');