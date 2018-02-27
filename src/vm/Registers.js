"use strict";
import {FixedInt, ALU} from '../fixed-int/FixedInt.js';
/**
 * Indicates a failure to read from a hardware register
 */
export class RegisterError extends Error {
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
export default class RegisterSet {
	/**
	 * Create a set of registers from an object which gives
	 * register names mapped to byte offsets and byte lengths
	 * for each available register.  The word size and endianness
	 * can also be specified at construction.
	 */
	constructor(descriptor, littleEndian = true) {
		// Dave properties of registers
		this.littleEndian = littleEndian;
		this.n = descriptor.info.n;
		this.size = descriptor.info.size;

		// Allocate space to hold register data
		this.buffer = new ArrayBuffer(this.size * this.n);
		this.view = new DataView(this.buffer);

		// Parse the register descriptor to get register to buffer offset mapping
		// and keep group mapping as relative offset
		this.mapping = {};
		this.groups = descriptor.mapping.map((group, idx) => {
			let aligned = [];
			for (const reg in group) {
				// Save directly to mapping
				this.mapping[reg] = group[reg];
				// Calculate offset from this register
				aligned.push({
					name: reg,
					offset: group[reg][0] - idx*this.size,
					size: group[reg][1]
				});
			}

			return aligned;
		});

		this.flags = descriptor.flags;
	}

	/**
	 * Return the value held in the specified register.
	 */
	read(reg) {
		let [idx, size]  = this.mapping[reg];

		return new FixedInt(size, this.view, idx);
	}

	/**
	 * Write a value to the specified register, representing it
	 * with the appropriate number of bytes.
	 */
	write(reg, value) {
		let idx, size;

		try {
			[idx, size]  = this.mapping[reg];
		} catch (Error) {
			throw new RegisterError(reg, 'Does not exist');
		}

		if (value.size !== size)
			throw new RegisterError(`Can't write ${value.size}-byte value to ${size}-byte register`);

		value.toBuffer(this.view, idx);
	}

	/**
	 * Set the flag with the given name to the given value
	 */
	setFlag(name, value=true) {
		this.flags[name] = value;
	}

	/**
	 * Return the current value of the given flag
	 */
	getFlag(name) {
		return this.flags[name];
	}
}

module.exports = { RegisterSet };