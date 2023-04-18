import { ICorrelator } from "../src/types";

export const testCorrelationId = "4fb94571-7f97-4fe0-a1b8-eb82994fb754";
export const testLogMessage = "test log message";
export const testFunctionName = "testFunction";
export const testLevel = "info";
export const testMeta = {
  user: {
    id: 123,
  },
};

export const testCorrelator: ICorrelator = {
  getId() {
    return testCorrelationId;
  },
};
