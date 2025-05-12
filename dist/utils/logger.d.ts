/**
 * Logger
 *
 * Provides logging functionality for the SDK.
 */
export declare class Logger {
    private isDebugEnabled;
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
