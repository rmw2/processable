/**********************************************************************
 * Testing for the FixedInt and ALU classes
 *
 *
 *********************************************************************/

const { 
	FixedInt, 
	ALU, 
	SIGN_MASK, 
	VAL_MASK, 
	MODULUS, 
	MAX_SAFE_HI 
} = require('./FixedInt.js');


// Important values in each size
const ZERO = {
	1: new FixedInt(1),
	2: new FixedInt(2),
	4: new FixedInt(4),
	8: new FixedInt(8)
};

const ONE = {
	1: new FixedInt(1, 1),
	2: new FixedInt(2, 1),
	4: new FixedInt(4, 1),
	8: new FixedInt(8, 1)
};

const MAX = {
	1: new FixedInt(1, 0xFF),
	2: new FixedInt(2, 0xFFFF),
	4: new FixedInt(4, 0xFFFFFFFF),
	8: new FixedInt(8, 0xFFFFFFFF, 0xFFFFFFFF)
};

// Arbitrary value for testing things
const TESTVAL = 0x12345678;

// Number of times to repeat random trials
const N_RAND = 10;

function random(size, safe=true) {
	let lo = (MODULUS[4] * Math.random() | 0) >>> 0;
	let hi = (size === 8) && (safe ? MAX_SAFE_HI : MODULUS[4]) * Math.random() | 0;

	return new FixedInt(size, lo, hi);
}

