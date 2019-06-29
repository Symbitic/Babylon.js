import babylonjs from './rollup-plugin-babylonjs.js';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import path from 'path';
import rename from 'rollup-plugin-rename';
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

const output = (name, format) => format === 'esm' ? ({
    dir: path.join(dest, name),
    format,
    sourcemap: true
}) : ({
    extend: true,
    file: `${path.join(dest, name.replace(/\-/g, '.'))}.${ext(format)}`,
    format,
    name: lib(name),
    sourcemap: true
});

export default [
    [ 'babylonjs', 'esm', 'src/index-es6.ts' ],
    [ 'babylonjs', 'umd', 'src/index-es6.ts' ],
    [ 'babylonjs-min', 'umd', 'src/index-es6.ts' ],
    [ 'babylonjs-gui', 'esm', 'gui/src/index.ts' ],
    [ 'babylonjs-gui', 'umd', 'gui/src/index.ts' ],
    [ 'babylonjs-gui-min', 'umd', 'gui/src/index.ts' ],
    [ 'babylonjs-loaders', 'esm', 'loaders/src/index.ts' ],
    [ 'babylonjs-loaders', 'umd', 'loaders/src/index.ts' ],
    [ 'babylonjs-loaders-min', 'umd', 'loaders/src/index.ts' ],
    [ 'babylonjs-materials', 'esm', 'materialsLibrary/src/index.ts' ],
    [ 'babylonjs-materials', 'umd', 'materialsLibrary/src/index.ts' ],
    [ 'babylonjs-materials-min', 'umd', 'materialsLibrary/src/index.ts' ],
    [ 'babylonjs-postProcess', 'esm', 'postProcessLibrary/src/index.ts' ],
    [ 'babylonjs-postProcess', 'umd', 'postProcessLibrary/src/index.ts' ],
    [ 'babylonjs-postProcess-min', 'umd', 'postProcessLibrary/src/index.ts' ],
    [ 'babylonjs-proceduralTextures', 'esm', 'proceduralTexturesLibrary/src/index.ts' ],
    [ 'babylonjs-proceduralTextures', 'umd', 'proceduralTexturesLibrary/src/index.ts' ],
    [ 'babylonjs-proceduralTextures-min', 'umd', 'proceduralTexturesLibrary/src/index.ts' ],
    [ 'babylonjs-serializers', 'esm', 'serializers/src/index.ts' ],
    [ 'babylonjs-serializers', 'umd', 'serializers/src/index.ts' ],
    [ 'babylonjs-serializers-min', 'umd', 'serializers/src/index.ts' ],
    [ 'babylonjs-max', 'umd', 'src/index-max.ts' ]
].map(([ name, format, src ]) => ({
    input: src,
    output: output(name, format),
    preserveModules: format === 'esm',
    plugins: [
        json(),
        babylonjs({
            max: name.indexOf('-max') > -1,
            dts: format === 'esm' && path.join(dest,
                name.replace(/\-/g, '.').concat('.module.d.ts')
            )
        }),
        resolve({
            extensions: [ '.ts', '.mjs', '.js', '.jsx', '.json' ]
        }),

        typescript({
            tsconfig: path.dirname(src)
        }),

        commonjs({
            extensions: [ '.ts', '.js' ]
        }),

        format === 'esm' && rename({
            include: [ '**/*.ts', '**/*.fx' ],
            map: file => file
                .replace(`${path.dirname(src)}/`, '')
                .replace('src/', '')
                // .replace(`${file.replace(/\-/g, '.')}/`, '')
                .replace(/\.(ts|fx)$/, '.js')
                .replace(/index-es6\.js/, 'index.js')
        }),

        (name.endsWith('-min') || name.endsWith('-max')) && terser()
    ]
}));
