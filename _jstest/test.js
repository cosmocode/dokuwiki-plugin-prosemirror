const { testJsonAgainstSchema } = require('./testmodule.js');

QUnit.module('testing json strings');

const testData = [
    { input: '{"type": "doc", "content": [{ "type": "paragraph", "content": [{"type": "text","text": "ABC DEF"}]}]}', msg: 'paragraph' },
    { input: '{"type": "doc","content": [{"type": "text","text": " ABC DEF"}]}', msg: 'quotes' },
];

testData.forEach((data) => {
    QUnit.test(data.msg, (assert) => {
        let valid = true;
        try {
            testJsonAgainstSchema(data.input);
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
