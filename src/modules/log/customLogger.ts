import { Injectable, ConsoleLogger, Inject } from '@nestjs/common';
import { ConsoleLoggerOptions } from '@nestjs/common/services/console-logger.service';
import { IConfig } from 'config';

import getLogLevels from '@microservice-user/utils/getLogLevels';
import { CONFIG } from '@microservice-user/module-config/config.provider';

import LogsService from './logs.service';

@Injectable()
class CustomLogger extends ConsoleLogger {
  private readonly logsService: LogsService;

  constructor(
    context: string,
    options: ConsoleLoggerOptions,
    @Inject(CONFIG) private readonly configService: IConfig,
    logsService: LogsService,
  ) {
    const environment = configService.get('env');

    super(context, {
      ...options,
      logLevels: getLogLevels(environment === 'production'),
    });

    this.logsService = logsService;
  }

  log(message: string, context?: string) {
    super.log.apply(this, [message, `${this.context}.${context}`]);

    this.logsService.createLog({
      message,
      context,
      level: 'log',
    });
  }
  error(message: string, stack?: string, context?: string) {
    super.error.apply(this, [message, stack, `${this.context}.${context}`]);
    this.logsService.createLog({
      message,
      context,
      level: 'error',
    });
  }
  warn(message: string, context?: string) {
    super.warn.apply(this, [message, `${this.context}.${context}`]);

    this.logsService.createLog({
      message,
      context,
      level: 'error',
    });
  }
  debug(message: string, context?: string) {
    super.debug.apply(this, [message, `${this.context}.${context}`]);

    this.logsService.createLog({
      message,
      context,
      level: 'error',
    });
  }
  verbose(message: string, context?: string) {
    super.debug.apply(this, [message, `${this.context}.${context}`]);

    this.logsService.createLog({
      message,
      context,
      level: 'error',
    });
  }
}

export default CustomLogger;
