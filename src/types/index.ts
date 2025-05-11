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

// Transaction information
export interface TransactionInfo {
  id: string
  type: "deposit" | "withdrawal" | "wager" | "reward" | "purchase"
  amount: number
  currency: string
  timestamp: number
  status: "pending" | "completed" | "failed"
  playerId: string
  gameId?: string
  sessionId?: string
  txHash?: string
}
