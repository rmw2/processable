/**
 * A module for decoding 
 */

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
	let val;
	switch (size) {
		case 1: val = data.getUint8(offset, littleEndian);
			break;
		case 2: val = data.getUint16(offset, littleEndian);
			break;
		case 4: val = data.getUint32(offset, littleEndian);
			break;
		case 8: val = data.getUint64(offset, littleEndian);
			break;
		default:
			throw new DecodeError(`Cannot decode in chunks of ${size} bytes. Size must be 1,2,4, or 8`);
	}

    switch (encoding) {
    	// Handle the char case first, size doesn't matter
        case 'char':
            let str = '';
            for (let i = 0; i < size; i++)
                str += String.fromCharCode(data.getUint8(offset + i));
            return `'${str}'`;

        // Int case requires signed decoding
        case 'int':
            switch (size) {
            	case 1: return data.getInt8(offset, littleEndian);
            	case 2: return data.getInt16(offset, littleEndian);
            	case 4: return data.getInt32(offset, littleEndian);
            	case 8: 
            		// Some fancy magic to get a 64bit signed int in decimal
            		return 'TODO';
            	default: return 'HECK!';
            }

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