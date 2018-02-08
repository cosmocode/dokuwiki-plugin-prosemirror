/* eslint-disable */

const { testJsonAgainstSchema } = require('./testmodule.js');
const fs = require('fs');
const path = require('path');

QUnit.module('testing json strings');

/**
 * Tests all json files against the Prosemirror Schema validator
 */
const testdata = `${__dirname}/../_test/json/`;
fs.readdirSync(testdata).forEach((file) => {
    if (path.extname(file) !== '.json') return;
    const json = fs.readFileSync(testdata + file);
    const name = path.basename(file, '.json');

    QUnit.test(name, (assert) => {
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
        assert.ok(valid, 'json validation');
    });
});
