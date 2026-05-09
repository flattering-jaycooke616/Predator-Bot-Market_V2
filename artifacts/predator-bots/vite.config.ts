import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const port = Number(process.env.PORT) || 5173;
const basePath = process.env.BASE_PATH || "/";
const apiServerUrl = process.env.API_SERVER_URL || "http://localhost:8080";

export default defineConfig({
  base: basePath,
  define: {
    "import.meta.env.VITE_CLERK_PUBLISHABLE_KEY": JSON.stringify(
      process.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_aW50ZW50LWN1Yi0xOC5jbGVyay5hY2NvdW50cy5kZXYk"
    ),
    "process.env.VITE_CLERK_PUBLISHABLE_KEY": JSON.stringify(
      process.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_aW50ZW50LWN1Yi0xOC5jbGVyay5hY2NvdW50cy5kZXYk"
    ),
    "import.meta.env.VITE_API_URL": JSON.stringify(
      process.env.VITE_API_URL || ""
    ),
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: false,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
    proxy: {
      "/api": {
        target: apiServerUrl,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
