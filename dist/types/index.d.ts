/**
 * Mutable SDK Types
 *
 * Type definitions for the Mutable SDK.
 */
export interface MutableSDKConfig {
    apiKey: string;
    environment?: "development" | "staging" | "production";
    debug?: boolean;
    apiUrl?: string;
    websocketUrl?: string;
}
export interface PlayerInfo {
    id: string;
    name: string;
    walletAddress?: string;
    avatarUrl?: string;
}
export interface GameInfo {
    id: string;
    name: string;
    version: string;
    buildId?: string;
}