describe('FixedInt objects', () => {
	test('identify unsafe integers', () => {
		let unsafe = new FixedInt(8, 0, MAX_SAFE_HI + 1);
		let safe = new FixedInt(8, VAL_MASK[4], MAX_SAFE_HI);

		expect(unsafe.isSafeInteger()).toBe(false);
		expect(safe.isSafeInteger()).toBe(true);
	});

	test('throw errors for invalid constructors', () => {
		expect(() => new FixedInt()).toThrow();
		expect(() => new FixedInt({})).toThrow();
		expect(() => new FixedInt(0)).toThrow();
		expect(() => new FixedInt(8, Number.MAX_SAFE_INTEGER + 1)).toThrow();
	});

	// Repeat set of tests for all safe integer sizes
	for (const size of [1,2,4]) {
		test(`correctly determine ${size}-byte equality, valueOf`, () => {
			for (let i = 0; i < N_RAND; i++) {			
				/* Test valueOf */
				let x = random(size);

				expect(+x).toEqual(x.lo);

				/* Test equality */
				let val = MODULUS[1] * Math.random() | 0;
				let y1 = new FixedInt(size, val), y2 = new FixedInt(size, val);

				expect(+y1).toEqual(+y2);
				expect(y1.equals(y2)).toBe(true);

				/* Test clones */
				let z = random(size);
				expect(z).toEqual(z.clone());
				expect(z.clone().equals(z)).toBe(true);
			}
		});

		test(`correctly compare ${size}-byte numbers`, () => {
			expect(ONE[size].isLessThan(ZERO[size])).toBe(false);
			expect(ZERO[size].isLessThan(ONE[size])).toBe(true);
			for (let i = 0; i < N_RAND; i++) {
				let val = (MODULUS[size] * Math.random() | 0) >>> 0;
				let x = new FixedInt(size, val + MODULUS[size]);
				expect(+x).toEqual(val);
			}
		});

		test(`handle overflow in ${size}-byte constructor`, () => {
			for (let i = 0; i < N_RAND; i++) {
				let val = (MODULUS[size] * Math.random() | 0) >>> 0;
				let x = new FixedInt(size, val + MODULUS[size]);
				expect(+x).toEqual(val);
			}
		});

		test(`coerce ${size}-byte negatives to positive`, () => {
			let x = new FixedInt(size, -1);
			expect(+x).toEqual((-1 & VAL_MASK[size]) >>> 0);
		});

		test(`identify ${size}-byte odd and even numbers`, () => {
			for (let i = 0; i < N_RAND; i++) {
				let val = ((MODULUS[size] * Math.random() / 2) - 1 | 0) >>> 0;

				let even = new FixedInt(size, 2*val);
				let odd = new FixedInt(size, 2*val + 1);

				expect(even.isOdd()).toBe(false);
				expect(odd.isOdd()).toBe(true);
			}
		});

		test(`identify ${size}-byte negative numbers`, () => {
			for (let i = 0; i < N_RAND; i++) {
				let neg = SIGN_MASK[size] * (1 + Math.random()) | 0;
				let pos = SIGN_MASK[size] * Math.random() | 0;

				expect(new FixedInt(size, neg).isNegative()).toBe(true);
				expect(new FixedInt(size, pos).isNegative()).toBe(false);
			}
		});

		test(`correctly read ${size}-byte values from arraybuffer`, () => {
			for (let i = 0; i < N_RAND; i++) {
				let buf = new ArrayBuffer(4);
				let view = new DataView(buf);
				let val = MODULUS[size] * Math.random() | 0;
				view.setUint32(0, val, /*littleEndian = */ true);

				let x = new FixedInt(size, view, 0);
				expect(+x).toEqual(val >>> 0);
			}
		});

		test(`correctly write ${size}-byte values to arraybuffer`, () => {
			for (let i = 0; i < N_RAND; i++) {
				let buf = new ArrayBuffer(4);
				let view = new DataView(buf);
				let x = random(size);

				x.toBuffer(view);
				expect(view.getUint32(0, true)).toEqual(+x);
			}
		});
	}

	// Test 8-byte integers separately
	test(`determine 8-byte equality, valueOf`, () => {
		for (let i = 0; i < N_RAND; i++) {
			/* Two int constructor */
			let x = random(8);
			expect(+x).toEqual(x.lo + MODULUS[4]*x.hi);

			/* Single int constructor */
			let val = (Number.MAX_SAFE_INTEGER * Math.random() | 0) >>> 0;
			let y = new FixedInt(8, val);
			expect(+y).toEqual(val);

			let z = random(8, false);
			expect(z.clone()).toEqual(z);
			expect(z.equals(z.clone())).toBe(true);
		}
	});

	test(`construct negative 8-byte values`, () => {
		let minusOne = new FixedInt(8, -1);
		expect(minusOne.lo).toBe(VAL_MASK[4]);
		expect(minusOne.hi).toBe(VAL_MASK[4]);

		let largeMinus = new FixedInt(8, -Number.MAX_SAFE_INTEGER);
		expect(largeMinus.lo).toBe(1);
		expect(largeMinus.hi).toBe(0xFFE00000);
	});

	test(`correctly read 8-byte values from arraybuffer`, () => {
		for (let i = 0; i < N_RAND; i++) {
			let buf = new ArrayBuffer(8);
			let view = new DataView(buf);
			let val1 = MODULUS[4] * Math.random() | 0;
			let val2 = MODULUS[4] * Math.random() | 0;
			view.setUint32(0, val1, /*littleEndian = */ true);
			view.setUint32(4, val2, /*littleEndian = */ true);

			let x = new FixedInt(8, view, 0);
			expect(x.lo).toBe(val1 >>> 0);
			expect(x.hi).toBe(val2 >>> 0);
		}
	});

	test(`correctly write 8-byte values to arraybuffer`, () => {
		for (let i = 0; i < N_RAND; i++) {
			let buf = new ArrayBuffer(8);
			let view = new DataView(buf);
			let x = random(8);

			x.toBuffer(view);

			expect(view.getUint32(0, true)).toBe(x.lo);
			expect(view.getUint32(4, true)).toBe(x.hi);
		}
	});

	test(`hold values larger than 2^53-1`, () => {
		// Just check that the values come out right ? 
		// maybe this shouldn't be it's own test...
		expect(MAX[8]).toEqual(MAX[8].clone());
		expect(MAX[8].lo).toBe(VAL_MASK[4]);
		expect(MAX[8].hi).toBe(VAL_MASK[4]);
	});
});

