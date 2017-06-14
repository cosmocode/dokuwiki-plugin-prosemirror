QUnit.test('quotes', (assert) => {
    const json = '{"type": "doc","content": [{"type": "text","text": " ABC DEF"}]}';
    let passed = true;
    try {
        window.testJsonAgainstSchema(json);
    } catch (e) {
        console.log(e);
        passed = false;
    }
    assert.ok(passed, 'Passed!');
});

QUnit.test('paragraph', (assert) => {
    const json = '{"type": "doc", "content": [{ "type": "paragraph", "content": [{"type": "text","text": "ABC DEF"}]}]}';
    let passed = true;
    try {
        window.testJsonAgainstSchema(json);
    } catch (e) {
        console.log(e);
        passed = false;
    }
    assert.ok(passed, 'Passed!');
});
