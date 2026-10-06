CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(15),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(255),
  stock INT DEFAULT 0,
  category VARCHAR(50),
  is_custom BOOLEAN DEFAULT TRUE
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(30) DEFAULT 'placed',
  address TEXT,
  phone VARCHAR(15),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  size VARCHAR(50),
  frame VARCHAR(20),
  custom_text VARCHAR(255),
  reference_image VARCHAR(255),
  needed_by DATE,
  notes TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

INSERT INTO products (name, description, price, image_url, stock, category) VALUES
('Pencil Portrait', 'Custom portrait sketched from your photo', 1500.00, 'images/pencil.jpeg', 100, 'Portraits'),
('Framed Devotional Art', 'Hand-painted Krishna, Shiva or Jagannath in a frame', 1200.00, 'images/devotional.jpeg', 100, 'Devotional Art'),
('Custom Name Magnet', 'Hand-painted magnet with your name or quote', 150.00, 'images/magnet.jpeg', 100, 'Magnets & Keychains'),
('Painted Phone Case', 'Custom hand-painted phone case', 600.00, 'images/phonecase.jpeg', 100, 'Phone Cases'),
('Custom Framed Illustration', 'Hand-painted illustration in a frame, made from your idea or photo', 1000.00, 'images/framed.jpeg', 100, 'Framed Art');