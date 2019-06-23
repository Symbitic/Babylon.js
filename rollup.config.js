import babylonjs from './rollup-plugin-babylonjs.js';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import path from 'path';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript';
import { terser } from 'rollup-plugin-terser';

const dest = path.join('dist', 'rollup');

const ext = (format) => ({
    'esm': 'mjs',
    'umd': 'js'
}[format]);

function lib (name) {
    if (name.endsWith('gui')) {
        return 'BABYLON.GUI';
    } else {
        return 'BABYLON';
    }
}

const output = (name, format) => ({
    extend: true,
    file: `${path.join(dest, name.replace(/\-/g, '.'))}.${ext(format)}`,
    format,
    name: lib(name),
    sourcemap: true
});

export default [
    [ 'babylonjs', 'src/index-es6.ts' ],
    [ 'babylonjs-min', 'src/index-es6.ts' ],
    [ 'babylonjs-gui', 'gui/src/index.ts' ],
    [ 'babylonjs-gui-min', 'gui/src/index.ts' ],
    [ 'babylonjs-loaders', 'loaders/src/index.ts' ],
    [ 'babylonjs-loaders-min', 'loaders/src/index.ts' ],
    [ 'babylonjs-materials', 'materialsLibrary/src/index.ts' ],
    [ 'babylonjs-materials-min', 'materialsLibrary/src/index.ts' ],
    [ 'babylonjs-postProcess', 'postProcessLibrary/src/index.ts' ],
    [ 'babylonjs-postProcess-min', 'postProcessLibrary/src/index.ts' ],
    [ 'babylonjs-proceduralTextures', 'proceduralTexturesLibrary/src/index.ts' ],
    [ 'babylonjs-proceduralTextures-min', 'proceduralTexturesLibrary/src/index.ts' ],
    [ 'babylonjs-serializers', 'serializers/src/index.ts' ],
    [ 'babylonjs-serializers-min', 'serializers/src/index.ts' ],
    [ 'babylonjs-max', 'src/index-max.ts' ]
].map(([ name, src ]) => ({
    input: src,
    output: name.endsWith('-min')
        ? output(name, 'umd')
        : [ output(name, 'esm'), output(name, 'umd') ],
    plugins: [
        json(),
        babylonjs({
            max: name.indexOf('-max') > -1,
            dts: !name.endsWith('-max') && !name.endsWith('-min')
        }),
        resolve({
            extensions: [ '.ts', '.mjs', '.js', '.jsx', '.json' ]
        }),

        typescript({
            tsconfig: path.dirname(src),
            declaration: true,
            declarationDir: './dist/rollup'
        }),

        commonjs({
            extensions: [ '.ts', '.js' ]
        }),
        (name.endsWith('-min') || name.endsWith('-max')) && terser()
    ]
}));
