import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import obfuscator from "vite-plugin-javascript-obfuscator";

export default defineConfig({
  plugins: [
    tailwindcss(),

    // 🔒 Obfuscate production build only
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

  build: {
    sourcemap: false, // ❌ prevents easy reverse engineering
    minify: "terser", // 🔥 stronger minification
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});