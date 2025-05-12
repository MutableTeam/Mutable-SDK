/**
 * Godot Bridge Module
 *
 * Handles communication between the Mutable platform and Godot games.
 */

import {
  type MutableSDKConfig,
  type PlayerInfo,
  type GodotMessage,
  type GodotConfig,
  ErrorCode,
  MutableSDKError,
} from "../types"
import type { Logger } from "../utils/logger"

export class GodotBridgeModule {
  private config: MutableSDKConfig
  private logger: Logger
  private player?: PlayerInfo
  private godotInstance?: any
  private messageHandlers: Map<string, (data: any) => void> = new Map()
  private isInitialized = false
  private godotCallbacks: Map<string, Function> = new Map()

  constructor(config: MutableSDKConfig, logger: Logger) {
    this.config = config
    this.logger = logger
  }

  /**
   * Initialize the Godot bridge module
   */
  public async initialize(): Promise<void> {
    this.logger.info("Initializing GodotBridgeModule")

    // Set up message listener for Godot
    if (typeof window !== "undefined") {
      window.addEventListener("message", this.handleGodotMessage)

      // Add global methods for Godot to call
      window.mutableReceiveMessage = this.receiveMessageFromGodot.bind(this)
    }

    this.isInitialized = true
  }

  /**
   * Set the current player
   * @param player Player information
   */
  public setPlayer(player: PlayerInfo): void {
    this.player = player
    this.logger.info("Player set in GodotBridgeModule", player)

    // If Godot is already loaded, send player info
    if (this.godotInstance) {
      this.sendPlayerInfo()
    }
  }

  /**
   * Load a Godot game
   * @param containerId ID of the container element to render Godot content
   * @param godotConfig Godot configuration
   */
  public async loadGodot(containerId: string, godotConfig: GodotConfig): Promise<void> {
    try {
      if (!this.isInitialized) {
        throw new MutableSDKError(ErrorCode.INVALID_CONFIGURATION, "GodotBridgeModule not initialized")
      }

      this.logger.info("Loading Godot game", { containerId, godotConfig })

      const container = document.getElementById(containerId)
      if (!container) {
        throw new MutableSDKError(ErrorCode.GODOT_LOAD_ERROR, `Container element with ID "${containerId}" not found`)
      }

      // Load Godot engine script
      await this.loadGodotScript(godotConfig.engineUrl)

      // Create configuration for Godot
      const engineConfig = {
        args: godotConfig.args || [],
        canvasResizePolicy: godotConfig.canvasResizePolicy || 2,
        executable: godotConfig.executableUrl,
        experimentalVK: godotConfig.experimentalVK || false,
        focusCanvas: godotConfig.focusCanvas !== false,
        gdextensionLibs: godotConfig.gdextensionLibs || [],
        persistentPaths: godotConfig.persistentPaths || [],
        projectZip: godotConfig.projectZipUrl,
        unloadAfterInit: false,
      }

      // Initialize Godot engine
      const engine = new window.Engine(engineConfig)

      // Set up canvas in the container
      const canvas = document.createElement("canvas")
      canvas.id = "godot-canvas"
      canvas.style.width = "100%"
      canvas.style.height = "100%"
      container.appendChild(canvas)

      // Start the Godot engine
      this.godotInstance = await engine.start(canvas)

      // Store Godot instance globally for debugging
      window.godotInstance = this.godotInstance

      // Set up communication methods
      this.setupGodotCommunication()

      // Send player info to Godot
      if (this.player) {
        this.sendPlayerInfo()
      }

      this.logger.info("Godot game loaded successfully")
    } catch (error) {
      this.logger.error("Failed to load Godot game", error)
      throw new MutableSDKError(ErrorCode.GODOT_LOAD_ERROR, "Failed to load Godot game", error)
    }
  }

  /**
   * Send a message to Godot
   * @param method Name of the method to call
   * @param data Data to send (will be JSON stringified if object)
   * @param objectPath Path to the object in Godot (default: "/root/Main")
   */
  public sendMessage(method: string, data: any, objectPath = "/root/Main"): void {
    try {
      if (!this.godotInstance) {
        throw new MutableSDKError(ErrorCode.GODOT_COMMUNICATION_ERROR, "Godot instance not loaded")
      }

      this.logger.debug("Sending message to Godot", { objectPath, method, data })

      // Convert data to string if it's an object
      const message = typeof data === "object" ? JSON.stringify(data) : data

      // Call the method on the Godot object
      this.godotInstance.callFunction(objectPath, method, [message])
    } catch (error) {
      this.logger.error("Failed to send message to Godot", error)
      throw new MutableSDKError(ErrorCode.GODOT_COMMUNICATION_ERROR, "Failed to send message to Godot", error)
    }
  }

