/**
 * .d.ts generator for Babylon.js
 */
import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const exec = promisify(cp.exec);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const babylonGlobals = {
    'babylonjs': 'BABYLON',
    'babylonjs-serializers': 'BABYLON',
    'babylonjs-loaders': 'BABYLON',
    'babylonjs-gui': 'BABYLON.GUI',
    'babylonjs-materials': 'BABYLON',
    'babylonjs-postProcess': 'BABYLON',
    'babylonjs-proceduralTextures': 'BABYLON',
    '@babylonjs/serializers': 'BABYLON',
    '@babylonjs/loaders': 'BABYLON',
    '@babylonjs/gui': 'BABYLON.GUI',
    '@babylonjs/materials': 'BABYLON',
    '@babylonjs/post-process': 'BABYLON',
    '@babylonjs/procedural-textures': 'BABYLON',
    '@babylonjs/core': 'BABYLON'
};

const classMap = {
    'babylonjs': 'BABYLON',
    'babylonjs-gltf2interface': 'BABYLON.GLTF2',
    'babylonjs-loaders': 'BABYLON',
    'babylonjs-serializers': 'BABYLON',
    'babylonjs-gui': 'BABYLON.GUI',
    '@babylonjs/core': 'BABYLON',
    '@babylonjs/loaders': 'BABYLON',
    '@babylonjs/serializers': 'BABYLON',
    '@babylonjs/gui': 'BABYLON.GUI',
    '@fortawesome': false,
    'react-contextmenu': false,
    'react': 'React'
};

const classMaps = {
    'babylonjs-materials': { 'babylonjs': 'BABYLON' },
    'babylonjs-post-process': { 'babylonjs': 'BABYLON' },
    'babylonjs-procedural-textures': { 'babylonjs': 'BABYLON' },
    'babylonjs-loaders': {
        'babylonjs': 'BABYLON',
        'babylonjs-gltf2interface': 'BABYLON.GLTF2'
    },
    'babylonjs-serializers': {
        'babylonjs': 'BABYLON',
        'babylonjs-loaders': 'BABYLON',
        'babylonjs-serializers': 'BABYLON',
        'babylonjs-gltf2interface': 'BABYLON.GLTF2'
    },
    'babylonjs-gui': {
        'babylonjs': 'BABYLON',
        'babylonjs-loaders': 'BABYLON',
        'babylonjs-serializers': 'BABYLON'
    },
    'babylonjs-inspector': {
        'babylonjs': 'BABYLON',
        'babylonjs-loaders': 'BABYLON',
        'babylonjs-serializers': 'BABYLON',
        'babylonjs-gltf2interface': 'BABYLON.GLTF2',
        'react': 'React',
        'babylonjs-gui': 'BABYLON.GUI',
        '@babylonjs/core': 'BABYLON',
        '@babylonjs/loaders': 'BABYLON',
        '@babylonjs/serializers': 'BABYLON',
        '@babylonjs/gui': 'BABYLON.GUI',
        '@fortawesome': false,
        'react-contextmenu': false
    },
    'babylonjs-node-editor': {
        'babylonjs': 'BABYLON',
        'react': 'React',
        '@babylonjs/core': 'BABYLON',
        '@fortawesome': false,
        'react-contextmenu': false
    },
    'babylonjs-viewer': {
        'babylonjs': 'BABYLON',
        'babylonjs-loaders': 'BABYLON'
    }
}

const moduleSpecifics = {
    'babylonjs': [
        { 'path': 'babylonjs/Debug/axesViewer', 'namespace': 'BABYLON.Debug' },
        { 'path': 'babylonjs/Debug/boneAxesViewer', 'namespace': 'BABYLON.Debug' },
        { 'path': 'babylonjs/Debug/physicsViewer', 'namespace': 'BABYLON.Debug' },
        { 'path': 'babylonjs/Debug/skeletonViewer', 'namespace': 'BABYLON.Debug' }
    ],
    'babylonjs-loaders': [
        { 'path': 'babylonjs-loaders/glTF/1.0', 'namespace': 'BABYLON.GLTF1' },
        { 'path': 'babylonjs-loaders/glTF/2.0', 'namespace': 'BABYLON.GLTF2' },
        { 'path': 'babylonjs-loaders/glTF/2.0/glTFLoaderInterfaces', 'namespace': 'BABYLON.GLTF2.Loader' },
        { 'path': 'babylonjs-loaders/glTF/2.0/Extensions', 'namespace': 'BABYLON.GLTF2.Loader.Extensions' }
    ],
    'babylonjs-serializers': [
        { 'path': 'babylonjs-serializers/glTF/2.0', 'namespace': 'BABYLON.GLTF2.Exporter' },
        { 'path': 'babylonjs-serializers/glTF/2.0/Extensions', 'namespace': 'BABYLON.GLTF2.Exporter.Extensions' },
        { 'path': 'babylonjs-serializers/glTF/2.0/glTFData', 'namespace': 'BABYLON' },
        { 'path': 'babylonjs-serializers/glTF/2.0/glTFSerializer', 'namespace': 'BABYLON' }
    ]
}

