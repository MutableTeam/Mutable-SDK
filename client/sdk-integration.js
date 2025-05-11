// SDK Integration

// Get the current port from the URL
const currentPort = window.location.port || "3001";

// Initialize the Mutable SDK
let sdk;
try {
    // Check if MutableSDK is available
    if (typeof MutableSDK === "undefined") {
        console.error("MutableSDK not found. Make sure the SDK is properly loaded.");
        // Create a mock SDK for testing
        sdk = {
            initialize: async () => {
                console.log("Mock SDK initialized");
                return true;
            },
            auth: {
                authenticateAsGuest: async (name) => {
                    console.log("Mock authentication for:", name);
                    return { id: "guest-123", name: name || "Guest" };
                }
            },
            setPlayer: (player) => {
                console.log("Mock setPlayer:", player);
            },
            transactions: {
                getBalance: async () => {
                    console.log("Mock getBalance");
                    return 100;
                }
            }
        };
    } else {
        sdk = new MutableSDK({
            apiKey: "test-api-key",
            environment: "development",
            debug: true,
            apiUrl: `http://localhost:${currentPort}/api` // Use the current port
        });
    }
} catch (error) {
    console.error("Error initializing SDK:", error);
    // Create a mock SDK for testing
    sdk = {
        initialize: async () => {
            console.log("Mock SDK initialized");
            return true;
        },
        auth: {
            authenticateAsGuest: async (name) => {
                console.log("Mock authentication for:", name);
                return { id: "guest-123", name: name || "Guest" };
            }
        },
        setPlayer: (player) => {
            console.log("Mock setPlayer:", player);
        },
        transactions: {
            getBalance: async () => {
                console.log("Mock getBalance");
                return 100;
            }
        }
    };
}

// Initialize the SDK with game info
async function initializeSDK() {
    try {
        await sdk.initialize({
            id: "coin-collector",
            name: "Mutable Coin Collector",
            version: "1.0.0"
        });
        console.log("SDK initialized successfully");
        return true;
    } catch (error) {
        console.error("Failed to initialize SDK:", error);
        return false;
    }
}

// Authenticate player as guest
async function authenticatePlayer(playerName) {
    try {
        const player = await sdk.auth.authenticateAsGuest(playerName);
        sdk.setPlayer(player);
        console.log("Player authenticated:", player);
        return player;
    } catch (error) {
        console.error("Authentication failed:", error);
        return null;
    }
}

// Create a game session
async function createGameSession() {
    try {
        // In a real implementation, this would call sdk.gameState.createSession
        // For now, we will simulate it
        const sessionId = "session-" + Date.now();
        console.log("Game session created:", sessionId);
        return sessionId;
    } catch (error) {
        console.error("Failed to create game session:", error);
        return null;
    }
}

// Update game state
async function updateGameState(sessionId, state) {
    try {
        // In a real implementation, this would call sdk.gameState.updateGameState
        // For now, we will simulate it
        console.log("Game state updated:", state);
        return true;
    } catch (error) {
        console.error("Failed to update game state:", error);
        return false;
    }
}

// End game session
async function endGameSession(sessionId, score) {
    try {
        // In a real implementation, this would call sdk.gameState.endSession
        // For now, we will simulate it
        console.log("Game session ended. Score:", score);
        return true;
    } catch (error) {
        console.error("Failed to end game session:", error);
        return false;
    }
}

// Get player balance
async function getPlayerBalance() {
    try {
        const balance = await sdk.transactions.getBalance("COIN");
        console.log("Player balance:", balance);
        return balance;
    } catch (error) {
        console.error("Failed to get player balance:", error);
        return 0;
    }
}

// Award coins to player
async function awardCoins(amount) {
    try {
        // In a real implementation, this would call sdk.transactions.awardReward
        // For now, we will simulate it
        console.log("Awarded coins:", amount);
        return true;
    } catch (error) {
        console.error("Failed to award coins:", error);
        return false;
    }
}

// Export SDK functions
window.mutableSDK = {
    initialize: initializeSDK,
    authenticate: authenticatePlayer,
    createSession: createGameSession,
    updateState: updateGameState,
    endSession: endGameSession,
    getBalance: getPlayerBalance,
    awardCoins: awardCoins
};
