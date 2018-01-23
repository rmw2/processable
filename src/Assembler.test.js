const { assemble } = require('./Assembler.js');

// Node stuff for reading files
const fs = require('fs');
const path = require('path');

// Read file 
let file = fs.readFileSync(
	path.join(__dirname, '../samples/euclid.s'), 
	{encoding: 'utf-8'}
);

let {instructions, addresses, labels} = assemble(file);

test('fake test', () => {
	// Do nothing
});
