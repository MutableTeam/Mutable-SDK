/**
 * Authentication Module
 *
 * Handles player authentication and session management.
 */
import { MutableSDKConfig, PlayerInfo } from "../types";
import { Logger } from "../utils/logger";
export declare class AuthModule {
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
