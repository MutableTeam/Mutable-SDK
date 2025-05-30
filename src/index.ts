/**
 * Mutable SDK
 *
 * Main entry point for the SDK
 */

// Export core SDK
export { MutableSDK } from "./core/mutable-sdk"

// Export modules
export { AuthModule } from "./modules/auth"
export { GameStateModule } from "./modules/game-state"
export { TransactionsModule } from "./modules/transactions"
export { AnalyticsModule } from "./modules/analytics"
export { UnityBridgeModule } from "./modules/unity-bridge"
export { GodotBridgeModule } from "./modules/godot-bridge"

// Export types
export * from "./types"

// Export version
export const VERSION = "1.0.0"
