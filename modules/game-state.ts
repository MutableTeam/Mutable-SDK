/**
 * Game State Module
 *
 * Manages game state, sessions, and real-time updates.
 */

import {
  type MutableSDKConfig,
  type GameInfo,
  type PlayerInfo,
  type GameSession,
  type GameState,
  type GameModeInfo,
  type PlayerState,
  ErrorCode,
  MutableSDKError,
} from "../types"
import type { Logger } from "../utils/logger"
import { ApiClient } from "../utils/api-client"
import { WebSocketClient } from "../utils/websocket-client"

export class GameStateModule {
  private config: MutableSDKConfig
  private logger: Logger
  private apiClient: ApiClient
  private wsClient: WebSocketClient
  private gameInfo?: GameInfo
  private player?: PlayerInfo
  private currentSession?: GameSession
  private currentState?: GameState
  private stateUpdateCallbacks: ((state: GameState) => void)[] = []
  private sessionUpdateCallbacks: ((session: GameSession) => void)[] = []

  constructor(config: MutableSDKConfig, logger: Logger) {
    this.config = config
    this.logger = logger
    this.apiClient = new ApiClient(config, logger)
    this.wsClient = new WebSocketClient(config, logger)
  }

  /**
   * Initialize the game state module
   * @param gameInfo Game information
   */
  public async initialize(gameInfo: GameInfo): Promise<void> {
    this.logger.info("Initializing GameStateModule", gameInfo)
    this.gameInfo = gameInfo

    // Set up WebSocket event handlers
    this.setupWebSocketHandlers()
  }

  /**
   * Set the current player
   * @param player Player information
   */
  public setPlayer(player: PlayerInfo): void {
    this.player = player
    this.logger.info("Player set in GameStateModule", player)
  }

  /**
   * Create a new game session
   * @param modeId Game mode ID
   * @param isPublic Whether the session is public or private
   */
  public async createSession(modeId: string, isPublic = true): Promise<GameSession> {
    try {
      this.validateInitialization()

      this.logger.info("Creating game session", { modeId, isPublic })

      const response = await this.apiClient.post("/sessions/create", {
        gameId: this.gameInfo!.id,
        modeId,
        isPublic,
      })

      if (!response.success || !response.data) {
        throw new MutableSDKError(ErrorCode.INVALID_GAME_STATE, "Failed to create game session", response.error)
      }

      this.currentSession = response.data.session

      // Connect to session via WebSocket
      await this.connectToSession(this.currentSession.sessionId)

      // Notify callbacks
      this.notifySessionUpdateCallbacks()

      this.logger.info("Game session created", this.currentSession)

      return this.currentSession
    } catch (error) {
      this.logger.error("Failed to create game session", error)
      throw new MutableSDKError(ErrorCode.INVALID_GAME_STATE, "Failed to create game session", error)
    }
  }

  /**
   * Join an existing game session
   * @param sessionId Session ID to join
   */
  public async joinSession(sessionId: string): Promise<GameSession> {
    try {
      this.validateInitialization()

      this.logger.info("Joining game session", { sessionId })

      const response = await this.apiClient.post(`/sessions/${sessionId}/join`, {})

      if (!response.success || !response.data) {
        throw new MutableSDKError(ErrorCode.INVALID_GAME_STATE, "Failed to join game session", response.error)
      }

      this.currentSession = response.data.session

      // Connect to session via WebSocket
      await this.connectToSession(sessionId)

      // Notify callbacks
      this.notifySessionUpdateCallbacks()

      this.logger.info("Joined game session", this.currentSession)

      return this.currentSession
    } catch (error) {
      this.logger.error("Failed to join game session", error)
      throw new MutableSDKError(ErrorCode.INVALID_GAME_STATE, "Failed to join game session", error)
    }
  }

  /**
   * Leave the current game session
   */
  public async leaveSession(): Promise<void> {
    try {
      if (!this.currentSession) {
        this.logger.warn("No active session to leave")
        return
      }

      const sessionId = this.currentSession.sessionId

      this.logger.info("Leaving game session", { sessionId })

      await this.apiClient.post(`/sessions/${sessionId}/leave`, {})

      // Disconnect from WebSocket
      this.wsClient.disconnect()

      this.currentSession = undefined
      this.currentState = undefined

      this.logger.info("Left game session", { sessionId })
    } catch (error) {
      this.logger.error("Failed to leave game session", error)
      throw new MutableSDKError(ErrorCode.INVALID_GAME_STATE, "Failed to leave game session", error)
    }
  }

