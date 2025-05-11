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

// Get player balance
router.get('/players/:playerId/balance', (req, res) => {
    try {
        const { playerId } = req.params;
        const { currency = 'COIN' } = req.query;
        
        // Get player from database
        const db = readDB();
        const player = db.players[playerId];
        
        if (!player) {
            return res.status(404).json({
                success: false,
                error: 'Player not found'
            });
        }
        
        // Calculate balance from transactions
        let balance = 0;
        db.transactions.forEach(tx => {
            if (tx.playerId === playerId && tx.currency === currency) {
                if (tx.type === 'reward') {
                    balance += tx.amount;
                } else if (tx.type === 'wager') {
                    balance -= tx.amount;
                }
            }
        });
        
        res.json({
            success: true,
            data: {
                balance,
                currency
            }
        });
    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get balance'
        });
    }
});

// Award reward
router.post('/transactions/reward', (req, res) => {
    try {
        const { playerId, amount, currency = 'COIN', gameId, sessionId } = req.body;
        
        // Validate request
        if (!playerId || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request. playerId and amount are required.'
            });
        }
        
        // Get player from database
        const db = readDB();
        const player = db.players[playerId];
        
        if (!player) {
            return res.status(404).json({
                success: false,
                error: 'Player not found'
            });
        }
        
        // Create transaction
        const transaction = {
            id: uuidv4(),
            type: 'reward',
            amount: Number(amount),
            currency,
            timestamp: Date.now(),
            status: 'completed',
            playerId,
            gameId,
            sessionId
        };
        
        // Save transaction
        db.transactions.push(transaction);
        writeDB(db);
        
        res.json({
            success: true,
            data: {
                transaction
            }
        });
    } catch (error) {
        console.error('Award reward error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to award reward'
        });
    }
});

module.exports = router;
