const redis = require('redis');

let redisClient;
let isRedisConnected = false;

// Fast In-Memory Cache (Multi-Tier fallback with TTL)
const memoryCache = new Map();
const DEFAULT_TTL_MS = 60 * 1000; // 60 seconds

const getMemoryCache = (key) => {
  const item = memoryCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return item.data;
};

const setMemoryCache = (key, data, ttlMs = DEFAULT_TTL_MS) => {
  if (memoryCache.size > 500) {
    // Evict oldest keys if cache grows large
    const firstKey = memoryCache.keys().next().value;
    memoryCache.delete(firstKey);
  }
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
};

const clearMemoryCache = (keyPrefix) => {
  for (const key of memoryCache.keys()) {
    if (key.startsWith(keyPrefix)) {
      memoryCache.delete(key);
    }
  }
};

// Initialize Redis client gracefully
const initRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URI;
    if (!redisUrl) {
      console.log('No REDIS_URI found. Utilizing high-speed in-memory multi-tier cache.');
      return;
    }

    redisClient = redis.createClient({
      url: redisUrl
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
    console.warn('Failed to initialize Redis. Utilizing high-speed in-memory multi-tier cache.', err.message);
  }
};

initRedis();

const cacheMiddleware = (keyPrefix, ttlSeconds = 60) => {
  return async (req, res, next) => {
    const key = `${keyPrefix}_${JSON.stringify(req.query)}`;

    // 1. Check ultra-fast in-memory cache (< 1ms)
    const memData = getMemoryCache(key);
    if (memData) {
      res.setHeader('X-Cache', 'HIT-MEMORY');
      return res.json(memData);
    }

    // 2. Check Redis if available
    if (isRedisConnected && redisClient) {
      try {
        const cachedData = await redisClient.get(key);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          setMemoryCache(key, parsed, ttlSeconds * 1000);
          res.setHeader('X-Cache', 'HIT-REDIS');
          return res.json(parsed);
        }
      } catch (err) {
        console.warn('Redis GET error:', err.message);
      }
    }

    // 3. Cache Miss - Intercept response
    res.setHeader('X-Cache', 'MISS');
    const sendResponse = res.json.bind(res);
    res.json = (body) => {
      // Store in memory
      setMemoryCache(key, body, ttlSeconds * 1000);

      // Store in Redis if connected
      if (isRedisConnected && redisClient) {
        redisClient.setEx(key, ttlSeconds, JSON.stringify(body)).catch((err) =>
          console.warn('Redis set error:', err.message)
        );
      }
      return sendResponse(body);
    };

    next();
  };
};

const clearCache = async (keyPrefix) => {
  // Clear memory cache immediately
  clearMemoryCache(keyPrefix);

  // Clear Redis if connected
  if (isRedisConnected && redisClient) {
    try {
      const keys = await redisClient.keys(`${keyPrefix}_*`);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (err) {
      console.warn('Redis clear cache error:', err.message);
    }
  }
};

module.exports = {
  cacheMiddleware,
  clearCache
};
