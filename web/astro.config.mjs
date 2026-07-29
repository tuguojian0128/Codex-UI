import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://tuguojian0128.github.io/Codex-UI",
  output: "static",
  integrations: [sitemap()],
  vite: {
    ssr: {
      noExternal: ["lucide-astro"],
    },
    server: {
      host: "0.0.0.0",
      allowedHosts: ["terminal.local"],
    },
  },
});
