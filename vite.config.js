import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/luxury-comfort-solutions-app/" : "/",
  server: {
    port: 5173,
  },
}));
