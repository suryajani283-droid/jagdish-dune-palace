var RUNTIME_PUBLIC_PATH = "server/chunks/ssr/[turbopack]_runtime.js";
var RELATIVE_ROOT_PATH = "..";
var ASSET_PREFIX = "/_next/";
// Apply forwarded globals from workerData if running in a worker thread
if (typeof require !== 'undefined') {
    try {
        var { workerData } = require('worker_threads');
        if (workerData?.__turbopack_globals__) {
            Object.assign(globalThis, workerData.__turbopack_globals__);
            // Remove internal data so it's not visible to user code
            delete workerData.__turbopack_globals__;
        }
    } catch (_) {
        // Not in a worker thread context, ignore
    }
}
/**
 * This file contains runtime types and functions that are shared between all
 * TurboPack ECMAScript runtimes.
 *
 * It will be prepended to the runtime code of each runtime.
 */ /* eslint-disable @typescript-eslint/no-unused-vars */ /// <reference path="./runtime-types.d.ts" />
/// <reference path="./async-module.ts" />
/**
 * Describes why a module was instantiated.
 * Shared between browser and Node.js runtimes.
 */ var SourceType = /*#__PURE__*/ function(SourceType) {
    /**
   * The module was instantiated because it was included in an evaluated chunk's
   * runtime.
   * SourceData is a ChunkPath.
   */ SourceType[SourceType["Runtime"] = 0] = "Runtime";
    /**
   * The module was instantiated because a parent module imported it.
   * SourceData is a ModuleId.
   */ SourceType[SourceType["Parent"] = 1] = "Parent";
    /**
   * The module was instantiated because it was included in a chunk's hot module
   * update.
   * SourceData is an array of ModuleIds or undefined.
   */ SourceType[SourceType["Update"] = 2] = "Update";
    return SourceType;
}(SourceType || {});
/**
 * Flag indicating which module object type to create when a module is merged. Set to `true`
 * by each runtime that uses ModuleWithDirection (browser dev-base.ts, nodejs dev-base.ts,
 * nodejs build-base.ts). Browser production (build-base.ts) leaves it as `false` since it
 * uses plain Module objects.
 */ let createModuleWithDirectionFlag = false;
const REEXPORTED_OBJECTS = new WeakMap();
/**
 * Constructs the `__turbopack_context__` object for a module.
 */ function Context(module, exports) {
    this.m = module;
    // We need to store this here instead of accessing it from the module object to:
    // 1. Make it available to factories directly, since we rewrite `this` to
    //    `__turbopack_context__.e` in CJS modules.
    // 2. Support async modules which rewrite `module.exports` to a promise, so we
    //    can still access the original exports object from functions like
    //    `esmExport`
    // Ideally we could find a new approach for async modules and drop this property altogether.
    this.e = exports;
}
const contextPrototype = Context.prototype;
const hasOwnProperty = Object.prototype.hasOwnProperty;
const toStringTag = typeof Symbol !== 'undefined' && Symbol.toStringTag;
function defineProp(obj, name, options) {
    if (!hasOwnProperty.call(obj, name)) Object.defineProperty(obj, name, options);
}
function getOverwrittenModule(moduleCache, id) {
    let module = moduleCache.get(id);
    if (module === undefined) {
        if (createModuleWithDirectionFlag) {
            // set in development modes for hmr support
            module = createModuleWithDirection(id);
        } else {
            module = createModuleObject(id);
        }
        moduleCache.set(id, module);
    }
    return module;
}
/**
 * Creates the module object. Only done here to ensure all module objects have the same shape.
 */ function createModuleObject(id) {
    return {
        exports: {},
        error: undefined,
        id,
        namespaceObject: undefined
    };
}
function createModuleWithDirection(id) {
    return {
        exports: {},
        error: undefined,
        id,
        namespaceObject: undefined,
        parents: [],
        children: []
    };
}
const BindingTag_Value = 0;
/**
 * Terminates a module's group of entries in an {@link EsmReexports} list.
 */ const REEXPORT_GROUP_END = 0;
