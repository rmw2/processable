/*********************************************************************
 * A module for representing fixed-width integers and performing 
 * logical and arithmetic operations on them.
 *
 *********************************************************************/
"use strict";

class FixedIntError extends Error {
	constructor(message) {
		super(message);
		this.name = 'FixedIntError';
	}
}

// (2^53 - 1) >> 32
const MAX_SAFE_HI = 0x001FFFFF;

// Mask for the high bit for each size
const SIGN_MASK = {
	1: 0x80,
	2: 0x8000,
	4: 0x8000000
};

// Truncation masks for values
const VAL_MASK = {
	1: 0xFF,
	2: 0xFFFF,
	4: 0xFFFFFFFF
}

// Moduli for each byte size
const MODULUS = {
	1: 0x100,
	2: 0x10000,
	4: 0x100000000
};

/**
 * An immutable data type representing a fixed width integer
 * its size in bytes can be 1, 2, 4, or 8
 */
export default class FixedInt {
	/**
	 * Construct a new FixedInt object.  The constructor admits three formats:
	 *     FixedInt(size {int}, lo {int} [, hi {int}])
	 *     FixedInt(size {int}, view {DataView}, offset {int}, littleEndian {boolean})
	 *     FixedInt(fixedInt)
	 */
	constructor (sizeOrObject, loOrDataView = 0, hiOrOffset = 0, littleEndian = true) {
		// Deconstruct object if provided
		if (typeof sizeOrObject === 'object') {
			sizeOrObject = sizeOrObject.size || throw new FixedIntError('Object must provide size');
			loOrDataView = sizeOrObject.lo || 0;
			hiOrOffset = sizeOrObject.hi || 0;
		}

		// Validate size
		if ([1,2,4,8].indexOf(sizeOrObject) < 0) 
			throw new FixedIntError(`Invalid size in bytes: ${sizeOrObject}`);
		this._size = sizeOrObject;

		// DataView constructor
		if (loOrDataView instanceof DataView) {
			let view = loOrDataView;
			let offset = hiOrOffset;
			switch (size) {
				case 1:
					this._lo = view.getUint8(offset, littleEndian);
					this._hi = 0;
					break;
				case 2:
					this._lo = view.getUint16(offset, littleEndian);
					this._hi = 0;
					break;
				case 4:
					this._lo = view.getUint32(offset, littleEndian);
					this._hi = 0;
					break;
				case 8:
					if (littleEndian) {
						this._lo = view.getUint32(offset, littleEndian);
						this._hi = view.getUint32(offset + 4, littleEndian);
					} else {
						this._hi = view.getUint32(offset, !littleEndian);
						this._lo = view.getUint32(offset + 4, !littleEndian);
					}
			}
		}

		// Integer constructor
		else {
			// Validate size of input number
			if (this.size === 8) {
				if (hiOrOffset && loOrDataView >= MODULUS[4]) 
					throw new FixedIntError('hi and lo must be less than 2^32');
				if (loOrDataView > Number.MAX_SAFE_INTEGER)
					throw new FixedIntError('Value larger than max safe integer.  Use two-part constructor.');

				// Set hi and lo
				this._hi = hiOrDataView || (loOrDataView / MODULUS[4]) | 0;
				this._lo = (loOrDataView & VAL_MASK[4]) >>> 0;
			} else {
				this._lo = (loOrDataView & VAL_MASK[this.size]) >>> 0;
				this._hi = 0;
			}
		}
	}

	/**
	 * Getters for size, lo, and hi.  
	 * All are read-only properties, setters do nothing
	 */
	get size() {
		return this._size;
	}

	get lo() {
		return this._lo;
	}

	get hi() {
		return this._hi;
	}

	/**
	 * Is this integer negative, when interpretted as signed?
	 * {boolean}
	 */
	isNegative() {
		return (this.size == 8) 
			? !!(this.hi & SIGN_MASK[4])
			: !!(this.lo & SIGN_MASK[this.size]);
	}

	/**
	 * Is this integer less than that integer, 
	 * when both are interpreted as unsigned
	 */
	isLessThan(that) {

	}

