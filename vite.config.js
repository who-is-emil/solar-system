import { defineConfig } from 'vite';
import path from 'path';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/scss/vars/index.scss";
          @import "@/scss/mixins/index.scss";
        `,
      },
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'index.html',
    },
  },
  plugins: [glsl()],
});
