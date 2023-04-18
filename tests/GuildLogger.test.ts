import { spawn } from "child_process";
import path from "path";
import {
  testMeta,
  testCorrelationId,
  testLevel,
  testLogMessage,
  testFunctionName,
} from "./common";

const filePropertyRegex = /^\s*file: '.*\/tests\/fileToRun.ts:\d{2}:\d{2}',$/;
const timestampPropertyRegex = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/;

describe("Check GuildLogger", () => {
  test("Check json logging", async () => {
    const testAppFilePath = path.join(__dirname, "./fileToRun.ts");
    const testApp = spawn("npx", ["ts-node", testAppFilePath, "true"]);

    await new Promise((resolve, reject) => {
      testApp.stdout.on("data", (data) => {
        try {
          const stringData: string = data.toString();
          const lines = stringData.split("\n");

          // test file property
          expect(lines.find((l) => l.includes("file"))).toMatch(
            filePropertyRegex
          );

          // test timestamp property
          expect(lines.find((l) => l.includes("timestamp"))).toMatch(
            timestampPropertyRegex
          );

          // remove file entry's line because it contains extra colons
          const filteredLines = lines.filter(
            (l) => !l.includes("file") && !l.includes("timestamp")
          );

          // remove last comma
          filteredLines[filteredLines.length - 3] = filteredLines[
            filteredLines.length - 3
          ].replace(",", "");

          // rejoin string
          const filteredStringData = filteredLines.join("\n");

          // add double quotes to keys and values to form a correct json
          const correctJsonString = filteredStringData
            .replace(/(['"])?(\w+)(['"])?:/g, '"$2": ')
            .replaceAll(/'/g, '"');

          const json = JSON.parse(correctJsonString);

          expect(json?.user).toStrictEqual(testMeta.user);
          expect(json?.correlationId).toBe(testCorrelationId);
          expect(json?.function).toBe(testFunctionName);
          expect(json?.level).toBe(testLevel);
          expect(json?.message).toBe(testLogMessage);

          resolve("ok");
        } catch (error) {
          reject(error);
        }
      });
    });

    await new Promise((resolve, reject) => {
      testApp.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`Process returned with error code ${code}`));
        }
        resolve("ok");
      });
    });
  });

  test("Check text logging", async () => {
    const testAppFilePath = path.join(__dirname, "./fileToRun.ts");
    const testApp = spawn("npx", ["ts-node", testAppFilePath, "false"]);

    await new Promise((resolve, reject) => {
      testApp.stdout.on("data", (data) => {
        try {
          const stringData: string = data.toString();
          console.log(stringData);

          expect(stringData).toMatch(
            new RegExp(
              `\\s*\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2} ${testLevel} ${testCorrelationId}: ${testLogMessage}, user={\\"id\\":123}, correlationId=${testCorrelationId}, function=${testFunctionName}, file=.*fileToRun.ts:\\d{2}:\\d{2}\\n`
            )
          );

          resolve("ok");
        } catch (error) {
          reject(error);
        }
      });
    });

    await new Promise((resolve, reject) => {
      testApp.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`Process returned with error code ${code}`));
        }
        resolve("ok");
      });
    });
  });
});
