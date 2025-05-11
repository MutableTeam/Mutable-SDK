/**
 * Authentication Module
 *
 * Handles player authentication and session management.
 */

import { type MutableSDKConfig, type PlayerInfo, ErrorCode, MutableSDKError } from "../types"
import type { Logger } from "../utils/logger"
import { ApiClient } from "../utils/api-client"

export class AuthModule {
  private config: MutableSDKConfig
  private logger: Logger
  private apiClient: ApiClient
  private player?: PlayerInfo
  private authToken?: string
  private refreshToken?: string
  private tokenExpiry?: number
  private refreshTokenTimeout?: NodeJS.Timeout

  constructor(config: MutableSDKConfig, logger: Logger) {
    this.config = config
    this.logger = logger
    this.apiClient = new ApiClient(config, logger)
  }

  /**
   * Initialize the authentication module
   */
  public async initialize(): Promise<void> {
    this.logger.info("Initializing AuthModule")
    // Check for existing auth in localStorage
    this.tryRestoreSession()
  }

  /**
   * Set the current player
   * @param player Player information
   */
  public setPlayer(player: PlayerInfo): void {
    this.player = player
    this.logger.info("Player set in AuthModule", player)
  }

  /**
   * Get the current player
   */
  public getPlayer(): PlayerInfo | undefined {
    return this.player
  }

  /**
   * Authenticate a player with wallet
   * @param walletAddress The player's wallet address
   * @param signedMessage The signed message for verification
   */
  public async authenticateWithWallet(walletAddress: string, signedMessage: string): Promise<PlayerInfo> {
    try {
      this.logger.info("Authenticating with wallet", { walletAddress })

      const response = await this.apiClient.post("/auth/wallet", {
        walletAddress,
        signedMessage,
      })

      if (!response.success || !response.data) {
        throw new MutableSDKError(ErrorCode.AUTHENTICATION_FAILED, "Authentication failed", response.error)
      }

      const { player, token, refreshToken, expiresIn } = response.data

      // Set auth data
      this.player = player
      this.authToken = token
      this.refreshToken = refreshToken
      this.tokenExpiry = Date.now() + expiresIn * 1000

      // Save to localStorage
      this.saveSession()

      // Set up token refresh
      this.setupTokenRefresh(expiresIn)

      this.logger.info("Authentication successful", { playerId: player.id })

      return player
    } catch (error) {
      this.logger.error("Authentication failed", error)
      throw new MutableSDKError(ErrorCode.AUTHENTICATION_FAILED, "Failed to authenticate with wallet", error)
    }
  }

  /**
   * Authenticate a player as a guest
   * @param name Optional display name for the guest
   */
  public async authenticateAsGuest(name?: string): Promise<PlayerInfo> {
    try {
      this.logger.info("Authenticating as guest")

      const response = await this.apiClient.post("/auth/guest", {
        name: name || `Guest_${Math.floor(Math.random() * 10000)}`,
      })

      if (!response.success || !response.data) {
        throw new MutableSDKError(ErrorCode.AUTHENTICATION_FAILED, "Guest authentication failed", response.error)
      }

      const { player, token, refreshToken, expiresIn } = response.data

      // Set auth data
      this.player = player
      this.authToken = token
      this.refreshToken = refreshToken
      this.tokenExpiry = Date.now() + expiresIn * 1000

      // Save to localStorage
      this.saveSession()

      // Set up token refresh
      this.setupTokenRefresh(expiresIn)

      this.logger.info("Guest authentication successful", { playerId: player.id })

      return player
    } catch (error) {
      this.logger.error("Guest authentication failed", error)
      throw new MutableSDKError(ErrorCode.AUTHENTICATION_FAILED, "Failed to authenticate as guest", error)
    }
  }

