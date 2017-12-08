/**
 * A module to define a fixed-width value
 */

// The maximum values of unsigned integers of each size
const UMAX ={
	1: 0xFF,
	2: 0xFFFF,
	4: 0xFFFFFFFF,
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
		if (!(size in [1,2,4,8]))
			throw new FixedWidthError(`Invalid size: ${size}`);

		// Instantiate from a DataView if provided
		if (loOrDataView instanceof DataView) {
			let view = loOrDataView;
			let offset = hiOrOffset;
			switch (size) {
				case 1:
					this.lo = view.getUint8(offset, true);
					break;
				case 2:
					this.lo = view.getUint16(offset, true);
					break;
				case 4:
					this.lo = view.getUint32(offset, true);
					break;
				case 8:
					this.lo = view.getUint32(offset, true);
					this.hi = view.getUint32(offset + 4, true);
					break;
			}
		} else {
			// Validate size of input number
			if (size === 8 & loOrDataView > UMAX[4]) {
				if (hiOrOffset) throw new FixedWidthError('hi and lo must be less than 2^32');
				hiOrOffset = (loOrDataView / MOD[4]) | 0;
				loOrDataView |= UMAX[4];
			} else if (loOrDataView > UMAX[size]) {
				throw new FixedWidthError(`Value exceeds max size for ${size}-byte integer`);
			} else if (loOrDataView < 0) {
				// Interpret all numbers as unsigned
				loOrDataView += MOD[size];
			}

			this.lo = loOrDataView;
			this.hi = hiOrOffset;
		}

		this.size = size;
		this.overflow = false;
		this.carry = false;
	}

	add(that) {
		if (this.size !== that.size) 
			throw new FixedWidthError(`Sizes don't match: ${this.size} and ${that.size}`);

		if (this.size === 8) {
			let sign = this.hi > IMAX[4];
			this.lo += that.lo;
			this.hi += that.hi + ((this.lo / MOD[4]) | 0);
			this.lo |= UMAX[4];

			// Handle overflow
			this.overflow = sign ^ (this.hi > IMAX[4]);
			this.carry = this.hi > UMAX[4];
		} else {
			let sign = this.lo > IMAX[size]];
			this.lo += that.lo;

			// Handle overflows and such
			this.overflow = sign ^ (this.lo > IMAX[size]);
			this.carry = this.lo > UMAX[size];
		}
	}

	subtract(that) {
		if (this.size !== that.size) 
			throw new FixedWidthError(`Sizes don't match: ${this.size} and ${that.size}`);

		if (this.size === 8) {
			this.lo -= that.lo;
			this.hi -= that.hi + ((this.lo / MOD[4]) | 0);
			this.lo |= UMAX[4];

			// Handle overflow
			this.overflow = sign ^ (this.hi > IMAX[4]);
			this.carry = this.hi > UMAX[4];
		} else {
			// Do the addition
			let sign = this.lo > IMAX[size]];
			this.lo -= that.lo;

			// Keep things unsigned
			if (this.lo < 0) 
				this.lo += MOD[size];

			// Handle overflow
			this.overflow = sign ^ (this.lo > IMAX[size]);
			this.carry = this.lo > UMAX[size];
		}
	}

	multiply(that) {

	}

	divide(that) {

	}

	shift(that) {

	}

	negate() {

	}

	not() {
		
	}

	valueOf() {
		return this.lo + MOD[4]*this.hi;
	}

	writeToBuffer(view) {
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
				view.setUint32(offset, this.lo, this.littleEndian);
				view.setUint32(offset + 4, this.hi, this.littleEndian);
				break;
		}
	}
}