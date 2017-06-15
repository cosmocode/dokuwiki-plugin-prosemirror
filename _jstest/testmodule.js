const { Node } = require('prosemirror-model');
const { schema } = require('../script/schema.js');

module.exports = {
    testJsonAgainstSchema: function testJsonAgainstSchema(jsonInput) {
        const node = Node.fromJSON(schema, JSON.parse(jsonInput));
        node.check();
    },
};
