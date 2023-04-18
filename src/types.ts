export interface ICorrelator {
  getId: () => string;
}

export type LogLevel = "error" | "warn" | "info" | "verbose" | "debug";

export type GuildLoggerOptions = {
  /**
   * log level
   */
  level: LogLevel;
  /**
   * suppress all logs
   */
  silent: boolean;
  /**
   * correlator instance
   */
  correlator: ICorrelator;
  /**
   * format log as json
   */
  json: boolean;
};
