/**
 * Transactions Module
 *
 * Handles token transactions, wagers, and rewards.
 */

import { type MutableSDKConfig, type PlayerInfo, type TransactionInfo, ErrorCode, MutableSDKError } from "../types"
import type { Logger } from "../utils/logger"
import { ApiClient } from "../utils/api-client"

export class TransactionsModule {
  private config: MutableSDKConfig
  private logger: Logger
  private apiClient: ApiClient
  private player?: PlayerInfo

  constructor(config: MutableSDKConfig, logger: Logger) {
    this.config = config
    this.logger = logger
    this.apiClient = new ApiClient(config, logger)
  }

  /**
   * Initialize the transactions module
   */
  public async initialize(): Promise<void> {
    this.logger.info("Initializing TransactionsModule")
  }

  /**
   * Set the current player
   * @param player Player information
   */
  public setPlayer(player: PlayerInfo): void {
    this.player = player
    this.logger.info("Player set in TransactionsModule", player)
  }

  /**
   * Get player balance
   * @param currency Currency code (e.g., 'MUTB', 'SOL')
   */
  public async getBalance(currency = "MUTB"): Promise<number> {
    try {
      this.validatePlayer()

      this.logger.info("Getting player balance", { currency })

      const response = await this.apiClient.get(`/players/${this.player!.id}/balance?currency=${currency}`)

      if (!response.success || !response.data) {
        throw new MutableSDKError(ErrorCode.TRANSACTION_FAILED, "Failed to get player balance", response.error)
      }

      this.logger.info("Player balance retrieved", response.data)

      return response.data.balance
    } catch (error) {
      this.logger.error("Failed to get player balance", error)
      throw new MutableSDKError(ErrorCode.TRANSACTION_FAILED, "Failed to get player balance", error)
    }
  }

  /**
   * Place a wager
   * @param amount Amount to wager
   * @param currency Currency code (e.g., 'MUTB', 'SOL')
   * @param gameId Game ID
   * @param sessionId Session ID
   */
  public async placeWager(
    amount: number,
    currency = "MUTB",
    gameId?: string,
    sessionId?: string,
  ): Promise<TransactionInfo> {
    try {
      this.validatePlayer()

      this.logger.info("Placing wager", { amount, currency, gameId, sessionId })

      const response = await this.apiClient.post("/transactions/wager", {
        playerId: this.player!.id,
        amount,
        currency,
        gameId,
        sessionId,
      })

      if (!response.success || !response.data) {
        throw new MutableSDKError(ErrorCode.TRANSACTION_FAILED, "Failed to place wager", response.error)
      }

      this.logger.info("Wager placed successfully", response.data.transaction)

      return response.data.transaction
    } catch (error) {
      this.logger.error("Failed to place wager", error)
      throw new MutableSDKError(ErrorCode.TRANSACTION_FAILED, "Failed to place wager", error)
    }
  }

  /**
   * Award a reward to the player
   * @param amount Amount to reward
   * @param currency Currency code (e.g., 'MUTB', 'SOL')
   * @param gameId Game ID
   * @param sessionId Session ID
   */
  public async awardReward(
    amount: number,
    currency = "MUTB",
    gameId?: string,
    sessionId?: string,
  ): Promise<TransactionInfo> {
    try {
      this.validatePlayer()

      this.logger.info("Awarding reward", { amount, currency, gameId, sessionId })

      const response = await this.apiClient.post("/transactions/reward", {
        playerId: this.player!.id,
        amount,
        currency,
        gameId,
        sessionId,
      })

      if (!response.success || !response.data) {
        throw new MutableSDKError(ErrorCode.TRANSACTION_FAILED, "Failed to award reward", response.error)
      }

      this.logger.info("Reward awarded successfully", response.data.transaction)

      return response.data.transaction
    } catch (error) {
      this.logger.error("Failed to award reward", error)
      throw new MutableSDKError(ErrorCode.TRANSACTION_FAILED, "Failed to award reward", error)
    }
  }

  /**
   * Get transaction history
   * @param limit Maximum number of transactions to return
   * @param offset Offset for pagination
   * @param type Optional transaction type filter
   */
  public async getTransactionHistory(limit = 10, offset = 0, type?: string): Promise<TransactionInfo[]> {
    try {
      this.validatePlayer()

      this.logger.info("Getting transaction history", { limit, offset, type })

      let url = `/players/${this.player!.id}/transactions?limit=${limit}&offset=${offset}`
      if (type) {
        url += `&type=${type}`
      }

      const response = await this.apiClient.get(url)

      if (!response.success || !response.data) {
        throw new MutableSDKError(ErrorCode.TRANSACTION_FAILED, "Failed to get transaction history", response.error)
      }

      this.logger.info("Transaction history retrieved", response.data)

      return response.data.transactions
    } catch (error) {
      this.logger.error("Failed to get transaction history", error)
      throw new MutableSDKError(ErrorCode.TRANSACTION_FAILED, "Failed to get transaction history", error)
    }
  }

  /**
   * Deposit tokens from wallet
   * @param amount Amount to deposit
   * @param currency Currency code (e.g., 'MUTB', 'SOL')
   * @param walletAddress Wallet address
   */
  public async deposit(amount: number, currency = "MUTB", walletAddress?: string): Promise<TransactionInfo> {
    try {
      this.validatePlayer()

      this.logger.info("Depositing tokens", { amount, currency, walletAddress })

      const response = await this.apiClient.post("/transactions/deposit", {
        playerId: this.player!.id,
        amount,
        currency,
        walletAddress: walletAddress || this.player!.walletAddress,
      })

      if (!response.success || !response.data) {
        throw new MutableSDKError(ErrorCode.TRANSACTION_FAILED, "Failed to deposit tokens", response.error)
      }

      this.logger.info("Tokens deposited successfully", response.data.transaction)

      return response.data.transaction
    } catch (error) {
      this.logger.error("Failed to deposit tokens", error)
      throw new MutableSDKError(ErrorCode.TRANSACTION_FAILED, "Failed to deposit tokens", error)
    }
  }

  /**
   * Withdraw tokens to wallet
   * @param amount Amount to withdraw
   * @param currency Currency code (e.g., 'MUTB', 'SOL')
   * @param walletAddress Wallet address
   */
  public async withdraw(amount: number, currency = "MUTB", walletAddress?: string): Promise<TransactionInfo> {
    try {
      this.validatePlayer()

      this.logger.info("Withdrawing tokens", { amount, currency, walletAddress })

      const response = await this.apiClient.post("/transactions/withdraw", {
        playerId: this.player!.id,
        amount,
        currency,
        walletAddress: walletAddress || this.player!.walletAddress,
      })

      if (!response.success || !response.data) {
        throw new MutableSDKError(ErrorCode.TRANSACTION_FAILED, "Failed to withdraw tokens", response.error)
      }

      this.logger.info("Tokens withdrawn successfully", response.data.transaction)

      return response.data.transaction
    } catch (error) {
      this.logger.error("Failed to withdraw tokens", error)
      throw new MutableSDKError(ErrorCode.TRANSACTION_FAILED, "Failed to withdraw tokens", error)
    }
  }

  /**
   * Validate that player is set
   */
  private validatePlayer(): void {
    if (!this.player) {
      throw new MutableSDKError(ErrorCode.INVALID_CONFIGURATION, "TransactionsModule not initialized with player info")
    }
  }
}
