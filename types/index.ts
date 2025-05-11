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

// Game mode information
export interface GameModeInfo {
  id: string
  name: string
  minPlayers: number
  maxPlayers: number
  entryFee?: number
  description?: string
}

// Game session information
export interface GameSession {
  sessionId: string
  gameId: string
  modeId: string
  players: PlayerInfo[]
  startTime: number
  status: "waiting" | "playing" | "completed" | "aborted"
  hostId: string
}

// Game state
export interface GameState {
  sessionId: string
  status: "waiting" | "playing" | "paused" | "completed"
  currentRound?: number
  score?: number
  timeRemaining?: number
  playerStates?: Record<string, PlayerState>
  customData?: Record<string, any>
}

// Player state in a game
export interface PlayerState {
  playerId: string
  status: "active" | "inactive" | "eliminated"
  score: number
  lives?: number
  position?: { x: number; y: number; z?: number }
  customData?: Record<string, any>
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

// Unity message types
export interface UnityMessage {
  type: string
  data: any
}

// Unity configuration
export interface UnityConfig {
  loaderUrl: string
  dataUrl: string
  frameworkUrl: string
  codeUrl: string
  streamingAssetsUrl?: string
  companyName?: string
  productName?: string
  productVersion?: string
}

// Event types for analytics
export type EventType =
  | "game_start"
  | "game_end"
  | "round_start"
  | "round_end"
  | "player_join"
  | "player_leave"
  | "transaction"
  | "error"
  | "custom"

// Event data for analytics
export interface EventData {
  eventType: EventType
  timestamp: number
  gameId: string
  sessionId?: string
  playerId?: string
  data?: Record<string, any>
}

// Error types
export enum ErrorCode {
  AUTHENTICATION_FAILED = "auth_failed",
  CONNECTION_ERROR = "connection_error",
  INVALID_GAME_STATE = "invalid_game_state",
  TRANSACTION_FAILED = "transaction_failed",
  UNITY_LOAD_ERROR = "unity_load_error",
  UNITY_COMMUNICATION_ERROR = "unity_communication_error",
  INVALID_CONFIGURATION = "invalid_configuration",
  UNKNOWN_ERROR = "unknown_error",
}

// SDK Error class
export class MutableSDKError extends Error {
  code: ErrorCode
  details?: any

  constructor(code: ErrorCode, message: string, details?: any) {
    super(message)
    this.name = "MutableSDKError"
    this.code = code
    this.details = details
  }
}
