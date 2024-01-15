import { createLogger, format, Logger, transports } from "winston";
import { ICorrelator, GuildLoggerOptions, LogLevel, Meta } from "./types";
import {
  getCallerFunctionAndFileName,
  includeErrorPropertiesFormat,
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
        ? [colorize(), this.getPlainTextFormat()]
        : [this.getPlainTextFormat()];
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
   * Create a formatter for plain text logging
   * @returns
   */
  private getPlainTextFormat = () =>
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
