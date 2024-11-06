-- 1. Bảng Users - d
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL, -- Nên mã hóa
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    role VARCHAR(50) DEFAULT 'user',
    avatar_url VARCHAR(255)
);

-- 2. Bảng Products -d
CREATE TABLE Products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category_id INT NOT NULL,
    brand_id INT NOT NULL,
    quantity_in_stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    rating FLOAT DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id),
    FOREIGN KEY (brand_id) REFERENCES Brands(brand_id)
);

-- 3. Bảng Categories -d
CREATE TABLE Categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    parent_id INT,
    FOREIGN KEY (parent_id) REFERENCES Categories(category_id)
);

-- 4. Bảng Brands -d
CREATE TABLE Brands (
    brand_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- 5. Bảng ProductImages
CREATE TABLE ProductImages (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
);

-- 6. Bảng Orders
CREATE TABLE Orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total_price DECIMAL(10, 2) NOT NULL,
    order_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- 7. Bảng OrderDetails
CREATE TABLE OrderDetails (
    order_detail_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
);

-- 8. Bảng Cart
CREATE TABLE Cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    product_id INT,
    quantity INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
);

-- 9. Bảng Payments
CREATE TABLE Payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id)
);

-- 10. Bảng Reviews
CREATE TABLE Reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    user_id INT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Products(product_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- 11. Bảng Wishlists
CREATE TABLE Wishlists (
    wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    product_id INT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
);

--12. RefreshTokens
CREATE TABLE RefreshTokens (
    token_id INT AUTO_INCREMENT PRIMARY KEY,   
    user_id INT UNIQUE,                              
    refresh_token VARCHAR(255) UNIQUE NOT NULL,       
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  
    expires_at TIMESTAMP NOT NULL,              
    FOREIGN KEY (user_id) REFERENCES Users(user_id)  
);

--13. Bảng ForgotPasswordCodes
CREATE TABLE ForgotPasswordCodes (
    code_id INT AUTO_INCREMENT PRIMARY KEY,          -- ID tự động tăng cho mỗi mã
    user_id INT UNIQUE,                                     -- ID của người dùng yêu cầu quên mật khẩu
    code VARCHAR(10) NOT NULL,                       -- Mã xác nhận gửi đến người dùng
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Thời gian mã được tạo
    expires_at TIMESTAMP NOT NULL,                   -- Thời gian mã hết hạn
    used BOOLEAN DEFAULT FALSE,                      -- Trạng thái mã đã sử dụng hay chưa
    FOREIGN KEY (user_id) REFERENCES Users(user_id)  -- Khóa ngoại liên kết đến bảng Users
);

--14. Bảng PasswordHistory
CREATE TABLE PasswordHistory (
    history_id INT AUTO_INCREMENT PRIMARY KEY,  -- Khóa chính, tự động tăng
    user_id INT UNIQUE,                                -- ID người dùng liên kết với bảng Users
    old_password VARCHAR(255) NOT NULL,          -- Mật khẩu cũ (nên mã hóa)
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Thời gian thay đổi mật khẩu
    FOREIGN KEY (user_id) REFERENCES Users(user_id)  -- Liên kết với bảng Users
);
