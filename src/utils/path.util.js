import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Utility to derive `__dirname` in ES module environments.
 *
 * Node.js does not provide `__dirname` in ESM,
 * so this converts `import.meta.url` to a file system path
 * and returns its directory name.
 *
 * @param {string | URL} metaUrl - Usually `import.meta.url`
 * @returns {string} Absolute directory path of the current module
 */
export const getDirname = (metaUrl) => path.dirname(fileURLToPath(metaUrl));
