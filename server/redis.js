// server/redis.js
// ✅ PRODUCTION-SAFE REDIS (NO STARTUP CRASH, NO STALE QUEUE)

const Redis = require("ioredis");

let isReady = false;

const redisConfig = {
  retryStrategy(times) {
    const delay = Math.min(times * 100, 2000);
    console.log(`🔄 Redis reconnecting... attempt ${times}`);
    return delay;
  },

  // ✅ Allow queue ONLY until ready
  enableOfflineQueue: true,

  // ✅ Required for long-running servers
  maxRetriesPerRequest: null,

  enableReadyCheck: true,
  lazyConnect: false,
  connectTimeout: 10000,
  keepAlive: 30000,

  showFriendlyErrorStack: process.env.NODE_ENV === "development",
};

// ========================================
// CREATE REDIS INSTANCE
// ========================================

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, redisConfig)
  : new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      ...redisConfig,
    });

// ========================================
// EVENTS
// ========================================

redis.on("connect", () => {
  console.log("🟢 Redis connected");
});

redis.on("ready", () => {
  console.log("✅ Redis ready");
  isReady = true;

  // 🚨 CRITICAL: disable offline queue AFTER ready
  redis.options.enableOfflineQueue = false;
});

redis.on("reconnecting", (delay) => {
  console.log(`🔄 Redis reconnecting in ${delay}ms`);
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err.message);
  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }
});

redis.on("end", () => {
  console.log("🛑 Redis connection closed");
});

// ========================================
// SAFE HELPERS
// ========================================

redis.waitUntilReady = () =>
  new Promise((resolve) => {
    if (isReady) return resolve();
    redis.once("ready", resolve);
  });

redis.isHealthy = async () => {
  if (!isReady) return false;
  try {
    await redis.ping();
    return true;
  } catch {
    return false;
  }
};

redis.getStats = async () => {
  try {
    const [dbSize, info] = await Promise.all([
      redis.dbsize(),
      redis.info("stats"),
    ]);

    return {
      dbSize,
      connected: redis.status === "ready",
      info,
    };
  } catch (err) {
    console.error("❌ Redis stats error:", err);
    return null;
  }
};

module.exports = redis;
