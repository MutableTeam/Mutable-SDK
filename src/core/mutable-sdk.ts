/**
 * Mutable SDK Core
 *
 * The main SDK class that provides access to all Mutable platform features.
 */

import { AuthModule } from "../modules/auth"
import { GameStateModule } from "../modules/game-state"
import { TransactionsModule } from "../modules/transactions"
import { Logger } from "../utils/logger"
import { MutableSDKConfig, GameInfo, PlayerInfo } from "../types"

/**
 * Main SDK class that provides access to all Mutable platform features
 */
export class MutableSDK {
  private config: MutableSDKConfig
  private logger: Logger
  private initialized = false

  // SDK modules
  public auth: AuthModule
  public gameState: GameStateModule
  public transactions: TransactionsModule

  // Game and player information
  private gameInfo?: GameInfo
  private playerInfo?: PlayerInfo

  /**
   * Create a new instance of the MutableSDK
   * @param config SDK configuration
   */
  constructor(config: MutableSDKConfig) {
    // Set default configuration values
    this.config = {
      environment: "production",
      debug: false,
      apiUrl: this.getDefaultApiUrl(config.environment || "production"),
      ...config,
    }

    // Initialize logger
    this.logger = new Logger(this.config.debug || false)

    // Initialize modules
    this.auth = new AuthModule(this.config, this.logger)
    this.gameState = new GameStateModule(this.config, this.logger)
    this.transactions = new TransactionsModule(this.config, this.logger)

    this.logger.info("MutableSDK instance created")
  }

  /**
   * Initialize the SDK with game information
   * @param gameInfo Information about the game
   */
  public async initialize(gameInfo: GameInfo): Promise<void> {
    try {
      this.logger.info("Initializing MutableSDK", gameInfo)

      if (!gameInfo.id || !gameInfo.name || !gameInfo.version) {
        throw new Error("Game information is incomplete. id, name, and version are required.")
      }

      this.gameInfo = gameInfo

      // Initialize all modules
      await this.auth.initialize()
      await this.gameState.initialize(gameInfo)
      await this.transactions.initialize()

      this.initialized = true
      this.logger.info("MutableSDK initialized successfully")
    } catch (error) {
      this.logger.error("Failed to initialize MutableSDK", error)
      throw error
    }
  }

  /**
   * Set the current player information
   * @param playerInfo Player information
   */
  public setPlayer(playerInfo: PlayerInfo): void {
    this.playerInfo = playerInfo
    this.auth.setPlayer(playerInfo)
    this.gameState.setPlayer(playerInfo)
    this.transactions.setPlayer(playerInfo)

    this.logger.info("Player information set", playerInfo)
  }

  /**
   * Get the current player information
   */
  public getPlayer(): PlayerInfo | undefined {
    return this.playerInfo
  }

  /**
   * Get the current game information
   */
  public getGameInfo(): GameInfo | undefined {
    return this.gameInfo
  }

  /**
   * Check if the SDK is initialized
   */
  public isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Get the SDK configuration
   */
  public getConfig(): MutableSDKConfig {
    return { ...this.config }
  }

  /**
   * Get the default API URL based on environment
   */
  private getDefaultApiUrl(environment: string): string {
    switch (environment) {
      case "development":
        return "https://dev-api.mutable.io"
      case "staging":
        return "https://staging-api.mutable.io"
      case "production":
      default:
        return "https://api.mutable.io"
    }
  }
}
