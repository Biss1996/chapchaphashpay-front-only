import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import obfuscator from "vite-plugin-javascript-obfuscator";

export default defineConfig({
  plugins: [
    react(),
    // Use Tailwind CSS v3 plugin directly
    {
      name: "tailwindcss",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url.endsWith(".css")) {
            res.setHeader("Content-Type", "text/css");
          }
          next();
        });
      },
      transformIndexHtml: {
        order: "pre",
        handler(html) {
          return html.replace(
            /<head>/,
            `<head>
              <link href="/src/input.css" rel="stylesheet">
            `
          );
        },
      },
    },
    obfuscator({
      apply: "build",
      options: {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.7,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.3,
        stringArray: true,
        stringArrayEncoding: ["base64"],
        stringArrayThreshold: 0.75,
        rotateStringArray: true,
        selfDefending: true,
        debugProtection: false,
        disableConsoleOutput: true,
      },
    }),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  build: {
    sourcemap: false,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
});