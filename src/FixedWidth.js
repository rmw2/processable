/**
 * A module to define a fixed-width value
 */
"use strict";

// The maximum values of unsigned integers of each size
const UMAX ={
	1: 0xFF,
	2: 0xFFFF,
	4: 0xFFFFFFFF,
	8: 0xFFFFFFFF // Repeated for convenience
};

// The maximum values of signed integers of each size
const IMAX = {
	1: 0x7F,
	2: 0x7FFF,
	4: 0x7FFFFFFF,
}

// The modulus 
const MOD = {
	1: 0x100,
	2: 0x10000,
	4: 0x100000000,
};

class FixedWidthError extends Error {
	constructor(message) {
		super(message);
		this.name = 'FixedWidthError';
	}
}


/**
 * The Fixed Width Number can represent a 1,2,4, or 8 byte integer, agnostic to sign.
 * 
 */
export default class FixedWidthNumber {
	/**
	 * Create a new number of the specified width in bytes.
	 * The size of the 
	 */
	constructor(size, loOrDataView = 0, hiOrOffset = 0, littleEndian = true) {
		if ([1,2,4,8].indexOf(size) < 0)
			throw new FixedWidthError(`Invalid size in bytes: ${size}`);


		// Instantiate from a DataView if provided
		if (loOrDataView instanceof DataView) {
			let view = loOrDataView;
			let offset = hiOrOffset;
			switch (size) {
				case 1:
					this.lo = view.getUint8(offset, littleEndian);
					this.hi = 0;
					break;
				case 2:
					this.lo = view.getUint16(offset, littleEndian);
					this.hi = 0;
					break;
				case 4:
					this.lo = view.getUint32(offset, littleEndian);
					this.hi = 0;
					break;
				case 8:
					this.lo = view.getUint32(offset, littleEndian);
					this.hi = view.getUint32(offset + 4, littleEndian);
					break;
			}
		} else {
			// Validate size of input number
			if (size === 8 && loOrDataView > UMAX[4]) {
				if (hiOrOffset) throw new FixedWidthError('hi and lo must be less than 2^32');
				hiOrOffset = (loOrDataView / MOD[4]) | 0;
				loOrDataView &= UMAX[4];
			} else if (loOrDataView > UMAX[this.size]) {
				// This need not be an error, but maybe a warning ? 
				// throw new FixedWidthError(`Value exceeds max size for ${size}-byte integer`);
			}

			this.lo = (loOrDataView & UMAX[size]) >>> 0;
			this.hi = hiOrOffset >>> 0;
		}

		this.size = size;
		this.littleEndian = littleEndian;

		// Flags to maintain
		this.sign = (size === 8) ? this.hi > IMAX[4] : this.lo > IMAX[this.size];
		this.overflow = false;
		this.carry = false;
	}

	/**
	 * Increase this fixed width number by the FixedWidthNumber represented by that.
	 *
     * Set the carry and overflow flags according to the result of the addition:
	 * Carry is set if the result exceeds the maximum value of a fixed width number for
	 * the current size
	 * Overflow is set if two negative integers are added to obtain a positive, or vice versa
	 * Sign is set to be the sign of the result interpreted as 2s complement in the current size
	 */
	add(that) {
		if (this.size !== that.size) 
			throw new FixedWidthError(`Sizes don't match: ${this.size} and ${that.size}`);

		// Get the signs of the addends ahead of time
		let equalSigns = !(this.sign ^ that.sign);
		let oldSign = this.sign;

		// Add lo first
		this.lo += that.lo;

		if (this.size === 8) {
			// Carry from lo into hi
			this.hi += that.hi + (this.lo > UMAX[4]);
			
			// Truncate lo and keep unsigned
			this.lo >>>= 0;

			// Handle sign and overflow
			this.carry = this.hi > UMAX[4];

			// Truncate overflow
			if (this.carry) this.hi >>>= 0;
			this.sign = this.hi > IMAX[4];
		} else {
			// Handle sign and overflow
			this.carry = this.lo > UMAX[this.size];

			// Truncate overflow
			if (this.carry) this.lo = (this.lo & UMAX[this.size]) >>> 0;
			this.sign = this.lo > IMAX[this.size];
		}

		// Set overflow flag
		this.overflow = equalSigns && !!(oldSign ^ this.sign);
		return this;
	}

	/**
	 * Subtract that from this by adding the negation of that 
	 */
	subtract(that) {
		return this.add(that.clone().negate());
	}

	multiply(that) {
		if (this.size !== that.size) 
			throw new FixedWidthError(`Sizes don't match: ${this.size} and ${that.size}`);

	    if (that.valueOf() == 0) {
   	        this.hi = 0;
			this.lo = 0;
			return;	    	
	    }

        product = mul(factor1, factor2 / 2) * 2
   	        if isOdd(factor2):
   	           product += factor1
   	     return product
	}

