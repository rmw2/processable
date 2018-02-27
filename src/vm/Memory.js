"use strict";
// Package for handling 8,16,32, & 64-bit data
import {FixedInt, ALU} from '../fixed-int/FixedInt.js';

/**
 * An error to throw for a segmentation fault in our virtual memory scheme
 */
export class SegFault extends Error {
	constructor(addr, msg) {
		super(`Segmentation Fault @${addr}: ${msg}`);
		this.name = 'SegFault';
		this.addr = addr;
	}
}

/**
 * An error to throw for illegal memory accesses that do not count as
 * a segmentation fault.
 *
 * e.g. Unaligned read from a section that does
 * not support unaligned reads
 */
export class InvalidAccess extends Error {
    constructor(addr, msg) {
        super(`Invalid Access @${addr}: ${msg}`);
        this.name = 'InvalidAccess';
        this.addr = addr;
    }
}

/**
 * @classdesc
 * An object to represent byte-addressable memory
 * Implemented by creating a dataview on a
 */
export class MemorySegment {
	/**
	 * @constructor
	 * @returns {MemorySegment} a new MemorySegment object
	 */
	constructor(hiAddr, sizeOrData = 1024, name='') { //, resizable = false) {
		if (sizeOrData instanceof ArrayBuffer) {
			// Instantiate memory from preexisting arraybuffer
			this.buf = new ArrayBuffer(sizeOrData.byteLength);

            let from = new Uint8Array(sizeOrData);
            let to = new Uint8Array(this.buf);

            this.size = this.buf.byteLength;

            // Copy over in reverse order
            for (let i = 0; i < this.size; i++) {
                to[i] = from[this.size - i - 1];
            }
		} else {
			// Size of memory, in bytes
			this.size = sizeOrData;
			// Initialize to the provided size (will resize dynamically?)
			this.buf = new ArrayBuffer(this.size);
		}

		// Define a view into the buffer which will be used to read values
		this.mem = new DataView(this.buf);

        // Name of the section
		this.name = name;

		// Can the memory resize?
		// this.resizable = resizable

		// 4-byte addresses that corresponds to the beginning and end of the array
		// Accesses outside of this range will throw a segmentation fault
		this.hiAddr = hiAddr;
		this.loAddr = hiAddr - this.size;
	}

	/**
	 * Double the size of the underlying ArrayBuffer.  Copy the old
	 * ArrayBuffer into the top or bottom half of the new one depending
	 * on whether addr is above or below the currently mapped address space.
	 */
	// resize(addr) {
	// 	// Double the size of the buffer
	// 	this.buf = ArrayBuffer.transfer(this.buf, 2*this.size);

	// 	if (addr < this.loAddr) {
	// 		// Move the contents into the second half of the buffer
	// 		let tmpView = new Uint8Array(this.buf);
	// 		tmpView.copyWithin(this.size, 0);
	// 		this.loAddr -= this.size;
	// 	} else {
	// 		// First half of the buffer is already correct
	// 		this.hiAddr += this.size;
	// 	}

	// 	this.size *= 2;
	// }

	/**
	 * Verify that a requested address is currently mapped by the memory
	 * space, and return its byte index into the underlying ArrayBuffer.
	 * If the requested address is not mapped, resize the memory, and return
	 * the index into the new version.
	 * @param {FixedInt|Number} addr
	 * @param {Number} size
	 */
	addrToIdx(addr, size) {
		// Convert address to integer
		addr = +addr;

		// Throw a segfault for accessing memory above current range
		// Otherwise resize
		if (addr + size > this.hiAddr)
			throw new SegFault(addr.toString(16), `Reading ${size} bytes of section ${this.name}.`
                + ` [0x${this.loAddr.toString(16)}, ${this.hiAddr.toString(16)}]`);

		else if (addr < this.loAddr) {
            // Perhaps add support for resizing at some point
			// if (this.resizable)
			// 	   this.resize(addr);
			throw new SegFault(addr.toString(16), `Reading ${size} bytes of section ${this.name}.`
                + ` [0x${this.loAddr.toString(16)}, ${this.hiAddr.toString(16)}]`);
		}

		return (this.hiAddr - addr - size);
	}

	/**
	 * Return the value of the given size at the specified address
	 * @param {FixedInt|Number} addr
	 * @param {Number} size
	 * @returns {FixedInt} the value at the requested address
	 */
	read(addr, size) {
		let idx = this.addrToIdx(addr, size);

		return new FixedInt(size, this.mem, idx, false);
	}

	/**
	 * Store value at the specified address
	 * @param {FixedInt} value
	 * @param {FixedInt|Number} addr
	 */
	write(value, addr, size) {
        if (!(value instanceof FixedInt))
            value = new FixedInt(size, value);

		let idx = this.addrToIdx(addr, value.size);
		value.toBuffer(this.mem, idx, false);
	}
}

/**
 * An object to represent addressable text.  Text will be stored as an
 * array of string instructions.
 */
