import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Base is relative so the static build works when embedded under any Shopify
// path or served from a subdirectory / CDN.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
          r3f: ["@react-three/fiber", "@react-three/drei"],
        },
      },
    },
  },
});
