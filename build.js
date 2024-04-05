const { build } = require('esbuild');

const configs = [
  {
    entryPoints: ['./src/client/index.ts'],
    outfile: './dist/client.js',
    loader: { '.css': 'text' },
    format: 'esm',
    jsx: 'automatic',
    target: ['es2020'],
    bundle: true,
    loader: { '.svg': 'text' },
    minify: true
  },
  {
    entryPoints: ['./src/extension/index.ts'],
    outfile: './dist/extension.js',
    external: ['vscode'],
    format: 'cjs',
    target: ['es2020'],
    platform: 'node',
    bundle: true,
    minify: true
  }
];

(async () => {
  console.time('generating code');
  await Promise.all(configs.map(build));
  console.timeEnd('generating code');
})();
