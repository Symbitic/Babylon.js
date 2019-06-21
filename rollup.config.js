import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import path from 'path'
import resolve from 'rollup-plugin-node-resolve'
import typescript from 'rollup-plugin-typescript'
import babylonjs from './rollup-plugin-babylonjs.js'

const dest = path.join('dist', 'rollup')

const ext = (format) => ({
    'esm': 'mjs',
    'umd': 'js'
}[format])

function lib (name) {
    if (name.endsWith('gui')) {
        return 'BABYLON.GUI'
    } else {
        return 'BABYLON'
    }
}

const output = (name, format) => ({
    extend: true,
    file: `${path.join(dest, name.replace(/\-/, '.'))}.${ext(format)}`,
    format,
    name: lib(name)
})

export default [
    [ 'babylonjs' ],
    [ 'babylonjs-gui', 'gui' ],
    [ 'babylonjs-loaders', 'loaders' ],
    [ 'babylonjs-materials', 'materialsLibrary' ],
    [ 'babylonjs-postProcess', 'postProcessLibrary' ],
    [ 'babylonjs-proceduralTextures', 'proceduralTexturesLibrary' ],
    [ 'babylonjs-serializers', 'serializers' ]
].map(([ name, dir = '' ]) => ({
    input: path.join(dir, 'src', 'index.ts'),
    output: [
        output(name, 'esm'),
        output(name, 'umd')
    ],
    plugins: [
        json(),
        babylonjs(),
        resolve({
            extensions: [ '.ts', '.mjs', '.js', '.jsx', '.json' ]
        }),
        typescript({
            tsconfig: path.join(dir || 'src', 'tsconfig.json'),
            declaration: false
        }),
        commonjs({
            extensions: [ '.ts', '.js' ]
        })
    ]
}))
