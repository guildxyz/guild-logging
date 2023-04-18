import { testCorrelator, testLevel, testLogMessage, testMeta } from "./common";
import GuildLogger from "../src/GuildLogger";

const isJson = process.argv[2] === "true";

const guildLogger = new GuildLogger({
  correlator: testCorrelator,
  json: isJson,
  level: testLevel,
  silent: false,
});

const testFunction = () => {
  guildLogger.info(testLogMessage, testMeta);
};

testFunction();
