/**
 * Transactions Module
 *
 * Handles token transactions, wagers, and rewards.
 */
import { MutableSDKConfig, PlayerInfo } from "../types";
import { Logger } from "../utils/logger";
export declare class TransactionsModule {
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
