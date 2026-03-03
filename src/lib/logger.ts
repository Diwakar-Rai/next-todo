//! Basic custom logging
/*
type LogLevel = "ERROR" | "INFO";
export function log(
  level: LogLevel,
  message: string,
  meta?: Record<string, any>,
) {
  const timeStamp = new Date().toISOString();

  const logEntry = {
    timeStamp,
    message,
    level,
    ...(meta && { meta }),
  };

  const serialized = JSON.stringify(logEntry);

  switch (level) {
    case "ERROR":
      console.error(serialized);
      break;
    case "INFO":
      console.log(serialized);
      break;
    default:
      console.log(serialized);
  }
}
*/

// ! Pino Logging

import pino from "pino";
const isDev = process.env.NODE_ENV !== "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: isDev
    ? { target: "pino-pretty", options: { colorize: true } }
    : undefined,
  base: { service: "todo-api" },
  timestamp: pino.stdTimeFunctions.isoTime,
});
