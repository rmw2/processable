let { MemorySegment } = require('./Memory.js');

let hiAddr = 0x0100;
let memSize = 0x0100;
let loAddr = 0x000;

let Mem = new MemorySegment(hiAddr, memSize);

test('low address correctly computed', () => {
	expect(Mem.loAddr).toBe(hiAddr - memSize);
});

test('set and retrieve values', () => {
	for (let sz = 1; sz < 8; sz *= 2) {
		for (let addr = loAddr; addr <= hiAddr - sz; addr++) {
			Mem.write(addr, addr, sz);
			expect(Mem.read(addr, sz)).toBe(addr);
		}
	}
});

test('values stored as little-endian', () => {
	let val = 0x12345678;

	// Write 4-byte value
	Mem.write(val, loAddr, 4);

	// Read back single byte in each position
	expect(Mem.read(loAddr + 0, 1)).toBe(0x78);
	expect(Mem.read(loAddr + 1, 1)).toBe(0x56);
	expect(Mem.read(loAddr + 2, 1)).toBe(0x34);
	expect(Mem.read(loAddr + 3, 1)).toBe(0x12);
});

test('throws errors invalid read/write lengths', () => {
	let val = 0x0;

	expect( () => {
		Mem.write(val, loAddr, 3);
	}).toThrow();

	expect( () => {
		Mem.read(loAddr, 5);
	}).toThrow();
});

test('throws errors for out of bounds access', () => {
	// Below the bottom of the segment
	expect( () => {
		Mem.write(0, loAddr - 1, 1);
	}).toThrow();
	
	expect( () => {
		Mem.read(loAddr - 1, 1);
	}).toThrow();

	// Above the top of the segment
	expect( () => {
		Mem.write(0, hiAddr, 1);
	}).toThrow();

	expect( () => {
		Mem.read(hiAddr, 1);
	}).toThrow();

	// Partially out of the segment
	expect( () => {
		Mem.write(0, hiAddr - 1, 2);
	}).toThrow();

	expect( () => {
		Mem.read(hiAddr - 1, 2);
	}).toThrow();
})
