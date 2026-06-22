import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  preview: {
    allowedHosts: ["padel-brazzers-production.up.railway.app"],
  },
  plugins: [react()],
});
