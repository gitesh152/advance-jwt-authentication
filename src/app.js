/**
 * Express boot strap:
 * - Security ->
 *                  Disable x-powered-by - to hide tech stack,
 *                  trust-proxy - when behind reverse proxy, trust proxy for correct IPs,
 *                  (Middlware for Request context for ID - Request ID),
 *                  helmet - setting security headers as express does not do it,
 *                  cors- tells browser which external origins are allowed to talk to yyour APIs,
 *                  hpp - Protection against HTML parameter polution (req query, body)
 *
 *  - Rate Limiting -> Without rate limiting attacker can span APIs,
 *
 *  - Body-Parsers -> express url encoded, express json, cookie-parser
 *
 *  - Request Logging -> Need to log every request
 *                      Morgan for request logging,
 *                      Morgan pipes to winston for structuring etc
 *
 *  - Compression -> Compress HTTP response before sending to client,
 *                   Reduce bandwidth, (Avoid compressing already compressed formats).
 *
 *  - Health Check with a specific API
 *
 *  - Mount APIs
 *
 *  - 404 Handler
 *
 *  - Central error handler
 */

import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';

import { isProd } from './config/env.config.js';
import errorHandlerMiddleware from './middlewares/error.handler.middleware.js';
import requestContextMiddleware from './middlewares/request.context.middleware.js';
import router from './routes/index.js';
import logger from './utils/logger.util.js';
const app = express();

/** Hide tech stack */
app.disabled('x-powered-by');

/** Trust proxy */
/** When behind reverse proxy, trust proxy for correct IPs */
app.set('trust proxy', 1);

// /** Middleware for request context ID */
app.use(requestContextMiddleware);

/** Helmet to set security headers, by default express does not set headers */
app.use(
  helmet({
    /** Allow authorization headers via cors, others kept default */
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  }),
);

/** Allow frontend origins */
/** Tells browser which exteral origin can talk to the APIs */
app.use(
  cors({
    allowedHeaders: ['Context-Type', 'Authorization'],
    credentials: true,
    maxAge: 600,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    origin: true,
  }),
);

/** Protection from HTTP Parameter Pollution attacks*/
/** Sanitize request query, body etc so each parameter has single value */
app.use(hpp());

/** Basic rate limiting per IP */
/** Without rate limiting hackers can span the APIs */
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    legacyHeaders: false,
    standardHeaders: true,
  }),
);

/** Parsers */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

/** Morgan for request logging, it can log methods, url, reponse time etc */
/** It pipe to winston for production level structured logging */
/** JSON in prod, colorful in development */
const morganFormat = isProd ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (msg) =>
        logger.http ? logger.http(msg.trim()) : logger.info(msg.trim()),
    },
  }),
);

/** Compress the responses before sending to the client */
/** Reduce bandwidth- saves server cost and speed up response time */
/** Note- Avoid compressing already compressed formats (image, videos, zip) */
app.use(compression());

/** Health check API - useful for uptime monitoring */
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

/** Mount APIs */
app.use('/', router);

/** 404 handler for unknown routes */
app.use((req, res) =>
  res.status(404).json({
    message: `Route not found ${req.method} ${req.originalUrl}`,
  }),
);

/** Centralized error handler */
app.use(errorHandlerMiddleware);

export default app;
