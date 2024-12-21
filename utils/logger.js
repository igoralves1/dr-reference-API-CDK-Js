const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, colorize } = format;

// Custom format for log messages
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Format to handle error stack trace
const errorStackTracerFormat = format((info) => {
  if (info.meta && info.meta instanceof Error) {
    info.message = `${info.meta.message} \n${info.meta.stack}`;
  } else if (info.stack) {
    info.message = `${info.message} \n${info.stack}`;
  }
  return info;
});

// Logger instance
const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat,
    errorStackTracerFormat()
  ),
  transports: [
    new transports.Console({
      format: combine(colorize(), logFormat),
    }),
  ],
  exitOnError: false,
});

module.exports = logger;
