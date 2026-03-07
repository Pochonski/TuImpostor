import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  base: './',
  publicDir: "public",
  build: {
    outDir: "www",
    emptyOutDir: true,
    rollupOptions: {
      input: "index.html",
    },
  },
});
