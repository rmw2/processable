// Tests for Registers module

const x86 = require('./x86.js');
const { Int64 } = require('./Int64.js')
const { RegisterSet } = require('./Registers.js');

let Regs = new RegisterSet(x86.Registers);
let regnames = Object.keys(x86.Registers);

test('setting and retrieving 1,2, and 4-byte values with LSC', () => {
	for (let i = 0; i < regnames.length; i++) {
		if (x86.Registers[regnames[i]][1] == 8)
			continue

		// Get random integer value between 0 and 255
		let val = Math.floor(Math.random() * 0xFF);
		Regs.write(regnames[i], val);

		expect(Regs.read(regnames[i])).toBe(val);
	}
});

test('setting and retrieving 8-byte values with LSC', () => {
	for (let i = 0; i < regnames.length; i++) {
		if (x86.Registers[regnames[i]][1] != 8)
			continue

		// Get random integer value between 0 and 255
		let val = Math.floor(Math.random() * 0xFF);
		Regs.write(regnames[i], val);

		expect(Regs.read(regnames[i])).toEqual(new Int64(val));
	}
});

test('setting and retrieving 1,2, and 4-byte values without LSC', () => {
	let val = 0x12345678;

	Regs.write('eax', val);

	expect(Regs.read('ax')).toBe(0x5678);
	expect(Regs.read('al')).toBe(0x78);
	expect(Regs.read('ah')).toBe(0x56);
});