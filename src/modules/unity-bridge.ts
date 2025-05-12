/**
 * Unity Bridge Module
 *
 * Provides integration with Unity game engine.
 */

import type { MutableSDKConfig, PlayerInfo } from "../types"
import type { Logger } from "../utils/logger"

export class UnityBridgeModule {
  private config: MutableSDKConfig
  private logger: Logger
  private player?: PlayerInfo
  private unityInstance?: any

  constructor(config: MutableSDKConfig, logger: Logger) {
    this.config = config
    this.logger = logger
  }

  /**
   * Initialize the Unity bridge module
   */
  public async initialize(): Promise<void> {
    this.logger.info("Initializing UnityBridgeModule")
  }

  /**
   * Set the current player
   * @param player Player information
   */
  public setPlayer(player: PlayerInfo): void {
    this.player = player
    this.logger.info("Player set in UnityBridgeModule", player)

    // If Unity is already loaded, update the player info
    if (this.unityInstance) {
      this.sendToUnity("SetPlayer", JSON.stringify(player))
    }
  }

  /**
   * Load Unity WebGL build
   * @param containerId ID of the container element
   * @param unityConfig Unity configuration
   */
  public async loadUnity(containerId: string, unityConfig: any): Promise<any> {
    try {
      this.logger.info("Loading Unity WebGL build", unityConfig)

      // In a real implementation, this would load the Unity WebGL build
      // For now, we'll just simulate it
      this.logger.info("Unity WebGL build loaded successfully")

      // Create a mock Unity instance
      this.unityInstance = {
        SendMessage: (objectName: string, methodName: string, value: any) => {
          this.logger.debug(`Unity SendMessage: ${objectName}.${methodName}(${value})`)
        },
      }

      // If we have player info, send it to Unity
      if (this.player) {
        this.sendToUnity("SetPlayer", JSON.stringify(this.player))
      }

      return this.unityInstance
    } catch (error) {
      this.logger.error("Failed to load Unity WebGL build", error)
      throw error
    }
  }

  /**
   * Send a message to Unity
   * @param methodName Method name to call in Unity
   * @param value Value to pass to the method
   * @param objectName GameObject name (default: "MutableSDKBridge")
   */
  public sendToUnity(methodName: string, value: any, objectName = "MutableSDKBridge"): void {
    if (!this.unityInstance) {
      this.logger.warn("Unity not loaded, cannot send message")
      return
    }

    try {
      this.logger.debug(`Sending message to Unity: ${methodName}`, value)
      this.unityInstance.SendMessage(objectName, methodName, value)
    } catch (error) {
      this.logger.error(`Failed to send message to Unity: ${methodName}`, error)
    }
  }

  /**
   * Handle a message from Unity
   * @param message Message from Unity
   */
  public handleUnityMessage(message: string): void {
    try {
      this.logger.debug("Received message from Unity", message)

      const parsedMessage = JSON.parse(message)

      // Handle different message types
      switch (parsedMessage.type) {
        case "ready":
          this.logger.info("Unity is ready")
          break
        case "event":
          this.logger.info("Unity event", parsedMessage.data)
          break
        default:
          this.logger.warn("Unknown message type from Unity", parsedMessage)
      }
    } catch (error) {
      this.logger.error("Failed to handle message from Unity", error)
    }
  }
}
