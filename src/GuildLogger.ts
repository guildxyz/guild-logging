import { createLogger, format, Logger, transports } from "winston";
import { ICorrelator, GuildLoggerOptions, LogLevel, Meta } from "./types";
import {
  getCallerFunctionAndFileName,
  includeErrorPropertiesFormat,
  plainTextFormat,
} from "./utils";

const { printf, combine, colorize, timestamp, errors, prettyPrint } = format;
type Format = ReturnType<typeof printf>;

/**
 * Util for logging with metadata
 */
export default class GuildLogger {
  /**
   * Instance of winston logger
   */
  private logger: Logger;

  /**
   * Correlation id provider instance
   */
  private correlator: ICorrelator;

  /**
   * Set the logging options
   * @param options options for logging
   */
  constructor(options: GuildLoggerOptions) {
    this.correlator = options.correlator;

    let logFormat: Format[];
    if (options.json) {
      logFormat = options.pretty
        ? [includeErrorPropertiesFormat(), format.json(), prettyPrint()]
        : [includeErrorPropertiesFormat(), format.json()];
    } else {
      logFormat = options.pretty
        ? [colorize(), plainTextFormat]
        : [plainTextFormat];
    }

    this.logger = createLogger({
      level: options.level,
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        ...logFormat
      ),
      transports: [new transports.Console()],
      silent: options.silent,
    });
  }

  /**
   * Log a message at a given level with metadata
   * @param level log level
   * @param message log message
   * @param meta metadata
   */
  private log = (level: LogLevel, message: string, meta?: Meta) => {
    try {
      const { callerFunctionName, fileName } = getCallerFunctionAndFileName();
      const extendedMeta = {
        correlationId: this.correlator?.getId(),
        ...meta,
        function: callerFunctionName,
        file: fileName,
        pid: process.pid,
      };

      this.logger?.[level]?.(message, extendedMeta);
    } catch (error) {
      let metaString: string;
      try {
        metaString = JSON.stringify(meta);
      } catch (metaStringifyError: any) {
        metaString = `(Cannot stringify meta: ${metaStringifyError.message})`;
      }

      // eslint-disable-next-line no-console
      console.log(
        `GuildLogger.log failed with params (${level}, ${message}, ${metaString}})`
      );
    }
  };

  public error = (message: string, meta?: Meta) =>
    this.log("error", message, meta);

  public warn = (message: string, meta?: Meta) =>
    this.log("warn", message, meta);

  public info = (message: string, meta?: Meta) =>
    this.log("info", message, meta);

  public verbose = (message: string, meta?: Meta) =>
    this.log("verbose", message, meta);

  public debug = (message: string, meta?: Meta) =>
    this.log("debug", message, meta);
}
