const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '../db.json');

// Helper function to read the database
function readDB() {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
}

// Helper function to write to the database
function writeDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Guest authentication
router.post('/auth/guest', (req, res) => {
    try {
        const { name } = req.body;
        const playerName = name || `Guest_${Math.floor(Math.random() * 10000)}`;
        
        // Generate a unique player ID
        const playerId = uuidv4();
        
        // Create player object
        const player = {
            id: playerId,
            name: playerName,
            createdAt: Date.now()
        };
        
        // Save player to database
        const db = readDB();
        db.players[playerId] = player;
        writeDB(db);
        
        // Generate mock tokens
        const token = `mock-token-${playerId}`;
        const refreshToken = `mock-refresh-token-${playerId}`;
        
        res.json({
            success: true,
            data: {
                player,
                token,
                refreshToken,
                expiresIn: 3600 // 1 hour
            }
        });
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            error: 'Authentication failed'
        });
    }
});

module.exports = router;
