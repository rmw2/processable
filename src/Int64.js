"use strict";
import { pad } from './decode.js';

const MAX_INT32 = 0xFFFFFFFF;
const MAX_INT53 = 0x1FFFFFFFFFFFFF;
const MAX_INT64 = 0xFFFFFFFFFFFFFFFF;

/**
 * Indicates a failure to read from a hardware register
 */
class Int64Error extends Error {
    constructor(msg) {
        super(`Int64 Error: ${msg}`);
        this.name = 'Int64Error';
    }
}

class Int64 {
	constructor(lo, hi) {
		if (lo > MAX_INT32) {
			if (hi) throw new Int64Error('Components must be less than 2^32');
			if (lo > MAX_INT64) throw new Int64Error('Value must be less than 2^64');
			// Chop off the low bits
			hi  = Math.floor(lo / (MAX_INT32 + 1));
			// Stick the low bits back in
			lo &= MAX_INT32;
		}
		
		if (hi > MAX_INT32)
			throw new Int64Error('Value must be less than 2^64');

		// Save hi and lo as 32 bit values
		this.lo = lo || 0;
		this.hi = hi || 0;

		// For identification
		this.name = 'Int64';
	}

	// Return a number for each
	lohi() {
		return {
			lo: this.lo,
			hi: this.hi
		}
	}

	val() {
		let val = this.hi * (MAX_INT32 + 1) + this.lo;

		if (val > MAX_INT53) 
			throw new Int64Error(`Value ${val} is too large to store accurately`);

		return val;
	}

	toString(base) {
		if (base === 2 || base === 16) {
			return this.hi.toString(base) + pad(this.lo.toString(base), 64 / base);
		} else if (base === 10) {
			// Convert to hex first, as strings can be concatenated
			const hexDigits = this.hi.toString(16) + pad(this.lo.toString(16), 8);

			// Keep track of decimal digits in an array
			let decDigits = [];
			let carry = 0;

			for (let digit of hexDigits.split('')) {
				let val = parseInt(digit, 16) + carry;
				carry = Math.floor(val / 10);
				decDigits.unshift(val % 10);
			}

			// Trim leading zeros
			return decDigits.join('').replace(/^0+(?!\.|$)/, '');
		} else {
			throw new Int64Error(`Can't directly decode to base ${base}!  Only decimal, binary, and hex supported.`);
		}
	}
}


/** Update the dataview prototype to support 64-bit integers */
DataView.prototype.getUint64 = function (idx, littleEndian=true) {
	let lo, hi;
	if (littleEndian) {
		lo = this.getUint32(idx, littleEndian);
		hi = this.getUint32(idx + 4, littleEndian);
	} else {
		lo = this.getUint32(idx + 4, littleEndian);
		hi = this.getUint32(idx, littleEndian);
	}

	return new Int64(lo, hi);
}

DataView.prototype.setUint64 = function (idx, value, littleEndian=true) {
	let {lo, hi} = value.lohi();

	if (littleEndian) {
		this.setUint32(idx, lo, littleEndian);
		this.setUint32(idx + 4, hi, littleEndian);
	} else {
		this.setUint32(idx + 4, lo, littleEndian);
		this.setUint32(idx, hi, littleEndian);
	}
}

module.exports = { Int64 };