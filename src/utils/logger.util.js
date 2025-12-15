import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { v4 as uuidv4 } from 'uuid';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import requestContextUtil from './request.context.util.js';
import { isProd } from '../config/env.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Ensure logs directory exists */
const logDir = path.join(__dirname, '../../logs');
if (isProd && !fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

/** Global startupId to log outside requests */
const startupId = uuidv4();

/** Add request ID If available */
const addRequestId = format((info) => {
  const ctx = requestContextUtil.getContext();
  info.requestId = ctx?.requestId || info.requestId || startupId;
  return info;
});

/** Custon JSON format for production logs */
const customJsonFormatter = format.printf((info) => {
  const ordered = {
    timestamp: info.timestamp,
    level: info.level,
    message: info.message,
    requestId: info.requestId,
  };

  info.status !== undefined && (ordered.status = info.status);
  info.details !== undefined && (ordered.details = info.details);
  info.stack !== undefined && (ordered.stack = info.stack);

  Object.keys(info).forEach((key) => {
    if (!ordered.hasOwnProperty(key)) {
      ordered[key] = info[key];
    }
  });

  return JSON.stringify(ordered);
});

const logger = createLogger({
  level: isProd ? 'http' : 'debug',
  transports: isProd
    ? [
        new transports.Console(),
        new DailyRotateFile({
          datePattern: 'YYYY-MM-DD',
          dirname: logDir,
          filename: 'error-%DATE%.log',
          level: 'error',
          maxFiles: '14d',
          zippedArchive: true,
        }),
        new DailyRotateFile({
          datePattern: 'YYYY-MM-DD',
          dirname: logDir,
          filename: 'combined-%DATE%.log',
          maxFiles: '14d',
          zippedArchive: true,
        }),
      ]
    : [new transports.Console()],
  format: isProd
    ? format.combine(
        addRequestId(),
        format.timestamp(),
        format.errors({ stack: true }),
        customJsonFormatter,
      )
    : format.combine(
        addRequestId(),
        format.colorize(),
        format.timestamp(),
        format.printf(({ timestamp, level, message, requestId, ...rest }) => {
          const { status, details, stack, ...otherProps } = rest;

          let output = `[${timestamp}] ${level}: ${message}`;

          if (requestId) {
            output += ` (requestId = ${requestId})`;
          }

          const extras = [];

          if (status) {
            extras.push(`status=${status}`);
          }

          if (details && Array.isArray(details)) {
            const quoted = details.map((d) => `"${d}"`).join(', ');
            extras.push(`details=[${quoted}]`);
          }

          if (Object.keys(otherProps).length) {
            extras.push(JSON.stringify(otherProps));
          }

          if (stack && level.includes('error')) {
            extras.push(`Stack: ${stack}`);
          }

          if (extras.length) {
            output += ` | ${extras.join(' | ')}`;
          }

          return output;
        }),
      ),
});

logger.http = (msg) => logger.log({ level: 'http', message: msg });

export default logger;
