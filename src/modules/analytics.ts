/**
 * Analytics Module
 *
 * Tracks game events and player behavior for analytics.
 */

import type { MutableSDKConfig, GameInfo, PlayerInfo } from "../types"
import type { Logger } from "../utils/logger"

export class AnalyticsModule {
  private config: MutableSDKConfig
  private logger: Logger
  private gameInfo?: GameInfo
  private player?: PlayerInfo
  private sessionId?: string

  constructor(config: MutableSDKConfig, logger: Logger) {
    this.config = config
    this.logger = logger
  }

  /**
   * Initialize the analytics module
   * @param gameInfo Game information
   */
  public async initialize(gameInfo: GameInfo): Promise<void> {
    this.logger.info("Initializing AnalyticsModule", gameInfo)
    this.gameInfo = gameInfo
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
  public trackEvent(eventType: string, data?: Record<string, any>): void {
    try {
      if (!this.gameInfo) {
        throw new Error("AnalyticsModule not initialized with game info")
      }

      const event = {
        eventType,
        timestamp: Date.now(),
        gameId: this.gameInfo.id,
        sessionId: this.sessionId,
        playerId: this.player?.id,
        data,
      }

      this.logger.debug("Tracking event", event)

      // In a real implementation, this would send the event to an analytics service
      // For now, we'll just log it
      this.logger.info(`Event tracked: ${eventType}`, data)
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
   * Clean up resources
   */
  public cleanup(): void {
    this.logger.info("Cleaning up AnalyticsModule")
  }
}
