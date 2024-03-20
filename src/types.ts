export interface ICorrelator {
  getId: () => string;
}

export interface IContext {
  get: () => any;
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
  silent?: boolean;
  /**
   * correlator instance
   */
  correlator: ICorrelator;
  /**
   * @guildxyz/context
   */
  context: IContext;
  /**
   * format log as json
   */
  json: boolean;
  /**
   * prettify json logs / colorize text logs
   */
  pretty?: boolean;
};

type AnyKey = {
  [key: string]: any | AnyKey;
};

type User = {
  id?: number;
  address?: string;
} & AnyKey;

type PlatformUser = {
  platformId?: number;
  platformUserId?: string;
} & AnyKey;

type JustId = {
  id?: number;
} & AnyKey;

export type Meta = {
  user?: User | User[];
  platformUser?: PlatformUser | PlatformUser[];
  guild?: JustId | JustId[];
  role?: JustId | JustId[];
  params?: AnyKey;
  error?: any;
} & AnyKey;
