/**
 * Godot Bridge Module
 *
 * Provides integration with Godot game engine.
 */
import type { MutableSDKConfig, PlayerInfo } from "../types";
import type { Logger } from "../utils/logger";
export declare class GodotBridgeModule {
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
