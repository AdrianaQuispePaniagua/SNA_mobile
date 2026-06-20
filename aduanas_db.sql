CREATE DATABASE IF NOT EXISTS aduanas_db;
USE aduanas_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_type ENUM('chilean', 'foreign') NOT NULL,
    rut VARCHAR(20),
    passport VARCHAR(50),
    country_of_origin VARCHAR(100),
    country_flag VARCHAR(10),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    birth_date DATE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    wants_printed_qr BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS declarations (
    id VARCHAR(50) PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    emoji VARCHAR(10),
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    date VARCHAR(50),
    status VARCHAR(50),
    qr_data VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
