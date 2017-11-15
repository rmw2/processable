// Tests for Registers module

const x86 = require('./x86.js');
const { Int64 } = require('./Int64.js')
const { RegisterSet } = require('./Registers.js');

let Regs = new RegisterSet(x86.Registers);
let regnames = Object.keys(x86.Registers);

test('sets and retrieves 1, 2, and 4-byte values with LSC', () => {
	for (let i = 0; i < regnames.length; i++) {
		if (x86.Registers[regnames[i]][1] == 8)
			continue

		// Get random integer value between 0 and 255
		let val = Math.floor(Math.random() * 0xFF);
		Regs.write(regnames[i], val);

		expect(Regs.read(regnames[i])).toBe(val);
	}
});

test('sets and retrieves 8-byte values with LSC', () => {
	for (let i = 0; i < regnames.length; i++) {
		if (x86.Registers[regnames[i]][1] != 8)
			continue

		// Get random integer value between 0 and 255
		let val = Math.floor(Math.random() * 0xFF);
		Regs.write(regnames[i], val);

		expect(Regs.read(regnames[i])).toEqual(new Int64(val));
	}
});

test('promotes number to Int64 when necessary', () => {
	let value = Math.pow(2, 33);
	Regs.write('rax', value);

	expect(Regs.read('rax')).toEqual(new Int64(value));
});

test('sets and retrieves 1, 2, and 4-byte values without LSC', () => {
	let val = 0x12345678;

	Regs.write('eax', val);

	expect(Regs.read('ax')).toBe(0x5678);
	expect(Regs.read('al')).toBe(0x78);
	expect(Regs.read('ah')).toBe(0x56);
});

// TODO: Implement this
test.skip('clears upper 4 bytes of 8-byte register on write to 4-byte register', () => {
	let val64 = 0xFFFFFFFF00000000;
	let val32 = 0xFFFFFFFF;

	Regs.write('rax', val64);
	expect(Regs.read('eax')).toBe(0);
	expect(Regs.read('rax')).toEqual(new Int64(val64));

	Regs.write('eax', val32);
	expect(Regs.read('eax')).toBe(val32);
	expect(Regs.read('rax')).toEqual(new Int64(val32));
});

test('throws error on invalid register name', () => {
	expect( () => {
		Regs.read('fakeregister');
	}).toThrow();

	expect( () => {
		Regs.write('fakeregister', 0x0);
	}).toThrow();
});