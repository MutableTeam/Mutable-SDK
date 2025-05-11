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
export interface TransactionInfo {
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
