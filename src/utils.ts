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
