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
interface TransactionInfo {
    id: string;
    type: "deposit" | "withdrawal" | "wager" | "reward" | "purchase";
    amount: number;
    currency: string;
    timestamp: number;
    status: "pending" | "completed" | "failed";
    playerId: string;
    gameId?: string;
    sessionId?: string;
    txHash?: string;
}

/**
 * Logger
 *
 * Provides logging functionality for the SDK.
 */
declare class Logger {
    private debug;
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
}

/**
 * Mutable SDK
 *
 * Main entry point for the SDK
 */

declare const VERSION = "1.0.0";

export { AuthModule, GameInfo, GameStateModule, MutableSDK, MutableSDKConfig, PlayerInfo, TransactionInfo, TransactionsModule, VERSION };