  /**
   * Start the current game session
   * Only the host can start the session
   */
  public async startSession(): Promise<GameState> {
    try {
      if (!this.currentSession) {
        throw new MutableSDKError(ErrorCode.INVALID_GAME_STATE, "No active session to start")
      }

      const sessionId = this.currentSession.sessionId

      this.logger.info("Starting game session", { sessionId })

      const response = await this.apiClient.post(`/sessions/${sessionId}/start`, {})

      if (!response.success || !response.data) {
        throw new MutableSDKError(ErrorCode.INVALID_GAME_STATE, "Failed to start game session", response.error)
      }

      this.currentState = response.data.state

      // Notify callbacks
      this.notifyStateUpdateCallbacks()

      this.logger.info("Game session started", this.currentState)

      return this.currentState
    } catch (error) {
      this.logger.error("Failed to start game session", error)
      throw new MutableSDKError(ErrorCode.INVALID_GAME_STATE, "Failed to start game session", error)
    }
  }

  /**
   * End the current game session
   * @param winnerIds Optional array of winner player IDs
   */
  public async endSession(winnerIds?: string[]): Promise<void> {
    try {
      if (!this.currentSession) {
        throw new MutableSDKError(ErrorCode.INVALID_GAME_STATE, "No active session to end")
      }

      const sessionId = this.currentSession.sessionId

      this.logger.info("Ending game session", { sessionId, winnerIds })

      await this.apiClient.post(`/sessions/${sessionId}/end`, {
        winnerIds,
      })

      // Session will be updated via WebSocket

      this.logger.info("Game session ended", { sessionId })
    } catch (error) {
      this.logger.error("Failed to end game session", error)
      throw new MutableSDKError(ErrorCode.INVALID_GAME_STATE, "Failed to end game session", error)
    }
  }

  /**
   * Update the game state
   * @param stateUpdate Partial game state update
   */
  public async updateGameState(stateUpdate: Partial<GameState>): Promise<GameState> {
    try {
      if (!this.currentSession) {
        throw new MutableSDKError(ErrorCode.INVALID_GAME_STATE, "No active session to update state")
      }

      const sessionId = this.currentSession.sessionId

      this.logger.info("Updating game state", { sessionId, stateUpdate })

      // Send state update via WebSocket for real-time updates
      this.wsClient.send("game_state_update", {
        sessionId,
        stateUpdate,
      })

      // Also send via API for persistence
      const response = await this.apiClient.post(`/sessions/${sessionId}/state`, {
        stateUpdate,
      })

      if (!response.success || !response.data) {
        throw new MutableSDKError(ErrorCode.INVALID_GAME_STATE, "Failed to update game state", response.error)
      }

      this.currentState = response.data.state

      // Notify callbacks
      this.notifyStateUpdateCallbacks()

      this.logger.info("Game state updated", this.currentState)

      return this.currentState
    } catch (error) {
      this.logger.error("Failed to update game state", error)
      throw new MutableSDKError(ErrorCode.INVALID_GAME_STATE, "Failed to update game state", error)
    }
  }

  /**
   * Update a player's state
   * @param playerId Player ID
   * @param playerState Partial player state update
   */
  public async updatePlayerState(playerId: string, playerState: Partial<PlayerState>): Promise<GameState> {
    try {
      if (!this.currentSession) {
        throw new MutableSDKError(ErrorCode.INVALID_GAME_STATE, "No active session to update player state")
      }

      const sessionId = this.currentSession.sessionId

      this.logger.info("Updating player state", { sessionId, playerId, playerState })

      // Create state update with player state
      const stateUpdate: Partial<GameState> = {
        playerStates: {
          ...(this.currentState?.playerStates || {}),
          [playerId]: {
            ...(this.currentState?.playerStates?.[playerId] || { playerId, status: "active", score: 0 }),
            ...playerState,
          },
        },
      }

      return this.updateGameState(stateUpdate)
    } catch (error) {
      this.logger.error("Failed to update player state", error)
      throw new MutableSDKError(ErrorCode.INVALID_GAME_STATE, "Failed to update player state", error)
    }
  }

  /**
   * Get available game modes
   */
  public async getGameModes(): Promise<GameModeInfo[]> {
    try {
      this.validateInitialization()

      this.logger.info("Getting game modes")

      const response = await this.apiClient.get(`/games/${this.gameInfo!.id}/modes`)

      if (!response.success || !response.data) {
        throw new MutableSDKError(ErrorCode.INVALID_GAME_STATE, "Failed to get game modes", response.error)
      }

      this.logger.info("Game modes retrieved", response.data.modes)

      return response.data.modes
    } catch (error) {
      this.logger.error("Failed to get game modes", error)
      throw new MutableSDKError(ErrorCode.INVALID_GAME_STATE, "Failed to get game modes", error)
    }
  }

