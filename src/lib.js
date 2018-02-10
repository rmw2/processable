/**
 * Library of C functions, fake-implemented in javascript to allow for
 * a similar debugging and i/o experience
 *
 * We implement this as a system call-like Foreign Function Interface,
 * where the javascript functions take no arguments, but instead pull
 * them from registers or the stack according to the System V AMD64 ABI
 * using the SysV_arg function
 *
 * Libraries are implemented as Javascript objects whose members are
 * functions conforming to this API (ABI?)
 */
"use strict";

import {ALU} from './FixedInt.js';

// Hack, will fix when the FFI and lib is built out a little more
const WORD_SIZE = 8;

/**
 * The glue for our Foreign funciton interface.  Function arguments must
 * be read from registers or the stack.
 * @param {Number} index -- the (zero-based) index of the argument to fetch
 * @param {Number} size  -- the byte length of the argument to be fetched
 * @this {Process}       -- the object making the foreign function call
 */
function SysV_arg(idx, size=4) {
	switch (idx) {
		case 0:
			return this.regs.read('rdi');
		case 1:
			return this.regs.read('esi');
		case 2:
			return this.regs.read('edx');
		case 3:
			return this.regs.read('ecx');
		case 4:
			return this.regs.read('r8d');
		case 5:
			return this.regs.read('r9d');
		default:
			throw new Error('More than 6 arguments not yet implemented');
	}
}

/**
 * More glue for System V ABI: return value goes in RAX
 *
 * @param {FixedInt} -- the value to return
 */
function SysV_ret(val) {
	// Set rax to the given value
	if (val !== undefined) {
		this.regs.write('rax', val);
	}

	// Pop the return address
	let rsp = this.regs.read('rsp');
	this.regs.write('rsp', ALU.add(rsp, WORD_SIZE));
}

/**
 * Read a zero-terminated string beginning from a memory address
 *
 * @param {Number} pointer
 * @this {Process} the process in which the string resides
 * @note Perhaps this could be "hardware accelerated" by giving
 * string reading methods to the memory object itself, saving a lot of
 * function calls and comparisons
 */
function readString(pointer) {
	let ch, str = '';

	while ((ch = +this.mem.read(pointer++, 1)) != 0) {
		str += String.fromCharCode(ch);
	}

	return str;
}

/**
 * The library of C functions
 *
 */
export function Stdlib(io) {
	// Bind helper functions
	readString = readString.bind(this);
	SysV_arg = SysV_arg.bind(this);
	SysV_ret = SysV_ret.bind(this);

	console.log(io);

	return {
		printf: () => {
			// TODO expect that rax is zero
			let outString = '';
			let argIdx = 1;

			// TODO: could do this manually ?
			let addr = SysV_arg(0);
			let fmtString = readString(addr);

			for (let i = 0; i < fmtString.length; i++) {
				const ch = fmtString.charAt(i);

				if (ch == '%') {
					throw new Error('Formatting not yet implmented')
					let val = SysV_arg(idx);
					switch (fmtString.charAt(i+1)) {
						case 'd':
							outString += val.toString();
							i++; // Skip the format specifier
							break;
						case 'f':
							break;
						case '%':
							// Literal %
							outString += '%';
					}
					// Increment pointer to skip format spe
					i++;
				} else {
					outString += ch;
				}
			}

			// TODO: replace with a write to stdout
			io.stdout.write(outString);

			SysV_ret();
		},

		exit: () => {
			// TODO: Set return value or something?
			this.pc = undefined;
		}
	};
}