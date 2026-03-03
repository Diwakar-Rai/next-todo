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
