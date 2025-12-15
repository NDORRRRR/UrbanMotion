-- 1. Tabel Keranjang Belanja (Tempat user simpan barang sebelum checkout)
CREATE TABLE carts (
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (user_id, product_id), 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 2. Tabel Pesanan Utama (Data order, total harga, status)
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(15, 2) NOT NULL,
  shipping_address TEXT,
  payment_method VARCHAR(50),
  payment_status ENUM('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending',
  order_status ENUM('new', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- 3. Tabel Detail Pesanan (Barang apa saja yang dibeli)
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  seller_id INT NOT NULL,
  quantity INT NOT NULL,
  price_at_purchase DECIMAL(15, 2) NOT NULL,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE RESTRICT
);

ALTER TABLE products ADD COLUMN sizes VARCHAR(255) NOT NULL DEFAULT '';

DROP TABLE IF EXISTS carts;
CREATE TABLE carts (
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  size VARCHAR(50) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, product_id, size),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

ALTER TABLE order_items ADD COLUMN size VARCHAR(50) NOT NULL DEFAULT '';