  /**
   * Log out the current player
   */
  public async logout(): Promise<void> {
    try {
      this.logger.info("Logging out")

      if (this.authToken) {
        await this.apiClient.post("/auth/logout", {
          refreshToken: this.refreshToken,
        })
      }

      // Clear auth data
      this.player = undefined
      this.authToken = undefined
      this.refreshToken = undefined
      this.tokenExpiry = undefined

      // Clear localStorage
      this.clearSession()

      // Clear token refresh timeout
      if (this.refreshTokenTimeout) {
        clearTimeout(this.refreshTokenTimeout)
        this.refreshTokenTimeout = undefined
      }

      this.logger.info("Logout successful")
    } catch (error) {
      this.logger.error("Logout failed", error)
      // Still clear local data even if API call fails
      this.clearSession()
    }
  }

  /**
   * Get the current auth token
   */
  public getAuthToken(): string | undefined {
    return this.authToken
  }

  /**
   * Check if the player is authenticated
   */
  public isAuthenticated(): boolean {
    return !!this.authToken && !!this.player
  }

  /**
   * Refresh the auth token
   */
  private async refreshAuthToken(): Promise<void> {
    try {
      if (!this.refreshToken) {
        throw new Error("No refresh token available")
      }

      this.logger.info("Refreshing auth token")

      const response = await this.apiClient.post("/auth/refresh", {
        refreshToken: this.refreshToken,
      })

      if (!response.success || !response.data) {
        throw new Error("Token refresh failed")
      }

      const { token, refreshToken, expiresIn } = response.data

      // Update auth data
      this.authToken = token
      this.refreshToken = refreshToken
      this.tokenExpiry = Date.now() + expiresIn * 1000

      // Save to localStorage
      this.saveSession()

      // Set up next token refresh
      this.setupTokenRefresh(expiresIn)

      this.logger.info("Token refresh successful")
    } catch (error) {
      this.logger.error("Token refresh failed", error)
      // Force logout on refresh failure
      this.logout()
    }
  }

  /**
   * Set up token refresh timer
   * @param expiresIn Seconds until token expires
   */
  private setupTokenRefresh(expiresIn: number): void {
    // Clear any existing timeout
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout)
    }

    // Refresh token 5 minutes before expiry
    const refreshDelay = Math.max(0, (expiresIn - 300) * 1000)

    this.refreshTokenTimeout = setTimeout(() => {
      this.refreshAuthToken()
    }, refreshDelay)
  }

  /**
   * Save session to localStorage
   */
  private saveSession(): void {
    if (typeof window === "undefined") return

    try {
      const sessionData = {
        player: this.player,
        authToken: this.authToken,
        refreshToken: this.refreshToken,
        tokenExpiry: this.tokenExpiry,
      }

      localStorage.setItem("mutable_session", JSON.stringify(sessionData))
    } catch (error) {
      this.logger.error("Failed to save session to localStorage", error)
    }
  }

  /**
   * Try to restore session from localStorage
   */
  private tryRestoreSession(): void {
    if (typeof window === "undefined") return

    try {
      const sessionData = localStorage.getItem("mutable_session")

      if (!sessionData) return

      const { player, authToken, refreshToken, tokenExpiry } = JSON.parse(sessionData)

      // Check if token is expired
      if (!tokenExpiry || tokenExpiry < Date.now()) {
        this.clearSession()
        return
      }

      this.player = player
      this.authToken = authToken
      this.refreshToken = refreshToken
      this.tokenExpiry = tokenExpiry

      // Set up token refresh
      const expiresIn = Math.floor((tokenExpiry - Date.now()) / 1000)
      this.setupTokenRefresh(expiresIn)

      this.logger.info("Session restored from localStorage", { playerId: player.id })
    } catch (error) {
      this.logger.error("Failed to restore session from localStorage", error)
      this.clearSession()
    }
  }

  /**
   * Clear session from localStorage
   */
  private clearSession(): void {
    if (typeof window === "undefined") return

    try {
      localStorage.removeItem("mutable_session")
    } catch (error) {
      this.logger.error("Failed to clear session from localStorage", error)
    }
  }
}
