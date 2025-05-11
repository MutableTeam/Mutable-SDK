/**
 * Unity Bridge Module
 *
 * Handles communication between the Mutable platform and Unity WebGL games.
 */

import {
  type MutableSDKConfig,
  type PlayerInfo,
  type UnityMessage,
  type UnityConfig,
  ErrorCode,
  MutableSDKError,
} from "../types"
import type { Logger } from "../utils/logger"

export class UnityBridgeModule {
  private config: MutableSDKConfig
  private logger: Logger
  private player?: PlayerInfo
  private unityInstance?: any
  private messageHandlers: Map<string, (data: any) => void> = new Map()
  private isInitialized = false

  constructor(config: MutableSDKConfig, logger: Logger) {
    this.config = config
    this.logger = logger
  }

  /**
   * Initialize the Unity bridge module
   */
  public async initialize(): Promise<void> {
    this.logger.info("Initializing UnityBridgeModule")

    // Set up message listener for Unity
    if (typeof window !== "undefined") {
      window.addEventListener("message", this.handleUnityMessage)
    }

    this.isInitialized = true
  }

  /**
   * Set the current player
   * @param player Player information
   */
  public setPlayer(player: PlayerInfo): void {
    this.player = player
    this.logger.info("Player set in UnityBridgeModule", player)

    // If Unity is already loaded, send player info
    if (this.unityInstance) {
      this.sendPlayerInfo()
    }
  }

  /**
   * Load a Unity WebGL game
   * @param canvasId ID of the canvas element to render Unity content
   * @param unityConfig Unity configuration
   */
  public async loadUnity(canvasId: string, unityConfig: UnityConfig): Promise<void> {
    try {
      if (!this.isInitialized) {
        throw new MutableSDKError(ErrorCode.INVALID_CONFIGURATION, "UnityBridgeModule not initialized")
      }

      this.logger.info("Loading Unity WebGL game", { canvasId, unityConfig })

      const canvas = document.getElementById(canvasId) as HTMLCanvasElement
      if (!canvas) {
        throw new MutableSDKError(ErrorCode.UNITY_LOAD_ERROR, `Canvas element with ID "${canvasId}" not found`)
      }

      // Load Unity loader script
      await this.loadUnityScript(unityConfig.loaderUrl)

      // Create Unity instance
      if (typeof window.createUnityInstance !== "function") {
        throw new MutableSDKError(ErrorCode.UNITY_LOAD_ERROR, "Unity loader script did not define createUnityInstance")
      }

      this.unityInstance = await window.createUnityInstance(
        canvas,
        {
          dataUrl: unityConfig.dataUrl,
          frameworkUrl: unityConfig.frameworkUrl,
          codeUrl: unityConfig.codeUrl,
          streamingAssetsUrl: unityConfig.streamingAssetsUrl || "StreamingAssets",
          companyName: unityConfig.companyName || "Mutable",
          productName: unityConfig.productName || "MutableGame",
          productVersion: unityConfig.productVersion || "1.0",
        },
        (progress: number) => {
          this.logger.debug("Unity loading progress", { progress: Math.round(progress * 100) })
        },
      )

      // Store Unity instance globally for debugging
      window.unityInstance = this.unityInstance

      // Send player info to Unity
      if (this.player) {
        this.sendPlayerInfo()
      }

      this.logger.info("Unity WebGL game loaded successfully")
    } catch (error) {
      this.logger.error("Failed to load Unity WebGL game", error)
      throw new MutableSDKError(ErrorCode.UNITY_LOAD_ERROR, "Failed to load Unity WebGL game", error)
    }
  }

  /**
   * Send a message to Unity
   * @param gameObject Name of the game object in Unity
   * @param method Name of the method to call
   * @param data Data to send (will be JSON stringified if object)
   */
  public sendMessage(gameObject: string, method: string, data: any): void {
    try {
      if (!this.unityInstance) {
        throw new MutableSDKError(ErrorCode.UNITY_COMMUNICATION_ERROR, "Unity instance not loaded")
      }

      this.logger.debug("Sending message to Unity", { gameObject, method, data })

      // Convert data to string if it's an object
      const message = typeof data === "object" ? JSON.stringify(data) : data

      this.unityInstance.SendMessage(gameObject, method, message)
    } catch (error) {
      this.logger.error("Failed to send message to Unity", error)
      throw new MutableSDKError(ErrorCode.UNITY_COMMUNICATION_ERROR, "Failed to send message to Unity", error)
    }
  }

  /**
   * Register a handler for messages from Unity
   * @param messageType Type of message to handle
   * @param handler Function to call when message is received
   * @returns Function to unregister the handler
   */
  public on(messageType: string, handler: (data: any) => void): () => void {
    this.messageHandlers.set(messageType, handler)

    return () => {
      this.messageHandlers.delete(messageType)
    }
  }

  /**
   * Unload Unity instance
   */
  public unloadUnity(): void {
    try {
      if (!this.unityInstance) {
        return
      }

      this.logger.info("Unloading Unity instance")

      this.unityInstance.Quit()
      this.unityInstance = undefined
      window.unityInstance = undefined

      this.logger.info("Unity instance unloaded")
    } catch (error) {
      this.logger.error("Failed to unload Unity instance", error)
    }
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    this.unloadUnity()

    if (typeof window !== "undefined") {
      window.removeEventListener("message", this.handleUnityMessage)
    }
  }

  /**
   * Handle messages from Unity
   */
  private handleUnityMessage = (event: MessageEvent): void => {
    // Only process messages from Unity
    if (!event.data || event.data.source !== "unity") {
      return
    }

    const message = event.data as UnityMessage

    this.logger.debug("Received message from Unity", message)

    // Call the appropriate handler
    const handler = this.messageHandlers.get(message.type)
    if (handler) {
      try {
        handler(message.data)
      } catch (error) {
        this.logger.error("Error in Unity message handler", error)
      }
    }
  }

  /**
   * Send player information to Unity
   */
  private sendPlayerInfo(): void {
    if (!this.player || !this.unityInstance) {
      return
    }

    this.sendMessage("GameManager", "SetPlayerInfo", {
      id: this.player.id,
      name: this.player.name,
      walletAddress: this.player.walletAddress,
    })
  }

  /**
   * Load Unity loader script
   * @param loaderUrl URL of the Unity loader script
   */
  private loadUnityScript(loaderUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (typeof window.createUnityInstance === "function") {
        resolve()
        return
      }

      const script = document.createElement("script")
      script.src = loaderUrl
      script.async = true

      script.onload = () => {
        this.logger.debug("Unity loader script loaded")
        resolve()
      }

      script.onerror = (error) => {
        this.logger.error("Failed to load Unity loader script", error)
        reject(new Error("Failed to load Unity loader script"))
      }

      document.body.appendChild(script)

      // Set a timeout to prevent hanging
      const timeout = setTimeout(() => {
        if (typeof window.createUnityInstance !== "function") {
          this.logger.error("Timeout loading Unity loader script")
          reject(new Error("Timeout loading Unity loader script"))
        }
      }, 10000)

      // Clear timeout when script loads
      script.onload = () => {
        clearTimeout(timeout)
        this.logger.debug("Unity loader script loaded")
        resolve()
      }
    })
  }
}

// Add createUnityInstance to the Window interface
declare global {
  interface Window {
    createUnityInstance: any
    unityInstance: any
  }
}
