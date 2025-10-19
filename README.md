# Durga Traders - Tile Management System

A web application for managing tile inventory with MySQL database.

## Features
- Add new tiles to inventory
- Delete tiles from inventory
- Update tile information
- Generate bills for customers

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Set up MySQL database:
```sql
CREATE DATABASE durga_traders;
USE durga_traders;

CREATE TABLE tiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    size VARCHAR(50) NOT NULL,
    color VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    supplier VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    customer_address TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    bill_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    items JSON NOT NULL
);
```

3. Create `.env` file:
```
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=durga_traders
PORT=3000
```

4. Start the application:
```bash
npm run dev
```

## API Endpoints

- GET `/api/tiles` - Get all tiles
- POST `/api/tiles` - Add new tile
- PUT `/api/tiles/:id` - Update tile
- DELETE `/api/tiles/:id` - Delete tile
- POST `/api/bills` - Create new bill

## Usage

Open your browser and navigate to `http://localhost:3000` to access the web interface.
