/**
 * Unity Bridge Module
 *
 * Provides integration with Unity game engine.
 */
import type { MutableSDKConfig, PlayerInfo } from "../types";
import type { Logger } from "../utils/logger";
export declare class UnityBridgeModule {
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
