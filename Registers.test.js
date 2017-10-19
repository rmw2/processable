// Tests for Registers module

const x86 = require('./x86.js');
const { Registers } = require('./Registers.js');

let Regs = new Registers(x86.Regnames);

test('setting and retrieving values with LSC', () => {
	let regnames = Object.keys(x86.Regnames);
	for (let i = 0; i < regnames.length; i++) {
		// Get random integer value between 0 and 255
		let val = Math.floor(Math.random() * 0xFF);
		Regs.write(regnames[i], val);

		expect(Regs.read(regnames[i])).toBe(val);
	}
});

// test('setting and retrieving values without LSC', () => {

// });