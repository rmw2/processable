/**
 * An assembler module, to parse an assembly file and convert it
 * to objects understood by our debugger
 */

import { FixedInt } from '../FixedInt.js';

import crt0 from './runtime.js';

// Hacky approximation of the average instruction length
// Stretch goals would be to get actual instruction length but alas
const INSTR_LEN = 2;

/**
 * @classdesc
 * Two-pass assembler.
 * Use line numbers for relocation records
 * Allow linking multiple files
 */
class Assembly {
	/**
	 * Instantiate a new assembler object by initializing empty data segments
	 * @constructor
	 * @returns {Assembly} an empty Assembly object
	 */
	constructor(asm) {
		// Use line number to identify relocations
		this.linenum = 0;

		// Map line numbers to labels
		this.labelFor = {};
		// Map labels to addresses
		this.labels = {};

		// Map line numbers to instructions
		this.instructions = {};
		this.nInstructions = 0;

		// Map line numbers to static memory (& keep track of sizes)
		this.bss = {};
		this.bssSz = 0;
		this.data = {};
		this.dataSz = 0;
		this.rodata = {};
		this.rodataSz = 0;

		// Start assembling if a string was provided
		if (asm !== undefined)
			this.assemble(asm);
	}

	/**
	 * @param {String} asm -- the contents of the file to preprocess
	 */
	preprocess(asm) {
		// Remove multiline comments
		// NOT a good solution actually
		asm.replace(/\/\*[^]*?\*\//g, '\n');

		// Also note EQU directives
		return asm;
	}

	/**
	 * Add the contents of an assembly file to the current assembly
	 * @param {String} asm -- the contents of the file to assemble
	 */
	assemble(asm) {
		const lines = asm.split('\n');
		let section = 'text';

		// TODO:
		//  Remove multiline /* */ comments
		//  replace .equ directives with values
		//  convert characters to integers
		//   --> abstract this into a preprocess function ?

		for (const line of lines) {
			// Remove comments
			let [code, ...comments] = line.trim().split('#');

			// Split on whitespace or commas keep quotes intact
			let tokens = code.match(/('.*'?|".*"|[^\s,]+)/g);
			if (tokens == null) continue;

			// Parse label and identify with linenum (and remove from instruction)
			if (tokens[0] && tokens[0].endsWith(':')) {
				// TODO: ignore compiler-generated labels
				this.labelFor[this.linenum] = tokens.shift().slice(0,-1);
			}

			// Remove empty tokens
			for (let i in tokens)
				if (!tokens[i]) tokens.splice(i, 1);

			// Skip empty lines
			if (!tokens.length || (!tokens[0] && tokens.length === 1))
				continue;

			// Check if section has changed
			let newSection = parseSection(tokens);
			if (newSection) {
				// Hacky parsing of section name
				section = newSection.split('.')[1];
				continue;
			}


			// Handle the line in the context of the current section
			switch (section) {
				case 'text':
					// Skip directives in text section
					// (maybe do something with .loc or .cfi_* in the future)
					if (tokens[0].startsWith('.'))
						continue;
					// Save instruction
					this.instructions[this.linenum] = tokens;
					this.nInstructions++;
					break;
				case 'data':
				case 'rodata':
				case 'bss':
					let item = alloc(tokens);
					if (item !== undefined) {
						this[section][this.linenum] = item;
						this[`${section}Sz`] += item.size * item.value.length;
					}
					break;
				default:
					console.log(`Unknown section: ${section} (parsed from ${newSection})`);
			}

			// Increment linenum only after succesfully parsing something
			this.linenum += 1;
		}
		return this;
	}

	/**
	 * Process all assembled files so far and "link" to a program runnable
	 * by the virtual machine defined in Process.js
	 *
	 * @param {Number} addr -- the start address of the text section
	 * @returns {Object} -- A representation of the program's binary image and
	 * 						the labels it contains
	 */
	link(addr=0x08048000, runtime=crt0) {
		// Single image object to represent an ELF binary
		let image = {};

		image.text = {
			start: addr,
			end: addr + INSTR_LEN * (this.nInstructions + runtime.length),
			contents: [],
			addresses: []
		};

		image.rodata = {
			start: image.text.end,
			end: image.text.end + this.rodataSz,
			contents: new ArrayBuffer(this.rodataSz),
		};

		image.data = {
			start: image.rodata.end,
			end: image.rodata.end + this.dataSz,
			contents: new ArrayBuffer(this.dataSz),
		};

		image.bss = {
			start: image.data.end,
			end: image.data.end + this.bssSz,
			contents: new ArrayBuffer(this.bssSz),
		};

		// Write the runtime to the image
		this.labels['_start'] = addr;
		for (const inst of runtime) {
			image.text.addresses.push(addr);
			image.text.contents.push(inst);
			addr += INSTR_LEN;
		}

		// Write text to image
		for (const linenum in this.instructions) {
			// Convert line number to label
			if (linenum in this.labelFor) {
				this.labels[this.labelFor[linenum]] = addr;
			}

			image.text.addresses.push(addr);
			image.text.contents.push(this.instructions[linenum]);
			addr += INSTR_LEN;
		}

		// Write each section to image
		for (let section of ['rodata', 'data', 'bss']) {
			let view = new DataView(image[section].contents);
			addr = this.writeToImage(view, this[section], addr);

			// TODO: alignment
		}

		return {image, labels: this.labels};
	}

	/**
	 * Write the contents of a static virtual memory area to an ArrayBuffer
	 * via the DataView view.  Also map labels to final addresses in the process
	 *
	 * @param {DataView} view
	 * @param {Object} data
	 * @param {Number} addr
	 * @returns {Number} the current address after allocating this section
	 */
	writeToImage(view, data, addr) {
		let start = addr;

		for (const linenum in data) {
			// Convert line number to label
			if (this.labelFor[linenum] !== undefined)
				this.labels[this.labelFor[linenum]] = addr;

			let item = data[linenum];
			//console.log(`allocating ${item.type}: ${item.value}`);
			// Write text to an ArrayBuffer
			for (let val of item.value) {
				// Convert string to charCode
				if (typeof val == 'string') {
					val = val.charCodeAt(0);
				}

				// Write value to buffer
				let x = new FixedInt(item.size, val);
				x.toBuffer(view, addr - start);

				// Increment address
				addr += item.size;
			}
		}

		return addr;
	}
}

/**
 * Parse an assembly static memory allocation
 * @param {String[]} tokens -- an Array of string tokens parsed from a line of assembly
 * @returns {Object} a description of the allocated memory
 */
function alloc(tokens) {
	let str;
	switch (tokens[0]) {
		case ".ascii":
			// remove quotes
			str = unescapeWhitespace(tokens[1].slice(1, -1));

			return {
				type:  '.ascii',
				size:  1,
				value: str
			};
		case ".string":
		case ".asciz":
			str = unescapeWhitespace(tokens[1].slice(1, -1));

			return {
				type:  '.asciz',
				size:  1,
				value: str + '\0'
			};
		case ".byte":
			return {
				type:  '.byte',
				size:  1,
				value: tokens.slice(1).map(val => parseInt(val))
			};
		case ".double":
			return {
				type:  '.double',
				size:  8,
				value: tokens.slice(1).map(val => parseFloat(val))
			};
		case ".int":
		case ".long":
			return {
				type:  '.int',
				size:  4,
				value: tokens.slice(1).map(val => parseInt(val))
			};
		case ".octa":
			return {
				type:  '.octa',
				size:  16,
				value: tokens.slice(1).map(val => parseInt(val))
			};
		case ".quad":
			return {
				type:  '.quad',
				size:  8,
				value: tokens.slice(1).map(val => parseInt(val))
			};
		case ".single":
			return {
				type:  '.single',
				size:  4,
				value: tokens.slice(1).map(val => parseFloat(val))
			};
		case ".short":
		case ".word":
			return {
				type:  '.word',
				size:  2,
				value: tokens.slice(1).map(val => parseInt(val))
			};
		case ".skip":
		case ".zero":
			let val = tokens[2] ? parseInt(tokens[2]) : 0;
			return {
				type:  '.skip',
				size:  1,
				value: (new Array(parseInt(tokens[1]))).map(_ => val)
			};
	}

	return undefined;
}

function unescapeWhitespace(str) {
	return str
		.replace(/\\n/g, '\n')
		.replace(/\\t/g, '\t')
		.replace(/\\r/g, '\r')
		.replace(/\\b/g, '\b');
}

/**
 * Determine if the current line defines a new assembly section,
 * and return its name if so.f
 *
 * @param {String[]} tokens -- A line of assembly language split on spaces
 * @returns {String} the name of the current section or undefined if the line
 *                   does not define a new section
 */
function parseSection(tokens) {
	// Remove quotes

	if (tokens[0].startsWith('.')) {
		if (tokens[0] === '.text')
			return '.text';
		if (tokens[0] === '.data')
			return '.data';
		if (tokens[0] === '.section')
			return tokens[1].replace(/["']/g, '');
	}

	return undefined;
}

module.exports = { Assembly };

// /**
//  * @deprecated: to be replaced with Class Assembly
//  * Assemble a text file containing assembly instructions in AT&T syntax
//  * and return an object mapping labels to addresses, parellel lists of
//  * instruction strings and instruction addresses, and an object to
//  * describe staticly allocated data.
//  */
// export default function assemble(asm) {
// 	let addresses = [];
// 	let instructions = [];
// 	let labels = {};
// 	let addr = 0;

// 	let section = '';

// 	// Split assembly file by line
// 	const lines = asm.split('\n');

// 	for (let line of lines) {
// 		// Remove comments
// 		let [code, ...comments] = line.trim().split('#');
// 		// Split on whitespace or commas
// 		let tokens = code.split(/[\s,]+/g);

// 		// Parse label (and remove from instruction)
// 		if (tokens[0] && tokens[0].endsWith(':'))
// 			labels[tokens.shift().slice(0,-1)] = addr;

// 		// Parse directive
// 		if (tokens[0] && tokens[0].startsWith('.')) {
// 			switch (tokens[0]) {
// 				case '.section':
// 					section = tokens[1];
// 					break;
// 				case '.text':
// 					section = '.text';
// 				// TODO: handle static allocation etc.
// 				case '.data':

// 			}

// 			continue;
// 		}

// 		// Add instruction to instruction list & increment address
// 		if (section === '.text' && tokens.length > 0 && tokens[0]) {
// 			for (let i in tokens)
// 				if (!tokens[i]) tokens.splice(i, 1);

// 			instructions.push(tokens);
// 			addresses.push(addr);
// 			addr += 1; // REPLACE WITH LENGTH OF INSTRUCTION AT SOME POINT [eek]
// 		}
// 	}

// 	return { instructions, addresses, labels };
// }