/**
 * Adds the getters to the exports object.
 */ function esm(exports, bindings, dynamic) {
    defineProp(exports, '__esModule', {
        value: true
    });
    if (toStringTag) defineProp(exports, toStringTag, {
        value: 'Module'
    });
    let i = 0;
    while(i < bindings.length){
        const propName = bindings[i++];
        const tagOrFunction = bindings[i++];
        if (typeof tagOrFunction === 'number') {
            if (tagOrFunction === BindingTag_Value) {
                defineProp(exports, propName, {
                    value: bindings[i++],
                    enumerable: true,
                    writable: false
                });
            } else {
                throw new Error(`unexpected tag: ${tagOrFunction}`);
            }
        } else {
            const getterFn = tagOrFunction;
            if (typeof bindings[i] === 'function') {
                const setterFn = bindings[i++];
                defineProp(exports, propName, {
                    get: getterFn,
                    set: setterFn,
                    enumerable: true
                });
            } else {
                defineProp(exports, propName, {
                    get: getterFn,
                    enumerable: true
                });
            }
        }
    }
    // The properties defined above are already non-configurable and
    // non-writable, so the namespace's existing exports are effectively
    // immutable. Sealing additionally makes the object non-extensible, matching
    // real ESM-namespace semantics. Modules with dynamic re-exports
    // (`export *` from a CommonJS module) must stay extensible so the dynamic
    // export proxy can surface keys discovered at runtime, so skip the seal for
    // them.
    if (!dynamic) Object.seal(exports);
}
/**
 * Makes the module an ESM with exports
 */ function esmExport(bindings, id, dynamic) {
    let module;
    let exports;
    if (id != null) {
        module = getOverwrittenModule(this.c, id);
        exports = module.exports;
    } else {
        module = this.m;
        exports = this.e;
    }
    module.namespaceObject = exports;
    esm(exports, bindings, dynamic);
}
contextPrototype.s = esmExport;
/**
 * Registers re-exports that all forward to properties of other modules.
 *
 * This is a compact spelling of the pattern
 *
 * ```js
 * var ns = context.i(moduleId)
 * context.s([exportName, () => ns[importedName], ...])
 * ```
 *
 * The list is a flat sequence of groups. Each group starts with the source the exports come from,
 * followed by that group's entries, and is terminated by the `0` sentinel (or the end of the list).
 *
 * The group head is either a **module id**, which is instantiated here:
 *
 * ```js
 * context.S([
 *   76061, 'default', 'f', 'named', 'A', 0,
 *   29842, 'otherModule', 'f',
 * ])
 * ```
 *
 * or the **namespace value** of a module that has already been imported, which is used directly:
 *
 * ```js
 * var ns1 = context.i(76061)
 * context.S([ns1, 'default', 'f', 'named', 'A'])
 * ```
 *
 * The producer picks the namespace form when it has generated the import anyway -- because some
 * later import must not be reordered past it -- so nothing is instantiated twice. The two are told
 * apart by type: a module id is always a string or number. A CommonJS function export produces a
 * callable namespace value, so namespace heads can be functions as well as objects.
 *
 * Entries are `exportName, importedName` pairs, except when a group holds exactly one string. That
 * string is then a comma-joined list of the same pairs, which saves the repeated quoting:
 *
 * ```js
 * context.S([
 *   76061, 'default,f,named,A', 0,
 *   29842, 'otherModule,f',
 * ])
 * ```
 *
 * The producer picks that spelling independently for each group whose names contain no commas,
 * since that group's names are recovered by splitting on them.
 *
 * Groups whose head is a module id are instantiated in list order, at the point where the call
 * appears, so the producer must not merge such a group across an import of another module. The
 * destination reuses a source data value or getter descriptor when one exists, falling back to a
 * wrapper getter for dynamic/proxy/inherited properties.
 *
 * `id` names the module the exports belong to when this module was merged into a scope-hoisting
 * group, exactly as it does for {@link EsmExport}.
 *
 * Only the source descriptor's payload (value or getter) is reused. {@link esm} still defines a
 * fresh enumerable, non-configurable destination property, and no source setter is ever forwarded.
 */ function esmReexport(list, id) {
    const bindings = [];
    let i = 0;
    while(i < list.length){
        const head = list[i++];
        const start = i;
        while(i < list.length && list[i] !== REEXPORT_GROUP_END)i++;
        const end = i;
        // Skip the sentinel, if this group was terminated by one rather than by the end of the list.
        i++;
        // Module ids are always strings or numbers. Other values are already-imported namespaces;
        // notably, interop with a CommonJS function export produces a callable namespace function.
        // `esmImport` may return a promise for an async module, but re-exports of async modules keep
        // going through `context.s`, so the producer never routes them here and this stays synchronous.
        const namespace = typeof head === 'string' || typeof head === 'number' ? esmImport.call(this, head) : head;
        if (end - start === 1) {
            const pairs = list[start].split(',');
            for(let j = 0; j < pairs.length; j += 2){
                appendReexportBinding(bindings, pairs[j], namespace, pairs[j + 1]);
            }
        } else {
            for(let j = start; j < end; j += 2){
                appendReexportBinding(bindings, list[j], namespace, list[j + 1]);
            }
        }
    }
    esmExport.call(this, bindings, id);
}
contextPrototype.S = esmReexport;
function appendReexportBinding(bindings, exportedName, namespace, importedName) {
    const descriptor = Reflect.getOwnPropertyDescriptor(namespace, importedName);
    if (descriptor) {
        if ('value' in descriptor) {
            // Code generation only routes immutable imported bindings through this helper, so a data
            // descriptor is a constant export and can be captured once.
            bindings.push(exportedName, BindingTag_Value, descriptor.value);
            return;
        }
        if (descriptor.get) {
            // Accessors remain live by reusing the source getter. `esmReexport` is only called by
            // generated code: every group head is either produced by
            // `this.i` or is the namespace variable from a generated `this.i` call. Every getter on such
            // a namespace is receiver-independent: ESM bindings are compiler-generated arrow functions,
            // and the CommonJS/dynamic-namespace paths create arrows in `createGetter` and
            // `getOwnPropertyDescriptor`. The destination can therefore reuse the exact function instead
            // of allocating another wrapper getter.
            bindings.push(exportedName, descriptor.get);
            return;
        }
    }
    // Dynamic/proxy/inherited CommonJS edge cases may not expose a usable own descriptor.
    bindings.push(exportedName, ()=>namespace[importedName]);
}
function ensureDynamicExports(module, exports) {
    let reexportedObjects = REEXPORTED_OBJECTS.get(module);
    if (!reexportedObjects) {
        REEXPORTED_OBJECTS.set(module, reexportedObjects = []);
        // Returns the re-exported object that provides `prop` as an own property,
        // or `undefined` if none does. The traps share this logic so they always
        // agree on which keys are synthesized from `reexportedObjects`. `default`
        // is never re-exported by `export *`, so it is never synthesized.
        const reexportOwning = (prop)=>{
            if (prop !== 'default') {
                for (const obj of reexportedObjects){
                    if (hasOwnProperty.call(obj, prop)) return obj;
                }
            }
            return undefined;
        };
        // Modules with dynamic re-exports are not sealed by `esm()`, so the
        // target beneath the namespace stays extensible. That is what lets the
        // `ownKeys` and `getOwnPropertyDescriptor` traps legally report keys that
        // exist on `reexportedObjects` but not on the target itself.
        module.exports = module.namespaceObject = new Proxy(exports, {
            get (target, prop) {
                if (hasOwnProperty.call(target, prop) || prop === 'default' || prop === '__esModule') {
                    return Reflect.get(target, prop);
                }
                const obj = reexportOwning(prop);
                return obj && Reflect.get(obj, prop);
            },
            // The namespace is read-only, like a real esm namespace object. The
            // re-exported modules can still mutate their own exports (exposed live
            // via `get`), but mutating the namespace itself is rejected. Refusing
            // here, rather than forwarding to the extensible target, also prevents an
            // assignment/definition from shadowing a dynamic re-export. It also
            // prevents delete from removing a static export.
            set () {
                return false;
            },
            defineProperty () {
                return false;
            },
            deleteProperty () {
                return false;
            },
            // The `has` trap ensures that `'exportName' in starImports` will reflect
            // the truth of whether a key is exported.
            has (target, prop) {
                if (Reflect.has(target, prop)) return true;
                if (prop === 'default' || prop === '__esModule') return false;
                return reexportOwning(prop) !== undefined;
            },
            // ownKeys and getOwnPropertyDescriptor together make the keys enumerable.
            // If a value is returned from `ownKeys` but its property descriptor is
            // not enumerable, it will not be visible to iterator methods.
            // Collectively, they allow code like the following:
            //
            // ```
            // // module.js re-exports dynamic CJS exports
            // export * from './legacyModule.cjs'
            //
            // // from another JS file, reference the re-exported dynamic values
            // import * as Namespace from './module.js'
            // Object.keys(Namespace)
            // ```
            ownKeys (target) {
                const keys = Reflect.ownKeys(target);
                for (const obj of reexportedObjects){
                    for (const key of Reflect.ownKeys(obj)){
                        if (key !== 'default' && !keys.includes(key)) keys.push(key);
                    }
                }
                return keys;
            },
            getOwnPropertyDescriptor (target, prop) {
                const own = Reflect.getOwnPropertyDescriptor(target, prop);
                if (own || prop === 'default' || prop === '__esModule') return own;
                const obj = reexportOwning(prop);
                if (obj) {
                    // Synthetic keys don't exist on the target, so they MUST be
                    // reported as configurable. However the set/delete traps above will
                    // prevent them from actually being changed
                    return {
                        enumerable: true,
                        configurable: true,
                        get: ()=>Reflect.get(obj, prop)
                    };
                }
                return undefined;
            }
        });
    }
    return reexportedObjects;
}
/**
 * Dynamically exports properties from an object
 */ function dynamicExport(object, id) {
    let module;
    let exports;
    if (id != null) {
        module = getOverwrittenModule(this.c, id);
        exports = module.exports;
    } else {
        module = this.m;
        exports = this.e;
    }
    const reexportedObjects = ensureDynamicExports(module, exports);
    if (typeof object === 'object' && object !== null) {
        reexportedObjects.push(object);
    }
}
contextPrototype.j = dynamicExport;
function exportValue(value, id) {
    let module;
    if (id != null) {
        module = getOverwrittenModule(this.c, id);
    } else {
        module = this.m;
    }
    module.exports = value;
}
contextPrototype.v = exportValue;
function exportNamespace(namespace, id) {
    let module;
    if (id != null) {
        module = getOverwrittenModule(this.c, id);
    } else {
        module = this.m;
    }
    module.exports = module.namespaceObject = namespace;
}
contextPrototype.n = exportNamespace;
function createGetter(obj, key) {
    return ()=>obj[key];
}
/**
 * @returns prototype of the object
 */ const getProto = Object.getPrototypeOf ? (obj)=>Object.getPrototypeOf(obj) : (obj)=>obj.__proto__;
