/**
 * Mutable SDK Core
 *
 * The main SDK class that provides access to all Mutable platform features.
 */
import { AuthModule } from "../modules/auth";
import { GameStateModule } from "../modules/game-state";
import { TransactionsModule } from "../modules/transactions";
import { MutableSDKConfig, GameInfo, PlayerInfo } from "../types";
/**
 * Main SDK class that provides access to all Mutable platform features
 */
export declare class MutableSDK {
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
