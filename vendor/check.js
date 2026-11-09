/**
 * Checks the freshly built vendor/prosemirror.js, run by `npm run vendor` after esbuild
 *
 * esbuild builds all of these problems without an error or a warning:
 *
 * - A name exported by more than one package is dropped by `export *` in vendor/entry.js.
 *   Importing it in the browser then fails. Such a name must be re-exported explicitly there.
 * - A package bundled twice, e.g. a CommonJS build next to the ESM one, breaks ProseMirror's
 *   `instanceof` checks (prosemirror-tables 0.8 did that: its `CellSelection` no longer
 *   extended the editor's `Selection`).
 * - vendor/LICENSES.txt is maintained by hand and must list every bundled package, including
 *   transitive ones like orderedmap, rope-sequence and w3c-keyname.
 *
 * Reads the metafile esbuild wrote to vendor/meta.json and deletes it. Exits with status 1 if a
 * check fails.
 */
import { readFileSync, rmSync } from 'node:fs';

const META = 'vendor/meta.json';
const errors = [];

let meta;
try {
    meta = JSON.parse(readFileSync(META, 'utf8'));
} finally {
    rmSync(META, { force: true });
}
const inputs = Object.keys(meta.inputs);

// names dropped by `export *`
const entry = readFileSync('vendor/entry.js', 'utf8');
const starred = [...entry.matchAll(/^export \* from '([^']+)'/gm)].map(m => m[1]);
const explicit = new Set(
    [...entry.matchAll(/^export \{([^}]+)\} from/gm)]
        .flatMap(m => m[1].split(','))
        .map(name => name.trim().split(/\s+as\s+/).pop())
);
const exporters = {};
for (const pkg of starred) {
    for (const name of Object.keys(await import(pkg))) {
        (exporters[name] ??= []).push(pkg);
    }
}
for (const [name, pkgs] of Object.entries(exporters)) {
    if (pkgs.length > 1 && !explicit.has(name)) {
        errors.push(`"${name}" is exported by ${pkgs.join(', ')}: re-export it explicitly in vendor/entry.js`);
    }
}

// second copies of a package
for (const input of inputs.filter(path => path.endsWith('.cjs'))) {
    errors.push(`CommonJS file bundled, probably a second copy of its package: ${input}`);
}

// license notices
const bundled = new Set(
    inputs.map(path => path.match(/node_modules\/((?:@[^/]+\/)?[^/]+)\//)?.[1]).filter(Boolean)
);
const licensed = new Set(
    [...readFileSync('vendor/LICENSES.txt', 'utf8').matchAll(/^=+\n(\S+) \(/gm)].map(m => m[1])
);
for (const pkg of bundled) {
    if (!licensed.has(pkg)) errors.push(`${pkg} is bundled but missing from vendor/LICENSES.txt`);
}
for (const pkg of licensed) {
    if (!bundled.has(pkg)) errors.push(`${pkg} is listed in vendor/LICENSES.txt but not bundled`);
}

if (errors.length) {
    console.error(`vendor/prosemirror.js was built, but has problems:\n- ${errors.join('\n- ')}`);
    process.exit(1);
}
console.log(`vendor/prosemirror.js: checks passed (${bundled.size} packages bundled)`);