  /**
   * Register a handler for messages from Godot
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
   * Register a callback function that Godot can call
   * @param name Name of the callback
   * @param callback Function to call
   */
  public registerCallback(name: string, callback: Function): void {
    this.godotCallbacks.set(name, callback)
    this.logger.debug("Registered callback for Godot", { name })
  }

  /**
   * Unload Godot instance
   */
  public unloadGodot(): void {
    try {
      if (!this.godotInstance) {
        return
      }

      this.logger.info("Unloading Godot instance")

      // Call Godot's quit method if available
      try {
        this.godotInstance.callFunction("/root", "quit", [])
      } catch (e) {
        // Ignore errors if quit method is not available
      }

      // Clean up
      this.godotInstance = undefined
      window.godotInstance = undefined

      this.logger.info("Godot instance unloaded")
    } catch (error) {
      this.logger.error("Failed to unload Godot instance", error)
    }
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    this.unloadGodot()

    if (typeof window !== "undefined") {
      window.removeEventListener("message", this.handleGodotMessage)
      delete window.mutableReceiveMessage
    }
  }

  /**
   * Handle messages from Godot
   */
  private handleGodotMessage = (event: MessageEvent): void => {
    // Only process messages from Godot
    if (!event.data || event.data.source !== "godot") {
      return
    }

    const message = event.data as GodotMessage

    this.logger.debug("Received message from Godot", message)

    // Call the appropriate handler
    const handler = this.messageHandlers.get(message.type)
    if (handler) {
      try {
        handler(message.data)
      } catch (error) {
        this.logger.error("Error in Godot message handler", error)
      }
    }
  }

  /**
   * Receive message from Godot
   * This method is called directly by Godot
   */
  private receiveMessageFromGodot(messageType: string, data: string): void {
    try {
      this.logger.debug("Received message from Godot", { messageType, data })

      // Parse data if it's a JSON string
      let parsedData
      try {
        parsedData = JSON.parse(data)
      } catch (e) {
        parsedData = data
      }

      // Call the appropriate handler
      const handler = this.messageHandlers.get(messageType)
      if (handler) {
        handler(parsedData)
      } else {
        // Check if there's a registered callback
        const callback = this.godotCallbacks.get(messageType)
        if (callback) {
          callback(parsedData)
        }
      }
    } catch (error) {
      this.logger.error("Error processing message from Godot", error)
    }
  }

  /**
   * Send player information to Godot
   */
  private sendPlayerInfo(): void {
    if (!this.player || !this.godotInstance) {
      return
    }

    this.sendMessage("SetPlayerInfo", {
      id: this.player.id,
      name: this.player.name,
      walletAddress: this.player.walletAddress,
    })
  }

  /**
   * Set up communication with Godot
   */
  private setupGodotCommunication(): void {
    // Register methods that Godot can call
    if (this.godotInstance) {
      // These methods will be exposed to Godot
      this.registerCallback("getPlayerInfo", () => {
        return this.player ? JSON.stringify(this.player) : null
      })

      this.registerCallback("getConfig", () => {
        return JSON.stringify(this.config)
      })
    }
  }

  /**
   * Load Godot engine script
   * @param engineUrl URL of the Godot engine script
   */
  private loadGodotScript(engineUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (typeof window.Engine !== "undefined") {
        resolve()
        return
      }

      const script = document.createElement("script")
      script.src = engineUrl
      script.async = true

      script.onload = () => {
        this.logger.debug("Godot engine script loaded")
        resolve()
      }

      script.onerror = (error) => {
        this.logger.error("Failed to load Godot engine script", error)
        reject(new Error("Failed to load Godot engine script"))
      }

      document.body.appendChild(script)

      // Set a timeout to prevent hanging
      const timeout = setTimeout(() => {
        if (typeof window.Engine === "undefined") {
          this.logger.error("Timeout loading Godot engine script")
          reject(new Error("Timeout loading Godot engine script"))
        }
      }, 10000)

      // Clear timeout when script loads
      script.onload = () => {
        clearTimeout(timeout)
        this.logger.debug("Godot engine script loaded")
        resolve()
      }
    })
  }
}

// Add Engine to the Window interface
declare global {
  interface Window {
    Engine: any
    godotInstance: any
    mutableReceiveMessage: (messageType: string, data: string) => void
  }
}