  /**
   * Get available public sessions
   */
  public async getPublicSessions(): Promise<GameSession[]> {
    try {
      this.validateInitialization()

      this.logger.info("Getting public sessions")

      const response = await this.apiClient.get(`/games/${this.gameInfo!.id}/sessions`)

      if (!response.success || !response.data) {
        throw new MutableSDKError(ErrorCode.INVALID_GAME_STATE, "Failed to get public sessions", response.error)
      }

      this.logger.info("Public sessions retrieved", response.data.sessions)

      return response.data.sessions
    } catch (error) {
      this.logger.error("Failed to get public sessions", error)
      throw new MutableSDKError(ErrorCode.INVALID_GAME_STATE, "Failed to get public sessions", error)
    }
  }

  /**
   * Get the current game session
   */
  public getCurrentSession(): GameSession | undefined {
    return this.currentSession
  }

  /**
   * Get the current game state
   */
  public getCurrentState(): GameState | undefined {
    return this.currentState
  }

  /**
   * Register a callback for game state updates
   * @param callback Function to call when game state is updated
   * @returns Function to unregister the callback
   */
  public onStateUpdate(callback: (state: GameState) => void): () => void {
    this.stateUpdateCallbacks.push(callback)

    return () => {
      this.stateUpdateCallbacks = this.stateUpdateCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Register a callback for session updates
   * @param callback Function to call when session is updated
   * @returns Function to unregister the callback
   */
  public onSessionUpdate(callback: (session: GameSession) => void): () => void {
    this.sessionUpdateCallbacks.push(callback)

    return () => {
      this.sessionUpdateCallbacks = this.sessionUpdateCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Connect to a game session via WebSocket
   * @param sessionId Session ID to connect to
   */
  private async connectToSession(sessionId: string): Promise<void> {
    try {
      await this.wsClient.connect()

      // Join the session room
      this.wsClient.send("join_session", {
        sessionId,
        playerId: this.player!.id,
      })

      this.logger.info("Connected to session via WebSocket", { sessionId })
    } catch (error) {
      this.logger.error("Failed to connect to session via WebSocket", error)
      throw new MutableSDKError(ErrorCode.CONNECTION_ERROR, "Failed to connect to session via WebSocket", error)
    }
  }

  /**
   * Set up WebSocket event handlers
   */
  private setupWebSocketHandlers(): void {
    // Handle session updates
    this.wsClient.on("session_update", (data) => {
      this.logger.info("Received session update", data)

      this.currentSession = data.session
      this.notifySessionUpdateCallbacks()
    })

    // Handle game state updates
    this.wsClient.on("game_state_update", (data) => {
      this.logger.info("Received game state update", data)

      this.currentState = data.state
      this.notifyStateUpdateCallbacks()
    })

    // Handle player join
    this.wsClient.on("player_join", (data) => {
      this.logger.info("Player joined session", data)

      if (this.currentSession) {
        this.currentSession.players = [...this.currentSession.players, data.player]

        this.notifySessionUpdateCallbacks()
      }
    })

    // Handle player leave
    this.wsClient.on("player_leave", (data) => {
      this.logger.info("Player left session", data)

      if (this.currentSession) {
        this.currentSession.players = this.currentSession.players.filter((player) => player.id !== data.playerId)

        this.notifySessionUpdateCallbacks()
      }
    })
  }

  /**
   * Notify all state update callbacks
   */
  private notifyStateUpdateCallbacks(): void {
    if (!this.currentState) return

    for (const callback of this.stateUpdateCallbacks) {
      try {
        callback(this.currentState)
      } catch (error) {
        this.logger.error("Error in state update callback", error)
      }
    }
  }

  /**
   * Notify all session update callbacks
   */
  private notifySessionUpdateCallbacks(): void {
    if (!this.currentSession) return

    for (const callback of this.sessionUpdateCallbacks) {
      try {
        callback(this.currentSession)
      } catch (error) {
        this.logger.error("Error in session update callback", error)
      }
    }
  }

  /**
   * Validate that the module is properly initialized
   */
  private validateInitialization(): void {
    if (!this.gameInfo) {
      throw new MutableSDKError(ErrorCode.INVALID_CONFIGURATION, "GameStateModule not initialized with game info")
    }

    if (!this.player) {
      throw new MutableSDKError(ErrorCode.INVALID_CONFIGURATION, "GameStateModule not initialized with player info")
    }
  }
}
