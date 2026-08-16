const redis = require('redis');

let redisClient;
let isRedisConnected = false;

// Initialize Redis client gracefully
const initRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URI || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => {
      console.warn('Redis connection error:', err.message);
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('Connected to Redis');
      isRedisConnected = true;
    });

    await redisClient.connect();
  } catch (err) {
    console.warn('Failed to initialize Redis. Caching will be disabled.', err.message);
  }
};

initRedis();

const cacheMiddleware = (keyPrefix) => {
  return async (req, res, next) => {
    if (!isRedisConnected) {
      return next(); // Skip cache if Redis is down
    }

    try {
      const key = `${keyPrefix}_${JSON.stringify(req.query)}`;
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }
      // If not cached, attach a method to res to let controllers cache it
      res.sendResponse = res.json;
      res.json = (body) => {
        redisClient.setEx(key, 3600, JSON.stringify(body)).catch(err => console.warn('Redis set error:', err.message));
        res.sendResponse(body);
      };
      
      next();
    } catch (err) {
      console.warn('Redis GET error:', err.message);
      next();
    }
  };
};

const clearCache = async (keyPrefix) => {
  if (!isRedisConnected) return;

  try {
    // Note: To delete all keys matching a pattern, we need to scan or use a set.
    // For simplicity, if we just want to invalidate all 'products_all_*' keys,
    // we can find keys and delete them.
    const keys = await redisClient.keys(`${keyPrefix}_*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (err) {
    console.warn('Redis clear cache error:', err.message);
  }
};

module.exports = {
  cacheMiddleware,
  clearCache
};
