const redis = require("./redis");

const QUEUE_LIST = "zivro:queue:list";
const QUEUE_SET = "zivro:queue:set";
const ROOMS_KEY = "zivro:rooms";
const ROOM_DETAILS_KEY = "zivro:room_details";

const USER_TTL = 600; // 10 minutes

// ===================================================
// ADD USER TO QUEUE
// ===================================================
async function addToQueue(socketId, userData) {
  const inSet = await redis.sismember(QUEUE_SET, socketId);
  if (inSet) return false;

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
    local list = KEYS[1]
    local set = KEYS[2]
    local rooms = KEYS[3]
    local details = KEYS[4]

    local a = redis.call('LPOP', list)
    local b = redis.call('LPOP', list)

    if not a or not b then
      if a then redis.call('LPUSH', list, a) end
      return nil
    end

    redis.call('SREM', set, a)
    redis.call('SREM', set, b)

    local room = 'room_' .. a .. '_' .. b

    redis.call('HSET', rooms, a, b)
    redis.call('HSET', rooms, b, a)
    redis.call('HSET', details, a, room)
    redis.call('HSET', details, b, room)

    return {a, b, room}
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

  return { userA: res[0], userB: res[1], roomId: res[2] };
}

// ===================================================
// REMOVE USER
// ===================================================
async function removeUser(socketId) {
  const partner = await redis.hget(ROOMS_KEY, socketId);

  await redis
    .multi()
    .lrem(QUEUE_LIST, 0, socketId)
    .srem(QUEUE_SET, socketId)
    .hdel(ROOMS_KEY, socketId)
    .hdel(ROOM_DETAILS_KEY, socketId)
    .del(`zivro:user:${socketId}`)
    .exec();

  if (partner) {
    await redis
      .multi()
      .hdel(ROOMS_KEY, partner)
      .hdel(ROOM_DETAILS_KEY, partner)
      .exec();
  }

  return partner;
}

// ===================================================
// CLEANUP STALE USERS (🔥 FIX)
// ===================================================
async function cleanupStaleUsers() {
  const users = await redis.smembers(QUEUE_SET);
  let cleaned = 0;

  for (const socketId of users) {
    const exists = await redis.exists(`zivro:user:${socketId}`);

    // TTL expired → remove ghost user
    if (!exists) {
      await redis
        .multi()
        .srem(QUEUE_SET, socketId)
        .lrem(QUEUE_LIST, 0, socketId)
        .hdel(ROOMS_KEY, socketId)
        .hdel(ROOM_DETAILS_KEY, socketId)
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
  removeUser,
  getUserPartner,
  getQueueLength,
  getUserData,
  cleanupStaleUsers, // ✅ FIXED
};