	/**
	 * Is this integer odd?
	 * {boolean}
	 */
	isOdd() {
		return !!(this.lo & 1);
	}

	/**
	 * Is the value of this integer safely representable as a Number?
	 * {boolean}
	 */
	isSafeInteger() {
		return (this.size < 8 || this.hi < MAX_SAFE_HI);
	}

	/**
	 * Return the javascript Number that most closely represents this
	 * number.  Accuracy guaranteed iff this.isSafeInteger().
	 */
	valueOf() {
		return (this.size == 8)
			? MODULUS[4]*this.hi + this.lo
			: this.lo;
	}

	/**
	 * Return a new FixedInt with the same value as this
	 */
	clone() {
		return new FixedInt(this);
	}

	/**
	 * Return a new FixedInt with the same value as this with the 
	 * specified size, truncating if necessary
	 */
	toSize(size) {
		return new FixedInt(size, this.lo, this.hi);
	}

	/**
	 * Is this integer the same value as that? 
	 */
	equals(that) {
		return (this.size == that.size)
		 	&& (this.lo == that.lo) 
			&& (this.size < 8 || this.hi == that.hi);
	}

	/**
	 * Write this value to an ArrayBuffer wrapped by a DataView view
	 */
	toBuffer(view, offset=0, littleEndian=true) {
		switch (this.size) {
			case 1:
				view.setUint8(offset, this.lo, littleEndian);
				break;
			case 2:
				view.setUint16(offset, this.lo, littleEndian);
				break;
			case 4:
				view.setUint32(offset, this.lo, littleEndian);
				break;
			case 8:
				if (littleEndian) {
					view.setUint32(offset, this.lo, littleEndian);
					view.setUint32(offset + 4, this.hi, littleEndian);
				} else {
					view.setUint32(offset, this.hi, !littleEndian);
					view.setUint32(offset + 4, this.lo, !littleEndian);
				}
				break;
		}
	}
}


/* Flags to represent carry/overflow */
let _OF = false;
let _CF = false;
let _ZF = false;
let _SF = false;

let _PF = false; /* Not implemented */
let _AF = false; /* Not implemented */

/**
 * Static class to perform arithmetic on FixedInt objects
 */
export class ALU {
	/** Setters and getters for Overflow, Carry, Zero, and Sign flags */
	static get OF() {return _OF};
	static get CF() {return _CF};
	static get ZF() {return _ZF};
	static get SF() {return _SF};
	// static get AF() {return _AF};
	// static get PF() {return _PF};

	static add(a, b) {
		let {size, a, b} = validateOperands(a, b);
		let hi = a.hi + b.hi;
		let lo = a.lo + b.lo;

		if (size === 8) {
			// Carry from lo into hi
			hi += (lo > VAL_MASK[4]);
			lo &= VAL_MASK[4];

			this.CF = hi > MODULUS[4];
		} else {
			this.CF = lo > MODULUS[size];
		}

		const result = new FixedInt(size, lo, hi);

		// Set overflow, sign, & zero flags
		_OF = (a.isNegative() == b.isNegative()) ^ result.isNegative();
		_ZF = result == 0;
		_SF = result.isNegative();

		return result;
	}

	static sub(a, b) {
		return this.add(a, this.neg(b));
	}

	static mul(a, b) {
		let {size, a, b} = validateOperands(a, b);

		// Base case
		if (b == 0) return new FixedInt(size);

		// Recursive definition of multiplication
		const product = this.shl(this.mul(a, this.sar(b, 1)), 1);
        if (b.isOdd()) {
   	        product = this.add(product, a);
        }

   	    return product;
	}

	static div(a, b) {
	// def divmod(dividend, divisor):
  //       if dividend < divisor:
  //          quotient, remainder = [0, dividend]
  //       else:
  //          quotient, remainder = divmod(dividend, 2*divisor)
  //          quotient *= 2
  //          if remainder >= divisor:
  //             quotient += 1
  //             remainder -= divisor
  //       return [quotient, remainder]
	}

