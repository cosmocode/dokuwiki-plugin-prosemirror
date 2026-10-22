import fs from 'fs';
import path from 'path';
import test from 'node:test';
import testJsonAgainstSchema from './testmodule.js';

/**
 * Tests all json files against the Prosemirror Schema validator
 *
 * Run via `npm test`, which bundles this file first because Node can't resolve the
 * extensionless imports in script/. The bundle sits next to this file, so __dirname holds.
 */
const testdata = `${__dirname}/../_test/json/`;
fs.readdirSync(testdata).forEach((file) => {
    if (path.extname(file) !== '.json') return;
    const json = fs.readFileSync(testdata + file);
    const name = path.basename(file, '.json');

    test(name, () => {
        testJsonAgainstSchema(json);
    });
});
