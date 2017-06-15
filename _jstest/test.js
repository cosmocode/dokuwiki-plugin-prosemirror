const { testJsonAgainstSchema } = require('./testmodule.js');
const fs = require('fs');

QUnit.module('testing json strings');

const path = __dirname;
const buffer = fs.readFileSync(`${path}/../_test/testdata.json`);
const testData = JSON.parse(buffer.toString());

testData.forEach((data) => {
    QUnit.test(data.msg, (assert) => {
        let valid = true;
        try {
            testJsonAgainstSchema(data.json);
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
