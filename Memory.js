"use strict";
// Package for handling 64-bit data
let { Int64 } = require('./Int64.js');

/**
 * An error to throw for a page fault in our virtual memory scheme
 */
class SegFault extends Error {
	constructor(addr, msg) {
		super(`Segmentation Fault @${addr}: ${msg}`);
		this.name = 'SegFault';
		this.addr = addr;
	}
}

class InvalidAccess extends Error {
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
class MemorySegment {

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
	 */
	addrToIdx(addr, size) {
		// Throw a segfault for accessing memory above current range
		// Otherwise resize
		if (addr + size > this.hiAddr) 
			throw new SegFault(addr, size);

		else if (addr < this.loAddr) {
            // Perhaps add support for resizing at some point
			// if (this.resizable)
			// 	   this.resize(addr);
			throw new SegFault(addr, size);
		}

		return (this.hiAddr - addr - size);
	}

	/**
	 * Return the value of the given size at the specified address
	 */
	read(addr, size) {
		let idx = this.addrToIdx(addr, size);

		switch (size) {
			case 1:
				return this.mem.getUint8(idx, /* littleEndian = */ false);

			case 2:
				return this.mem.getUint16(idx, /* littleEndian = */ false);

			case 4:
				return this.mem.getUint32(idx, /* littleEndian = */ false);

			case 8:
				return this.mem.getUint64(idx, /* littleEndian = */ false)

			default:
				throw new InvalidAccess(addr, `Cannot read memory in units of ${size} bytes`);
		}
	}

	/**
	 * Store value at the specified address encoded with [size] bytes
	 */
	write(value, addr, size) {
		let idx = this.addrToIdx(addr, size);

		switch (size) {
			case 1:
				this.mem.setUint8(idx, value, /* littleEndian = */ false);
				break;
			case 2:
				this.mem.setUint16(idx, value, /* littleEndian = */ false);
				break;
			case 4:
				this.mem.setUint32(idx, value, /* littleEndian = */ false);
				break;
			case 8:
				if (!value.name === 'Int64') value = new Int64(value, 0);
				this.mem.setUint64(idx, value, /* littleEndian = */ false)
				break;
			default:
				throw new InvalidAccess(addr, `Cannot read memory in units of ${size} bytes`);
		}

	}
}

/**
 * An object to represent addressable text.  Text will be stored as an 
 * array of string instructions.
 */
class TextSegment {
    constructor(instructions, addresses) {
        // Validate provided addresses
        if (addresses && instructions.length != addresses.length)
            throw new TypeError('addresses must be same length as instructions')

        // Intiialize mapping from address to instruction list index
        this.addrToIdx = {};
        this.instructions = instructions;

        for (let i = 0; i < instructions.length; i++) {
            if (addresses)
                this.addrToIdx[addresses[i]] = i;
            else {
                this.addrToIdx[i] = i;
            }
        }
        
        this.loAddr = addresses ? addresses[0] : 0;
    }

    read(addr) {
        if (!(addr in this.addrToIdx))
            throw new InvalidAccess(addr, 'Unaligned read from text section');

        return this.instructions[this.addrToIdx[addr]];
    }

    /* Refuse writing to text section */
    write() {
        throw new SegFault(addr, 8);
    }
}


/**
 * Memory in general, wrapping several segments of different types
 */
class Memory {

    constructor() {
        // Initialize text segment
        this.text = new TextSegment();

        // Initialize data segment
        // TODO
        // Initialize bss segment
        // TODO

        // Initialize stack segment and randomize stack pointer
        this.stack = new MemorySegment();

        this.segments = [

        ]		
    }

    getSegment(addr) {

    }

    read(addr, size) {
    	return getSegment(addr).read(addr, size);
    }

    write(value, addr, size) {
    	getSegment(addr).write(value, addr, size);
    }
}

module.exports = { MemorySegment, TextSegment };