/** Prototypes that are not expanded for exports */ const LEAF_PROTOTYPES = [
    null,
    getProto({}),
    getProto([]),
    getProto(getProto)
];
/**
 * @param raw
 * @param ns
 * @param allowExportDefault
 *   * `false`: will have the raw module as default export
 *   * `true`: will have the default property as default export
 */ function interopEsm(raw, ns, allowExportDefault) {
    const bindings = [];
    let defaultLocation = -1;
    for(let current = raw; (typeof current === 'object' || typeof current === 'function') && !LEAF_PROTOTYPES.includes(current); current = getProto(current)){
        for (const key of Object.getOwnPropertyNames(current)){
            bindings.push(key, createGetter(raw, key));
            if (defaultLocation === -1 && key === 'default') {
                defaultLocation = bindings.length - 1;
            }
        }
    }
    // this is not really correct
    // we should set the `default` getter if the imported module is a `.cjs file`
    if (!(allowExportDefault && defaultLocation >= 0)) {
        // Replace the binding with one for the namespace itself in order to preserve iteration order.
        if (defaultLocation >= 0) {
            // Replace the getter with the value
            bindings.splice(defaultLocation, 1, BindingTag_Value, raw);
        } else {
            bindings.push('default', BindingTag_Value, raw);
        }
    }
    esm(ns, bindings);
    return ns;
}
function createNS(raw) {
    if (typeof raw === 'function') {
        return function(...args) {
            return raw.apply(this, args);
        };
    } else {
        return Object.create(null);
    }
}
function esmImport(id) {
    const module = getOrInstantiateModuleFromParent(id, this.m);
    // any ES module has to have `module.namespaceObject` defined.
    if (module.namespaceObject) return module.namespaceObject;
    // only ESM can be an async module, so we don't need to worry about exports being a promise here.
    const raw = module.exports;
    return module.namespaceObject = interopEsm(raw, createNS(raw), raw && raw.__esModule);
}
contextPrototype.i = esmImport;
function asyncLoader(moduleId) {
    const loader = this.r(moduleId);
    return loader(esmImport.bind(this));
}
contextPrototype.A = asyncLoader;
// Add a simple runtime require so that environments without one can still pass
// `typeof require` CommonJS checks so that exports are correctly registered.
const runtimeRequire = // @ts-ignore
typeof require === 'function' ? require : function require1() {
    throw new Error('Unexpected use of runtime require');
};
contextPrototype.t = runtimeRequire;
function commonJsRequire(id) {
    return getOrInstantiateModuleFromParent(id, this.m).exports;
}
contextPrototype.r = commonJsRequire;
/**
 * Remove fragments and query parameters since they are never part of the context map keys
 *
 * This matches how we parse patterns at resolving time.  Arguably we should only do this for
 * strings passed to `import` but the resolve does it for `import` and `require` and so we do
 * here as well.
 */ function parseRequest(request) {
    // Per the URI spec fragments can contain `?` characters, so we should trim it off first
    // https://datatracker.ietf.org/doc/html/rfc3986#section-3.5
    const hashIndex = request.indexOf('#');
    if (hashIndex !== -1) {
        request = request.substring(0, hashIndex);
    }
    const queryIndex = request.indexOf('?');
    if (queryIndex !== -1) {
        request = request.substring(0, queryIndex);
    }
    return request;
}
/**
 * `require.context` and require/import expression runtime.
 */ function moduleContext(map) {
    function moduleContext(id) {
        id = parseRequest(id);
        if (hasOwnProperty.call(map, id)) {
            return map[id].module();
        }
        const e = new Error(`Cannot find module '${id}'`);
        e.code = 'MODULE_NOT_FOUND';
        throw e;
    }
    moduleContext.keys = ()=>{
        return Object.keys(map);
    };
    moduleContext.resolve = (id)=>{
        id = parseRequest(id);
        if (hasOwnProperty.call(map, id)) {
            return map[id].id();
        }
        const e = new Error(`Cannot find module '${id}'`);
        e.code = 'MODULE_NOT_FOUND';
        throw e;
    };
    moduleContext.import = async (id)=>{
        return await moduleContext(id);
    };
    return moduleContext;
}
contextPrototype.f = moduleContext;
/**
 * Returns the path of a chunk defined by its data.
 */ function getChunkPath(chunkData) {
    return typeof chunkData === 'string' ? chunkData : chunkData.path;
}
// Load the CompressedModuleFactories of a chunk into the `moduleFactories` Map.
// The flat format alternates one or more module IDs with their factory function.
// Strict factories can be prepended as a nested array.
function installCompressedModuleFactories(chunkModules, offset, moduleFactories, newModuleId) {
    let i = offset;
    const strictFactories = chunkModules[i];
    if (Array.isArray(strictFactories)) {
        installCompressedModuleFactories(strictFactories, 0, moduleFactories, newModuleId);
        i++;
    }
    while(i < chunkModules.length){
        let end = i + 1;
        // Find our factory function
        while(end < chunkModules.length && typeof chunkModules[end] !== 'function'){
            end++;
        }
        if (end === chunkModules.length) {
            throw new Error('malformed chunk format, expected a factory function');
        }
        // Install the factory for each module ID that doesn't already have one.
        // When some IDs in this group already have a factory, reuse that existing
        // group factory for the missing IDs to keep all IDs in the group consistent.
        // Otherwise, install the factory from this chunk.
        const moduleFactoryFn = chunkModules[end];
        let existingGroupFactory = undefined;
        for(let j = i; j < end; j++){
            const id = chunkModules[j];
            const existingFactory = moduleFactories.get(id);
            if (existingFactory) {
                existingGroupFactory = existingFactory;
                break;
            }
        }
        const factoryToInstall = existingGroupFactory ?? moduleFactoryFn;
        let didInstallFactory = false;
        for(let j = i; j < end; j++){
            const id = chunkModules[j];
            if (!moduleFactories.has(id)) {
                if (!didInstallFactory) {
                    if (factoryToInstall === moduleFactoryFn) {
                        applyModuleFactoryName(moduleFactoryFn);
                    }
                    didInstallFactory = true;
                }
                moduleFactories.set(id, factoryToInstall);
                newModuleId?.(id);
            }
        }
        i = end + 1;
    }
}
/**
 * A pseudo "fake" URL object to resolve to its relative path.
 *
 * When UrlRewriteBehavior is set to relative, calls to the `new URL()` will construct url without base using this
 * runtime function to generate context-agnostic urls between different rendering context, i.e ssr / client to avoid
 * hydration mismatch.
 *
 * This is based on webpack's existing implementation:
 * https://github.com/webpack/webpack/blob/87660921808566ef3b8796f8df61bd79fc026108/lib/runtime/RelativeUrlRuntimeModule.js
 */ const relativeURL = function relativeURL(inputUrl) {
    const realUrl = new URL(inputUrl, 'x:/');
    const values = {};
    for(const key in realUrl)values[key] = realUrl[key];
    values.href = inputUrl;
    values.pathname = inputUrl.replace(/[?#].*/, '');
    values.origin = values.protocol = '';
    values.toString = values.toJSON = (..._args)=>inputUrl;
    for(const key in values)Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        value: values[key]
    });
};
relativeURL.prototype = URL.prototype;
contextPrototype.U = relativeURL;
/**
 * Utility function to ensure all variants of an enum are handled.
 */ function invariant(never, computeMessage) {
    throw new Error(`Invariant: ${computeMessage(never)}`);
}
/**
 * Constructs an error message for when a module factory is not available.
 */ function factoryNotAvailableMessage(moduleId, sourceType, sourceData) {
    let instantiationReason;
    switch(sourceType){
        case 0:
            instantiationReason = `as a runtime entry of chunk ${sourceData}`;
            break;
        case 1:
            instantiationReason = `because it was required from module ${sourceData}`;
            break;
        case 2:
            instantiationReason = 'because of an HMR update';
            break;
        default:
            invariant(sourceType, (sourceType)=>`Unknown source type: ${sourceType}`);
    }
    return `Module ${moduleId} was instantiated ${instantiationReason}, but the module factory is not available.`;
}
/**
 * Returns a `file://` URL under a synthetic directory named after `root`
 * (`ROOT` for the project root), for when the real filesystem path is unknown.
 * The root name and path segments are percent-encoded so the result is always
 * a valid file URI.
 */ function placeholderFileUrl(modulePath, root) {
    return `file:///${encodeURIComponent(root ?? 'ROOT')}/${modulePath.split('/').map(encodeURIComponent).join('/')}`;
}
/**
 * A stub function to make `require` available but non-functional in ESM.
 */ function requireStub(_moduleId) {
    throw new Error('dynamic usage of require is not supported');
}
contextPrototype.z = requireStub;
// Make `globalThis` available to the module in a way that cannot be shadowed by a local variable.
contextPrototype.g = globalThis;
function applyModuleFactoryName(factory) {
    // Give the module factory a nice name to improve stack traces.
    Object.defineProperty(factory, 'name', {
        value: 'module evaluation'
    });
}
/// <reference path="../shared/runtime/runtime-utils.ts" />
/// A 'base' utilities to support runtime can have externals.
/// Currently this is for node.js / edge runtime both.
/// If a fn requires node.js specific behavior, it should be placed in `node-external-utils` instead.
async function externalImport(id) {
    let raw;
    try {
        switch (id) {
  case "next/dist/compiled/@vercel/og/index.node.js":
    raw = await import("next/dist/compiled/@vercel/og/index.edge.js");
    break;
  default:
    raw = await import(id);
};
    } catch (err) {
        // TODO(alexkirsz) This can happen when a client-side module tries to load
        // an external module we don't provide a shim for (e.g. querystring, url).
        // For now, we fail semi-silently, but in the future this should be a
        // compilation error.
        throw new Error(`Failed to load external module ${id}: ${err}`);
    }
    if (raw && raw.__esModule && raw.default && 'default' in raw.default) {
        return interopEsm(raw.default, createNS(raw), true);
    }
    return raw;
}
contextPrototype.y = externalImport;
function externalRequire(id, thunk, esm = false) {
    let raw;
    try {
        raw = thunk();
    } catch (err) {
        // TODO(alexkirsz) This can happen when a client-side module tries to load
        // an external module we don't provide a shim for (e.g. querystring, url).
        // For now, we fail semi-silently, but in the future this should be a
        // compilation error.
        throw new Error(`Failed to load external module ${id}: ${err}`);
    }
    if (!esm || raw.__esModule) {
        return raw;
    }
    return interopEsm(raw, createNS(raw), true);
}
externalRequire.resolve = (id, options)=>{
    return require.resolve(id, options);
};
contextPrototype.x = externalRequire;
/* eslint-disable @typescript-eslint/no-unused-vars */ const path = require('path');
const relativePathToRuntimeRoot = path.relative(RUNTIME_PUBLIC_PATH, '.');
// Compute the relative path to the `distDir`.
const relativePathToDistRoot = path.join(relativePathToRuntimeRoot, RELATIVE_ROOT_PATH);
const RUNTIME_ROOT = path.resolve(__filename, relativePathToRuntimeRoot);
// Compute the absolute path to the root, by stripping distDir from the absolute path to this file.
const ABSOLUTE_ROOT = path.resolve(__filename, relativePathToDistRoot);
/**
 * Returns an absolute path to the given module path.
 * Module path should be relative, either path to a file or a directory.
 *
 * This fn allows to calculate an absolute path for some global static values, such as
 * `__dirname` or `import.meta.url` that Turbopack will not embeds in compile time.
 * See ImportMetaBinding::code_generation for the usage.
 */ function resolveAbsolutePath(modulePath) {
    if (modulePath) {
        return path.join(ABSOLUTE_ROOT, modulePath);
    }
    return ABSOLUTE_ROOT;
}
Context.prototype.P = resolveAbsolutePath;
/**
 * Returns an absolute `file://` URL for the given module path, which is
 * relative to the project root or the named `root`.
 *
 * Uses `url.pathToFileURL` so that the resulting URL is a valid file URI on
 * all platforms (forward slashes on Windows, drive letters handled
 * correctly, path segments URL-encoded).
 *
 * The location of a named `root` isn't known at runtime (the output may have
 * been moved away from the sources), so this returns a placeholder URL for it.
 */ function resolveFileUrl(modulePath, root) {
    if (root !== undefined) {
        return placeholderFileUrl(modulePath, root);
    }
    return require('url').pathToFileURL(resolveAbsolutePath(modulePath)).href;
}
Context.prototype.F = resolveFileUrl;
/* eslint-disable @typescript-eslint/no-unused-vars */ /// <reference path="../../shared/runtime/runtime-utils.ts" />
/// <reference path="../../shared-node/base-externals-utils.ts" />
/// <reference path="../../shared-node/node-externals-utils.ts" />
/// <reference path="./nodejs-globals.d.ts" />
/**
 * Base Node.js runtime shared between production and development.
 * Contains chunk loading, module caching, and other non-HMR functionality.
 */ process.env.TURBOPACK = '1';
