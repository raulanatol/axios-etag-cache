import { defineConfig } from 'rollup';
import typescript from 'rollup-plugin-typescript2';
import autoExternal from 'rollup-plugin-auto-external';

export default defineConfig({
  input: 'src/main.ts',
  output: [
    {
      format: 'cjs',
      file: 'dist/index.js',
      sourcemap: true
    },
    {
      format: 'esm',
      file: 'dist/index.esm.js',
      sourcemap: true
    }
  ],
  plugins: [typescript(), autoExternal()]
});
