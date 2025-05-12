/**
 * Mutable SDK Types
 *
 * Type definitions for the Mutable SDK.
 */
interface MutableSDKConfig {
    apiKey: string;
    environment?: "development" | "staging" | "production";
    debug?: boolean;
    apiUrl?: string;
    websocketUrl?: string;
}
interface PlayerInfo {
    id: string;
    name: string;
    walletAddress?: string;
    avatarUrl?: string;
}
interface GameInfo {
    id: string;
    name: string;
    version: string;
    buildId?: string;
}

/**
 * Logger
 *
 * Provides logging functionality for the SDK.
 */
declare class Logger {
    private isDebugEnabled;
    private prefix;
    constructor(debug?: boolean);
    /**
     * Set debug mode
     * @param debug Whether to enable debug logging
     */
    setDebug(debug: boolean): void;
    /**
     * Log a debug message
     * @param message Message to log
     * @param data Additional data to log
     */
    debug(message: string, data?: any): void;
    /**
     * Log an info message
     * @param message Message to log
     * @param data Additional data to log
     */
    info(message: string, data?: any): void;
    /**
     * Log a warning message
     * @param message Message to log
     * @param data Additional data to log
     */
    warn(message: string, data?: any): void;
    /**
     * Log an error message
     * @param message Message to log
     * @param error Error to log
     */
    error(message: string, error?: any): void;
}

/**
 * Authentication Module
 *
 * Handles player authentication and session management.
 */

declare class AuthModule {
    private config;
    private logger;
    private player?;
    constructor(config: MutableSDKConfig, logger: Logger);
    /**
     * Initialize the authentication module
     */
    initialize(): Promise<void>;
    /**
     * Set the current player
     * @param player Player information
     */
    setPlayer(player: PlayerInfo): void;
    /**
     * Get the current player
     */
    getPlayer(): PlayerInfo | undefined;
    /**
     * Authenticate a player as a guest
     * @param name Optional display name for the guest
     */
    authenticateAsGuest(name?: string): Promise<PlayerInfo>;
}

/**
 * Game State Module
 *
 * Manages game state, sessions, and real-time updates.
 */

declare class GameStateModule {
    private config;
    private logger;
    private gameInfo?;
    private player?;
    constructor(config: MutableSDKConfig, logger: Logger);
    /**
     * Initialize the game state module
     * @param gameInfo Game information
     */
    initialize(gameInfo: GameInfo): Promise<void>;
    /**
     * Set the current player
     * @param player Player information
     */
    setPlayer(player: PlayerInfo): void;
}

/**
 * Transactions Module
 *
 * Handles token transactions, wagers, and rewards.
 */

declare class TransactionsModule {
    private config;
    private logger;
    private player?;
    constructor(config: MutableSDKConfig, logger: Logger);
    /**
     * Initialize the transactions module
     */
    initialize(): Promise<void>;
    /**
     * Set the current player
     * @param player Player information
     */
    setPlayer(player: PlayerInfo): void;
    /**
     * Get player balance
     * @param currency Currency code (e.g., 'MUTB', 'SOL')
     */
    getBalance(currency?: string): Promise<number>;
}

/**
 * Analytics Module
 *
 * Tracks game events and player behavior for analytics.
 */

declare class AnalyticsModule {
    private config;
    private logger;
    private gameInfo?;
    private player?;
    private sessionId?;
    constructor(config: MutableSDKConfig, logger: Logger);
    /**
     * Initialize the analytics module
     * @param gameInfo Game information
     */
    initialize(gameInfo: GameInfo): Promise<void>;
    /**
     * Set the current player
     * @param player Player information
     */
    setPlayer(player: PlayerInfo): void;
    /**
     * Set the current session ID
     * @param sessionId Session ID
     */
    setSessionId(sessionId: string): void;
    /**
     * Track a game event
     * @param eventType Type of event
     * @param data Additional event data
     */
    trackEvent(eventType: string, data?: Record<string, any>): void;
    /**
     * Track game start event
     * @param data Additional event data
     */
    trackGameStart(data?: Record<string, any>): void;
    /**
     * Track game end event
     * @param data Additional event data
     */
    trackGameEnd(data?: Record<string, any>): void;
    /**
     * Clean up resources
     */
    cleanup(): void;
}

