/**
 * A module for decoding
 */
import {FixedInt, ALU} from '../fixed-int/FixedInt.js';

// Lowest printable character code
const UNPRINTABLE = 0x19;

// Other helpful constants
const BYTE_MASK = 0xFF;
const BITS_PER_BYTE = 0x8;

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

// Enumeration of the different available encodings
export const Encodings = {
    HEX:    0,
    INT:    1,
    UINT:   2,
    CHAR:   3,
    BIN:    4,
    length: 5
};

export const ENC_NAMES = ['hex', 'int', 'uint', 'char', 'bin'];

/**
 * Decode a FixedInt object according to the specified decoding index
 */
export function decode(val, encoding) {
    switch (encoding) {
        case Encodings.INT:
            return val.toString(10, true)
        case Encodings.UINT:
            return val.toString(10, false);
        case Encodings.HEX:
            return pad(val.toString(16), 2*val.size);
        case Encodings.BIN:
            return pad(val.toString(2), 8*val.size);
        case Encodings.CHAR:
            return (val.size === 8)
                ? `${toPrintableCharacters(val.hi, 4)}${toPrintableCharacters(val.lo, 4)}`
                : `${toPrintableCharacters(val.lo, val.size)}`;
    }
}

export function format(valString, encoding, flip) {
    switch (encoding) {
        case Encodings.HEX:
            return valString.replace(/(.{8})/g, "$1<wbr/>");
        case Encodings.BIN:
            return (flip) 
                ? valString.match(/(.{8})/g).reverse().join('<br/>')
                : valString.replace(/(.{8})/g, "$1<br/>");
        case Encodings.CHAR:
            return (flip)
                ? valString.match((/(\\?.{1})/g)).reverse().join('<br/>')
                : valString.replace(/(\\?.{1})/g, "$1<br/>");
        default:
            return valString
    }
}

export function decodeAndFormat(val, encoding, flip) {
    return format(decode(val, encoding), encoding, flip);
}

/**
 * Convert an integer to n ASCII characters, byte by byte.
 * All non-printable characters are rendered as spaces
 *
 * @param {Number} val -- the number to convert
 * @param {Number} [n] -- the number of characters to decode (1-4)
 * @param {String} [insert] -- string to insert between each character
 * @returns {String}   -- the ASCII
 */
export function toPrintableCharacters(val, n=4, insert='') {
    let str = '';
    for (let i = n-1; i >= 0; i--) {
        let charCode = (val >> (i*BITS_PER_BYTE)) & BYTE_MASK;
        str += escapeChar(charCode) + insert;
    }

    return str;
}

export function escapeChar(charCode) {
    if (charCode > UNPRINTABLE)
        return String.fromCharCode(charCode);

    switch (charCode) {
        case 0x00:
            return '\\0';
        case 0x08:
            return '\\b';
        case 0x09:
            return '\\t';
        case 0x0a:
            return '\\n';
        case 0x0d:
            return '\\r';
        default:
            return `.`;
    }
}

/**
 * TRYNA GET AWAY FROM THIS FUNC AND REPLACE WITH FIXEDINT STUFF
 *
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
                str += escapeChar(code);
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