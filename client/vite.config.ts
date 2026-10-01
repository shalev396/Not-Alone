import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Split third-party code into cacheable vendor chunks so no single chunk
// exceeds Vite's 500 kB warning limit.
const vendorChunks: Record<string, string[]> = {
  react: ["react", "react-dom", "react-router", "react-router-dom", "scheduler"],
  state: ["@reduxjs/toolkit", "react-redux", "redux", "immer", "reselect"],
  query: ["@tanstack/react-query", "@tanstack/react-query-devtools"],
  ui: ["@radix-ui", "@floating-ui", "lucide-react", "react-day-picker", "date-fns"],
  forms: ["formik", "zod", "zod-formik-adapter", "lodash", "lodash-es"],
  network: ["axios", "socket.io-client", "engine.io-client", "socket.io-parser"],
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          const pkgPath = id.split("node_modules/").pop() ?? "";
          for (const [chunk, pkgs] of Object.entries(vendorChunks)) {
            if (pkgs.some((pkg) => pkgPath.startsWith(`${pkg}/`))) return chunk;
          }
          return "vendor";
        },
      },
    },
  },
});
