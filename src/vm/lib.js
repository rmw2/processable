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
 *
 * Some things in this library (e.g. scanf) are asynchronous, so we use
 * custom Javascript events to handle them.  This means that the library
 * will only run if the vm is in a browser context
 */
"use strict";

import {FixedInt, ALU} from '../fixed-int/FixedInt.js';

// Hack, will fix when the FFI and lib is built out a little more
const WORD_SIZE = 8;

const EOF = '';

const SCAN = {
	MATCH: 0,
}

/**
 * The library of C functions
 *
 * NOTE/TODO: probably change the io {stdout, stdin, stderr} to
 * an array fd [] of "file descriptors", just for more extensibility
 */
export function Stdlib(io) {

	/**
	 * The glue for our Foreign funciton interface.  Function arguments must
	 * be read from registers or the stack.
	 * @param {Number} index -- the (zero-based) index of the argument to fetch
	 * @param {Number} size  -- the byte length of the argument to be fetched
	 * @this {Process}       -- the object making the foreign function call
	 */
	const SysV_arg = (idx) => {
		switch (idx) {
			case 0:
				return this.regs.read('rdi');
			case 1:
				return this.regs.read('rsi');
			case 2:
				return this.regs.read('rdx');
			case 3:
				return this.regs.read('rcx');
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
	const SysV_ret = (val) => {
		// Set rax to the given value
		if (val !== undefined) {
			this.regs.write('rax', new FixedInt(WORD_SIZE, val));
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
	const readString = (pointer) => {
		let ch, str = '';

		while ((ch = +this.mem.read(pointer++, 1)) != 0) {
			str += String.fromCharCode(ch);
		}

		return str;
	}

	return {
		/**
		 *
		 */
		printf: () => {
			// TODO expect that rax is zero
			let outString = '';
			let idx = 1;

			// TODO: could do this manually ?
			let addr = SysV_arg(0);
			let fmtString = readString(addr);

			for (let i = 0; i < fmtString.length; i++) {
				const ch = fmtString.charAt(i);

				if (ch == '%') {
					let val = SysV_arg(idx++);
					let fmt;
					switch (fmt = fmtString.charAt(i+1)) {
						case 'l':
							if (fmtString.charAt(i+2) != 'd')
								throw new Error(`Invalid format specifier ${fmt + fmtSTring.charAt(i+2)}`);
							i++;
						case 'i':
						case 'd':
							outString += val.toString();
							i++; // Skip the format specifier
							break;
						case 'x':
							outString += val.toString(16);
							i++;
							break;
						case 'f':
						case 'g':
							throw new Error('Double precision conversion specifiers not supported');
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

			// Write it to stdout
			io.stdout.write(outString);

			SysV_ret(0);
		},

		putchar: () => {
			let arg = SysV_arg(0);
			let char = String.fromCharCode(+arg);
			io.stdout.write(char);
			SysV_ret(arg);
		},

		getchar: () => {
			// TODO
		},

		/**
		 *
		 */
		labs: () => {
			let val = SysV_arg(0);

			if (val.isNegative())
				SysV_ret(ALU.neg(val));
			else
				SysV_ret(val);
		},

		/**
		 * Slightly simplified scanf that assumes buffer will match format
		 */
		scanf: () => {
			let fmtString = readString(SysV_arg(0));

			// Parse the format string and determine what to read
			let sections = fmtString.split(/(%(?:[dics]))/g);
			let nRead = 0;
			let idx = 0;
			let arg = 1;

			const _scanf = () => {
				// Block process and setup event handler for input
				this.blocked = true;
				this.signals.register('SIGIO', _scanf);

				let match;
				while (match = sections[idx]) {
					if (match == '%d') {
						// Read the next value
						let val = _readInt(this.io.stdin);

						if (val == '') return;  // empty buffer, wait.
						if (val == null) break; // invalid input, break

						// Write the read value to the given address
						let addr = SysV_arg(arg++);
						this.mem.write(addr, new FixedInt(4, parseInt(val)), 4);

						nRead++;
						idx++;
					} else if (match == '%ld') {
						// Read the next value
						let val = _readInt(this.io.stdin);

						if (val == '') return;  // empty buffer, wait.
						if (val == null) break; // invalid input, break

						// Write the read value to the given address
						let addr = SysV_arg(arg++);
						console.log(`Destination address: ${addr}`);
						console.log(new FixedInt(8, parseInt(val)));
						this.mem.write(new FixedInt(8, parseInt(val)), addr, 8);

						nRead++;
						idx++;
					} else {
						// Match each character
						let cancel = false;
						for (let ch of match) {
							let next = io.stdin.peek();
							if (next == ch) {
								// Need a solution in case this doesn't complete
								io.stdin.read();
							}
							else if (next == '') {
								// Empty buffer, wait.
								return;
							} else {
								// Mismatch, return early
								cancel = true;
								break;
							}
						}

						if (cancel) break;
						idx++;
					}
				}

				// Allow process to resume and unregister input handler
				this.blocked = false;
				this.signals.unregister('SIGIO');
				SysV_ret(nRead);
			}

			_scanf();
		},

		/**
		 *
		 */
		scanf_real: () => {
			throw new Error('not implemented');

			let fmtString = readString(SysV_arg(0));

			// Parse the format string and determine what to read
			let sections = fmtString.split(/(%(?:[dics]))/g);

			// State of the parser, which segment are we reading
			let iSection = 0;
			let iChar = 0;
			let nRead = 0;

			// Define the actual handler asynchonously
			const _scanf = () => {
				let ch;
				let s = sections[iSection];

				// Block process and setup event handler for input
				this.blocked = true;
				this.signals.register('SIGIO', _scanf);

				// Keep reading stuff
				while ((ch = io.stdin.read()) !== EOF) {
					// Nothing in the buffer, wait for next interrupt
					if (ch === null)
						return;

					// Handle beginning of next section
					if (iChar == null) {

					}
				}

				// Allow process to resume and unregister input handler
				this.blocked = false;
				this.signals.unregister('SIGIO');
				SysV_ret(nRead);
			};

			// Call the asynchronous _scanf
			_scanf();
		},

		exit: (override) => {
			// flush any output
			io.stdout.flush();

			// Get the return value
			let val = override || SysV_arg(0);
			io.stdout.write(`[Process exited with status code ${+val}]`);
			io.stdout.flush();

			// TODO: Set return value
			this.pc = null;

			// Pop return address
			SysV_ret();
		}
	};
}

function _readInt(stdin) {
	// Keep reading stuff
	let str = '';

	// Gobble whitespace
	while (stdin.peek().match(/\s/))
		stdin.read();

	while (stdin.peek().match(/[0-9]/)) {
		str += stdin.read();
	}

	// Hack to force console to block
	if (str == '') stdin.read();

	return str;
}

function _isspace(ch) {
	return ' \n\t\b\r'.indexOf(ch) >= 0;
}