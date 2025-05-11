/**
 * Logger
 *
 * Provides logging functionality for the SDK.
 */

export class Logger {
  private isDebugEnabled: boolean  // Renamed from 'debug' to avoid conflict
  private prefix = "[MutableSDK]"

  constructor(debug = false) {
    this.isDebugEnabled = debug
  }

  /**
   * Set debug mode
   * @param debug Whether to enable debug logging
   */
  public setDebug(debug: boolean): void {
    this.isDebugEnabled = debug
  }

  /**
   * Log a debug message
   * @param message Message to log
   * @param data Additional data to log
   */
  public debug(message: string, data?: any): void {
    if (!this.isDebugEnabled) return

    if (data) {
      console.debug(`${this.prefix} ${message}`, data)
    } else {
      console.debug(`${this.prefix} ${message}`)
    }
  }

  /**
   * Log an info message
   * @param message Message to log
   * @param data Additional data to log
   */
  public info(message: string, data?: any): void {
    if (data) {
      console.info(`${this.prefix} ${message}`, data)
    } else {
      console.info(`${this.prefix} ${message}`)
    }
  }

  /**
   * Log a warning message
   * @param message Message to log
   * @param data Additional data to log
   */
  public warn(message: string, data?: any): void {
    if (data) {
      console.warn(`${this.prefix} ${message}`, data)
    } else {
      console.warn(`${this.prefix} ${message}`)
    }
  }

  /**
   * Log an error message
   * @param message Message to log
   * @param error Error to log
   */
  public error(message: string, error?: any): void {
    if (error) {
      console.error(`${this.prefix} ${message}`, error)
    } else {
      console.error(`${this.prefix} ${message}`)
    }
  }
}
