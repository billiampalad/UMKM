-- E-commerce Database Schema
-- Create database
CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

-- Users table
CREATE TABLE users (
    id_user INT PRIMARY KEY AUTO_INCREMENT,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    pass VARCHAR(255) NOT NULL,
    role ENUM('admin', 'employee') DEFAULT 'employee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Products table
CREATE TABLE products (
    id_product INT PRIMARY KEY AUTO_INCREMENT,
    nama_product VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    harga DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nama_product (nama_product),
    INDEX idx_stock (stock),
    INDEX idx_harga (harga)
);

-- Cart items table
CREATE TABLE cart_items (
    id_cart INT PRIMARY KEY AUTO_INCREMENT,
    id_user INT NOT NULL,
    id_product INT NOT NULL,
    jumlah INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE,
    FOREIGN KEY (id_product) REFERENCES products(id_product) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (id_user, id_product),
    INDEX idx_user (id_user),
    INDEX idx_product (id_product)
);

-- Transactions table
CREATE TABLE transactions (
    id_transaksi INT PRIMARY KEY AUTO_INCREMENT,
    id_user INT NOT NULL,
    total_harga DECIMAL(10,2) NOT NULL,
    tanggal_transaksi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metode_pembayaran VARCHAR(50) NOT NULL,
    status_pembayaran ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE,
    INDEX idx_user (id_user),
    INDEX idx_status (status_pembayaran),
    INDEX idx_tanggal (tanggal_transaksi),
    INDEX idx_total (total_harga)
);

-- Transaction items table
CREATE TABLE transaction_items (
    id_transaksi_item INT PRIMARY KEY AUTO_INCREMENT,
    id_transaksi INT NOT NULL,
    id_product INT NOT NULL,
    jumlah INT NOT NULL,
    sub_total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_transaksi) REFERENCES transactions(id_transaksi) ON DELETE CASCADE,
    FOREIGN KEY (id_product) REFERENCES products(id_product) ON DELETE CASCADE,
    INDEX idx_transaksi (id_transaksi),
    INDEX idx_product (id_product)
);

-- Documents table
CREATE TABLE documents (
    id_dokumen INT PRIMARY KEY AUTO_INCREMENT,
    id_transaksi INT NOT NULL,
    tipe_dokumen VARCHAR(50) NOT NULL,
    tanggal_pembuatan TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_transaksi) REFERENCES transactions(id_transaksi) ON DELETE CASCADE,
    INDEX idx_transaksi (id_transaksi),
    INDEX idx_tipe (tipe_dokumen),
    INDEX idx_tanggal (tanggal_pembuatan)
);

-- Create triggers for updated_at timestamps
DELIMITER $$

CREATE TRIGGER users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER cart_items_updated_at 
    BEFORE UPDATE ON cart_items 
    FOR EACH ROW 
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW 
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$

DELIMITER ;

-- Create views for commonly used queries
CREATE VIEW user_transaction_summary AS
SELECT 
    u.id_user,
    u.nama,
    u.email,
    u.role,
    COUNT(t.id_transaksi) as total_transactions,
    COALESCE(SUM(t.total_harga), 0) as total_spent,
    COALESCE(AVG(t.total_harga), 0) as average_order_value,
    MAX(t.tanggal_transaksi) as last_transaction_date
FROM users u
LEFT JOIN transactions t ON u.id_user = t.id_user AND t.status_pembayaran = 'completed'
GROUP BY u.id_user, u.nama, u.email, u.role;

CREATE VIEW product_sales_summary AS
SELECT 
    p.id_product,
    p.nama_product,
    p.harga,
    p.stock,
    COALESCE(SUM(ti.jumlah), 0) as total_sold,
    COALESCE(SUM(ti.sub_total), 0) as total_revenue,
    COUNT(DISTINCT ti.id_transaksi) as transaction_count
FROM products p
LEFT JOIN transaction_items ti ON p.id_product = ti.id_product
LEFT JOIN transactions t ON ti.id_transaksi = t.id_transaksi AND t.status_pembayaran = 'completed'
GROUP BY p.id_product, p.nama_product, p.harga, p.stock;

CREATE VIEW cart_summary AS
SELECT 
    u.id_user,
    u.nama,
    u.email,
    COUNT(ci.id_cart) as items_in_cart,
    COALESCE(SUM(ci.jumlah), 0) as total_quantity,
    COALESCE(SUM(ci.jumlah * p.harga), 0) as cart_value
FROM users u
LEFT JOIN cart_items ci ON u.id_user = ci.id_user
LEFT JOIN products p ON ci.id_product = p.id_product
GROUP BY u.id_user, u.nama, u.email;

CREATE VIEW transaction_details AS
SELECT 
    t.id_transaksi,
    t.id_user,
    u.nama as user_nama,
    u.email as user_email,
    t.total_harga,
    t.tanggal_transaksi,
    t.metode_pembayaran,
    t.status_pembayaran,
    COUNT(ti.id_transaksi_item) as items_count,
    GROUP_CONCAT(p.nama_product SEPARATOR ', ') as product_names
FROM transactions t
JOIN users u ON t.id_user = u.id_user
LEFT JOIN transaction_items ti ON t.id_transaksi = ti.id_transaksi
LEFT JOIN products p ON ti.id_product = p.id_product
GROUP BY t.id_transaksi, t.id_user, u.nama, u.email, t.total_harga, 
         t.tanggal_transaksi, t.metode_pembayaran, t.status_pembayaran;

