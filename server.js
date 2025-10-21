const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const db = require('./config/database');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(session({
    secret: 'durga-traders-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(express.static('public'));

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session.isLoggedIn) {
        next();
    } else {
        res.status(401).json({ error: 'Authentication required' });
    }
}

// Routes

// Login route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // Check credentials (hardcoded as requested)
    if (username === 'DurgaAdmin' && password === '1234567890') {
        req.session.isLoggedIn = true;
        req.session.username = username;
        res.json({ 
            success: true, 
            message: 'Login successful',
            username: username
        });
    } else {
        res.status(401).json({ 
            error: 'Invalid username or password' 
        });
    }
});

// Logout route
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

// Check authentication status
app.get('/api/auth/status', (req, res) => {
    res.json({ 
        isLoggedIn: !!req.session.isLoggedIn,
        username: req.session.username || null
    });
});

// Protected routes - require authentication
app.get('/dashboard', (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login.html');
    }
    res.sendFile(__dirname + '/public/index.html');
});

// Serve login page
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

// Get all tiles
app.get('/api/tiles', requireAuth, (req, res) => {
    const query = 'SELECT * FROM tiles ORDER BY created_at DESC';
    db.execute(query, (err, results) => {
        if (err) {
            console.error('Error fetching tiles:', err);
            return res.status(500).json({ error: 'Failed to fetch tiles' });
        }
        res.json(results);
    });
});

// Get single tile by ID
app.get('/api/tiles/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM tiles WHERE id = ?';
    db.execute(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching tile:', err);
            return res.status(500).json({ error: 'Failed to fetch tile' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Tile not found' });
        }
        res.json(results[0]);
    });
});

// Add new tile
app.post('/api/tiles', requireAuth, (req, res) => {
    const { name, type, size, color, price, quantity, supplier, description } = req.body;
    
    if (!name || !type || !size || !color || !price || !quantity) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
        INSERT INTO tiles (name, type, size, color, price, quantity, supplier, description) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.execute(query, [name, type, size, color, price, quantity, supplier, description], (err, results) => {
        if (err) {
            console.error('Error adding tile:', err);
            return res.status(500).json({ error: 'Failed to add tile' });
        }
        res.status(201).json({ 
            message: 'Tile added successfully', 
            id: results.insertId 
        });
    });
});

// Update tile
app.put('/api/tiles/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const { name, type, size, color, price, quantity, supplier, description } = req.body;
    
    if (!name || !type || !size || !color || !price || !quantity) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
        UPDATE tiles 
        SET name = ?, type = ?, size = ?, color = ?, price = ?, quantity = ?, supplier = ?, description = ?
        WHERE id = ?
    `;
    
    db.execute(query, [name, type, size, color, price, quantity, supplier, description, id], (err, results) => {
        if (err) {
            console.error('Error updating tile:', err);
            return res.status(500).json({ error: 'Failed to update tile' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Tile not found' });
        }
        res.json({ message: 'Tile updated successfully' });
    });
});

// Delete tile
app.delete('/api/tiles/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM tiles WHERE id = ?';
    
    db.execute(query, [id], (err, results) => {
        if (err) {
            console.error('Error deleting tile:', err);
            return res.status(500).json({ error: 'Failed to delete tile' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Tile not found' });
        }
        res.json({ message: 'Tile deleted successfully' });
    });
});

// Create bill
app.post('/api/bills', requireAuth, (req, res) => {
    const { 
        customer_name, 
        customer_phone, 
        customer_address, 
        items, 
        discount = 0, 
        tax_amount = 0, 
        payment_method = 'Cash',
        notes = ''
    } = req.body;
    
    if (!customer_name || !items || items.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate total amount
    let total_amount = 0;
    for (const item of items) {
        total_amount += item.quantity * item.price;
    }
    
    const final_amount = total_amount - discount + tax_amount;
    
    // Generate bill number
    const bill_number = 'DT' + Date.now();
    
    const query = `
        INSERT INTO bills (bill_number, customer_name, customer_phone, customer_address, 
                          total_amount, discount, tax_amount, final_amount, payment_method, items, notes) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.execute(query, [
        bill_number, customer_name, customer_phone, customer_address,
        total_amount, discount, tax_amount, final_amount, payment_method,
        JSON.stringify(items), notes
    ], (err, results) => {
        if (err) {
            console.error('Error creating bill:', err);
            return res.status(500).json({ error: 'Failed to create bill' });
        }
        
        // Update tile quantities
        const updatePromises = items.map(item => {
            return new Promise((resolve, reject) => {
                const updateQuery = 'UPDATE tiles SET quantity = quantity - ? WHERE id = ?';
                db.execute(updateQuery, [item.quantity, item.tile_id], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });
        });
        
        Promise.all(updatePromises)
            .then(() => {
                res.status(201).json({ 
                    message: 'Bill created successfully', 
                    bill_id: results.insertId,
                    bill_number: bill_number,
                    final_amount: final_amount
                });
            })
            .catch(err => {
                console.error('Error updating tile quantities:', err);
                res.status(500).json({ error: 'Bill created but failed to update inventory' });
            });
    });
});

// Get all bills
app.get('/api/bills', requireAuth, (req, res) => {
    const query = 'SELECT * FROM bills ORDER BY bill_date DESC';
    db.execute(query, (err, results) => {
        if (err) {
            console.error('Error fetching bills:', err);
            return res.status(500).json({ error: 'Failed to fetch bills' });
        }
        res.json(results);
    });
});

// Get single bill by ID
app.get('/api/bills/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM bills WHERE id = ?';
    db.execute(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching bill:', err);
            return res.status(500).json({ error: 'Failed to fetch bill' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Bill not found' });
        }
        res.json(results[0]);
    });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login.html');
    }
    res.sendFile(__dirname + '/public/index.html');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
