import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Wiener Nebel",
        short_name: "Wiener Nebel",
        description: "Hidden-Role- und Deduction-Spiel im Wiener Öffi-Netz.",
        theme_color: "#7a1f1f",
        background_color: "#efe6d8",
        display: "standalone",
        start_url: "/",
        icons: []
      }
    })
  ],
  server: {
    port: 4173
  }
});
