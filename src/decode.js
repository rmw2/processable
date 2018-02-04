/**
 * A module for decoding 
 */
import {FixedInt, ALU} from './FixedInt.js';

const BITS_PER_BYTE = 8;
// Mask for lowest 8 bits of a number
const BYTE_MASK = 0xFF;
// Lowest printable character code
const PRINTABLE = 33;

/**
 * @classdesc
 * An error to be thrown when there are problems decoding values.
 */
class DecodeError extends Error {
	constructor(msg) {
        super(`Decode Error: ${msg}`);
        this.name = 'DecodeError';
    }
}

/**
 * Pad a number or string to a specific length
 *
 * @param {Number|String} n -- the value to be padded
 * @param {Number} width    -- the width of the result
 * @param {String} [z]      -- the character to pad with, defaults to zero
 * @returns {String}        -- the given value, padded to width with z
 */
export function pad(n, width, z='0') {
    // Convert n to string
    n = n + '';
    // Really hacky padding
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

/**
 * Take a DataView data, and decode its contents to a string
 * according to the specified encoding and size
 */
export function decodeFromBuffer(data, offset, size, encoding, littleEndian=true) {
	let val = new FixedInt(size, data, offset, littleEndian);

    switch (encoding) {
    	// Handle the char case first, size doesn't matter
        case 'char':
            let str = '';
            for (let i = 0; i < size; i++) {
                let code = data.getUint8(offset + i);
                str += (code > 32) ? String.fromCharCode(code) : ' ';
            }
            return `'${str}'`;

        // Int case requires signed decoding
        case 'int':
            return val.toString(10, true);

        case 'hex':
        	return '0x' + pad(val.toString(16), 2*size);

        case 'uint':
        	return val.toString(10);

        case 'bin':
        	return pad(val.toString(2), 8*size).replace(/(.{16})/g, "$1<wbr>");
        default:
        	return 'HECK!'
    }
}