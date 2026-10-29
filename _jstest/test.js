import fs from 'fs';
import path from 'path';
import test from 'node:test';
import testJsonAgainstSchema from './testmodule.js';

/**
 * Tests all json files against the Prosemirror Schema validator
 */
const testdata = `${import.meta.dirname}/../_test/json/`;
fs.readdirSync(testdata).forEach((file) => {
    if (path.extname(file) !== '.json') return;
    const json = fs.readFileSync(testdata + file);
    const name = path.basename(file, '.json');

    test(name, () => {
        testJsonAgainstSchema(json);
    });
});
