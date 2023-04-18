import { createLogger, format, Logger, transports } from "winston";
import { ICorrelator, GuildLoggerOptions, LogLevel } from "./types";
import { getCallerFunctionAndFileName } from "./utils";

const { printf, combine, colorize, timestamp, errors, prettyPrint } = format;

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

    const logFormat = options.json
      ? [this.getIncludeCorrelationIdFormat()(), format.json(), prettyPrint()]
      : [this.getPlainTextFormat(), colorize()];

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
   * Create a formatter that adds the correlation id to the metadata
   * @returns formatter
   */
  getIncludeCorrelationIdFormat = () =>
    format((info) => {
      const correlationId = this.correlator.getId();
      return {
        ...info,
        correlationId,
      };
    });

  /**
   * Create a formatter for plain text logging
   * @returns
   */
  getPlainTextFormat = () =>
    printf((log) => {
      const correlationId = this.correlator.getId();
      const correlationIdText = correlationId ? ` ${correlationId}` : "";

      let msg = `${log.timestamp} ${log.level}${correlationIdText}: ${log.message}`;
      let metaString = "";
      Object.entries(log).forEach(([k, v]) => {
        if (k === "timestamp" || k === "level" || k === "message") {
          return;
        }

        let value: any;
        if (v instanceof Error) {
          value = `\n${v.stack}\n`;
        } else if (typeof v === "object") {
          value = JSON.stringify(v);
        } else {
          value = v;
        }

        metaString += `, ${k}=${value}`;
      });
      msg += metaString;
      return msg;
    });

  /**
   * Log a message at a given level with metadata
   * @param level log level
   * @param message log message
   * @param meta metadata
   */
  log = (level: LogLevel, message: string, meta?: any) => {
    const { callerFunctionName, fileName } = getCallerFunctionAndFileName();
    const extendedMeta = {
      ...meta,
      correlationId: this.correlator.getId(),
      function: callerFunctionName,
      file: fileName,
    };
    this.logger[level](message, extendedMeta);
  };

  error = (message: string, meta?: any) => this.log("error", message, meta);

  warn = (message: string, meta?: any) => this.log("warn", message, meta);

  info = (message: string, meta?: any) => this.log("info", message, meta);

  verbose = (message: string, meta?: any) => this.log("verbose", message, meta);

  debug = (message: string, meta?: any) => this.log("debug", message, meta);
}