describe('8,16, & 32-bit ALU', () => {
	test(`throws error on invalid operands`, () => {
		expect(() => ALU.add(1,2)).toThrow();
		expect(() => ALU.neg(1)).toThrow();
		expect(() => ALU.add(ZERO[1], ZERO[2])).toThrow();
	});

	for (const size of [1,2,4]) {
		test(`performs ${size}-byte addition`, () => {
			for (let i = 0; i < N_RAND; i++) {
				// Adding zero
				let x = random(size);
				expect(ALU.add(x, ZERO[size])).toEqual(x);
				expect(ALU.CF).toBe(false);
				expect(ALU.OF).toBe(false);
				expect(ALU.SF).toBe(x.isNegative());
				expect(ALU.ZF).toBe(x.equals(ZERO[size]));
				
				// Adding random numbers without overflow
				let val1 = (MODULUS[size] * Math.random() / 2 | 0) >>> 0;
				let val2 = (MODULUS[size] * Math.random() / 2 | 0) >>> 0;

				let y1 = new FixedInt(size, val1);
				let y2 = new FixedInt(size, val2);

				let result = ALU.add(y1,y2);
				expect(result).toEqual(new FixedInt(size, val1+val2));

				// Test flags
				expect(ALU.ZF).toBe(result.equals(ZERO[size]));
				expect(ALU.CF).toBe(false);
				expect(ALU.OF).toBe((y1.isNegative() == y2.isNegative()) && (y1.isNegative() !== result.isNegative()));
				expect(ALU.SF).toBe(result.isNegative());
			}
		});

		test(`performs ${size}-byte subtraction`, () => {
			for (let i = 0; i < N_RAND; i++) {
				// Subtracting zero and self
				let x = random(size);
				expect(ALU.sub(x, ZERO[size])).toEqual(x);
				expect(ALU.sub(x, x)).toEqual(ZERO[size]);
				expect(ALU.ZF).toBe(true);

				// Subtracting values
				let val1 = (MODULUS[size] * Math.random() / 2 | 0) >>> 0;
				let val2 = (MODULUS[size] * Math.random() / 2 | 0) >>> 0;

				let y1 = new FixedInt(size, val1);
				let y2 = new FixedInt(size, val2);

				let result = ALU.sub(y1,y2);
				expect(result).toEqual(new FixedInt(size, val1-val2));

				// Test Flags
				expect(ALU.ZF).toBe(y1.equals(y2));
				// expect(ALU.CF).toBe();
				// expect(ALU.OF).toBe();
				expect(ALU.SF).toBe(result.isNegative());
			}
		});

		test(`performs ${size}-byte multiplication`, () => {
			// Multiply by 0 through 10
			for (let i = 0; i < 10; i++) {
				let val = (MODULUS[size] * Math.random() / i | 0) >>> 0;
				let x = new FixedInt(size, val);
				expect(+ALU.mul(x, i)).toEqual(i*val);
			}
		});

		test.skip(`performs ${size}-byte division`, () => {
			// Throw error on division by zero
			let tester = new FixedInt(size, TESTVAL);
			expect(() => ALU.div(tester, ZERO[size])).toThrow();
			expect(() => ALU.div(tester, 0)).toThrow();

			// Divide by 1 through 10
			for (let i = 1; i < 10; i++) {
				let val = (MODULUS[size] * Math.random() | 0) >>> 0;
				let x = new FixedInt(size, val);
				expect(+ALU.div(x, i)).toEqual(val / i);
				expect(+ALU.aux).toEqual(val % i);
			}
		});

		test(`performs ${size}-byte logical operations`, () => {
			// Test ones and zeros
			let tester = new FixedInt(size, TESTVAL);
			expect(ALU.or(tester, ZERO[size])).toEqual(tester);
			expect(ALU.or(tester, MAX[size])).toEqual(MAX[size]);
			expect(ALU.and(tester, ZERO[size])).toEqual(ZERO[size]);
			expect(ALU.and(tester, MAX[size])).toEqual(tester);
			expect(ALU.xor(tester, tester)).toEqual(ZERO[size]);
			expect(ALU.xor(tester, MAX[size])).toEqual(ALU.not(tester));

			// Random tests
			let val1 = (MODULUS[size] * Math.random() | 0) >>> 0;
			let val2 = (MODULUS[size] * Math.random() | 0) >>> 0;

			let x = new FixedInt(size, val1);
			let y = new FixedInt(size, val2);

			expect(+ALU.or(x, y)).toEqual((val1 | val2 & VAL_MASK[size]) >>> 0);
			expect(+ALU.and(x, y)).toEqual((val1 & val2 & VAL_MASK[size]) >>> 0);
			expect(+ALU.xor(x, y)).toEqual((val1 ^ val2 & VAL_MASK[size]) >>> 0);
		});

		test(`performs ${size}-byte 1s and 2s complement`, () => {
			// Opposite of zero is -1
			expect(+ALU.not(ZERO[size])).toEqual(VAL_MASK[size]);
			// Negative of zero is zero
			expect(ALU.neg(ZERO[size])).toEqual(ZERO[size]);

			// Throw errors on non-FixedInt inputs
			expect(() => ALU.not(0)).toThrow();
			expect(() => ALU.neg(0)).toThrow();

			// Random positive number
			for (let i = 0; i < N_RAND; i++) {
				let val = (MODULUS[size] * Math.random() / 2 | 0) >>> 0;
				let x = new FixedInt(size, val);
				let y = new FixedInt(size, -val);

				expect(ALU.neg(x)).toEqual(y);
				expect(+ALU.neg(x)).toEqual(+y);
			}
		});


		test(`performs ${size}-byte shifts`, () => {
			// Shifting by zero
			expect(ALU.shl(MAX[size], 0)).toEqual(MAX[size]);
			expect(ALU.shr(MAX[size], 0)).toEqual(MAX[size]);
			expect(ALU.sar(MAX[size], 0)).toEqual(MAX[size]);
			// Shifting by length
			expect(ALU.shl(MAX[size], 8*size)).toEqual(ZERO[size]);
			expect(ALU.shr(MAX[size], 8*size)).toEqual(ZERO[size]);
			expect(ALU.sar(MAX[size], 8*size)).toEqual(MAX[size]);
			// Shifting by one
			expect(+ALU.shl(MAX[size], 1)).toEqual((MAX[size] << 1 & VAL_MASK[size]) >>> 0);
			expect(+ALU.shr(MAX[size], 1)).toEqual(MAX[size] >>> 1 & VAL_MASK[size]);
			expect(+ALU.sar(MAX[size], 1)).toEqual((MAX[4] >> 1 & VAL_MASK[size]) >>> 0);

			// Random shifts
			for (let i = 0; i < N_RAND; i++) {
				let shift = size * Math.random() | 0;
				let x = random(size);

				expect(+ALU.shl(x, shift)).toEqual((+x << shift & VAL_MASK[size]) >>> 0);
				expect(+ALU.shr(x, shift)).toEqual(+x >>> shift);
				expect(+ALU.sar(x, shift)).toEqual(
					((+x | (x.isNegative() && ~VAL_MASK[size])) >> shift & VAL_MASK[size]) >>> 0);
			}
		});
	}
});


