import { format } from "winston";

// eslint-disable-next-line import/prefer-default-export
export const getCallerFunctionAndFileName = () => {
  const stackTraceLine = new Error().stack.split("at ")?.[4]?.split(" ");
  const callerFunctionName = stackTraceLine?.[0];
  const fileNameWithParenthesis = stackTraceLine?.[1];
  const fileName = fileNameWithParenthesis?.substring(
    1,
    fileNameWithParenthesis.length - 2
  );

  return { callerFunctionName, fileName };
};

/**
 * A formatter that adds error properties to the metadata
 * @returns formatter
 */
export const includeErrorPropertiesFormat = format((info) => {
  let error: any;
  if (info.error) {
    error = {
      name: info.error.name,
      message: info.error.message,
      stack: info.error.stack,
    };
  }

  return {
    ...info,
    error,
  };
});

/**
 * A formatter for plain text logging
 * @returns
 */
export const plainTextFormat = format.printf((log) => {
  const correlationIdText = log.correlationId ? ` ${log.correlationId}` : "";

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
