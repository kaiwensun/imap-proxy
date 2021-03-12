const _importScripts = importScripts;

const IMPORTED = new Set();
const IMPORTING = new Set();

importScripts = path => {
    if (!IMPORTED.has(path)) {
        if (IMPORTING.has(path)) {
            throw `Cycular dependency: ${path}`;
        }
        IMPORTING.add(path);
        _importScripts(path);
        IMPORTED.add(path);
        IMPORTING.delete(path);
    }
}
