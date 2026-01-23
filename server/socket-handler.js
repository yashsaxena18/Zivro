// server/socket-handler.js
// ✅ FINAL — PRODUCTION-GRADE, MULTI-USER SAFE MATCHMAKING

const {
  addToQueue,
  tryMatch,
  removeUser,
  getUserData,
  getUserPartner,
} = require("./queue");

module.exports = function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // ==================================
    // JOIN QUEUE
    // ==================================
    socket.on("join-queue", async (userData) => {
      try {
        console.log(`📥 ${socket.id} joining queue`);

        const added = await addToQueue(socket.id, userData);
        if (!added) return;

        await tryMatchAndEmit(io);
      } catch (err) {
        console.error("❌ join-queue error:", err);
      }
    });

    // ==================================
    // CLEANUP LOGIC (LEAVE / NEXT / DISCONNECT)
    // ==================================
    const cleanupAndRequeuePartner = async (reason) => {
      try {
        console.log(`👋 ${socket.id} cleanup (${reason})`);

        // Get partner BEFORE removal
        const partner = await getUserPartner(socket.id);
        const partnerData = partner ? await getUserData(partner) : null;

        // Remove current user completely
        await removeUser(socket.id);

        if (partner && partnerData) {
          io.to(partner).emit("partner-left");

          // Requeue ONLY the partner
          await addToQueue(partner, partnerData);
          await tryMatchAndEmit(io);
        }
      } catch (err) {
        console.error(`❌ cleanup error (${reason}):`, err);
      }
    };

    // ==================================
    // END CALL
    // ==================================
    socket.on("leave-queue", () =>
      cleanupAndRequeuePartner("leave-queue")
    );

    // ==================================
    // NEXT USER
    // ==================================
    socket.on("next", () =>
      cleanupAndRequeuePartner("next")
    );

    // ==================================
    // WEBRTC SIGNALING
    // ==================================
    socket.on("signal", ({ to, data }) => {
      io.to(to).emit("signal", {
        from: socket.id,
        data,
      });
    });

    // ==================================
    // DISCONNECT
    // ==================================
    socket.on("disconnect", () =>
      cleanupAndRequeuePartner("disconnect")
    );
  });
};

// ==================================
// MATCH LOOP (SAFE FOR MULTI-USERS)
// ==================================
async function tryMatchAndEmit(io) {
  while (true) {
    const match = await tryMatch();
    if (!match) break;

    await emitMatch(io, match);
  }
}

// ==================================
// EMIT MATCH
// ==================================
async function emitMatch(io, match) {
  const { roomId, userA, userB } = match;

  const userAData = await getUserData(userA);
  const userBData = await getUserData(userB);

  const isAInitiator = roomId.includes(`${userA}_${userB}`);

  io.to(userA).emit("matched", {
    roomId,
    partnerId: userB,
    partnerName: userBData?.name || "Stranger",
    isInitiator: isAInitiator,
  });

  io.to(userB).emit("matched", {
    roomId,
    partnerId: userA,
    partnerName: userAData?.name || "Stranger",
    isInitiator: !isAInitiator,
  });

  console.log(`🎯 MATCHED ${userA} ↔ ${userB} | room=${roomId}`);
}
