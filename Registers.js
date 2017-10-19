/**
 * A class to represent a set of potentially overlapping registers of
 * various bit-lengths.
 *
 * Supports read and write operations.
 */
class Registers {

	/**
	 * Create a set of registers from an object which gives 
	 * register names mapped to byte offsets and byte lengths
	 * for each available register.  The word size and endianness
	 * can also be specified at construction.
	 */
	constructor(regInfo, wordSize = 8, littleEndian = true) {
		let nRegs = Object.keys(regInfo).length;
		
		this.littleEndian = littleEndian;

		this.regInfo = regInfo;
		this.regbuf = new ArrayBuffer(wordSize * nRegs);
		this.regs = new DataView(this.regbuf);
	}

	/**
	 * Return the value held in the specified register.
	 */
	read(reg) {
		let [idx, size]  = this.regInfo[reg];

		switch (size) {
			case 1:
				return this.regs.getUint8(idx, this.littleEndian);
			case 2: 
				return this.regs.getUint16(idx, this.littleEndian);
			case 4:
				return this.regs.getUint32(idx, this.littleEndian);
			case 8:
				throw new NotImplementedError();

				let lowerHalf = this.regs.getUint32(idx, this.littleEndian);
				let upperHalf = this.regs.getUint32(idx + 4, this.littleEndian);
				return new Int64(lowerHalf, upperHalf);
		}
	}

	/**
	 * Write a value to the specified register, representing it
	 * with the appropriate number of bytes.
	 */
	write(reg, value) {
		let [idx, size]  = this.regInfo[reg];

		switch (size) {
			case 1:
				return this.regs.setUint8(idx, value, this.littleEndian);
			case 2: 
				return this.regs.setUint16(idx, value, this.littleEndian);
			case 4:
				return this.regs.setUint32(idx, value, this.littleEndian);
			case 8:
				let lowerHalf = this.regs.getUint32(idx, this.littleEndian);
				let upperHalf = this.regs.getUint32(idx + 4, this.littleEndian);
				return new Int64(lowerHalf, upperHalf);
		}
	}
}

module.exports = { Registers };