import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/neapolitan-wordle/",
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false
  }
});