const url = require('url');
const moduleFactories = new Map();
const moduleCache = new Map();
/**
 * Returns an absolute path to the given module's id.
 */ function resolvePathFromModule(moduleId) {
    const exported = this.r(moduleId);
    const exportedPath = exported?.default ?? exported;
    if (typeof exportedPath !== 'string') {
        return exported;
    }
    const strippedAssetPrefix = exportedPath.slice(ASSET_PREFIX.length);
    const resolved = path.resolve(RUNTIME_ROOT, strippedAssetPrefix);
    return url.pathToFileURL(resolved).href;
}
/**
 * Exports a URL value. No suffix is added in Node.js runtime.
 */ function exportUrl(urlValue, id) {
    exportValue.call(this, urlValue, id);
}
function loadRuntimeChunk(sourcePath, chunkData) {
    if (typeof chunkData === 'string') {
        loadRuntimeChunkPath(sourcePath, chunkData);
    } else {
        loadRuntimeChunkPath(sourcePath, chunkData.path);
    }
}
const loadedChunks = new Set();
const unsupportedLoadChunk = Promise.resolve(undefined);
const loadedChunk = Promise.resolve(undefined);
const chunkCache = new Map();
function clearChunkCache() {
    chunkCache.clear();
    loadedChunks.clear();
}
function loadRuntimeChunkPath(sourcePath, chunkPath) {
    if (!isJs(chunkPath)) {
        // We only support loading JS chunks in Node.js.
        // This branch can be hit when trying to load a CSS chunk.
        return;
    }
    if (loadedChunks.has(chunkPath)) {
        return;
    }
    try {
        const resolved = path.resolve(RUNTIME_ROOT, chunkPath);
        const chunkModules = requireChunk(chunkPath);
        installCompressedModuleFactories(chunkModules, 0, moduleFactories);
        loadedChunks.add(chunkPath);
    } catch (cause) {
        let errorMessage = `Failed to load chunk ${chunkPath}`;
        if (sourcePath) {
            errorMessage += ` from runtime for chunk ${sourcePath}`;
        }
        const error = new Error(errorMessage, {
            cause
        });
        error.name = 'ChunkLoadError';
        throw error;
    }
}
function loadChunkAsync(chunkData) {
    const chunkPath = typeof chunkData === 'string' ? chunkData : chunkData.path;
    if (!isJs(chunkPath)) {
        // We only support loading JS chunks in Node.js.
        // This branch can be hit when trying to load a CSS chunk.
        return unsupportedLoadChunk;
    }
    let entry = chunkCache.get(chunkPath);
    if (entry === undefined) {
        try {
            // resolve to an absolute path to simplify `require` handling
            const resolved = path.resolve(RUNTIME_ROOT, chunkPath);
            // TODO: consider switching to `import()` to enable concurrent chunk loading and async file io
            // However this is incompatible with hot reloading (since `import` doesn't use the require cache)
            const chunkModules = requireChunk(chunkPath);
            installCompressedModuleFactories(chunkModules, 0, moduleFactories);
            entry = loadedChunk;
        } catch (cause) {
            const errorMessage = `Failed to load chunk ${chunkPath} from module ${this.m.id}`;
            const error = new Error(errorMessage, {
                cause
            });
            error.name = 'ChunkLoadError';
            // Cache the failure promise, future requests will also get this same rejection
            entry = Promise.reject(error);
        }
        chunkCache.set(chunkPath, entry);
    }
    // TODO: Return an instrumented Promise that React can use instead of relying on referential equality.
    return entry;
}
contextPrototype.l = loadChunkAsync;
function loadChunkAsyncByUrl(chunkUrl) {
    const path1 = url.fileURLToPath(new URL(chunkUrl, RUNTIME_ROOT));
    return loadChunkAsync.call(this, path1);
}
contextPrototype.L = loadChunkAsyncByUrl;
// Shared runtime primitive: the root that on-disk chunk paths are resolved
// against. Used by the bundled wasm helper (exposed as `__turbopack_runtime_root__`).
contextPrototype.w = RUNTIME_ROOT;
const regexJsUrl = /\.js(?:\?[^#]*)?(?:#.*)?$/;
/**
 * Checks if a given path/URL ends with .js, optionally followed by ?query or #fragment.
 */ function isJs(chunkUrlOrPath) {
    return regexJsUrl.test(chunkUrlOrPath);
}
/* eslint-disable @typescript-eslint/no-unused-vars */ /// <reference path="./runtime-base.ts" />
/**
 * Production Node.js runtime.
 * Uses ModuleWithDirection and simple module instantiation without HMR support.
 */ // moduleCache and moduleFactories are declared in runtime-base.ts
// this is read in runtime-utils.ts so it creates a module with direction for hmr
createModuleWithDirectionFlag = true;
const nodeContextPrototype = Context.prototype;
nodeContextPrototype.q = exportUrl;
nodeContextPrototype.M = moduleFactories;
// Cast moduleCache to ModuleWithDirection for production mode
nodeContextPrototype.c = moduleCache;
nodeContextPrototype.R = resolvePathFromModule;
nodeContextPrototype.C = clearChunkCache;
function instantiateModule(id, sourceType, sourceData) {
    const moduleFactory = moduleFactories.get(id);
    if (typeof moduleFactory !== 'function') {
        // This can happen if modules incorrectly handle HMR disposes/updates,
        // e.g. when they keep a `setTimeout` around which still executes old code
        // and contains e.g. a `require("something")` call.
        throw new Error(factoryNotAvailableMessage(id, sourceType, sourceData));
    }
    const module1 = createModuleWithDirection(id);
    const exports = module1.exports;
    moduleCache.set(id, module1);
    const context = new Context(module1, exports);
    // NOTE(alexkirsz) This can fail when the module encounters a runtime error.
    try {
        moduleFactory(context, module1, exports);
    } catch (error) {
        module1.error = error;
        throw error;
    }
    ;
    module1.loaded = true;
    if (module1.namespaceObject && module1.exports !== module1.namespaceObject) {
        // in case of a circular dependency: cjs1 -> esm2 -> cjs1
        interopEsm(module1.exports, module1.namespaceObject);
    }
    return module1;
}
/**
 * Retrieves a module from the cache, or instantiate it if it is not cached.
 */ // @ts-ignore
function getOrInstantiateModuleFromParent(id, sourceModule) {
    const module1 = moduleCache.get(id);
    if (module1) {
        if (module1.error) {
            throw module1.error;
        }
        return module1;
    }
    return instantiateModule(id, SourceType.Parent, sourceModule.id);
}
/**
 * Instantiates a runtime module.
 */ function instantiateRuntimeModule(chunkPath, moduleId) {
    return instantiateModule(moduleId, SourceType.Runtime, chunkPath);
}
/**
 * Retrieves a module from the cache, or instantiate it as a runtime module if it is not cached.
 */ // @ts-ignore TypeScript doesn't separate this module space from the browser runtime
function getOrInstantiateRuntimeModule(chunkPath, moduleId) {
    const module1 = moduleCache.get(moduleId);
    if (module1) {
        if (module1.error) {
            throw module1.error;
        }
        return module1;
    }
    return instantiateRuntimeModule(chunkPath, moduleId);
}
module.exports = (sourcePath)=>({
        m: (id)=>getOrInstantiateRuntimeModule(sourcePath, id),
        c: (chunkData)=>loadRuntimeChunk(sourcePath, chunkData)
    });


//# sourceMappingURL=%5Bturbopack%5D_runtime.js.map

  function requireChunk(chunkPath) {
    switch(chunkPath) {
      case "server/chunks/ssr/[root-of-the-server]__02_fb65cn14-y._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__02_fb65cn14-y._.js");
      case "server/chunks/ssr/[root-of-the-server]__0rido5v19-m0u._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0rido5v19-m0u._.js");
      case "server/chunks/ssr/[root-of-the-server]__1urlr0jotwv-h._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1urlr0jotwv-h._.js");
      case "server/chunks/ssr/[turbopack]_runtime.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[turbopack]_runtime.js");
      case "server/chunks/ssr/_next-internal_server_app__not-found_page_actions_0pt47yrisjoev.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app__not-found_page_actions_0pt47yrisjoev.js");
      case "server/chunks/ssr/node_modules_1rlxdoxv0hxj9._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_1rlxdoxv0hxj9._.js");
      case "server/chunks/ssr/node_modules_next_dist_0ibikx4ugn4wu._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_0ibikx4ugn4wu._.js");
      case "server/chunks/ssr/node_modules_next_dist_0janj0i6dqko7._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_0janj0i6dqko7._.js");
      case "server/chunks/ssr/node_modules_next_dist_0jq_uwyw142gj._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_0jq_uwyw142gj._.js");
      case "server/chunks/ssr/node_modules_next_dist_1dupwucoqt5qm._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_1dupwucoqt5qm._.js");
      case "server/chunks/ssr/node_modules_next_dist_client_components_0bew68i643j53._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_client_components_0bew68i643j53._.js");
      case "server/chunks/ssr/node_modules_next_dist_client_components_0wpq8j32_ibz4._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_client_components_0wpq8j32_ibz4._.js");
      case "server/chunks/ssr/node_modules_next_dist_client_components_builtin_forbidden_0symwr9mbf-fh.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_client_components_builtin_forbidden_0symwr9mbf-fh.js");
      case "server/chunks/ssr/node_modules_next_dist_client_components_builtin_unauthorized_0l_sp0xky89qu.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_client_components_builtin_unauthorized_0l_sp0xky89qu.js");
      case "server/chunks/ssr/node_modules_next_dist_compiled_@edge-runtime_cookies_index_1kiz_an963mbg.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_compiled_@edge-runtime_cookies_index_1kiz_an963mbg.js");
      case "server/chunks/ssr/node_modules_next_dist_compiled_@opentelemetry_api_index_1oy1nwhip-98t.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_compiled_@opentelemetry_api_index_1oy1nwhip-98t.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0048lj3x5xrfs.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0048lj3x5xrfs.js");
      case "server/chunks/ssr/[root-of-the-server]__0_c4u070xe4a8._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0_c4u070xe4a8._.js");
      case "server/chunks/ssr/_04rzwcvwaw_8f._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_04rzwcvwaw_8f._.js");
      case "server/chunks/ssr/_1qh73zcn7oskw._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_1qh73zcn7oskw._.js");
      case "server/chunks/ssr/_next-internal_server_app_about_page_actions_0xvgj076vz0b3.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_about_page_actions_0xvgj076vz0b3.js");
      case "server/chunks/ssr/components_1u3ydtjmk4_ru._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/components_1u3ydtjmk4_ru._.js");
      case "server/chunks/ssr/components_Navbar_tsx_0v1fua9bfru6q._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/components_Navbar_tsx_0v1fua9bfru6q._.js");
      case "server/chunks/ssr/node_modules_1vvjy_wyqr164._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_1vvjy_wyqr164._.js");
      case "server/chunks/ssr/node_modules_next_dist_02bgybbfs4pls._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_02bgybbfs4pls._.js");
      case "server/chunks/ssr/node_modules_next_dist_19r-juqja1ice._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_19r-juqja1ice._.js");
      case "server/chunks/ssr/node_modules_next_dist_1c5t_vsn6u8fr._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_1c5t_vsn6u8fr._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1nmkmokwbpn51.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1nmkmokwbpn51.js");
      case "server/chunks/ssr/node_modules_next_dist_shared_lib_0ys5l-jfa2igs._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_shared_lib_0ys5l-jfa2igs._.js");
      case "server/chunks/ssr/[root-of-the-server]__0ak3t-72c1ky7._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0ak3t-72c1ky7._.js");
      case "server/chunks/ssr/[root-of-the-server]__0p9erv1idgc60._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0p9erv1idgc60._.js");
      case "server/chunks/ssr/[root-of-the-server]__1tvs_pn0qwv0s._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1tvs_pn0qwv0s._.js");
      case "server/chunks/ssr/_20wbsln3xgl4f._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_20wbsln3xgl4f._.js");
      case "server/chunks/ssr/app_admin_bookings_actions_ts_01qtpjcol3euv._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/app_admin_bookings_actions_ts_01qtpjcol3euv._.js");
      case "server/chunks/ssr/app_admin_bookings_new_page_tsx_1t7dl6cjzm3jo._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/app_admin_bookings_new_page_tsx_1t7dl6cjzm3jo._.js");
      case "server/chunks/ssr/app_admin_layout_tsx_1moen812b-ruj._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/app_admin_layout_tsx_1moen812b-ruj._.js");
      case "server/chunks/ssr/node_modules_@supabase_supabase-js_dist_index_mjs_087pi7gvho4jt._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@supabase_supabase-js_dist_index_mjs_087pi7gvho4jt._.js");
      case "server/chunks/ssr/node_modules_@swc_helpers_cjs__interop_require_wildcard_cjs_0t5jqoon1y3z0._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_@swc_helpers_cjs__interop_require_wildcard_cjs_0t5jqoon1y3z0._.js");
      case "server/chunks/ssr/node_modules_next_0xfzdls_z8cy3._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_0xfzdls_z8cy3._.js");
      case "server/chunks/ssr/node_modules_next_dist_0uz4cbaeldr3g._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_0uz4cbaeldr3g._.js");
      case "server/chunks/ssr/node_modules_next_dist_158jo-9mwvgad._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_158jo-9mwvgad._.js");
      case "server/chunks/ssr/node_modules_next_dist_1et9oq9q9-y3v._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_1et9oq9q9-y3v._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0ekhvlu6gu0im.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0ekhvlu6gu0im.js");
      case "server/chunks/ssr/[root-of-the-server]__0p33fl2yfvxcq._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0p33fl2yfvxcq._.js");
      case "server/chunks/ssr/[root-of-the-server]__17rsq2l73vlrk._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__17rsq2l73vlrk._.js");
      case "server/chunks/ssr/_1mux4iedps2t9._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_1mux4iedps2t9._.js");
      case "server/chunks/ssr/node_modules_next_1fo4q8sh8vt93._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_1fo4q8sh8vt93._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0tvxp8wpv-a61.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0tvxp8wpv-a61.js");
      case "server/chunks/ssr/[root-of-the-server]__1c4a9i27vn-mg._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1c4a9i27vn-mg._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_bookings_[id]_invoice_page_actions_1fq-avznj5z97.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_bookings_[id]_invoice_page_actions_1fq-avznj5z97.js");
      case "server/chunks/ssr/app_admin_bookings_[id]_invoice_page_tsx_106cutk2t1f6o._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/app_admin_bookings_[id]_invoice_page_tsx_106cutk2t1f6o._.js");
      case "server/chunks/ssr/components_PrintButton_tsx_20vtffkw5p78c._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/components_PrintButton_tsx_20vtffkw5p78c._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_014tmt3yzw3k5.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_014tmt3yzw3k5.js");
      case "server/chunks/ssr/[root-of-the-server]__1mddyegntps-6._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1mddyegntps-6._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_dashboard_page_actions_1fa04hu28296z.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_dashboard_page_actions_1fa04hu28296z.js");
      case "server/chunks/ssr/app_admin_dashboard_page_tsx_1m-d2ssmfijvf._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/app_admin_dashboard_page_tsx_1m-d2ssmfijvf._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1ty6lqgw1xqql.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1ty6lqgw1xqql.js");
      case "server/chunks/ssr/[root-of-the-server]__07lc4ndug23f2._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__07lc4ndug23f2._.js");
      case "server/chunks/ssr/[root-of-the-server]__0s296-xr8sjoi._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0s296-xr8sjoi._.js");
      case "server/chunks/ssr/app_admin_expenses_page_tsx_1bvvf2thr47i4._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/app_admin_expenses_page_tsx_1bvvf2thr47i4._.js");
      case "server/chunks/ssr/components_0v-wjgpt0g96u._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/components_0v-wjgpt0g96u._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0kfhovu__3mhl.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0kfhovu__3mhl.js");
      case "server/chunks/ssr/1cd__build_webpack_loaders_next-flight-loader_action-client-wrapper_1gvsork60blv_.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/1cd__build_webpack_loaders_next-flight-loader_action-client-wrapper_1gvsork60blv_.js");
      case "server/chunks/ssr/[root-of-the-server]__0-p89t7eob-7h._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0-p89t7eob-7h._.js");
      case "server/chunks/ssr/[root-of-the-server]__1x9z9p9loy9s1._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1x9z9p9loy9s1._.js");
      case "server/chunks/ssr/components_0r8m29tam6897._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/components_0r8m29tam6897._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1l7rw7vy3evyi.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1l7rw7vy3evyi.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_guests_page_actions_0jq0lhe5gh5o6.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_guests_page_actions_0jq0lhe5gh5o6.js");
      case "server/chunks/ssr/app_admin_guests_page_tsx_1qzsop8k7p_bp._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/app_admin_guests_page_tsx_1qzsop8k7p_bp._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1wuf_wy29qucx.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1wuf_wy29qucx.js");
      case "server/chunks/ssr/[root-of-the-server]__06z96n29ez0l6._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__06z96n29ez0l6._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_invoices_page_actions_0nkhp615qzfoq.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_invoices_page_actions_0nkhp615qzfoq.js");
      case "server/chunks/ssr/app_admin_invoices_page_tsx_1wumvsb_yb-pg._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/app_admin_invoices_page_tsx_1wumvsb_yb-pg._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1-u5q5hjbq5x4.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1-u5q5hjbq5x4.js");
      case "server/chunks/ssr/[root-of-the-server]__14v-3bhefc2ch._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__14v-3bhefc2ch._.js");
      case "server/chunks/ssr/[root-of-the-server]__1gax5nm_ngffb._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1gax5nm_ngffb._.js");
      case "server/chunks/ssr/_0r720ht44tpnc._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_0r720ht44tpnc._.js");
      case "server/chunks/ssr/_1m36t-yk5k3ry._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_1m36t-yk5k3ry._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1d3belr09_dgz.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1d3belr09_dgz.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_reports_page_actions_1c-mifh47jnxr.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_reports_page_actions_1c-mifh47jnxr.js");
      case "server/chunks/ssr/app_admin_reports_page_tsx_03yr_nf4i_x63._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/app_admin_reports_page_tsx_03yr_nf4i_x63._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0hds4xva7ashx.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0hds4xva7ashx.js");
      case "server/chunks/ssr/[root-of-the-server]__03-87yt4fyyw3._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__03-87yt4fyyw3._.js");
      case "server/chunks/ssr/[root-of-the-server]__17yqkf7fmh_es._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__17yqkf7fmh_es._.js");
      case "server/chunks/ssr/_0s7dk03-za05t._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_0s7dk03-za05t._.js");
      case "server/chunks/ssr/components_EditRoomForm_tsx_1tjo05-rwjslj._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/components_EditRoomForm_tsx_1tjo05-rwjslj._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0j1q-cpd5ilhp.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0j1q-cpd5ilhp.js");
      case "server/chunks/ssr/[root-of-the-server]__1jnc9fuh_70hr._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1jnc9fuh_70hr._.js");
      case "server/chunks/ssr/[root-of-the-server]__1kftr4cm2phmf._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1kftr4cm2phmf._.js");
      case "server/chunks/ssr/app_admin_settings_page_tsx_1cnm2hqchkwms._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/app_admin_settings_page_tsx_1cnm2hqchkwms._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_06bg1g9rh87-c.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_06bg1g9rh87-c.js");
      case "server/chunks/ssr/[root-of-the-server]__0bgan-5lpk-le._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0bgan-5lpk-le._.js");
      case "server/chunks/ssr/[root-of-the-server]__0v0f549p6b5vz._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0v0f549p6b5vz._.js");
      case "server/chunks/ssr/_0d9hezrbkb5tb._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_0d9hezrbkb5tb._.js");
      case "server/chunks/ssr/_1xp6yxnxaaix-._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_1xp6yxnxaaix-._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0x-hscrhsbzpi.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0x-hscrhsbzpi.js");
      case "server/chunks/[externals]__0xp-w031ecr12._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/[externals]__0xp-w031ecr12._.js");
      case "server/chunks/[root-of-the-server]__16vx9gz_nv4of._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__16vx9gz_nv4of._.js");
      case "server/chunks/[root-of-the-server]__1r7kbfkiw2xmu._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1r7kbfkiw2xmu._.js");
      case "server/chunks/[turbopack]_runtime.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/[turbopack]_runtime.js");
      case "server/chunks/_1vztwp_dx_m7a._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/_1vztwp_dx_m7a._.js");
      case "server/chunks/_next-internal_server_app_api_bookings_route_actions_1x10bx0memlb-.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_bookings_route_actions_1x10bx0memlb-.js");
      case "server/chunks/lib_supabase_admin_ts_055kwkt4o-eiv._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/lib_supabase_admin_ts_055kwkt4o-eiv._.js");
      case "server/chunks/[externals]__12s2uxrv8n30f._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/[externals]__12s2uxrv8n30f._.js");
      case "server/chunks/_1f5xcxmphsny-._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/_1f5xcxmphsny-._.js");
      case "server/chunks/_next-internal_server_app_api_bookings_search_route_actions_1amrqgtp_s7u-.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_bookings_search_route_actions_1amrqgtp_s7u-.js");
      case "server/chunks/_0jpibubabfbrx._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/_0jpibubabfbrx._.js");
      case "server/chunks/_next-internal_server_app_api_offers_validate_route_actions_1dr4yijj_dmp4.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_offers_validate_route_actions_1dr4yijj_dmp4.js");
      case "server/chunks/[externals]__11sk3ccdwyv9b._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/[externals]__11sk3ccdwyv9b._.js");
      case "server/chunks/[root-of-the-server]__1cytsih1xj8bw._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1cytsih1xj8bw._.js");
      case "server/chunks/_next-internal_server_app_api_payment_create-order_route_actions_0f3wodushgduc.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_payment_create-order_route_actions_0f3wodushgduc.js");
      case "server/chunks/_0fultev17ynk5._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/_0fultev17ynk5._.js");
      case "server/chunks/_next-internal_server_app_api_payment_verify_route_actions_0xu606-ha6rr7.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_payment_verify_route_actions_0xu606-ha6rr7.js");
      case "server/chunks/_0pz_wg6najh27._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/_0pz_wg6najh27._.js");
      case "server/chunks/_next-internal_server_app_api_rooms_availability_route_actions_1xck26-zm7jsm.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_rooms_availability_route_actions_1xck26-zm7jsm.js");
      case "server/chunks/ssr/[root-of-the-server]__1_n-c1z0sbazn._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1_n-c1z0sbazn._.js");
      case "server/chunks/ssr/_0g4u6u5ke8jjm._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_0g4u6u5ke8jjm._.js");
      case "server/chunks/ssr/_0r6v70205q9q0._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_0r6v70205q9q0._.js");
      case "server/chunks/ssr/_1ctaab_dk4qxp._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_1ctaab_dk4qxp._.js");
      case "server/chunks/ssr/_next-internal_server_app_booking_page_actions_0x7wzojxmu0ls.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_booking_page_actions_0x7wzojxmu0ls.js");
      case "server/chunks/ssr/components_Footer_tsx_1vy03bm02163v._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/components_Footer_tsx_1vy03bm02163v._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_07cqkvruwq2_o.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_07cqkvruwq2_o.js");
      case "server/chunks/ssr/node_modules_next_dist_shared_lib_1p_7c7q9c7kdw._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_shared_lib_1p_7c7q9c7kdw._.js");
      case "server/chunks/ssr/_01vmlon8job_c._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_01vmlon8job_c._.js");
      case "server/chunks/ssr/_next-internal_server_app_cancellation-policy_page_actions_0sj0l3wr0ikgm.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_cancellation-policy_page_actions_0sj0l3wr0ikgm.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0eu8vfjsdpbwz.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0eu8vfjsdpbwz.js");
      case "server/chunks/ssr/[root-of-the-server]__20ctvo5klc1o0._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__20ctvo5klc1o0._.js");
      case "server/chunks/ssr/_next-internal_server_app_contact_page_actions_0kuoobr9d9178.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_contact_page_actions_0kuoobr9d9178.js");
      case "server/chunks/ssr/app_contact_page_tsx_1x9k2ellydbby._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/app_contact_page_tsx_1x9k2ellydbby._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0_fah01q22l8h.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0_fah01q22l8h.js");
      case "server/chunks/ssr/[root-of-the-server]__0aldz1v77f3ew._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0aldz1v77f3ew._.js");
      case "server/chunks/ssr/_next-internal_server_app_customer_login_page_actions_1r81mlf8sjk75.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_customer_login_page_actions_1r81mlf8sjk75.js");
      case "server/chunks/ssr/app_customer_login_page_tsx_1583av1ww8x02._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/app_customer_login_page_tsx_1583av1ww8x02._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1p4rtu559n1lk.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1p4rtu559n1lk.js");
      case "server/chunks/ssr/_1o4xbnyex5q0w._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_1o4xbnyex5q0w._.js");
      case "server/chunks/ssr/_next-internal_server_app_facilities_page_actions_16rx9xtrbv-qj.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_facilities_page_actions_16rx9xtrbv-qj.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_19mmuabiom8zd.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_19mmuabiom8zd.js");
      case "server/chunks/_1mxn_lbuesj3_._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/_1mxn_lbuesj3_._.js");
      case "server/chunks/_next-internal_server_app_favicon_ico_route_actions_0g2jjlssn1kss.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_favicon_ico_route_actions_0g2jjlssn1kss.js");
      case "server/chunks/ssr/_1s8z5-9gy5gr6._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_1s8z5-9gy5gr6._.js");
      case "server/chunks/ssr/_next-internal_server_app_gallery_page_actions_1ci3vpy-hug0q.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_gallery_page_actions_1ci3vpy-hug0q.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0wdl2kn6_py8h.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0wdl2kn6_py8h.js");
      case "server/chunks/ssr/[root-of-the-server]__1wlxq941g1ygf._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1wlxq941g1ygf._.js");
      case "server/chunks/ssr/_0bzhzf2n1760l._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_0bzhzf2n1760l._.js");
      case "server/chunks/ssr/_next-internal_server_app_login_page_actions_04fnjo0ny9dmg.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_login_page_actions_04fnjo0ny9dmg.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1fatlty6le1sy.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1fatlty6le1sy.js");
      case "server/chunks/ssr/[root-of-the-server]__0w8zcphv9ix17._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0w8zcphv9ix17._.js");
      case "server/chunks/ssr/_0o-f6pvr12gem._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_0o-f6pvr12gem._.js");
      case "server/chunks/ssr/_1xy5n53287hl5._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_1xy5n53287hl5._.js");
      case "server/chunks/ssr/_next-internal_server_app_my-booking_invoice_[id]_page_actions_0ufe_kmsh8vr5.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_my-booking_invoice_[id]_page_actions_0ufe_kmsh8vr5.js");
      case "server/chunks/ssr/node_modules_0thsd_1u0nrbn._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_0thsd_1u0nrbn._.js");
      case "server/chunks/ssr/node_modules_next_dist_19r82zsxo2jj1._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_19r82zsxo2jj1._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_209dgmr-hrh4q.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_209dgmr-hrh4q.js");
      case "server/chunks/ssr/[root-of-the-server]__18ce7cuof28bl._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__18ce7cuof28bl._.js");
      case "server/chunks/ssr/_0lfbli5e_vnzj._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_0lfbli5e_vnzj._.js");
      case "server/chunks/ssr/_next-internal_server_app_my-booking_page_actions_0s6bvejbug2r8.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_my-booking_page_actions_0s6bvejbug2r8.js");
      case "server/chunks/ssr/app_my-booking_page_tsx_0idkid8c30dhu._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/app_my-booking_page_tsx_0idkid8c30dhu._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1aytm8su_rxub.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1aytm8su_rxub.js");
      case "server/chunks/ssr/_17pkj293fi-gr._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_17pkj293fi-gr._.js");
      case "server/chunks/ssr/_next-internal_server_app_offers_page_actions_06ha1473j5cxm.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_offers_page_actions_06ha1473j5cxm.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_19afrsy_jrg1j.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_19afrsy_jrg1j.js");
      case "server/chunks/ssr/[root-of-the-server]__0ilhawr6avurf._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0ilhawr6avurf._.js");
      case "server/chunks/ssr/_0ec8ye10dojoi._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_0ec8ye10dojoi._.js");
      case "server/chunks/ssr/_0tm8n8bapls06._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_0tm8n8bapls06._.js");
      case "server/chunks/ssr/_next-internal_server_app_page_actions_0hhsz1jew5ls7.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_page_actions_0hhsz1jew5ls7.js");
      case "server/chunks/ssr/components_RoomCard_tsx_0ykfpvpyfmjjs._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/components_RoomCard_tsx_0ykfpvpyfmjjs._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_04tpgk4fjuqws.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_04tpgk4fjuqws.js");
      case "server/chunks/ssr/_1cxeh_jnigyii._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_1cxeh_jnigyii._.js");
      case "server/chunks/ssr/_next-internal_server_app_privacy-policy_page_actions_0zb6o_bu8y65d.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_privacy-policy_page_actions_0zb6o_bu8y65d.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_09ms5mc7t94py.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_09ms5mc7t94py.js");
      case "server/chunks/ssr/_1159h-74ozmh1._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_1159h-74ozmh1._.js");
      case "server/chunks/ssr/_next-internal_server_app_rooms_page_actions_1zb09ml7amtq2.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_rooms_page_actions_1zb09ml7amtq2.js");
      case "server/chunks/ssr/app_rooms_loading_tsx_1-_nszmnayvg2._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/app_rooms_loading_tsx_1-_nszmnayvg2._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1xdqb_uswvpov.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1xdqb_uswvpov.js");
      case "server/chunks/ssr/_0qklzxs1n5qxr._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_0qklzxs1n5qxr._.js");
      case "server/chunks/ssr/_next-internal_server_app_terms_page_actions_0h-0lt4mmfgq3.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_terms_page_actions_0h-0lt4mmfgq3.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1gc5wc_f72ofe.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1gc5wc_f72ofe.js");
      case "server/chunks/ssr/[root-of-the-server]__0301p_jpo0n8p._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0301p_jpo0n8p._.js");
      case "server/chunks/ssr/[root-of-the-server]__0hyg345grv_hy._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0hyg345grv_hy._.js");
      case "server/chunks/ssr/[root-of-the-server]__0py1t7q9ntzgc._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0py1t7q9ntzgc._.js");
      case "server/chunks/ssr/_next-internal_server_app__global-error_page_actions_0zi5s8-psc_d2.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app__global-error_page_actions_0zi5s8-psc_d2.js");
      case "server/chunks/ssr/node_modules_0gxlxpuufujz9._.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_0gxlxpuufujz9._.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_13q04th-918ib.js": return require("E:/JagdishDunePalace/jagdish-dune-palace/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_13q04th-918ib.js");
      default:
        throw new Error(`Not found ${chunkPath}`);
    }
  }


  async function loadWasmChunk(chunkPath) {
    switch (chunkPath) {

      default:
        throw new Error(`Unknown wasm chunk: ${chunkPath}`);
    }
  }
