/**
 * Mutable SDK Types
 *
 * Type definitions for the Mutable SDK.
 */

// SDK Configuration
export interface MutableSDKConfig {
  apiKey: string
  environment?: "development" | "staging" | "production"
  debug?: boolean
  apiUrl?: string
  websocketUrl?: string
}

// Player information
export interface PlayerInfo {
  id: string
  name: string
  walletAddress?: string
  avatarUrl?: string
}

// Game information
export interface GameInfo {
  id: string
  name: string
  version: string
  buildId?: string
}
