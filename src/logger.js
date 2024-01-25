const pino = require('pino');
const expressPino = require('express-pino-logger');

const logger = pino({
    name: "WhatsApp",
    level: process.env.LOG_LEVEL || "info",
    customLevels: {fatal:60, error:50, warn:40, info:30, debug:20, trace:10},
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'yyyy-dd-mm, h:MM:ss TT'
        }
    }
 });
const expressLogger = expressPino({ logger });

module.exports = { expressLogger, logger }