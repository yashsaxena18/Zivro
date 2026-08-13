// client/src/socket/socket.js
import { io } from "socket.io-client";

// ✅ MUST be env-based
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

if (!BACKEND_URL) {
  console.error("❌ VITE_BACKEND_URL is not defined");
}

// ✅ Create socket (DO NOT CONNECT YET)
export const socket = io(BACKEND_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 50,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 3000,
  timeout: 15000,
  transports: ["websocket", "polling"],
});

// ========================================
// CONNECTION MANAGEMENT
// ========================================

export const connectSocket = () => {
  return new Promise((resolve, reject) => {
    if (socket.connected) {
      resolve();
      return;
    }

    socket.connect();

    const cleanup = () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onError);
      socket.io.off("reconnect_failed", onReconnectFailed);
    };

    const onConnect = () => {
      console.log("✅ Socket connected:", socket.id);
      cleanup();
      resolve();
    };

    const onError = (error) => {
      console.warn("⏳ Retrying connection...", error.message);
    };

    const onReconnectFailed = () => {
      console.error("❌ All reconnection attempts exhausted");
      cleanup();
      reject(new Error("Could not connect after multiple attempts."));
    };

    socket.on("connect", onConnect);
    socket.on("connect_error", onError);
    socket.io.on("reconnect_failed", onReconnectFailed);
  });
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log("🔌 Socket disconnected");
  }
};

// ========================================
// QUEUE MANAGEMENT
// ========================================

export const joinQueue = (userData) => {
  if (!socket.connected) {
    console.error("❌ Cannot join queue: Socket not connected");
    return;
  }

  console.log("📤 Joining queue:", userData);
  socket.emit("join-queue", userData);
};

export const leaveQueue = () => {
  if (!socket.connected) {
    console.error("❌ Cannot leave queue: Socket not connected");
    return;
  }

  console.log("🚪 Leaving queue");
  socket.emit("leave-queue");
};

export const nextUser = () => {
  if (!socket.connected) {
    console.error("❌ Cannot skip: Socket not connected");
    return;
  }

  console.log("⏭️ Next user");
  socket.emit("next");
};

// ========================================
// WEBRTC SIGNALING
// ========================================

export const sendSignal = (to, data) => {
  if (!socket.connected) {
    console.error("❌ Cannot send signal: Socket not connected");
    return;
  }

  console.log("📡 Sending signal:", data.type, "→", to);
  socket.emit("signal", { to, data });
};

// ========================================
// EVENT LISTENERS
// ========================================

export const onMatched = (callback) => {
  const handler = (data) => {
    console.log("🎯 Matched:", data);
    callback(data);
  };

  socket.on("matched", handler);
  return () => socket.off("matched", handler);
};

export const onSignal = (callback) => {
  const handler = ({ from, data }) => {
    console.log("📡 Signal received:", data.type);
    callback({ from, data });
  };

  socket.on("signal", handler);
  return () => socket.off("signal", handler);
};

export const onPartnerLeft = (callback) => {
  const handler = () => {
    console.log("👋 Partner left");
    callback();
  };

  socket.on("partner-left", handler);
  return () => socket.off("partner-left", handler);
};

export const onConnectionError = (callback) => {
  const handler = (error) => {
    console.error("⚠️ Socket error:", error.message);
    callback(error);
  };

  socket.on("connect_error", handler);
  return () => socket.off("connect_error", handler);
};

export const onDisconnect = (callback) => {
  const handler = (reason) => {
    console.warn("🔌 Disconnected:", reason);
    callback(reason);
  };

  socket.on("disconnect", handler);
  return () => socket.off("disconnect", handler);
};

export const onConnectGlobal = (callback) => {
  const handler = () => {
    console.log("✅ Global socket connected/reconnected!");
    callback();
  };

  socket.on("connect", handler);
  return () => socket.off("connect", handler);
};

// ========================================
// UTILS
// ========================================

export const getSocketId = () => socket.id;
export const isConnected = () => socket.connected;

export default socket;
