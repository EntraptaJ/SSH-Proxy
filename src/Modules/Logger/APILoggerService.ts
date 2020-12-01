// src/Modules/Logger/LoggerService.ts
import { Inject, Service } from 'typedi';
import type { Context } from '../../Library/Context';
import { logger, LogMode } from '../../Library/Logger';

/**
 * API Logger service with the request ID and other user context
 */
@Service()
export class APILogger {
  public constructor(@Inject('context') private readonly context: Context) {
    console.log('Logger created!');
  }

  /**
   * Log provided variables to console along with the Request ID
   * @param messages Objects and variables to log to console
   */
  public log(mode: LogMode, ...messages: unknown[]): void {
    logger.log(mode, `(ID ${this.context.requestId}):`, ...messages);
  }
}
