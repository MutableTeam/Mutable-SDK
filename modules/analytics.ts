/**
 * Analytics Module
 *
 * Tracks game events and player behavior for analytics.
 */

import {
  type MutableSDKConfig,
  type GameInfo,
  type PlayerInfo,
  type EventType,
  type EventData,
  ErrorCode,
  MutableSDKError,
} from "../types"
import type { Logger } from "../utils/logger"
import { ApiClient } from "../utils/api-client"

export class AnalyticsModule {
  private config: MutableSDKConfig
  private logger: Logger
  private apiClient: ApiClient
  private gameInfo?: GameInfo
  private player?: PlayerInfo
  private sessionId?: string
  private eventQueue: EventData[] = []
  private isProcessingQueue = false
  private flushInterval?: NodeJS.Timeout
  private readonly FLUSH_INTERVAL_MS = 10000 // 10 seconds
  private readonly MAX_QUEUE_SIZE = 100

  constructor(config: MutableSDKConfig, logger: Logger) {
    this.config = config
    this.logger = logger
    this.apiClient = new ApiClient(config, logger)
  }

  /**
   * Initialize the analytics module
   * @param gameInfo Game information
   */
  public async initialize(gameInfo: GameInfo): Promise<void> {
    this.logger.info("Initializing AnalyticsModule", gameInfo)
    this.gameInfo = gameInfo

    // Start the flush interval
    this.startFlushInterval()

    // Set up beforeunload handler to flush events when page is closed
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        this.flushEvents(true)
      })
    }
  }

  /**
   * Set the current player
   * @param player Player information
   */
  public setPlayer(player: PlayerInfo): void {
    this.player = player
    this.logger.info("Player set in AnalyticsModule", player)
  }

  /**
   * Set the current session ID
   * @param sessionId Session ID
   */
  public setSessionId(sessionId: string): void {
    this.sessionId = sessionId
    this.logger.info("Session ID set in AnalyticsModule", { sessionId })
  }

  /**
   * Track a game event
   * @param eventType Type of event
   * @param data Additional event data
   */
  public trackEvent(eventType: EventType, data?: Record<string, any>): void {
    try {
      if (!this.gameInfo) {
        throw new MutableSDKError(ErrorCode.INVALID_CONFIGURATION, "AnalyticsModule not initialized with game info")
      }

      const event: EventData = {
        eventType,
        timestamp: Date.now(),
        gameId: this.gameInfo.id,
        sessionId: this.sessionId,
        playerId: this.player?.id,
        data,
      }

      this.logger.debug("Tracking event", event)

      // Add to queue
      this.eventQueue.push(event)

      // Flush if queue is getting large
      if (this.eventQueue.length >= this.MAX_QUEUE_SIZE) {
        this.flushEvents()
      }
    } catch (error) {
      this.logger.error("Failed to track event", error)
    }
  }

  /**
   * Track game start event
   * @param data Additional event data
   */
  public trackGameStart(data?: Record<string, any>): void {
    this.trackEvent("game_start", data)
  }

  /**
   * Track game end event
   * @param data Additional event data
   */
  public trackGameEnd(data?: Record<string, any>): void {
    this.trackEvent("game_end", data)
  }

  /**
   * Track round start event
   * @param data Additional event data
   */
  public trackRoundStart(data?: Record<string, any>): void {
    this.trackEvent("round_start", data)
  }

  /**
   * Track round end event
   * @param data Additional event data
   */
  public trackRoundEnd(data?: Record<string, any>): void {
    this.trackEvent("round_end", data)
  }

  /**
   * Track player join event
   * @param data Additional event data
   */
  public trackPlayerJoin(data?: Record<string, any>): void {
    this.trackEvent("player_join", data)
  }

  /**
   * Track player leave event
   * @param data Additional event data
   */
  public trackPlayerLeave(data?: Record<string, any>): void {
    this.trackEvent("player_leave", data)
  }

  /**
   * Track transaction event
   * @param data Additional event data
   */
  public trackTransaction(data?: Record<string, any>): void {
    this.trackEvent("transaction", data)
  }

  /**
   * Track error event
   * @param data Additional event data
   */
  public trackError(data?: Record<string, any>): void {
    this.trackEvent("error", data)
  }

  /**
   * Flush events to the server
   * @param sync Whether to flush synchronously (default: false)
   */
  public async flushEvents(sync = false): Promise<void> {
    // If no events or already processing, skip
    if (this.eventQueue.length === 0 || (this.isProcessingQueue && !sync)) {
      return
    }

    this.isProcessingQueue = true

    try {
      // Take a copy of the current queue and clear it
      const events = [...this.eventQueue]
      this.eventQueue = []

      this.logger.debug("Flushing events", { count: events.length })

      const response = await this.apiClient.post("/analytics/events", {
        events,
      })

      if (!response.success) {
        // If failed, add events back to the queue
        this.eventQueue = [...events, ...this.eventQueue]
        this.logger.warn("Failed to flush events, will retry later", response.error)
      } else {
        this.logger.debug("Events flushed successfully")
      }
    } catch (error) {
      // If error, add events back to the queue
      this.eventQueue = [...this.eventQueue]
      this.logger.error("Error flushing events", error)
    } finally {
      this.isProcessingQueue = false
    }
  }

  /**
   * Start the flush interval
   */
  private startFlushInterval(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }

    this.flushInterval = setInterval(() => {
      this.flushEvents()
    }, this.FLUSH_INTERVAL_MS)
  }

  /**
   * Stop the flush interval
   */
  public stopFlushInterval(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = undefined
    }
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    this.stopFlushInterval()
    this.flushEvents(true)
  }
}
