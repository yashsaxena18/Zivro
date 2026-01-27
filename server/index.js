require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const socketHandler = require("./socket-handler");
const redis = require("./redis");

// ===================================================
// ENV VALIDATION
// ===================================================
if (!process.env.REDIS_URL) {
  console.error("❌ REDIS_URL is missing");
  process.exit(1);
}

if (!process.env.CLIENT_URL) {
  console.error("❌ CLIENT_URL is missing");
  process.exit(1);
}

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "production";
const CLIENT_URL = process.env.CLIENT_URL;

// ===================================================
// EXPRESS SETUP
// ===================================================
const app = express();
const server = http.createServer(app);

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));

// ===================================================
// SOCKET.IO SETUP
// ===================================================
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// 🔥 SOCKET LOGIC
socketHandler(io);

// ===================================================
// HEALTH CHECK (USED BY RENDER)
// ===================================================
app.get("/health", async (_req, res) => {
  try {
    await redis.ping();
    res.status(200).json({
      status: "ok",
      env: NODE_ENV,
      uptime: process.uptime(),
    });
  } catch (err) {
    res.status(503).json({
      status: "redis-down",
    });
  }
});

// ===================================================
// GRACEFUL SHUTDOWN (RENDER SAFE)
// ===================================================
const shutdown = async (signal) => {
  console.log(`🛑 ${signal} received`);

  try {
    io.close();
    server.close();
    await redis.quit();
  } catch (err) {
    console.error("Shutdown error:", err);
  } finally {
    process.exit(0);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// ===================================================
// START SERVER (RENDER REQUIRED)
// ===================================================
(async function start() {
  try {
    await redis.ping();

    server.listen(PORT, "0.0.0.0", () => {
      console.log("=================================");
      console.log("🚀 Zivro Backend Running on Render");
      // console.log(`🌍 ENV: ${NODE_ENV}`);
      // console.log(`🔌 PORT: ${PORT}`);
      // console.log(`🖥 CLIENT: ${CLIENT_URL}`);
      // console.log("=================================");
    });
  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
})();
