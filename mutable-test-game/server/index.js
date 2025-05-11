const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3001;

// Middleware
app.use(express.static(path.join(__dirname, "../client")));

// Serve the Mutable SDK from the parent directory
app.use("/dist", express.static(path.join(__dirname, "../../dist")));

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Serve the game
app.get("/", (req, res) => {
    const indexPath = path.join(__dirname, "../client/index.html");
    console.log("Serving index.html from:", indexPath);
    
    // Check if the file exists
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send("index.html not found. Path: " + indexPath);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Game available at http://localhost:${PORT}`);
});
