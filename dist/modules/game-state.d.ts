/**
 * Game State Module
 *
 * Manages game state, sessions, and real-time updates.
 */
import { MutableSDKConfig, GameInfo, PlayerInfo } from "../types";
import { Logger } from "../utils/logger";
export declare class GameStateModule {
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
