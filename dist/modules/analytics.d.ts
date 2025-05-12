/**
 * Analytics Module
 *
 * Tracks game events and player behavior for analytics.
 */
import type { MutableSDKConfig, GameInfo, PlayerInfo } from "../types";
import type { Logger } from "../utils/logger";
export declare class AnalyticsModule {
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
