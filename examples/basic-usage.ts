/**
 * Basic Usage Example
 *
 * This example demonstrates how to use the Mutable SDK for basic functionality.
 */

import { MutableSDK } from "@mutable/sdk"

// Initialize the SDK
const sdk = new MutableSDK({
  apiKey: "YOUR_API_KEY",
  environment: "development", // Use 'production' for production
  debug: true, // Set to false in production
})

// Example usage function
async function exampleUsage() {
  try {
    // Initialize the SDK with game information
    await sdk.initialize({
      id: "my-awesome-game",
      name: "My Awesome Game",
      version: "1.0.0",
    })

    console.log("SDK initialized successfully")

    // Authenticate as a guest
    const player = await sdk.auth.authenticateAsGuest("Player123")
    console.log("Authenticated as guest:", player)

    // Set player in SDK
    sdk.setPlayer(player)

    // Create a game session
    const session = await sdk.gameState.createSession("standard", true)
    console.log("Game session created:", session)

    // Set session ID in analytics
    sdk.analytics.setSessionId(session.sessionId)

    // Start the game session
    const gameState = await sdk.gameState.startSession()
    console.log("Game session started:", gameState)

    // Track game start event
    sdk.analytics.trackGameStart({
      mode: "standard",
      difficulty: "normal",
    })

    // Update player state
    await sdk.gameState.updatePlayerState(player.id, {
      score: 100,
      lives: 3,
      position: { x: 0, y: 0 },
    })

    // Simulate game progress
    setTimeout(async () => {
      // Update player score
      await sdk.gameState.updatePlayerState(player.id, {
        score: 250,
        lives: 2,
      })

      // Award tokens for achievement
      await sdk.transactions.awardReward(50, "MUTB", sdk.getGameInfo()?.id, session.sessionId)
      console.log("Reward awarded for achievement")

      // End the game
      setTimeout(async () => {
        // Final score update
        await sdk.gameState.updatePlayerState(player.id, {
          score: 500,
          lives: 1,
        })

        // End the session
        await sdk.gameState.endSession([player.id])
        console.log("Game session ended")

        // Track game end event
        sdk.analytics.trackGameEnd({
          score: 500,
          duration: 120, // seconds
          completed: true,
        })

        // Award tokens based on final score
        await sdk.transactions.awardReward(100, "MUTB", sdk.getGameInfo()?.id, session.sessionId)
        console.log("Final reward awarded")

        // Get player balance
        const balance = await sdk.transactions.getBalance("MUTB")
        console.log("Player balance:", balance)

        // Clean up
        sdk.analytics.flushEvents(true)
        console.log("Example completed")
      }, 3000)
    }, 3000)
  } catch (error) {
    console.error("Error in example:", error)
  }
}

// Run the example
exampleUsage()
