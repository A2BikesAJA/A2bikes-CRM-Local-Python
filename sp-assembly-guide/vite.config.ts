import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// SINGLE=1 bundles everything into one self-contained index.html (no server,
// double-click to open) — handy for sharing a preview. The default build is the
// normal multi-chunk static site for hosting / Shopify embed.
const single = process.env.SINGLE === "1";

// Base is relative so the static build works when embedded under any Shopify
// path or served from a subdirectory / CDN.
export default defineConfig({
  base: "./",
  assetsInclude: ["**/*.glb"],
  plugins: [react(), ...(single ? [viteSingleFile()] : [])],
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 2500,
    ...(single
      ? // inline the GLB as a base64 data URI so the one-file build works offline
        { outDir: "dist-single", assetsInlineLimit: Number.MAX_SAFE_INTEGER }
      : {
          rollupOptions: {
            output: {
              manualChunks: {
                three: ["three"],
                r3f: ["@react-three/fiber", "@react-three/drei"],
              },
            },
          },
        }),
  },
});
