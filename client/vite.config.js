// client/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  resolve: {
    alias: {
      // Ensure Rollup/Vite resolves the distributable for production builds on Vercel
      "socket.io-client": "socket.io-client/dist/socket.io.js",
    },
  },
  plugins: [react()],
  server: {
    host: "localhost", // dev only
    port: 5173,
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
  optimizeDeps: {
    include: ["socket.io-client"],
  },
});
