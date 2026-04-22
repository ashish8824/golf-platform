// vite.config.ts
// We import Tailwind as a Vite plugin — this is the new Tailwind v4 way
// No more tailwind.config.js file needed!

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind v4 runs as a Vite plugin directly
  ],
});
