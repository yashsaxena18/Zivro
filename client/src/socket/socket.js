// client/src/socket/socket.js
import { io } from "socket.io-client";

// ✅ MUST be env-based
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

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
      cleanup();
      resolve();
    };

    const onError = () => {
      // Connection retries happen silently in production.
    };

    const onReconnectFailed = () => {
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
  }
};

// ========================================
// QUEUE MANAGEMENT
// ========================================

export const joinQueue = (userData) => {
  if (!socket.connected) {
    return;
  }

  socket.emit("join-queue", userData);
};

export const leaveQueue = () => {
  if (!socket.connected) {
    return;
  }

  socket.emit("leave-queue");
};

export const nextUser = () => {
  if (!socket.connected) {
    return;
  }

  socket.emit("next");
};

// ========================================
// WEBRTC SIGNALING
// ========================================

export const sendSignal = (to, data) => {
  if (!socket.connected) {
    return;
  }

  socket.emit("signal", { to, data });
};

// ========================================
// EVENT LISTENERS
// ========================================

export const onMatched = (callback) => {
  const handler = (data) => {
    callback(data);
  };

  socket.on("matched", handler);
  return () => socket.off("matched", handler);
};

export const onSignal = (callback) => {
  const handler = ({ from, data }) => {
    callback({ from, data });
  };

  socket.on("signal", handler);
  return () => socket.off("signal", handler);
};

export const onPartnerLeft = (callback) => {
  const handler = () => {
    callback();
  };

  socket.on("partner-left", handler);
  return () => socket.off("partner-left", handler);
};

export const onConnectionError = (callback) => {
  const handler = (error) => {
    callback(error);
  };

  socket.on("connect_error", handler);
  return () => socket.off("connect_error", handler);
};

export const onDisconnect = (callback) => {
  const handler = (reason) => {
    callback(reason);
  };

  socket.on("disconnect", handler);
  return () => socket.off("disconnect", handler);
};

export const onConnectGlobal = (callback) => {
  const handler = () => {
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
