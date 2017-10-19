/**
 * An error to throw for a page fault in our virtual memory scheme
 */
class SegFault extends Error {
	constructor(addr, size) {
		super(`Attempt to access ${size} bytes at address ${addr} generated a segmentation fault.`);
		this.name = 'SegFault';
		this.addr = addr;
	}
}

/**
 * An object to represent byte-addressable memory
 * Implemented by creating several views of different sizes on an ArrayBuffer
 */
class MemorySpace {

	constructor(hiAddr, size = 1024, resizable = false) {
		// Size of memory, in bytes
		this.size = size;
		
		// Can the memory resize?
		this.resizable = resizable

		// A 4-byte addresses that corresponds to the beginning and end of the array
		// Accesses outside of this range will throw a page fault
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
	resize(addr) {
		// Double the size of the buffer
		this.buf = ArrayBuffer.transfer(this.buf, 2*this.size);

		if (addr < this.loAddr) {
			// Move the contents into the second half of the buffer
			let tmpView = new Uint8Array(this.buf);
			tmpView.copyWithin(this.size, 0);
			this.loAddr -= this.size;
		} else {
			// First half of the buffer is already correct
			this.hiAddr += this.size;
		}

		this.size *= 2;
	}

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
			if (this.resizable)
				this.resize(addr);
			else throw new SegFault(addr, size);
		}

		return (this.hiAddr - addr - size);
	}

	/**
	 * Return the value of the given size at the specified address
	 */
	read(addr, size) {
		let idx = this.addrToIdx(addr, size),
			value;

		switch (size) {
			case 1:
				value = this.mem.getUint8(idx, /* littleEndian = */ false);
				break;
			case 2:
				value = this.mem.getUint16(idx, /* littleEndian = */ false);
				break;
			case 4:
				value = this.mem.getUint32(idx, /* littleEndian = */ false);
				break;
			case 8:
				// TODO
				break;
			default:
				throw new InvalidAccess();
		}

		return value;
	}

	/**
	 * Store value at the specified address encoded with [size] bytes
	 */
	write(addr, value, size) {
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
				// TODO
				break;
		}
	}
}

module.exports = { MemorySpace };