/**
 * Unity Bridge Module
 *
 * Provides integration with Unity game engine.
 */

declare class UnityBridgeModule {
    private config;
    private logger;
    private player?;
    private unityInstance?;
    constructor(config: MutableSDKConfig, logger: Logger);
    /**
     * Initialize the Unity bridge module
     */
    initialize(): Promise<void>;
    /**
     * Set the current player
     * @param player Player information
     */
    setPlayer(player: PlayerInfo): void;
    /**
     * Load Unity WebGL build
     * @param containerId ID of the container element
     * @param unityConfig Unity configuration
     */
    loadUnity(containerId: string, unityConfig: any): Promise<any>;
    /**
     * Send a message to Unity
     * @param methodName Method name to call in Unity
     * @param value Value to pass to the method
     * @param objectName GameObject name (default: "MutableSDKBridge")
     */
    sendToUnity(methodName: string, value: any, objectName?: string): void;
    /**
     * Handle a message from Unity
     * @param message Message from Unity
     */
    handleUnityMessage(message: string): void;
}

/**
 * Godot Bridge Module
 *
 * Provides integration with Godot game engine.
 */

declare class GodotBridgeModule {
    private config;
    private logger;
    private player?;
    private godotInstance?;
    constructor(config: MutableSDKConfig, logger: Logger);
    /**
     * Initialize the Godot bridge module
     */
    initialize(): Promise<void>;
    /**
     * Set the current player
     * @param player Player information
     */
    setPlayer(player: PlayerInfo): void;
    /**
     * Load Godot WebGL build
     * @param containerId ID of the container element
     * @param godotConfig Godot configuration
     */
    loadGodot(containerId: string, godotConfig: any): Promise<any>;
    /**
     * Send a message to Godot
     * @param methodName Method name to call in Godot
     * @param value Value to pass to the method
     */
    sendToGodot(methodName: string, value: string): void;
    /**
     * Handle a message from Godot
     * @param message Message from Godot
     */
    handleGodotMessage(message: string): void;
}

/**
 * Mutable SDK Core
 *
 * The main SDK class that provides access to all Mutable platform features.
 */

/**
 * Main SDK class that provides access to all Mutable platform features
 */
declare class MutableSDK {
    private config;
    private logger;
    private initialized;
    auth: AuthModule;
    gameState: GameStateModule;
    transactions: TransactionsModule;
    analytics: AnalyticsModule;
    unityBridge: UnityBridgeModule;
    godotBridge: GodotBridgeModule;
    private gameInfo?;
    private playerInfo?;
    /**
     * Create a new instance of the MutableSDK
     * @param config SDK configuration
     */
    constructor(config: MutableSDKConfig);
    /**
     * Initialize the SDK with game information
     * @param gameInfo Information about the game
     */
    initialize(gameInfo: GameInfo): Promise<void>;
    /**
     * Set the current player information
     * @param playerInfo Player information
     */
    setPlayer(playerInfo: PlayerInfo): void;
    /**
     * Get the current player information
     */
    getPlayer(): PlayerInfo | undefined;
    /**
     * Get the current game information
     */
    getGameInfo(): GameInfo | undefined;
    /**
     * Check if the SDK is initialized
     */
    isInitialized(): boolean;
    /**
     * Get the SDK configuration
     */
    getConfig(): MutableSDKConfig;
    /**
     * Get the default API URL based on environment
     */
    private getDefaultApiUrl;
    /**
     * Get the default WebSocket URL based on environment
     */
    private getDefaultWebsocketUrl;
}

/**
 * Mutable SDK
 *
 * Main entry point for the SDK
 */

declare const VERSION = "1.0.0";

export { AnalyticsModule, AuthModule, GameInfo, GameStateModule, GodotBridgeModule, MutableSDK, MutableSDKConfig, PlayerInfo, TransactionsModule, UnityBridgeModule, VERSION };
