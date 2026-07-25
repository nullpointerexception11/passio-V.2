/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class LoggerService {
  private isDev = process.env.NODE_ENV !== 'production';
  private logs: string[] = [];

  private formatMessage(level: LogLevel, context: string, message: string): string {
    const timestamp = new Date().toISOString().substring(11, 19);
    const line = `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}`;
    this.logs.push(line);
    if (this.logs.length > 200) {
      this.logs.shift();
    }
    return line;
  }

  debug(context: string, message: string, ...args: unknown[]): void {
    if (this.isDev) {
      console.debug(this.formatMessage('debug', context, message), ...args);
    }
  }

  info(context: string, message: string, ...args: unknown[]): void {
    console.info(this.formatMessage('info', context, message), ...args);
  }

  warn(context: string, message: string, ...args: unknown[]): void {
    console.warn(this.formatMessage('warn', context, message), ...args);
  }

  error(context: string, message: string, ...args: unknown[]): void {
    console.error(this.formatMessage('error', context, message), ...args);
  }

  exportLogs(): string {
    return this.logs.join('\n');
  }
}

export const Logger = new LoggerService();
export default Logger;
