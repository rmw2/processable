const { Assembly } = require('./Assembler.js');

// Node stuff for reading files
const fs = require('fs');
const path = require('path');

test('euclid.s', () => {
	// Read file
	let file = fs.readFileSync(
		path.join(__dirname, '../samples/euclid.s'),
		{encoding: 'utf-8'}
	);

	let asm = new Assembly();

	asm.assemble(file);
	let {image, labels} = asm.link();
});


test('hello.s', () => {
	// Read file
	let file = fs.readFileSync(
		path.join(__dirname, '../samples/16hello.s'),
		{encoding: 'utf-8'}
	);

	let asm = new Assembly();

	asm.assemble(file);

	console.log(asm.labelFor);

	let {image, labels} = asm.link();

	console.log(image);
	console.log(labels);
});