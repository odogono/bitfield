import TypescriptPlugin from 'rollup-plugin-typescript2';
import pkg from './package.json';
const sourcemap = true;

export default {
    input: './src/index.ts',
    output: [
        { file: pkg.main, format: 'cjs', sourcemap },
        { name: 'odgn-bitfield', file: pkg['umd:main'], format: 'umd', sourcemap },
        { file: pkg.module, format: 'es', sourcemap }
    ],
    plugins: [
        TypescriptPlugin({
            verbosity: 2,
            clean: true,
            useTsconfigDeclarationDir: true,
          })
    ]
}