/**
 * Tests for the FixedWidth module
 */

const { FixedWidthNumber } = require('./FixedWidth.js');

const UMAX = {
	1: 0xFF, 
	2: 0xFFFF,
	4: 0xFFFFFFFF,
	8: 0xFFFFFFFF // Convenience hack
};

const IMAX = {
	1: 0x7F,
	2: 0x7FFF,
	4: 0x7FFFFFFF
};

const MAXVALIDHI = 0x1fffff;

/**
 * Return a random fixed width number within its valid range.
 * For size === 8, the valid flag determines whether values should
 * be clamped to 2^53, the max representable integer, to facilitate testing
 */
function randomFixedWidth(size, valid=true) {
	let lo = UMAX[size] * Math.random() | 0;

	if (size === 8) {
		let hi = (valid ? MAXVALIDHI : UMAX[size]) * Math.random() | 0;
		return new FixedWidthNumber(size, lo, hi);
	} else {
		return new FixedWidthNumber(size, lo);
	}
}

describe('Fixed width number objects', () => {
	let buf = new ArrayBuffer(8);
	let view = new DataView(buf);
	let val = 0x12345678;
	let res = {1: 0x78, 2: 0x5678, 4: val, 8: val};
	view.setUint32(0, val, true);

	for (let size of [1,2,4,8]) {
		test(`correctly determine ${size}-byte equality`, () => {
			let x = new FixedWidthNumber(size, 0xFF);
			let y = new FixedWidthNumber(size, 0xFF);
			let z = new FixedWidthNumber(size, 0x00);

			expect(x.equals(y)).toBe(true);
			expect(y.equals(z)).toBe(false);
		});

		test(`correctly load ${size}-byte values from arraybuffer`, () => {
			let x = new FixedWidthNumber(size, view, 0);
			expect(x.equals(new FixedWidthNumber(size, res[size]))).toBe(true);
		});

		test(`correctly compute ${size}-byte valueOf`, () => {
			let x = new FixedWidthNumber(size, 0xFF);
			expect(x.valueOf()).toBe(0xFF);
		});

		test(`are equal to their clones`, () => {
			let x = randomFixedWidth(size);

			expect(x.clone().equals(x)).toBe(true);
		});
	}
})

describe('Arithmetic', () => {
	// Set up a buffer to read zeros of every size 
	let zerobuf = new ArrayBuffer(8);
	let zeroview = new DataView(zerobuf);
	// Set up a buffer to read max values of every size
	let maxbuf = new ArrayBuffer(8);
	let maxview = new DataView(maxbuf);
	maxview.setUint32(0, 0xFFFFFFFF);
	maxview.setUint32(4, 0xFFFFFFFF);

	for (let size of [1,2,4,8]) {
		test(`correctly adds ${size}-byte values adds without overflow`, () => {
			let x = new FixedWidthNumber(size);
			let y = new FixedWidthNumber(size, 1);
			let z = new FixedWidthNumber(size, 2);

			expect(x.add(y).equals(y)).toBe(true);
			expect(y.add(y).equals(z)).toBe(true);
		});
	}

	for (let size of [1,2,4]) {
		test(`adds ${size}-byte values with overflow and carry`, () => {

			let hiSigned = new FixedWidthNumber(size, IMAX[size]);
			let hiUnsigned = new FixedWidthNumber(size, UMAX[size]);
			
			let one = new FixedWidthNumber(size, 1);
			let zero = new FixedWidthNumber(size, 0);

			// Overflow
			expect(hiSigned.add(one).equals(new FixedWidthNumber(size, IMAX[size] + 1))).toBe(true);
			expect(hiSigned.overflow).toBe(true);
			expect(hiSigned.carry).toBe(false);
			expect(hiSigned.sign).toBe(true);

			// Carry
			expect(hiUnsigned.add(one).equals(zero)).toBe(true);
			expect(hiUnsigned.overflow).toBe(false);
			expect(hiUnsigned.carry).toBe(true);
			expect(hiUnsigned.sign).toBe(false);
		});
	}

	test(`adds 8-byte values with overflow and carry`, () => {
		let hiSigned = new FixedWidthNumber(8, UMAX[4], IMAX[4]);
		let hiUnsigned = new FixedWidthNumber(8, maxview);
		
		let one = new FixedWidthNumber(8, 1);
		let zero = new FixedWidthNumber(8, 0);

		// Overflow
		expect(hiSigned.add(one).equals(new FixedWidthNumber(8, UMAX[4], IMAX[4] + 1))).toBe(true);
		expect(hiSigned.overflow).toBe(true);
		expect(hiSigned.carry).toBe(false);
		expect(hiSigned.sign).toBe(true);

		// Carry
		expect(hiUnsigned.add(one).equals(zero)).toBe(true);
		expect(hiUnsigned.overflow).toBe(false);
		expect(hiUnsigned.carry).toBe(true);
		expect(hiUnsigned.sign).toBe(false);
	});

	
	test(`32-bit carry in 64-bit integer`, () => {
		// 64 bit overflow and carry
		let max32 = new FixedWidthNumber(8, maxview);
		let pow32 = new FixedWidthNumber(8, 0, 1);
		let one = new FixedWidthNumber(8, 1, 0);

		// Addition
		expect(max32.clone().add(one).equals(pow32)).toBe(true);

		// Subtraction
		expect(pow32.subtract(one).equals(max32)).toBe(true);
	});

	for (let size of [1,2,4,8]) {
		test(`subtracts ${size}-byte values with and without overflow`, () => {
			let zero = new FixedWidthNumber(size, zeroview);
			let one = new FixedWidthNumber(size, 1);
			let max = new FixedWidthNumber(size, maxview);

			let val1 = randomFixedWidth(size);
			let val2 = randomFixedWidth(size);

			// Subtracting zero makes no difference
			expect(val1.subtract(zero).equals(val1)).toBe(true);
			// Subtracting one from zero gives max
			expect(zero.subtract(one).equals(max)).toBe(true);

			// Fixed width subtraction agrees with integer subtraction
			expect(val1.subtract(val2).equals(new FixedWidthNumber(size, val1-val2))).toBe(true);
			// Check flags ? 
			// TODO
		});

		test(`shifts ${size}-byte values left`, () => {
			let zero = new FixedWidthNumber(size, zeroview);
			expect(zero.shiftLeft(1).equals(zero)).toBe(true);

		});

		test(`shifts ${size}-byte values right logically`, 	() => {

		});

		test(`shifts ${size}-byte values right arithmetically`, () => {

		});

		test(`multiplies ${size}-byte values`, () => {
			// TODO
		});

		test(`divides ${size}-byte values`, () => {
			// TODO
		});

		test(`performs bitwise operations on ${size}-byte values`, () => {
			let val1 = randomFixedWidth(size);
			let val2 = randomFixedWidth(size);

			expect(+val1.clone().or(val2)).toEqual(+val1 | +val2);
			expect(+val1.clone().and(val2)).toEqual(+val1 & +val2);
			expect(+val1.clone().xor(val2)).toEqual(+val1 ^ +val2);

			if (size !== 8) {
				expect(+val1.clone().not() >>> 0).toEqual((~val1 & UMAX[size]) >>> 0);
				expect(+val1.clone().negate() >>> 0).toEqual((-val1 & UMAX[size]) >>> 0);
			} else {
				// TODO 
			}
		});
	}
})