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
