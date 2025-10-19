# Durga Traders - Tile Management System

A web application for managing tile inventory with MySQL database.

## Features
- Add new tiles to inventory
- Delete tiles from inventory
- Update tile information
- Generate bills for customers

## Setup Instructions

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
   - Copy `env-template.txt` to `.env`
   - Update the `.env` file with your MySQL credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_actual_mysql_password
   DB_NAME=durga_traders
   PORT=3000
   ```

3. **Set up MySQL database:**
```bash
npm run setup-db
```
   This will automatically create the database, tables, and insert sample data.

4. **Start the application:**
```bash
npm start
```
   Or for development with auto-restart:
```bash
npm run dev
```

5. **Access the application:**
   Open your browser and go to `http://localhost:3000`

## API Endpoints

- GET `/api/tiles` - Get all tiles
- POST `/api/tiles` - Add new tile
- PUT `/api/tiles/:id` - Update tile
- DELETE `/api/tiles/:id` - Delete tile
- POST `/api/bills` - Create new bill

## Usage

Open your browser and navigate to `http://localhost:3000` to access the web interface.