describe('64-bit ALU Arithmetic', () => {
	test(`performs 8-byte addition`, () => {
		for (let i = 0; i < N_RAND; i++) {
			// Adding zero
			let x = random(8);
			expect(ALU.add(x, ZERO[8])).toEqual(x);
			
			// Adding random numbers
			let val1 = (Number.MAX_SAFE_INTEGER * Math.random() / 2 | 0) >>> 0;
			let val2 = (Number.MAX_SAFE_INTEGER * Math.random() / 2 | 0) >>> 0;

			let y1 = new FixedInt(8, val1);
			let y2 = new FixedInt(8, val2);

			expect(ALU.add(y1,y2)).toEqual(new FixedInt(8, val1+val2));

			// Test flags
			// TODO
		}
	});

	test(`performs 8-byte subtraction`, () => {
		for (let i = 0; i < N_RAND; i++) {
			// Subtracting zero and self
			let x = random(8);
			expect(ALU.sub(x, ZERO[8])).toEqual(x);
			expect(ALU.sub(x, x)).toEqual(ZERO[8]);

			// Subtracting values
			let val1 = (Number.MAX_SAFE_INTEGER * Math.random() | 0) >>> 0;
			let val2 = (Number.MAX_SAFE_INTEGER * Math.random() | 0) >>> 0;

			let y1 = new FixedInt(8, val1);
			let y2 = new FixedInt(8, val2);

			expect(ALU.sub(y1,y2)).toEqual(new FixedInt(8, val1-val2));

			// Test Flags
			// TODO
		}
	});

	test(`performs 8-byte multiplication`, () => {
		// Multiply by 0 through 10
		for (let i = 0; i < 10; i++) {
			let val = (Number.MAX_SAFE_INTEGER * Math.random() / i | 0) >>> 0;
			let x = new FixedInt(8, val);
			expect(+ALU.mul(x, i)).toEqual(i*val);
		}
	});

	test.skip(`performs 8-byte division`, () => {
		// Throw error on division by zero
		let tester = new FixedInt(8, TESTVAL);
		expect(() => ALU.div(tester, ZERO[8])).toThrow();
		expect(() => ALU.div(tester, 0)).toThrow();

		// Divide by 1 through 10
		for (let i = 1; i < 10; i++) {
			let val = (Number.MAX_SAFE_INTEGER * Math.random() | 0) >>> 0;
			let x = new FixedInt(8, val);
			expect(+ALU.div(x, i)).toEqual(val / i);
			expect(+ALU.aux).toEqual(val % i);
		}
	});

	test(`performs 8-byte logical operations`, () => {
		// Test ones and zeros
		let tester = new FixedInt(8, TESTVAL);
		expect(ALU.or(tester, ZERO[8])).toEqual(tester);
		expect(ALU.or(tester, MAX[8])).toEqual(MAX[8]);
		expect(ALU.and(tester, ZERO[8])).toEqual(ZERO[8]);
		expect(ALU.and(tester, MAX[8])).toEqual(tester);
		expect(ALU.xor(tester, tester)).toEqual(ZERO[8]);
		expect(ALU.xor(tester, MAX[8])).toEqual(ALU.not(tester));

		// Test random values
		for (let i = 0; i < N_RAND; i++) {
			let x = random(8, false);
			let y = random(8, false);

			let or = ALU.or(x, y);
			let and = ALU.and(x,y);
			let xor = ALU.xor(x,y);

			expect(or.lo).toEqual((x.lo | y.lo) >>> 0);
			expect(or.hi).toEqual((x.hi | y.hi) >>> 0);
			expect(and.lo).toEqual((x.lo & y.lo) >>> 0);
			expect(and.hi).toEqual((x.hi & y.hi) >>> 0);
			expect(xor.lo).toEqual((x.lo ^ y.lo) >>> 0);
			expect(xor.hi).toEqual((x.hi ^ y.hi) >>> 0);
		}
	});

	test(`performs 8-byte 1s and 2s complement`, () => {
		// Opposite of zero is -1
		expect(ALU.not(ZERO[8])).toEqual(MAX[8]);
		// Negative of zero is zero
		expect(ALU.neg(ZERO[8])).toEqual(ZERO[8]);

		// Throw errors on non-FixedInt inputs
		expect(() => ALU.not(0)).toThrow();
		expect(() => ALU.neg(0)).toThrow();

		// Random positive number
		for (let i = 0; i < N_RAND; i++) {
			let val = (Number.MAX_SAFE_INTEGER * Math.random() | 0) >>> 0;
			let x = new FixedInt(8, val);
			let y = new FixedInt(8, -val);

			expect(ALU.neg(x)).toEqual(y);
			expect(+ALU.neg(x)).toEqual(+y);

			let not = ALU.not(x);
			expect(not.lo).toBe(~x.lo >>> 0);
			expect(not.hi).toBe(~x.hi >>> 0);
		}
	});


	test(`performs 8-byte shifts`, () => {
		// Shifting by zero
		expect(ALU.shl(MAX[8], 0)).toEqual(MAX[8]);
		expect(ALU.shr(MAX[8], 0)).toEqual(MAX[8]);
		expect(ALU.sar(MAX[8], 0)).toEqual(MAX[8]);
		// Shifting by length
		expect(ALU.shl(MAX[8], 8*8)).toEqual(ZERO[8]);
		expect(ALU.shr(MAX[8], 8*8)).toEqual(ZERO[8]);
		expect(ALU.sar(MAX[8], 8*8)).toEqual(MAX[8]);

		// Shifting by one
		let shl1 = ALU.shl(MAX[8], 1);
		let shr1 = ALU.shr(MAX[8], 1);
		let sar1 = ALU.sar(MAX[8], 1);

		expect(shl1.lo).toEqual((VAL_MASK[4] << 1) >>> 0);
		expect(shl1.hi).toEqual(VAL_MASK[4] >>> 0);
		expect(shr1.lo).toEqual(VAL_MASK[4] >>> 0);
		expect(shr1.hi).toEqual(VAL_MASK[4] >>> 1);
		expect(sar1.lo).toEqual(VAL_MASK[4] >>> 0);
		expect(sar1.hi).toEqual(VAL_MASK[4] >>> 0);

		// Shifting by 32
		let shl32 = ALU.shl(MAX[8], 32);
		let shr32 = ALU.shr(MAX[8], 32);
		let sar32 = ALU.sar(MAX[8], 32);

		expect(shl32.lo).toEqual(0);
		expect(shl32.hi).toEqual(VAL_MASK[4] >>> 0);
		expect(shr32.lo).toEqual(VAL_MASK[4] >>> 0);
		expect(shr32.hi).toEqual(0);
		expect(sar32.lo).toEqual(VAL_MASK[4] >>> 0);
		expect(sar32.hi).toEqual(VAL_MASK[4] >>> 0);

		// Random shifts
		for (let i = 0; i < N_RAND; i++) {
			let hi = (MODULUS[4] * Math.random() | 0) >>> 0;
			let lo = (MODULUS[4] * Math.random() | 0) >>> 0;
			let x = new FixedInt(8, lo, hi);

			let shift = 1 + (31 * Math.random() | 0);

			// Shifting by one
			let shl = ALU.shl(x, shift);
			let shr = ALU.shr(x, shift);
			let sar = ALU.sar(x, shift);

			// console.log(`     shift = ${shift}`);
			// console.log(`raw: ${pad(hi.toString(2), 32)} ${pad(lo.toString(2), 32)}`);
			// console.log(`shl: ${pad(shl.hi.toString(2), 32)} ${pad(shl.lo.toString(2), 32)}`);
			// console.log(`shr: ${pad(shr.hi.toString(2), 32)} ${pad(shr.lo.toString(2), 32)}`);
			// console.log(`sar: ${pad(sar.hi.toString(2), 32)} ${pad(sar.lo.toString(2), 32)}`);

			expect(shl.lo).toBe((lo << shift) >>> 0);
			expect(shl.hi).toBe(((hi << shift) | (lo >>> (32 - shift))) >>> 0);
			expect(shr.lo).toBe((lo >>> shift | hi << (32 - shift)) >>> 0);
			expect(shr.hi).toBe(hi >>> shift);
			expect(sar.lo).toBe((lo >>> shift | hi << (32 - shift)) >>> 0);
			expect(sar.hi).toBe((hi >> shift) >>> 0);
		}
	});
});

/** Debugging function */
function pad(n, width, z='0') {
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}