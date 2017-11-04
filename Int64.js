const MAX_INT32 = 0xFFFFFFFF;

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
			hi = lo >> 32;
			lo &= MAX_INT32;
		}
		
		if (hi > MAX_INT32)
			throw new Int64Error('Components must be less than 2^32');

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
		return (this.hi << 32) + this.lo;
	}
}


/** Update the dataview prototype to support 64-bit integers */
DataView.prototype.getUint64 = function (idx, littleEndian) {
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

DataView.prototype.setUint64 = function (idx, value, littleEndian) {
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