	static shl(a, b) {
		// Use the Number representation of the shift
		let hi, lo, shift = +b;

		if (a.size === 8) {
			if (shift >= 64) {
				hi = lo = 0;
			} else if (shift >= 32) {
				hi = a.lo << (shift - 32);
				lo = 0;
			} else {
				// Or bits shifted out of lo with shifted hi
				hi = (a.hi << shift) | (a.lo >>> (32 - shift));
				lo = a.lo << shift;
			}
		} else {
			lo = (shift >= 32) ? 0 : (a.lo << shift);
		}

		let result = new FixedInt(a.size, lo, hi);

		return result
	}

	static sar(a, b) {
		let hi, lo, shift = +b;

		if (a.size === 8) {
			if (shift >= 64) {
				// Value entirely shifted out
				hi = lo = (a.isNegative() ? VAL_MASK[4] : 0);
			} else if (shift >= 32) {
				// Hi entirely shifted out
				hi = a.isNegative() ? VAL_MASK[4] : 0;
				lo = a.hi >> (shift - 32);
			} else {
				// Carry bits shifted out of hi into shifted lo
				lo = (a.lo >> shift) | (a.hi << (32 - shift));
				hi = a.hi >> shift;
			}
		} else {
			if (a.isNegative()) {
				// Propagate the sign to the 4-byte sign bit
				lo = (shift >= 32) ? VAL_MASK[a.size] : (a.lo & ~VAL_MASK[a.size]) >> shift;
			} else {
				// Simply shift
				lo = (shift >= 32) ? 0 : (a.lo >> shift);
			}
		}

		let result = new FixedInt(a.size, lo, hi);

		return result;
	}

	static shr(a, b) {
		let lo, hi, shift = +that;

		if (a.size === 8) {
			if (shift >= 64) {
				// Value entirely shifted out
				hi = lo = 0;
			} else if (shift >= 32) {
				// Hi entirely shifted out
				hi = 0;
				lo = a.hi >>> (shift - 32);
			} else {
				// Carry bits shifted out of lo into shifted hi
				lo = (a.lo >>> shift) | (a.hi << (32 - shift));
				hi = a.hi >>> shift;
			}
		} else {
			lo = (shift >= 32) ? 0 : (a.lo >>> shift);
		}

		let result = new FixedInt(a.size, lo, hi);

		return result;
	}

	static and(a, b) {
		let {size, a, b} = validateOperands(a, b);
		let lo = a.lo & b.lo;
		let hi = a.hi & b.hi;

		let result = new FixedInt(size, lo, hi);

		return result;
	}

	static or(a, b) {
		let {size, a, b} = validateOperands(a, b);
		let lo = a.lo | b.lo;
		let hi = a.hi | b.hi;

		let result = new FixedInt(size, lo, hi);

		return result;
	}

	static xor(a, b) {
		let {size, a, b} = validateOperands(a, b);
		let lo = a.lo ^ b.lo;
		let hi = a.hi ^ b.hi;

		let result = new FixedInt(size, lo, hi);

		return result;
	}

	static not(a) {
		let lo = ~a.lo;
		let hi = ~a.hi;

		let result = new FixedInt(a.size, lo, hi);

		return result;
	}

	static neg(a) {
		let lo, hi;

		if (a.size === 8) {
			lo = ~a.lo + 1;
			hi = ~a.hi + (lo === 0);
		} else {
			lo = ~a.lo + 1;
		}

		let result = new FixedInt(a.size, lo, hi);
		return result;
	}
}

/**
 * Ensure that the operands are the same size, or coerce both to FixedInt
 */
function validateOperands(a, b) {
	// Validate type
	if (!(a instanceof FixedInt))
		throw new FixedIntError('First operand must be instance of FixedInt');

	// Validate sizes
	let size = a.size;
	if (b instanceof FixedInt) {
		if (b.size !== size) 
			throw new FixedIntError('FixedInt operands must be the same size');
	} else {
		b = new FixedInt(size, b);
	}

	return {size, a, b};
}