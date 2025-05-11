const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const http = require('http');

// Initialize mock database if it doesn't exist
const dbPath = path.join(__dirname, 'db.json');
if (!fs.existsSync(dbPath)) {
    const initialData = {
        players: {},
        sessions: {},
        transactions: []
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
}

// Import routes
const authRoutes = require('./routes/auth');
const gameStateRoutes = require('./routes/game-state');
const transactionsRoutes = require('./routes/transactions');

const app = express();
const PORT = process.env.PORT || 3001; // Use a different port

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../client')));

// Serve the Mutable SDK from the parent directory
app.use('/dist', express.static(path.join(__dirname, '../../dist')));

// API routes
app.use('/api', authRoutes);
app.use('/api', gameStateRoutes);
app.use('/api', transactionsRoutes);

// Serve the game
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, '../client/index.html');
    console.log('Serving index.html from:', indexPath);
    
    // Check if the file exists
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('index.html not found. Path: ' + indexPath);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Game available at http://localhost:${PORT}`);
});
