import path from 'node:path';
import bundleVisualizer from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import autoExternal from 'rollup-plugin-auto-external';

function getBundleVisualizerPlugin() {
  return {
    ...bundleVisualizer({
      template: 'treemap', open: true, gzipSize: true, brotliSize: true
    }),
    apply: 'build',
    enforce: 'post'
  };
}

export default defineConfig({
  plugins: [dts(), autoExternal(), process.env.BUNDLE_ANALYZE === '1' && getBundleVisualizerPlugin()].filter(Boolean),
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'axios-etag-cache',
      formats: ['es', 'umd'],
      fileName: 'axios-etag-cache'
    }, rollupOptions: {
      output: {
        globals: {
          axios: 'axios'
        }
      }
    }
  }
});
