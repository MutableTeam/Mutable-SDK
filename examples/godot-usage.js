/**
 * Godot Usage Example
 *
 * This example demonstrates how to use the Mutable SDK with a Godot game.
 */

import { MutableSDK } from "@mutable/sdk"

// Initialize the SDK
const sdk = new MutableSDK({
  apiKey: "YOUR_API_KEY",
  environment: "development", // Use 'production' for production
  debug: true, // Set to false in production
})

// Example usage function
async function exampleGodotUsage() {
  try {
    // Initialize the SDK with game information
    await sdk.initialize({
      id: "my-godot-game",
      name: "My Godot Game",
      version: "1.0.0",
    })

    console.log("SDK initialized successfully")

    // Authenticate as a guest
    const player = await sdk.auth.authenticateAsGuest("Player123")
    console.log("Authenticated as guest:", player)

    // Set player in SDK
    sdk.setPlayer(player)

    // Load the Godot game
    await sdk.godotBridge.loadGodot("godot-container", {
      engineUrl: "https://example.com/godot-engine.js",
      executableUrl: "https://example.com/game.wasm",
      projectZipUrl: "https://example.com/game.zip",
    })

    console.log("Godot game loaded")

    // Register callback for game events from Godot
    sdk.godotBridge.on("game_event", (data) => {
      console.log("Received game event from Godot:", data)

      // Handle different event types
      if (data.type === "score_update") {
        // Update player state with new score
        sdk.gameState.updatePlayerState(player.id, {
          score: data.score,
        })
      }
    })

    // Create a game session
    const session = await sdk.gameState.createSession("standard", true)
    console.log("Game session created:", session)

    // Set session ID in analytics
    sdk.analytics.setSessionId(session.sessionId)

    // Send session info to Godot
    sdk.godotBridge.sendMessage("SetSessionInfo", {
      sessionId: session.sessionId,
      gameMode: "standard",
    })

    // Start the game session
    const gameState = await sdk.gameState.startSession()
    console.log("Game session started:", gameState)

    // Track game start event
    sdk.analytics.trackGameStart({
      mode: "standard",
      difficulty: "normal",
    })

    // Example of handling a game end event from Godot
    sdk.godotBridge.registerCallback("endGame", async (data) => {
      console.log("Game ended with data:", data)

      // End the session
      await sdk.gameState.endSession([player.id])

      // Track game end event
      sdk.analytics.trackGameEnd({
        score: data.finalScore,
        duration: data.gameDuration,
        completed: true,
      })

      // Award tokens based on final score
      await sdk.transactions.awardReward(
        Math.floor(data.finalScore / 10),
        "MUTB",
        sdk.getGameInfo()?.id,
        session.sessionId,
      )

      // Get player balance
      const balance = await sdk.transactions.getBalance("MUTB")
      console.log("Player balance:", balance)

      // Clean up
      sdk.analytics.flushEvents(true)
    })

    // Example of sending a message to Godot
    function updateGameTime(timeRemaining) {
      sdk.godotBridge.sendMessage("UpdateTimeRemaining", {
        time: timeRemaining,
      })
    }

    // Simulate game progress
    let timeRemaining = 60
    const gameTimer = setInterval(() => {
      timeRemaining--
      updateGameTime(timeRemaining)

      if (timeRemaining <= 0) {
        clearInterval(gameTimer)
      }
    }, 1000)
  } catch (error) {
    console.error("Error in example:", error)
  }
}

// Run the example
exampleGodotUsage()