export class TextSegment {
    constructor(instructions, addresses, offset=0) {
        // Validate provided addresses
        if (addresses && instructions.length != addresses.length)
            throw new TypeError('addresses must be same length as instructions');

        // Intiialize mapping from address to instruction list index
        this.addrToIdx = {};
        this.idxToAddr = [];
        this.instructions = instructions;

        for (let i = 0; i < instructions.length; i++) {
            if (addresses) {
            	if (addresses[i] <= addresses[i-1])
            		throw new TypeError('addresses must be increasing');

            	// Keep track of forward and reverse mapping
                this.addrToIdx[addresses[i] + offset] = i;
	            this.idxToAddr.push(addresses[i] + offset);
            } else {
                this.addrToIdx[i + offset] = i;
                this.idxToAddr.push(i + offset);
            }
        }

        this.loAddr = addresses ? addresses[0] : 0;
        this.hiAddr = addresses ? addresses[addresses.length - 1] : null;
    }

    /* Return the instruction at the specified address */
    read(addr) {
    	addr = +addr;
        if (!(addr in this.addrToIdx))
            throw new InvalidAccess(addr, 'Unaligned read from text section');

        return this.instructions[this.addrToIdx[addr]];
    }

    /* Return the address of the next instruction after the specified instruction */
    next(addr) {
    	addr = +addr;
    	return this.idxToAddr[this.addrToIdx[addr] + 1];
    }

    /* Refuse writing to text section */
    write(addr) {
        throw new SegFault(addr.toString(16),
            `Attempting to write to read-only section ".text" [${this.loAddr.toString(16)}, ${this.hiAddr.toString(16)}]`);
    }
}


/**
 * Memory in general, wrapping several segments of different types
 * Initialized with an Image object specifying layout and contents of static memory
 *
 * This is analogous to an Operating system structure which keeps track of a
 * process' virtual memory and the areas
 */
export default class Memory {
    constructor(image, stackOrigin=0xC0000000) {
    	// Initialize a registry of mapped virtual memory areas for a process
    	this.segments = {};
    	for (let s in image) {
    		if (s == 'text') {
    			// Intialize TextSegment holding string assembly instructions
    			this.segments.text = {
    				hi: image.text.end,
    				lo: image.text.start,
    				data: new TextSegment(image.text.contents, image.text.addresses)
    			};
    		} else {
    			// Initialize static MemorySegments with preallocated contents
    			this.segments[s] = {
    				hi: image[s].end,
    				lo: image[s].start,
    				data: new MemorySegment(image[s].end, image[s].contents, s)
    			};
    		}
    	}

    	// TODO: fix/replace with better solution
    	const STACK_SIZE = 1024;
    	const HEAP_SIZE = 1024;

    	// Initialize Stack and Heap segments
    	this.segments.stack = {
    		hi: stackOrigin,
    		lo: stackOrigin - STACK_SIZE,
    		data: new MemorySegment(stackOrigin, STACK_SIZE, 'stack')
    	};

    	// Compute end of static sections
    	let endStatic = this.segments.bss.hi
    		|| this.segments.data.hi
    		|| this.segments.rodata.hi
    		|| this.segments.text.hi;

    	let brk = endStatic + HEAP_SIZE;
    	this.segments.heap = {
    		hi: brk,
    		lo: brk - HEAP_SIZE,
    		data: new MemorySegment(brk, HEAP_SIZE, 'heap')
    	};

        // Initialize a dictionary of watchpoints
        this.watchpoints = {};
    }

    /**
     * Compute the segment that maps the request virtual address
     * @param {Number} addr
     * @returns {MemorySegment|TextSegment}
     */
    getSegment(addr) {
    	// TODO: Incorporate read and write permissions and check those here
    	for (let s in this.segments) {
    		const seg = this.segments[s];
    		if (seg.lo <= addr && addr < seg.hi) {
    			return seg.data;
    		}
    	}

    	throw new SegFault(addr.toString(16), `Address not mapped`);
    }

    read(addr, size) {
        for (let i = 0; i < size; i++)
            if ((addr + i) in this.watchpoints) {
                // TODO
            }

    	return this.getSegment(addr).read(addr, size);
    }

    /**
     * Write the value
     */
    write(value, addr) {
        for (let i = 0; i < value.size; i++)
            if ((addr + i) in this.watchpoints) {
                // TODO
            }

    	this.getSegment(addr).write(value, addr);
    }

    /**
     * Compute the next valid address after addr
     * really only relevant for text section, where only addresses are valid
     *
     * Note: this is kind of a hack to keep segment type out of Process.js
     */
    next(addr) {
    	if (this.segments.text.lo <= addr && addr <= this.segments.text.hi)
    		return this.segments.text.data.next(addr);

    	throw new InvalidAccess(`0x${addr.toString(16)}`, `Not in text segment ` +
    		`(lo = ${this.segments.text.lo}, hi = ${this.segments.text.hi})`);
    }
}

module.exports = { Memory, MemorySegment, TextSegment };