"use strict";
let { Int64 } = require('./Int64.js');

/**
 * Indicates a failure to read from a hardware register
 */
class RegisterError extends Error {
    constructor(reg, msg) {
        super(`Invalid Access @${reg}: ${msg}`);
        this.name = 'InvalidAccess';
        this.reg = reg;
    }
}

/**
 * A class to represent a set of potentially overlapping registers of
 * various bit-lengths.
 *
 * Supports read and write operations.
 */
class RegisterSet {
	/**
	 * Create a set of registers from an object which gives 
	 * register names mapped to byte offsets and byte lengths
	 * for each available register.  The word size and endianness
	 * can also be specified at construction.
	 */
	constructor(info, wordSize = 8, littleEndian = true) {
		let nRegs = Object.keys(info).length;
		
		this.littleEndian = littleEndian;

		this.info = info;
		this.buffer = new ArrayBuffer(wordSize * nRegs);
		this.view = new DataView(this.buffer);
	}

	/**
	 * Return the value held in the specified register.
	 */
	read(reg) {
		let [idx, size]  = this.info[reg];

		switch (size) {
			case 1:
				return this.view.getUint8(idx, this.littleEndian);
			case 2: 
				return this.view.getUint16(idx, this.littleEndian);
			case 4:
				return this.view.getUint32(idx, this.littleEndian);
			case 8:
				return this.view.getUint64(idx, this.littleEndian);
		}
	}

	/**
	 * Write a value to the specified register, representing it
	 * with the appropriate number of bytes.
	 */
	write(reg, value) {
		let idx, size;

		try {
			[idx, size]  = this.info[reg];
		} catch (Error) {
			throw new RegisterError(reg, 'Does not exist');
		}

		switch (size) {
			case 1:
				this.view.setUint8(idx, value, this.littleEndian);
				break;
			case 2: 
				this.view.setUint16(idx, value, this.littleEndian);
				break;
			case 4:
				this.view.setUint32(idx, value, this.littleEndian);
				break;
			case 8:
				// Determine if value is already an Int64
				if (value.name !== 'Int64') value = new Int64(value, 0);
				this.view.setUint64(idx, value, this.littleEndian);
				break;
		}
	}
}

/**
 * Status flags register
 */
let Flags = {
	OF: false,
	SF: false,
	ZF: false,
	AF: false,
	CF: false,
	PF: false,
}

module.exports = { RegisterSet, Flags };