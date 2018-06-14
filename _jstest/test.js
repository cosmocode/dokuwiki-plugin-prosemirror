/* eslint-disable */

import fs from 'fs';
import path from 'path';
import testJsonAgainstSchema from './testmodule.js';

/**
 * Tests all json files against the Prosemirror Schema validator
 */
const testdata = `${__dirname}/../_test/json/`;
fs.readdirSync(testdata).forEach((file) => {
    if (path.extname(file) !== '.json') return;
    const json = fs.readFileSync(testdata + file);
    const name = path.basename(file, '.json');

    test(name, () => {
        let valid = true;
        try {
            testJsonAgainstSchema(json);
        } catch (e) {
            if (e instanceof RangeError) {
                valid = false;
            } else {
                console.log(e);
                throw e;
            }
        }

        expect(valid).toBeTruthy();
    });
});
