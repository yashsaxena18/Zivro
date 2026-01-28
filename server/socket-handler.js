// server/socket-handler.js
// ✅ FINAL — RACE-CONDITION SAFE, ATOMIC MATCHMAKING + STRANGER CHAT

const {
  addToQueue,
  tryMatch,
  nextPairAtomic,
  endCallAtomic,
  getUserData,
  getUserPartner
} = require("./queue");

module.exports = function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // ==================================
    // JOIN QUEUE
    // ==================================
    socket.on("join-queue", async (userData) => {
      try {
        const added = await addToQueue(socket.id, userData);
        if (!added) return;

        await tryMatchAndEmit(io);
      } catch (err) {
        console.error("❌ join-queue error:", err);
      }
    });

    // ==================================
    // NEXT (ANYONE → BOTH REQUEUE)
    // ==================================
    socket.on("next", async () => {
      try {
        const partner = await nextPairAtomic(socket.id);

        if (partner) {
          io.to(partner).emit("partner-left", { reason: "next" });
        }

        await tryMatchAndEmit(io);
      } catch (err) {
        console.error("❌ next error:", err);
      }
    });

    // ==================================
    // END CALL (ONLY PARTNER REQUEUE)
    // ==================================
    socket.on("leave-queue", async () => {
      try {
        const partner = await endCallAtomic(socket.id);

        if (partner) {
          io.to(partner).emit("partner-left", { reason: "leave" });
        }

        await tryMatchAndEmit(io);
      } catch (err) {
        console.error("❌ leave error:", err);
      }
    });

    // ==================================
    // DISCONNECT (ONLY PARTNER REQUEUE)
    // ==================================
    socket.on("disconnect", async () => {
      try {
        const partner = await endCallAtomic(socket.id);

        if (partner) {
          io.to(partner).emit("partner-left", { reason: "disconnect" });
        }

        await tryMatchAndEmit(io);
      } catch (err) {
        console.error("❌ disconnect error:", err);
      }
    });

    // ==================================
    // STRANGER CHAT (TEXT CHAT)
    // ==================================
    socket.on("chat-message", async ({ message }) => {
      try {
        if (!message || typeof message !== "string") return;

        const text = message.trim().slice(0, 500);
        if (!text) return;

        // get current partner
        const partner = await getUserPartner(socket.id);
        if (!partner) return;

        // send message only to current partner
        io.to(partner).emit("chat-message", {
          from: socket.id,
          message: text,
          timestamp: Date.now()
        });
      } catch (err) {
        console.error("❌ chat-message error:", err);
      }
    });

    // ==================================
    // WEBRTC SIGNALING (SAFE)
    // ==================================
    socket.on("signal", async ({ to, data }) => {
      try {
        const partner = await getUserPartner(socket.id);
        if (partner !== to) return; // prevent cross-room signaling

        io.to(to).emit("signal", {
          from: socket.id,
          data
        });
      } catch (err) {
        console.error("❌ signal error:", err);
      }
    });
  });
};

// ==================================
// MATCH LOOP
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

  const [userAData, userBData] = await Promise.all([
    getUserData(userA),
    getUserData(userB)
  ]);

  const isAInitiator = roomId.startsWith(`room_${userA}_`);

  io.to(userA).emit("matched", {
    roomId,
    partnerId: userB,
    partnerName: userBData?.name || "Stranger",
    isInitiator: isAInitiator
  });

  io.to(userB).emit("matched", {
    roomId,
    partnerId: userA,
    partnerName: userAData?.name || "Stranger",
    isInitiator: !isAInitiator
  });

  console.log(`🎯 MATCHED ${userA} ↔ ${userB}`);
}
