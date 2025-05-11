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

// Create a game session
router.post('/sessions/create', (req, res) => {
    try {
        const { gameId, modeId = 'standard', isPublic = true } = req.body;
        
        // Get player ID from auth token (simplified)
        const authHeader = req.headers.authorization || '';
        const token = authHeader.split(' ')[1];
        const playerId = token ? token.split('-')[2] : null;
        
        if (!playerId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
        }
        
        // Generate session ID
        const sessionId = uuidv4();
        
        // Create session object
        const session = {
            sessionId,
            gameId,
            modeId,
            isPublic,
            players: [playerId],
            hostId: playerId,
            startTime: Date.now(),
            status: 'waiting'
        };
        
        // Save session to database
        const db = readDB();
        db.sessions[sessionId] = session;
        writeDB(db);
        
        res.json({
            success: true,
            data: {
                session
            }
        });
    } catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create session'
        });
    }
});

// Update game state
router.post('/sessions/:sessionId/state', (req, res) => {
    try {
        const { sessionId } = req.params;
        const { stateUpdate } = req.body;
        
        // Get player ID from auth token (simplified)
        const authHeader = req.headers.authorization || '';
        const token = authHeader.split(' ')[1];
        const playerId = token ? token.split('-')[2] : null;
        
        if (!playerId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
        }
        
        // Get session from database
        const db = readDB();
        const session = db.sessions[sessionId];
        
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }
        
        // Update session state
        session.state = {
            ...(session.state || {}),
            ...stateUpdate,
            lastUpdated: Date.now()
        };
        
        // Save updated session
        db.sessions[sessionId] = session;
        writeDB(db);
        
        res.json({
            success: true,
            data: {
                state: session.state
            }
        });
    } catch (error) {
        console.error('Update state error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update state'
        });
    }
});

// End game session
router.post('/sessions/:sessionId/end', (req, res) => {
    try {
        const { sessionId } = req.params;
        const { winnerIds } = req.body;
        
        // Get player ID from auth token (simplified)
        const authHeader = req.headers.authorization || '';
        const token = authHeader.split(' ')[1];
        const playerId = token ? token.split('-')[2] : null;
        
        if (!playerId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
        }
        
        // Get session from database
        const db = readDB();
        const session = db.sessions[sessionId];
        
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }
        
        // Update session status
        session.status = 'completed';
        session.endTime = Date.now();
        session.winnerIds = winnerIds || [];
        
        // Save updated session
        db.sessions[sessionId] = session;
        writeDB(db);
        
        res.json({
            success: true,
            data: {
                session
            }
        });
    } catch (error) {
        console.error('End session error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to end session'
        });
    }
});

module.exports = router;