	divide(that) {
		// TODO

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

	shiftLeft(that) {
		let shift = +that;

		if (size === 8) {
			if (shift >= 64) {
				this.hi = this.lo = 0;
			} else if (shift >= 32) {
				this.hi = this.lo << (shift - 32);
				this.lo = 0;
			} else {
				// Or bits shifted out of lo with shifted hi
				this.hi = (this.hi << shift) | (this.lo >>> (32 - shift));
				this.lo <<= shift;
			}
		} else {
			this.lo = (this.lo << that) & UMAX[this.size] >>> 0;
		}

		return this;
	}

	shiftArithmeticRight(that) {
		let shift = +that;

		if (size === 8) {
			if (shift >= 64) {
				this.hi = this.lo = this.sign ? UMAX[4] : 0;
			} else if (shift >= 32) {
				this.hi = this.sign ? UMAX[4] : 0;
				this.lo = this.hi >> (shift - 32);
			} else {
				// carry bits shifted out of hi into shifted lo
				this.lo = (this.lo >> shift) | (this.hi << (32 - shift));
				this.hi >>= shift;
			}
		} else {
			// shift left to get sign
			let extraBits = (32 - 8*this.size);
			let signed = this.lo << extraBits >> extraBits;
			this.lo = (signed >> shift & UMAX[this.size]) >>> 0;
		}

		return this;
	}

	shiftLogicalRight(that) {
		let shift = +that;

		if (size === 8) {
			if (shift >= 64) {
				this.hi = this.lo = 0;
			} else if (shift >= 32) {
				this.hi = 0;
				this.lo = this.hi >>> (shift - 32);
			} else {
				// carry bits shifted out of lo into shifted hi
				this.lo = (this.lo >>> shift) | (this.hi << (32 - shift));
				this.hi >>>= shift;
			}
		} else {
			this.lo = (this.lo >>> shift & UMAX[this.size]) >>> 0;
		}

		return this;
	}

	or(that) {
		if (this.size !== that.size) 
			throw new FixedWidthError(`Sizes don't match: ${this.size} and ${that.size}`);

		if (this.size === 8) this.hi = (this.hi | that.hi) >>> 0;
		this.lo = (this.lo | that.lo) >>> 0;

		return this;
	}

	and(that) {
		if (this.size !== that.size) 
			throw new FixedWidthError(`Sizes don't match: ${this.size} and ${that.size}`);
		
		if (this.size === 8) this.hi = (this.hi & that.hi) >>> 0;
		this.lo = (this.lo & that.lo) >>> 0;

		return this;
	}

	/**
	 * Xor this number with that
	 */
	xor(that) {
		if (this.size !== that.size) 
			throw new FixedWidthError(`Sizes don't match: ${this.size} and ${that.size}`);
		
		if (this.size === 8) this.hi = (this.hi ^ that.hi) >>> 0;
		this.lo = (this.lo ^ that.lo) >>> 0;

		return this;
	}

	/**
	 * Negate (2s complement) the number represented by this object
	 */
	negate() {
		if (this.size === 8) this.hi = ~this.hi >>> 0;
		this.lo = ((~this.lo + 1) & UMAX[this.size]) >>> 0;

		if (this.lo !== 0) this.sign = !this.sign;

		return this;
	}

	/**
	 * Flip (1s complement) the number represented by this object
	 */
	not() {
		if (this.size === 8) this.hi = ~this.hi >>> 0;
		this.lo = (~this.lo & UMAX[this.size]) >>> 0;
		
		// Flip sign flag
		if (this.size === 8) this.sign = this.hi > IMAX[4];
		else this.sign = this.lo > IMAX[this.size];

		return this;
	}

	/**
	 * Return a javascript number with the same value as this object, if possible.
	 * If the value of this object is greater than 2^53, it will return the closest
	 * representable number to this value
	 */
	valueOf() {
		return this.lo + MOD[4]*this.hi;
	}

	/**
	 * Return true if the number represented by this object is the same as 
	 * the number represented by that.  Doesn't compare flags or size.
	 */
	equals(that) {
		return (this.lo === that.lo && this.hi === that.hi);
	}

	/** 
	 * Return a new FixedWidthNumber with the same representation as this.
	 * Note that this clears the carry and overflow flags.
	 */
	clone() {
		return new FixedWidthNumber(this.size, this.lo, this.hi);
	}

	/** 
	 * Write the value of this object to the DataView view, beginning at offset
	 */
	writeToBuffer(view, offset) {
		switch (this.size) {
			case 1:
				view.setUint8(offset, this.lo, this.littleEndian);
				break;
			case 2:
				view.setUint16(offset, this.lo, this.littleEndian);
				break;
			case 4:
				view.setUint32(offset, this.lo, this.littleEndian);
				break;
			case 8:
				if (this.littleEndian) {
					view.setUint32(offset, this.lo, this.littleEndian);
					view.setUint32(offset + 4, this.hi, this.littleEndian);
				} else {
					view.setUint32(offset, this.hi, !this.littleEndian);
					view.setUint32(offset + 4, this.lo, !this.littleEndian);
				}
				break;
		}
	}
}

module.exports = { FixedWidthNumber };