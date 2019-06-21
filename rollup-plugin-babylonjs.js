import path from 'path'

const babylonModules = [
    'babylonjs',
    'babylonjs-serializers',
    'babylonjs-loaders',
    'babylonjs-gui',
    '@babylonjs/serializers',
    '@babylonjs/loaders',
    '@babylonjs/gui',
    '@babylonjs/core'
]

const babylonGlobals = {
    'babylonjs': 'BABYLON',
    'babylonjs-serializers': 'BABYLON',
    'babylonjs-loaders': 'BABYLON',
    'babylonjs-gui': 'BABYLON.GUI',
    '@babylonjs/serializers': 'BABYLON',
    '@babylonjs/loaders': 'BABYLON',
    '@babylonjs/gui': 'BABYLON.GUI',
    '@babylonjs/core': 'BABYLON'
}

const template = (effect, includes, name, shader, store) =>
`// eslint-disable
import { Effect } from '${effect}'
${includes}
const name = '${name}'
const shader = ${JSON.stringify(shader)}

Effect.${store}[name] = shader
export const ${name} = { name, shader }
`

function resolveId (source, importer) {
    let ret = null

    if (source.includes('../Materials/effect')) {
        return path.join(path.dirname(importer), source).concat('.ts')
    } else if (/\.(fragment|vertex)$/.test(source)) {
        return {
            id: path.resolve(path.dirname(importer), source).concat('.fx')
        }
    } else if (/\.(fragment|vertex)\.fx$/.test(source)) {
        return {
            id: path.resolve(path.dirname(importer), source)
        }
    }

    babylonModules.forEach(id => {
        if (source.startsWith(id)) {
            ret = { id, external: true }
        }
    })
    return ret
}

function transform (source, id) {
    if (!/\.(fragment|vertex)\.fx$/.test(id)) {
        return
    }

    const regex = /#include<(.+)>(\((.*)\))*(\[(.*)\])*/g

    const isCore = path.relative(process.cwd(), id).startsWith('src/')
    const isInclude = path.normalize(id).indexOf('ShadersInclude') > -1

    const store = isInclude ? 'IncludesShadersStore' : 'ShadersStore'

    const effect = isCore
        ? (isInclude ? '../../Materials/effect' : '../Materials/effect')
        : 'babylonjs/Materials/effect'

    let includes = ''

    const shader = regex.test(source)
        ? source
            .replace(/[^\S\r\n]+$/gm, '')
        : source
            .replace(/[^\S\r\n]+$/gm, "")
            .replace(regex, (_, include) => {
                let files = []
                if (include.indexOf('__decl__') !== -1) {
                    const base = include.replace(/__decl__/, '')
                    const noUBOFile = base.concat('Declaration')

                    const uBOFile = base
                        .replace(/Vertex/, 'Ubo')
                        .replace(/Fragment/, 'Ubo')
                        .concat('Declaration')

                    files = [ noUBOFile, uBOFile ]
                } else {
                    files = [ include ]
                }
                files.forEach(entry => {
                    includes = includes.concat(isCore
                        ? `import "./ShadersInclude/${entry}"
`
                        : `import "babylonjs/Shaders/ShadersInclude/${entry}"
`
                    )
                })
                return ''
            })

    const name = path.basename(id).split('.')[0]

    if (includes) {
    console.log(includes)
    process.exit(0)
    }

    return {
        code: template(effect, includes, name, shader, store),
    }

}

function options (opts) {
    const onwarn = ({ code, msg, ...params }) => {
        if (code === 'NAMESPACE_CONFLICT') {
            return
        }
        opts.onwarn({ code, msg, ...params })
    }
    return {
        ...opts,
        external: babylonModules,
        onwarn,
        output: {
            globals: babylonGlobals
        }
    }
}

export default function () {
    return {
        name: 'babylonjs',
        options,
        resolveId,
        transform,
    }
}
