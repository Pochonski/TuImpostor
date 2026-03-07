import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  base: process.env.NODE_ENV === 'production' ? '/TuImpostor/' : '/',
  publicDir: "public",
  build: {
    outDir: "www",
    emptyOutDir: true,
    rollupOptions: {
      input: "index.html",
    },
  },
});
