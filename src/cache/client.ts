import Redis from 'ioredis';
import logger from '../logger.js';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = Number(process.env.REDIS_PORT) || 6379;

// Create a new Redis client instance
export const redisClient = new Redis({
  host: redisHost,
  port: redisPort,
  maxRetriesPerRequest: 3, // Optional: retry connection on failure
});

redisClient.on('connect', () => {
  logger.info(`Connected to Redis at ${redisHost}:${redisPort}`);
});

redisClient.on('error', (err) => {
  logger.error({ err }, 'Redis connection error');
});
