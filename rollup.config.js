import resolve from '@rollup/plugin-node-resolve';
import esmTranser from './src/index';

const mainFields = [
  // 'browser',
  // 'jsnext',
  // 'module',
  // 'unpkg',
  // 'umd',
  // 'umd:main',
  'main',
];

export default [
  {
    input: 'testPackage/cjs',
    output: {
      dir: 'build/cjs',
      format: 'esm',
    },
    plugins: [
      resolve({
        mainFields,
      }),
      esmTranser({}),
    ],
  },
  {
    input: 'testPackage/umd',
    output: {
      dir: 'build/umd',
      format: 'esm',
    },
    plugins: [
      resolve({
        mainFields,
      }),
      esmTranser({}),
    ],
  },
];
