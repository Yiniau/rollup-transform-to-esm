import resolve from '@rollup/plugin-node-resolve';
import commonjs from './commonjs/src/index';

const mainFields = [
  'browser',
  'jsnext',
  'module',
  'unpkg',
  'umd',
  'umd:main',
  'main',
];

export default {
  input: 'testPackage',
  output: {
    dir: 'build',
    format: 'esm',
  },
  plugins: [
    resolve({
      mainFields,
    }),
    commonjs({}),
  ],
};