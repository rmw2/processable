/**
 * A module for decoding 
 */

import {FixedInt, ALU} from './FixedInt.js';

// 
const ENCODINGS = ['hex', 'int', 'uint', 'char', 'bin'];

class DecodeError extends Error {
	constructor(msg) {
        super(`Decode Error: ${msg}`);
        this.name = 'DecodeError';
    }
}

export function pad(n, width, z='0') {
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

export function nextEncoding(state) {
	const nextIdx = (state.encIdx + 1) % ENCODINGS.length;
	return {
		encoding: ENCODINGS[nextIdx],
		encIdx: nextIdx
	};
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