// Remove empty module declaration
function cleanEmptyNamespace (str, moduleName) {
    let emptyDeclareRegexp = new RegExp("declare module " + moduleName + " {\\s*}\\s*", "gm");
    str = str.replace(emptyDeclareRegexp, "");

    return str;
}

function processAmdDeclarationToModule (data, moduleName) {
    const hiddenConsts = moduleName === 'babylonjs' ? [] : [ 'Debug' ];
    const entryPoint = moduleName === 'babylonjs' ? 'Legacy/legacy' : 'legacy/legacy';
    const regexTypeImport = /(.*)type ([A-Za-z0-9]*) = import\("(.*)"\)\.(.*);/g;
    const regexVar = /(.*)readonly (.*) = (.*);/g;

    let str = "" + data;

    // Start process by extracting all lines.
    let lines = str.split('\n');

    // Let's go line by line and check if we have special folder replacements
    // Replaces declare module '...'; by declare module 'babylonjs/...'; for instance
    for (let index = 0; index < lines.length; index++) {
        let line = lines[index];

        // Replace Type Imports
        let match = regexTypeImport.exec(line);
        if (match) {
            const [ spaces, , , module, type ] = match;
            line = `${spaces}import { ${type} } from "${module}";`;
        }

        // Checks if line is about external module
        let externalModule = false;
        const parts = moduleName.split('-');
        const names = parts.length === 1
            ? [ moduleName, '@'.concat(parts.join('/core')) ]
            : [ moduleName, '@'.concat(parts.join('/')) ];
        for (let ext in classMap) {
            if (names.indexOf(ext) === -1) {
                continue;
            }
            externalModule = line.indexOf(ext) > -1;
            if (externalModule) {
                break;
            }
        }

        // If not Append Module Name
        if (!externalModule) {
            line = line
                // Declaration
                .replace(/declare module "/g, `declare module "${moduleName}/`)
                // From
                .replace(/ from "/g, ` from "${moduleName}/`)
                // Module augmentation
                .replace(/    module "/g, `    module "${moduleName}/`)
                // Inlined Import
                .replace(/import\("/g, `import("${moduleName}/`)
                // Side Effect Import
                .replace(/import "/g, `import "${moduleName}/`);
        }

        // Replace Static Readonly declaration for UMD TS Version compat
        match = regexVar.exec(line);
        if (match) {
            const [ spaces, name, value ] = match;
            if (value === "true" || value === "false") {
                line = `${spaces}readonly ${name}: boolean;`;
            }
            else if (value.startsWith('"')) {
                line = `${spaces}readonly ${name}: string;`;
            }
            else {
                line = `${spaces}readonly ${name}: number;`;
            }
        }

        lines[index] = line;
    }

    // Recreate the file.
    str = lines.join('\n');

    // !!! Be carefull
    // Could cause issues if this appears in several import scope
    // with different aliases.
    // !!! Be carefull multiline not managed.
    // Remove unmanaged externals Appears as classMap false in the config.
    for (let ext in classMap) {
        // Need to remove the module and dependencies if false.
        if (classMap[ext] === false) {
            // Replace import { foo, bar } from ...
            const babylonRegex = new RegExp(`import {(.*)} from ['"](${ext})[\/'"](.*);`, "g");
            let match = babylonRegex.exec(str);
            let classes = new Set();
            while (match != null) {
                if (match[1]) {
                    match[1].split(",").forEach(element => {
                        classes.add(element.trim());
                    });
                }
                match = babylonRegex.exec(str);
            }
            str = str.replace(babylonRegex, '');

            classes.forEach(cls => {
                let alias = cls;

                // Deal with import { foo as A, bar as B } from ...
                if (cls.indexOf(" as ") > -1) {
                    const tokens = cls.split(" as ");
                    alias = tokens[1];
                }

                // !!! Be carefull multiline not managed.
                const rg = new RegExp(`.*[ <]${alias}[^\\w].*`, "g")
                str = str.replace(rg, "");
            });
        }
    }

    // Remove Empty Lines
    str = str.replace(/^\s*$/gm, "");

    // Hide Exported Consts if necessary
    for (let toHide of hiddenConsts) {
        const constStart = str.indexOf(`export const ${toHide}`);
        if (constStart > -1) {
            for (let i = constStart; i < str.length; i++) {
                if (str[i] === "}") {
                    // +1 to enroll the last }
                    // +2 to enroll the trailing ;
                    str = str.substr(0, constStart) + str.substr(i + 2);
                    break;
                }
            }
        }
    }

    // Add Entry point.
    const entry = `
declare module "${moduleName}" {
    export * from "${moduleName}/${entryPoint}";
}`;

    return str
      .replace(/\n+$/, '')
      .concat(entry);
}

function processModuleDeclarationToNamespace (data, packageName) {
    /*
    // Only for babylonjs-viewer, which we do not build right now.
    if (options.replacements) {
        for (let replacement of options.replacements) {
            data = data.replace(replacement.from, replacement.to);
        }
    }
    if (options.prependText) {
        data = options.prependText + '\n' + data.toString();
    }
    if (options.doNotAppendNamespace) {
        fs.writeFileSync(fileLocation, data);
    }
    */

    const declareRegex = /declare module ["'](.*)["'] {/g;
    const moduleRegex = /\smodule ["'](.*)["'] {/g;
    const importRegex = new RegExp(`import {(.*)} from ['"]${packageName}(.*)['"];`, 'g');
    let str = data;

    // Start process by extracting all lines.
    let lines = str.split('\n');

    // Let's go line by line and check if we have special folder replacements
    // Replaces declare module 'babylonjs'; by declare module BABYLON for instance
    for (let index = 0; index < lines.length; index++) {
        if (!babylonGlobals.hasOwnProperty(packageName)) {
            throw new Error(`${packageName} missing from babylonGlobals`);
        }

        let namespace = babylonGlobals[packageName];

        if (moduleSpecifics.hasOwnProperty(packageName)) {
            const match = declareRegex.exec(lines[index]);

            if (!match) {
                continue;
            }

            const module = match[1];

            moduleSpecifics[packageName].forEach(specific => {
                if (module.indexOf(specific.path) > -1) {
                    namespace = specific.namespace;
                }
            });
        }

        lines[index] = lines[index].replace(declareRegex, `declare module ${namespace} {`);
    }

    // Replace module augmentation blocks
    for (let index = 0; index < lines.length; index++) {
        const match = moduleRegex.exec(lines[index]);
        if (!match) {
            continue;
        }
        lines[index] = "";

        // Find matching closing curly }
        let opened = 0;
        for (let endIndex = index; endIndex < lines.length; endIndex++) {
            let scanLine = lines[endIndex].trim();
            if (scanLine.length === 0) {
                continue;
            }
            // Skip comments
            if (scanLine[0] === "*" || scanLine[0] === "/") {
                continue;
            }

            // Count open curly
            if (scanLine.indexOf("{") != -1) {
                opened++;
            }
            // And closing ones
            if (scanLine.indexOf("}") != -1) {
                opened--;

                // until the closing module
                if (opened < 0) {
                    lines[endIndex] = "";
                    index = endIndex;
                    break;
                }
            }
        }
    }

    // Recreate the file.
    str = lines.join('\n');

    // First let s deal with internal aliased imports.
    if (moduleSpecifics.hasOwnProperty(packageName)) {
        // Find all imported classes and aliased classes.
        const babylonRegex = new RegExp(`import {(.*)} from ['"](.*)['"];`, "g");
        let match = babylonRegex.exec(str);
        let aliasedClasses = new Set();
        while (match != null) {
            if (match[1]) {
                match[1].split(",").forEach(element => {
                    // Filter only aliased classes
                    if (element.indexOf(" as ") > -1) {
                        aliasedClasses.add(element.trim() + " as " + match[2]);
                    }
                });
            }
            match = babylonRegex.exec(str);
        }
        str = str.replace(babylonRegex, '');

        // For every aliased.
        aliasedClasses.forEach(cls => {
            const tokens = cls.split(" as ");
            const className = tokens[0];
            const alias = tokens[1];
            const pkg = tokens[2];

            // Use the default module name.
            let namespace = babylonGlobals[packageName];
            // If they are part of a specific module.
            moduleSpecifics[packageName].forEach(function(specific) {
                if (pkg.indexOf(specific.path) > -1) {
                    namespace = specific.namespace;
                }
            });

            // Replace
            const rg = new RegExp(`([ <])(${alias})([^\\w])`, "g")
            str = str.replace(rg, `$1${namespace}.${className}$3`);
        });
    }

    // Let s clean up all the import * from BABYLON or the package itself as we know it is part of
    // the same namespace... Should be
    str = str
        .replace("import * as BABYLON from 'babylonjs';", "")
        .replace(importRegex, '');

    // Let s clean other chosen imports from the mix.
    /*
    // Viewer again.
    if (options.importsToRemove) {
        while (options.importsToRemove.length) {
            let remove = options.importsToRemove.pop();
            str = str.replace(new RegExp(`import '${remove}';`), '');
        }
    }
    */

    // Find all other imported classes (Part of BABYLON or Loaders for instance)
    // and suffix them by the namespace.
    if (classMaps.hasOwnProperty(packageName)) {
        const classMap = classMaps[packageName];

        // Replace import { foo, bar } from ...
        Object.keys(classMap).forEach(pkg => {
            const babylonRegex = new RegExp(`import {(.*)} from ['"](${pkg})[\/'"](.*);`, "g");

            let match = babylonRegex.exec(str);
            let classes = new Set();
            while (match != null) {
                if (match[1]) {
                    match[1].split(",").forEach(element => {
                        classes.add(element.trim());
                    });
                }
                match = babylonRegex.exec(str);
            }
            str = str.replace(babylonRegex, '');

            classes.forEach(cls => {
                let className = cls;
                let alias = cls;

                // Deal with import { foo as A, bar as B } from ...
                if (cls.indexOf(" as ") > -1) {
                    const tokens = cls.split(" as ");
                    className = tokens[0];
                    alias = tokens[1];
                }

                // !!! Be carefull
                // Could cause issues if this appears in several import scope
                // with different aliases.
                // !!! Be carefull multiline not managed.
                // False is a special case to remove all the lines.
                if (classMap[pkg] === false) {
                    const rg = new RegExp(`.*[ <]${alias}[^\\w].*`, "g")
                    str = str.replace(rg, "");
                }
                // Else replace with the namespace prefix.
                else {
                    const rg = new RegExp(`([ <])(${alias})([^\\w])`, "g")
                    str = str.replace(rg, `$1${classMap[pkg]}.${className}$3`);
                }
            });
        });

        // Replace import * as ...
        Object.keys(classMap).forEach(pkg => {
            const babylonRegex = new RegExp(`import \\* as (.*) from ['"](${pkg})['"];`, "g");

            const match = babylonRegex.exec(str);
            let localNamespace = "";
            if (match && match[1]) {
                localNamespace = match[1].trim();
                str = str.replace(babylonRegex, '');

                let rg = new RegExp(`([ <])(${localNamespace}.)([A-Za-z])`, "g")
                str = str.replace(rg, `$1${classMap[pkg]}.$3`);
            }
        });
    }

    str = str
        // Clean up named export.
        .replace(/export {(.*)};/g, '')
        // Clean up left import.
        .replace(/import (.*);/g, "")
        // Clean up export * from.
        .split("\n").filter(line => line.trim()).filter(line => line.indexOf("export * from") === -1).join("\n");

    str = cleanEmptyNamespace(str, babylonGlobals[packageName]);

    // Remove empty module declaration of specific modules
    if (moduleSpecifics.hasOwnProperty(packageName)) {
        moduleSpecifics[packageName].forEach(specific => {
            str = cleanEmptyNamespace(str, specific.namespace);
        });
    }

    str = str
        // Remove Empty Lines
        .replace(/^\s*$/gm, "")
        // Remove Inlined Import
        .replace(/import\("[A-Za-z0-9\/]*"\)\./g, "");

    return str;
}

export default function ({ output = 'output.d.ts', name = 'babylonjs' }) {
    const root = __dirname;
    let tsconfig = '';
    let dtsFile = '';

    async function generateBundle () {
        const nsFile = dtsFile.replace('.module', '');

        console.log(`Generating ${path.basename(nsFile)} and ${path.basename(dtsFile)}`);

        const tsc = path.resolve(root, 'node_modules/typescript/bin/tsc');
        await exec(`node ${tsc} --module amd --outFile ${dtsFile} --emitDeclarationOnly true --project ${tsconfig}`);
        const data = await readFile(dtsFile, 'utf8');
        const dts = processAmdDeclarationToModule(data, name);
        const ns = processModuleDeclarationToNamespace(dts, name);

        await Promise.all([
            writeFile(nsFile, ns),
            writeFile(dtsFile, dts + '\n' + ns)
        ])
    }

    function options (opts) {
        const src = path.dirname(opts.input).replace(/\/src/, '');
        tsconfig = path.join(root, src, 'tsconfig.json');
        dtsFile = path.join(root, output);
    }

    return {
        name: 'babylonjs',
        options,
        generateBundle
    }
}
