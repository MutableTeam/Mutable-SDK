// Game Logic

// Game variables
let player = null;
let sessionId = null;
let gameActive = false;
let score = 0;
let coinBalance = 0;
let timeRemaining = 60;
let gameLoop = null;
let coins = [];
let playerX = 400;
let playerY = 300;
let playerSpeed = 5;
let keysPressed = {};

// DOM elements
const loginScreen = document.getElementById("login-screen");
const gameScreen = document.getElementById("game-screen");
const endScreen = document.getElementById("end-screen");
const playerNameInput = document.getElementById("player-name");
const loginButton = document.getElementById("login-button");
const playerNameDisplay = document.getElementById("player-name-display");
const scoreDisplay = document.getElementById("score");
const coinBalanceDisplay = document.getElementById("coin-balance");
const timeDisplay = document.getElementById("time");
const startButton = document.getElementById("start-button");
const endButton = document.getElementById("end-button");
const finalScoreDisplay = document.getElementById("final-score");
const coinsEarnedDisplay = document.getElementById("coins-earned");
const totalBalanceDisplay = document.getElementById("total-balance");
const playAgainButton = document.getElementById("play-again-button");
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// Initialize the game
async function initGame() {
    // Initialize the SDK
    const initialized = await window.mutableSDK.initialize();
    if (!initialized) {
        alert("Failed to initialize the game. Please try again.");
        return;
    }
    
    // Set up event listeners
    loginButton.addEventListener("click", handleLogin);
    startButton.addEventListener("click", startGame);
    endButton.addEventListener("click", endGame);
    playAgainButton.addEventListener("click", resetGame);
    
    // Set up keyboard controls
    window.addEventListener("keydown", (e) => { keysPressed[e.key] = true; });
    window.addEventListener("keyup", (e) => { keysPressed[e.key] = false; });
    
    // Get initial balance
    coinBalance = await window.mutableSDK.getBalance();
    coinBalanceDisplay.textContent = coinBalance;
}

// Handle player login
async function handleLogin() {
    const playerName = playerNameInput.value.trim() || "Guest";
    player = await window.mutableSDK.authenticate(playerName);
    
    if (player) {
        playerNameDisplay.textContent = player.name;
        loginScreen.classList.add("hidden");
        gameScreen.classList.remove("hidden");
        
        // Get updated balance
        coinBalance = await window.mutableSDK.getBalance();
        coinBalanceDisplay.textContent = coinBalance;
    } else {
        alert("Login failed. Please try again.");
    }
}

// Start the game
async function startGame() {
    // Create a game session
    sessionId = await window.mutableSDK.createSession();
    if (!sessionId) {
        alert("Failed to create game session. Please try again.");
        return;
    }
    
    // Reset game state
    gameActive = true;
    score = 0;
    timeRemaining = 60;
    coins = [];
    playerX = canvas.width / 2;
    playerY = canvas.height / 2;
    
    // Update UI
    scoreDisplay.textContent = score;
    timeDisplay.textContent = timeRemaining;
    startButton.disabled = true;
    endButton.disabled = false;
    
    // Generate initial coins
    for (let i = 0; i < 10; i++) {
        spawnCoin();
    }
    
    // Start game loop
    gameLoop = setInterval(updateGame, 1000 / 60); // 60 FPS
    
    // Start countdown
    const timerInterval = setInterval(() => {
        timeRemaining--;
        timeDisplay.textContent = timeRemaining;
        
        // Update game state every 5 seconds
        if (timeRemaining % 5 === 0) {
            window.mutableSDK.updateState(sessionId, {
                score,
                timeRemaining,
                playerPosition: { x: playerX, y: playerY }
            });
        }
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

// Update game state
function updateGame() {
    if (!gameActive) return;
    
    // Move player based on keys pressed
    if (keysPressed["ArrowUp"] || keysPressed["w"]) playerY = Math.max(20, playerY - playerSpeed);
    if (keysPressed["ArrowDown"] || keysPressed["s"]) playerY = Math.min(canvas.height - 20, playerY + playerSpeed);
    if (keysPressed["ArrowLeft"] || keysPressed["a"]) playerX = Math.max(20, playerX - playerSpeed);
    if (keysPressed["ArrowRight"] || keysPressed["d"]) playerX = Math.min(canvas.width - 20, playerX + playerSpeed);
    
    // Check coin collisions
    coins = coins.filter(coin => {
        const dx = playerX - coin.x;
        const dy = playerY - coin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 30) { // Player radius + coin radius
            score += coin.value;
            scoreDisplay.textContent = score;
            return false; // Remove the coin
        }
        return true;
    });
    
    // Spawn new coins if needed
    while (coins.length < 10) {
        spawnCoin();
    }
    
    // Draw game
    drawGame();
}

// Draw the game
function drawGame() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw player
    ctx.fillStyle = "#3498db";
    ctx.beginPath();
    ctx.arc(playerX, playerY, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw coins
    coins.forEach(coin => {
        ctx.fillStyle = coin.color;
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, 10, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Spawn a new coin
function spawnCoin() {
    const coinTypes = [
        { value: 1, color: "#f1c40f" },  // Gold
        { value: 5, color: "#e74c3c" },  // Red
        { value: 10, color: "#9b59b6" }  // Purple
    ];
    
    const coinType = coinTypes[Math.floor(Math.random() * coinTypes.length)];
    const margin = 30;
    
    const coin = {
        x: margin + Math.random() * (canvas.width - 2 * margin),
        y: margin + Math.random() * (canvas.height - 2 * margin),
        value: coinType.value,
        color: coinType.color
    };
    
    coins.push(coin);
}

// End the game
async function endGame() {
    if (!gameActive) return;
    
    // Stop game loop
    clearInterval(gameLoop);
    gameActive = false;
    
    // End session and award coins
    await window.mutableSDK.endSession(sessionId, score);
    const coinsEarned = Math.floor(score / 10); // 1 coin for every 10 points
    await window.mutableSDK.awardCoins(coinsEarned);
    
    // Get updated balance
    coinBalance = await window.mutableSDK.getBalance();
    
    // Update UI
    finalScoreDisplay.textContent = score;
    coinsEarnedDisplay.textContent = coinsEarned;
    totalBalanceDisplay.textContent = coinBalance;
    
    // Show end screen
    gameScreen.classList.add("hidden");
    endScreen.classList.remove("hidden");
}

// Reset the game
function resetGame() {
    endScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    
    // Reset UI
    startButton.disabled = false;
    endButton.disabled = true;
    scoreDisplay.textContent = "0";
    timeDisplay.textContent = "60";
    coinBalanceDisplay.textContent = coinBalance;
}

// Initialize the game when the page loads
window.addEventListener("load", initGame);
