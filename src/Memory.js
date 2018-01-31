"use strict";
// Package for handling 64-bit data
import {FixedInt, ALU} from './FixedInt.js';

/**
 * An error to throw for a page fault in our virtual memory scheme
 */
export class SegFault extends Error {
	constructor(addr, msg) {
		super(`Segmentation Fault @${addr}: ${msg}`);
		this.name = 'SegFault';
		this.addr = addr;
	}
}

export class InvalidAccess extends Error {
    constructor(addr, msg) {
        super(`Invalid Access @${addr}: ${msg}`);
        this.name = 'InvalidAccess';
        this.addr = addr;
    }
}

/**
 * An object to represent byte-addressable memory
 * Implemented by creating a dataview on a 
 */
export class MemorySegment {

	constructor(hiAddr, size = 1024, name='') { //, resizable = false) {
		// Size of memory, in bytes
		this.size = size;
        // Name of the section
		this.name = name;

		// Can the memory resize?
		// this.resizable = resizable

		// 4-byte addresses that corresponds to the beginning and end of the array
		// Accesses outside of this range will throw a segmentation fault
		this.hiAddr = hiAddr;
		this.loAddr = hiAddr - size;

		// Initialize to the provided size, will resize dynamically
		this.buf = new ArrayBuffer(size);

		// Define a view into the buffer which will be used to read values
		this.mem = new DataView(this.buf);
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
			throw new SegFault(addr, `Reading ${size}-bytes of section ${this.name}`);

		else if (addr < this.loAddr) {
            // Perhaps add support for resizing at some point
			// if (this.resizable)
			// 	   this.resize(addr);
			throw new SegFault(addr, `Reading ${size}-bytes of section ${this.name}`);
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

		return new FixedInt(size, this.mem, idx);
	}

	/**
	 * Store value at the specified address
	 * @param {FixedInt} value
	 * @param {FixedInt|Number} addr
	 */
	write(value, addr) {
		let idx = this.addrToIdx(addr, value.size);
		value.toBuffer(this.mem, idx);
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
    write() {
        throw new SegFault(addr, 0);
    }
}


/**
 * Memory in general, wrapping several segments of different types
 * 
 */
export default class Memory {
    constructor(segments) {
        this.segments = segments;
    }

    getSegment(addr) {
    	for (s in this.segments) {
    		const seg = this.segments[s];
    		if (seg.lo < addr && addr < seg.hi) {
    			return seg.data;
    		}
    	}
    }

    read(addr, size) {
    	return getSegment(addr).read(addr, size);
    }

    write(value, addr) {
    	getSegment(addr).write(value, addr);
    }
}

module.exports = { MemorySegment, TextSegment };
