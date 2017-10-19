let m = require('./Memory.js')

let hiAddr = 0x0100;
let memSize = 0x0100;
let loAddr = 0x000;

let Mem = new m.MemorySpace(hiAddr, memSize);

test('low address correctly computed', () => {
	expect(Mem.loAddr).toBe(hiAddr - memSize);
});

test('set and retrieve values', () => {
	for (let sz = 1; sz < 8; sz *= 2) {
		for (let addr = loAddr; addr <= loAddr + memSize - sz; addr++) {
			Mem.write(addr, addr, sz);
			expect(Mem.read(addr, sz)).toBe(addr);
		}
	}
});

test('values stored as little-endian', () => {
	let val = 0x12345678;

	// Write 2-byte value
	Mem.write(loAddr, val, 4);

	// Read back single byte in second position
	expect(Mem.read(loAddr + 0, 1)).toBe(0x78);
	expect(Mem.read(loAddr + 1, 1)).toBe(0x56);
	expect(Mem.read(loAddr + 2, 1)).toBe(0x34);
	expect(Mem.read(loAddr + 3, 1)).toBe(0x12);
});

test('memory resizes appropriately', () => {

})