let { Int64 } = require('./Int64.js');

const MAX_INT32 = 0xFFFFFFFF;
const MAX_INT53 = 0x1FFFFFFFFFFFFF;
const MAX_INT64 = 0xFFFFFFFFFFFFFFFF;

describe('Initialization', () => {
	test('handles values less than 2^32', () => {
		let val = MAX_INT32;

		let val64 = new Int64(val);
		let {lo, hi} = val64.lohi();

		expect(val64.val()).toBe(val);
		expect(lo).toBe(val);
		expect(hi).toBe(0);
	});

	test('handles values between 2^32 and 2^53', () => {
		let base = MAX_INT32 + 1;
		let more = 0xFF;

		let val64 = new Int64(base + more);
		let {lo, hi} = val64.lohi();

		expect(val64.val()).toBe(base + more);
		expect(lo).toBe(more);
		expect(hi).toBe(1);
	});

	test('handles values between 2^53 and 2^64', () => {
		let val = MAX_INT53 + 1;

		let val64 = new Int64(val);
		let {lo, hi} = val64.lohi();

		expect(() => {
			val.val();
		}).toThrow();

		expect(lo).toBe(val % (MAX_INT32 + 1));
		expect(hi).toBe(Math.floor(val / (MAX_INT32 + 1)));
	});

	test('throws error for invalid constructor', () => {
		expect(() => {
			new Int64(MAX_INT32 + 1, 1);
		}).toThrow();

		expect(() => {
			new Int64(1, MAX_INT32 + 1);
		}).toThrow();

		expect(() => {
			new Int64(MAX_INT64 + 1);
		}).toThrow();
	})
});

describe('Writing to buffers', () => {

});