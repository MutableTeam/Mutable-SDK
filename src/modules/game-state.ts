/**
 * Game State Module
 *
 * Manages game state, sessions, and real-time updates.
 */

import { MutableSDKConfig, GameInfo, PlayerInfo } from "../types"
import { Logger } from "../utils/logger"

export class GameStateModule {
  private config: MutableSDKConfig
  private logger: Logger
  private gameInfo?: GameInfo
  private player?: PlayerInfo

  constructor(config: MutableSDKConfig, logger: Logger) {
    this.config = config
    this.logger = logger
  }

  /**
   * Initialize the game state module
   * @param gameInfo Game information
   */
  public async initialize(gameInfo: GameInfo): Promise<void> {
    this.logger.info("Initializing GameStateModule", gameInfo)
    this.gameInfo = gameInfo
  }

  /**
   * Set the current player
   * @param player Player information
   */
  public setPlayer(player: PlayerInfo): void {
    this.player = player
    this.logger.info("Player set in GameStateModule", player)
  }
}
