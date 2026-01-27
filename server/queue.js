const redis = require("./redis");

// ================= CONSTANTS =================
const QUEUE_LIST = "zivro:queue:list";
const QUEUE_SET = "zivro:queue:set";
const ROOMS_KEY = "zivro:rooms";
const ROOM_DETAILS_KEY = "zivro:room_details";

const USER_TTL = 600; // 10 minutes

// ===================================================
// ADD USER TO QUEUE (JOIN)
// ===================================================
async function addToQueue(socketId, userData) {
  const inQueue = await redis.sismember(QUEUE_SET, socketId);
  if (inQueue) return false;

  const inRoom = await redis.hget(ROOMS_KEY, socketId);
  if (inRoom) return false;

  await redis
    .multi()
    .set(`zivro:user:${socketId}`, JSON.stringify(userData), "EX", USER_TTL)
    .rpush(QUEUE_LIST, socketId)
    .sadd(QUEUE_SET, socketId)
    .exec();

  return true;
}

// ===================================================
// MATCH USERS (ATOMIC)
// ===================================================
async function tryMatch() {
  const lua = `
    local queue = KEYS[1]
    local set = KEYS[2]
    local rooms = KEYS[3]
    local details = KEYS[4]

    local a = redis.call('LPOP', queue)
    local b = redis.call('LPOP', queue)

    if not a or not b then
      if a then redis.call('LPUSH', queue, a) end
      return nil
    end

    redis.call('SREM', set, a)
    redis.call('SREM', set, b)

    local room = 'room_' .. a .. '_' .. b

    redis.call('HSET', rooms, a, b)
    redis.call('HSET', rooms, b, a)
    redis.call('HSET', details, a, room)
    redis.call('HSET', details, b, room)

    return { a, b, room }
  `;

  const res = await redis.eval(
    lua,
    4,
    QUEUE_LIST,
    QUEUE_SET,
    ROOMS_KEY,
    ROOM_DETAILS_KEY
  );

  if (!res) return null;

  return {
    userA: res[0],
    userB: res[1],
    roomId: res[2]
  };
}

// ===================================================
// NEXT (ANYONE CLICKS → BOTH REQUEUE)
// ===================================================
async function nextPairAtomic(socketId) {
  const lua = `
    local user = ARGV[1]
    local partner = redis.call('HGET', KEYS[1], user)

    -- remove user
    redis.call('HDEL', KEYS[1], user)
    redis.call('HDEL', KEYS[2], user)
    redis.call('SREM', KEYS[4], user)
    redis.call('LREM', KEYS[3], 0, user)

    -- remove partner
    if partner then
      redis.call('HDEL', KEYS[1], partner)
      redis.call('HDEL', KEYS[2], partner)
      redis.call('SREM', KEYS[4], partner)
      redis.call('LREM', KEYS[3], 0, partner)
    end

    -- requeue BOTH
    redis.call('RPUSH', KEYS[3], user)
    redis.call('SADD', KEYS[4], user)

    if partner then
      redis.call('RPUSH', KEYS[3], partner)
      redis.call('SADD', KEYS[4], partner)
    end

    return partner
  `;

  return redis.eval(
    lua,
    4,
    ROOMS_KEY,
    ROOM_DETAILS_KEY,
    QUEUE_LIST,
    QUEUE_SET,
    socketId
  );
}

// ===================================================
// END / DISCONNECT (ONLY PARTNER REQUEUE)
// ===================================================
async function endCallAtomic(socketId) {
  const lua = `
    local user = ARGV[1]
    local partner = redis.call('HGET', KEYS[1], user)

    -- remove user completely
    redis.call('HDEL', KEYS[1], user)
    redis.call('HDEL', KEYS[2], user)
    redis.call('SREM', KEYS[4], user)
    redis.call('LREM', KEYS[3], 0, user)
    redis.call('DEL', 'zivro:user:' .. user)

    -- requeue ONLY partner
    if partner then
      redis.call('HDEL', KEYS[1], partner)
      redis.call('HDEL', KEYS[2], partner)

      redis.call('RPUSH', KEYS[3], partner)
      redis.call('SADD', KEYS[4], partner)
    end

    return partner
  `;

  return redis.eval(
    lua,
    4,
    ROOMS_KEY,
    ROOM_DETAILS_KEY,
    QUEUE_LIST,
    QUEUE_SET,
    socketId
  );
}

// ===================================================
// HARD CLEANUP (CRON / SAFETY)
// ===================================================
async function cleanupStaleUsers() {
  const users = await redis.smembers(QUEUE_SET);
  let cleaned = 0;

  for (const id of users) {
    const exists = await redis.exists(`zivro:user:${id}`);
    if (!exists) {
      await redis
        .multi()
        .srem(QUEUE_SET, id)
        .lrem(QUEUE_LIST, 0, id)
        .hdel(ROOMS_KEY, id)
        .hdel(ROOM_DETAILS_KEY, id)
        .exec();
      cleaned++;
    }
  }

  return cleaned;
}

// ===================================================
// HELPERS
// ===================================================
const getUserPartner = (id) => redis.hget(ROOMS_KEY, id);
const getQueueLength = () => redis.llen(QUEUE_LIST);

async function getUserData(id) {
  const d = await redis.get(`zivro:user:${id}`);
  return d ? JSON.parse(d) : null;
}

// ===================================================
// EXPORTS
// ===================================================
module.exports = {
  addToQueue,
  tryMatch,
  nextPairAtomic,   // 🔥 NEXT
  endCallAtomic,    // 🔥 DISCONNECT / END
  getUserPartner,
  getQueueLength,
  getUserData,
  cleanupStaleUsers
};