-- Create stored procedures
DELIMITER $

-- Procedure to get monthly sales report
CREATE PROCEDURE GetMonthlySalesReport(IN report_year INT, IN report_month INT)
BEGIN
    SELECT 
        DATE(t.tanggal_transaksi) as sale_date,
        COUNT(t.id_transaksi) as transaction_count,
        SUM(t.total_harga) as daily_revenue,
        AVG(t.total_harga) as average_order_value
    FROM transactions t
    WHERE YEAR(t.tanggal_transaksi) = report_year 
    AND MONTH(t.tanggal_transaksi) = report_month
    AND t.status_pembayaran = 'completed'
    GROUP BY DATE(t.tanggal_transaksi)
    ORDER BY sale_date;
END$

-- Procedure to get top selling products
CREATE PROCEDURE GetTopSellingProducts(IN limit_count INT)
BEGIN
    SELECT 
        p.id_product,
        p.nama_product,
        p.harga,
        p.stock,
        SUM(ti.jumlah) as total_sold,
        SUM(ti.sub_total) as total_revenue,
        COUNT(DISTINCT ti.id_transaksi) as order_count
    FROM products p
    JOIN transaction_items ti ON p.id_product = ti.id_product
    JOIN transactions t ON ti.id_transaksi = t.id_transaksi
    WHERE t.status_pembayaran = 'completed'
    GROUP BY p.id_product, p.nama_product, p.harga, p.stock
    ORDER BY total_sold DESC
    LIMIT limit_count;
END$

-- Procedure to clean up expired cart items (older than 30 days)
CREATE PROCEDURE CleanupExpiredCartItems()
BEGIN
    DELETE FROM cart_items 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
    
    SELECT ROW_COUNT() as deleted_items;
END$

-- Procedure to update product stock
CREATE PROCEDURE UpdateProductStock(
    IN product_id INT, 
    IN stock_change INT, 
    IN operation VARCHAR(10)
)
BEGIN
    DECLARE current_stock INT;
    DECLARE new_stock INT;
    
    -- Get current stock
    SELECT stock INTO current_stock 
    FROM products 
    WHERE id_product = product_id;
    
    -- Calculate new stock based on operation
    CASE operation
        WHEN 'add' THEN SET new_stock = current_stock + stock_change;
        WHEN 'subtract' THEN SET new_stock = GREATEST(0, current_stock - stock_change);
        WHEN 'set' THEN SET new_stock = stock_change;
        ELSE SET new_stock = current_stock;
    END CASE;
    
    -- Update stock
    UPDATE products 
    SET stock = new_stock 
    WHERE id_product = product_id;
    
    -- Return result
    SELECT 
        product_id,
        current_stock as previous_stock,
        new_stock,
        operation;
END$

DELIMITER ;

-- Insert default admin user (password: admin123)
INSERT INTO users (nama, email, pass, role) VALUES 
('Administrator', 'admin@ecommerce.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insert sample employee user (password: employee123)
INSERT INTO users (nama, email, pass, role) VALUES 
('John Employee', 'employee@ecommerce.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee');

-- Insert sample products
INSERT INTO products (nama_product, deskripsi, harga, stock) VALUES 
('Laptop HP Pavilion', 'Laptop HP Pavilion 14 inch dengan processor Intel Core i5', 8500000.00, 10),
('Mouse Wireless Logitech', 'Mouse wireless Logitech dengan teknologi laser', 250000.00, 50),
('Keyboard Mechanical', 'Keyboard mechanical dengan switch Cherry MX Blue', 1200000.00, 25),
('Monitor LED 24 inch', 'Monitor LED 24 inch Full HD dengan resolusi 1920x1080', 2500000.00, 15),
('Headset Gaming', 'Headset gaming dengan surround sound 7.1', 800000.00, 30),
('Webcam HD', 'Webcam HD 1080p untuk video call dan streaming', 450000.00, 20),
('SSD 500GB', 'SSD SATA 500GB dengan kecepatan baca 560 MB/s', 850000.00, 40),
('RAM DDR4 8GB', 'RAM DDR4 8GB PC-2400 untuk upgrade laptop/PC', 600000.00, 35),
('Printer Inkjet Canon', 'Printer inkjet Canon dengan fitur scan dan copy', 1800000.00, 12),
('External HDD 1TB', 'External hard disk 1TB USB 3.0 portable', 750000.00, 25);

-- Create indexes for performance optimization
CREATE INDEX idx_users_email_role ON users(email, role);
CREATE INDEX idx_products_stock_harga ON products(stock, harga);
CREATE INDEX idx_transactions_user_status ON transactions(id_user, status_pembayaran);
CREATE INDEX idx_transactions_date_status ON transactions(tanggal_transaksi, status_pembayaran);
CREATE INDEX idx_transaction_items_transaction_product ON transaction_items(id_transaksi, id_product);
CREATE INDEX idx_documents_transaction_type ON documents(id_transaksi, tipe_dokumen);

-- Create full-text search index for products
ALTER TABLE products ADD FULLTEXT(nama_product, deskripsi);

SHOW TABLES;