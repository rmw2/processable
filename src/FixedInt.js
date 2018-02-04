/*********************************************************************
 * A module for representing fixed-width integers and performing 
 * logical and arithmetic operations on them.
 *
 *********************************************************************/
"use strict";

class FixedIntError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FixedIntError';
  }
}

// (2^53 - 1) >> 32
const MAX_SAFE_HI = 0x001FFFFF;

// Mask for the high bit for each size
const SIGN_MASK = {
  1: 0x80,
  2: 0x8000,
  4: 0x8000000
};

// Truncation masks for values
const VAL_MASK = {
  1: 0xFF,
  2: 0xFFFF,
  4: 0xFFFFFFFF
};

// Moduli for each byte size
const MODULUS = {
  1: 0x100,
  2: 0x10000,
  4: 0x100000000
};

/**
 * @classdesc 
 * An immutable data type representing a fixed width integer
 * its size in bytes can be 1, 2, 4, or 8
 * All methods are static, and return new FixedInt objects
 * ALU also maintains status flags from the result of the last
 * computation, which can be accessed by the getters for OF, CF, SF, and ZF
 */
export default class FixedInt {
  /**
   * Construct a new FixedInt object.  The constructor admits three formats:
   *     FixedInt(size {int}, lo {int} [, hi {int}])
   *     FixedInt(size {int}, view {DataView}, offset {int}, littleEndian {boolean})
   *     FixedInt(fixedInt)
   *
   * @constructor
   * @param {int | Object} sizeOrObject An object 
   * @param {int | DataView} [loOrDataView]
   * @param {int} [hiOrOffset]
   * @param {boolean} [littleEndian] How to read from ArrayBuffer. Only use with the DataView constructor
   * @return A new FixedInt object with the specified value
   */
  constructor(sizeOrObject, loOrDataView = 0, hiOrOffset = 0, littleEndian = true) {
    // Deconstruct object if provided
    if ((typeof sizeOrObject) === 'object') {
      loOrDataView = sizeOrObject.lo || 0;
      hiOrOffset = sizeOrObject.hi || 0;
      sizeOrObject = sizeOrObject.size;
    }

    // Validate size
    if ([1,2,4,8].indexOf(sizeOrObject) < 0) 
      throw new FixedIntError(`Invalid size in bytes: ${sizeOrObject}`);
    this._size = sizeOrObject;

    // DataView constructor
    if (loOrDataView instanceof DataView) {
      let view = loOrDataView;
      let offset = hiOrOffset;
      switch (this.size) {
        case 1:
          this._lo = view.getUint8(offset, littleEndian);
          this._hi = 0;
          break;
        case 2:
          this._lo = view.getUint16(offset, littleEndian);
          this._hi = 0;
          break;
        case 4:
          this._lo = view.getUint32(offset, littleEndian);
          this._hi = 0;
          break;
        case 8:
          if (littleEndian) {
            this._lo = view.getUint32(offset, true);
            this._hi = view.getUint32(offset + 4, true);
          } else {
            this._hi = view.getUint32(offset, false);
            this._lo = view.getUint32(offset + 4, false);
          }
      }
    }

    // Integer constructor
    else {
      // Validate size of input number
      if (this.size === 8) {
        if (hiOrOffset && loOrDataView >= MODULUS[4]) 
          throw new FixedIntError('hi and lo must be less than 2^32');
        if (loOrDataView > Number.MAX_SAFE_INTEGER)
          throw new FixedIntError('Value larger than max safe integer.  Use two-part constructor.');

        // Set hi and lo
        if (loOrDataView < 0) {
          if (hiOrOffset) 
            throw new FixedIntError(
              `Cannot construct negative number in two parts: lo=${loOrDataView}, hi=${hiOrOffset}`);

          // Calculate positive value then negate
          this._lo = (~(-loOrDataView & VAL_MASK[4]) + 1) >>> 0;
          this._hi = (~(-loOrDataView / MODULUS[4] | 0) + (this.lo == 0)) >>> 0;
        } else {
          this._hi = (hiOrOffset || (loOrDataView / MODULUS[4]) | 0) >>> 0;
          this._lo = (loOrDataView & VAL_MASK[4]) >>> 0;
        }
      } else {
        this._lo = (loOrDataView & VAL_MASK[this.size]) >>> 0;
        this._hi = 0;
      }
    }
  }

  /**
   * Getters for size, lo, and hi.  
   * All are read-only properties, setters do nothing
   * @return {Number} the size of this object
   */
  get size() {
    return this._size;
  }

  get lo() {
    return this._lo;
  }

  get hi() {
    return this._hi;
  }

  /**
   * Is this integer negative, when interpretted as signed?
   * @returns {boolean}
   */
  isNegative() {
    return (this.size == 8) 
      ? !!(this.hi & SIGN_MASK[4])
      : !!(this.lo & SIGN_MASK[this.size]);
  }

  /**
   * Is this integer less than that integer, 
   * when both are interpreted as unsigned
   * @returns {boolean}
   */
  isLessThan(that) {
    return (this.size == 8)
      ? (this.hi == that.hi ? this.lo < that.lo : this.hi < that.hi)
      : (this.lo < that.lo);
  }

  /**
   * Is this integer odd?
   * @returns {boolean}
   */
  isOdd() {
    return !!(this.lo & 1);
  }

  /**
   * Is the value of this integer safely representable as a Number?
   * @returns {boolean}
   */
  isSafeInteger() {
    return (this.size < 8 || this.hi <= MAX_SAFE_HI);
  }

  /**
   * Return the javascript Number that most closely represents this
   * number.  Accuracy guaranteed iff this.isSafeInteger().
   * @returns {Number}
   */
  valueOf() {
    return (this.size == 8)
      ? MODULUS[4]*this.hi + this.lo
      : this.lo;
  }

  /**
   * Return a new FixedInt with the same value as this
   * @returns {FixedInt}
   */
  clone() {
    return new FixedInt(this);
  }

  /**
   * Return a new FixedInt with the same value as this with the 
   * specified size, truncating if necessary
   * @returns {FixedInt}
   */
  toSize(size) {
    return new FixedInt(size, this.lo, this.hi);
  }

  /**
   * Is this integer the same value as that? 
   * @returns {boolean}
   */
  equals(that) {
    return (this.size == that.size)
      && (this.lo == that.lo) 
      && (this.size < 8 || this.hi == that.hi);
  }

  /**
   * Print this number as a string in the given base, or as a string
   * @param {Number|String} radix -- base 
   * @param {boolean} [signed]    -- how to interpret this number when printing
   * @returns {String}            -- the string representation of this number
   */
  toString(radix=10, signed=false) {
    // Only consider sign if number is negative and base is 10
    signed = (signed && this.isNegative() && radix == 10);

    if (this.size < 8) {
      return (signed) 
        ? `-${ALU.neg(this).lo.toString(radix)}` 
        : this.lo.toString(radix);
    }

    // Custom handling for 64-bit integers
    switch (radix) {
      case 2:
        return this.hi.toString(radix) + pad(this.lo.toString(radix), 32);
      case 16:
        return this.hi.toString(radix) + pad(this.lo.toString(radix), 8);
      case 10:
        return this.isSafeInteger() ? (+this).toString() : 'TODO';
        // Skipped
        let hi = this.hi.toString(radix);
        let lo = pad(this.lo.toString(radix), 64/radix);
      default:
        throw new FixedIntError(`Cannot decode 64-bit FixedInt to base '${radix}'`);
    }
  }

  /**
   * Write this value to an ArrayBuffer wrapped by a DataView view
   */
  toBuffer(view, offset=0, littleEndian=true) {
    switch (this.size) {
      case 1:
        view.setUint8(offset, this.lo, littleEndian);
        break;
      case 2:
        view.setUint16(offset, this.lo, littleEndian);
        break;
      case 4:
        view.setUint32(offset, this.lo, littleEndian);
        break;
      case 8:
        if (littleEndian) {
          view.setUint32(offset, this.lo, littleEndian);
          view.setUint32(offset + 4, this.hi, littleEndian);
        } else {
          view.setUint32(offset, this.hi, !littleEndian);
          view.setUint32(offset + 4, this.lo, !littleEndian);
        }
        break;
    }
  }
}


/* Flags to represent carry/overflow */
let _OF = false;
let _CF = false;
let _ZF = false;
let _SF = false;

let _PF = false; /* Not implemented */
let _AF = false; /* Not implemented */

/* An auxiliary value to be stored by the ALU */
let _aux;

/**
 * Static class to perform arithmetic on FixedInt objects
 */
export class ALU {
  /** Getters for Overflow, Carry, Zero, and Sign flags */
  static get OF() {return _OF};
  static get CF() {return _CF};
  static get ZF() {return _ZF};
  static get SF() {return _SF};
  // static get AF() {return _AF};
  // static get PF() {return _PF};

  /**
   * Return an additional value computed by the ALU in the last computation
   * e.g. remainder after a division operation, or the extension of a multiplication
   * @returns {FixedInt} auxiliary value stored by the ALU
   */
  static get aux() {
    return _aux;
  };

  /**
   * @param {FixedInt} a
   * @param {FixedInt|Number} b
   * @returns {FixedInt}
   */
  static add(a, b) {
    ({a, b} = validateOperands(a, b));

    let hi = a.hi + b.hi;
    let lo = a.lo + b.lo;

    if (a.size === 8) {
      // Carry from lo into hi
      hi += (lo > VAL_MASK[4]);
      lo = (lo & VAL_MASK[4]) >>> 0;

      _CF = hi >= MODULUS[4];
    } else {
      _CF = lo >= MODULUS[a.size];
    }

    const result = new FixedInt(a.size, lo, hi);

    // Set overflow, sign, & zero flags
    _OF = (a.isNegative() == b.isNegative())     // Equal signs
      && (a.isNegative() != result.isNegative()); // and different result
    _ZF = result == 0;
    _SF = result.isNegative();

    return result;
  }

  /**
   * @param {FixedInt} a
   * @param {FixedInt|Number} b
   * @returns {FixedInt}
   */
  static sub(a, b) {
    if (!(b instanceof FixedInt))
      b = new FixedInt(a.size, b);
    return this.add(a, ALU.neg(b));
  }

  /**
   * @param {FixedInt} a
   * @param {FixedInt|Number} b
   * @returns {FixedInt}
   */
  static mul(a, b) {
    ({a, b} = validateOperands(a, b));

    // Double the size if we can fit it
    // if (a.size < 8) {
    //   a = a.toSize(2*a.size);
    //   b = b.toSize(2*a.size);
    // }

    // Base case
    if (b == 0) return new FixedInt(a.size);

    // Recursive definition of multiplication
    let product = this.shl(this.mul(a, this.sar(b, 1)), 1);
    if (b.isOdd()) {
        product = this.add(product, a);
    }

    return product;
  }

  /**
   * @param {FixedInt} a
   * @param {FixedInt|Number} b
   * @returns {FixedInt}
   */
  static div(a, b) {
    ({a, b} = validateOperands(a, b));

    if (+b === 0)
      throw new FixedIntError('Division by zero');

    // Use recursive helper for division
    let [result, mod] = divmod(a,b);

    // Store modulus in aux
    _aux = mod;
    return result;
  }

  /**
   * @param {FixedInt} a
   * @param {FixedInt|Number} b
   * @returns {FixedInt}
   */
  static shl(a, b) {
    // Use the Number representation of the shift
    let hi, lo, shift = +b;

    if (a.size === 8) {
      if (shift >= 64) {
        hi = lo = 0;
      } else if (shift >= 32) {
        hi = a.lo << (shift - 32);
        lo = 0;
      } else {
        // Or bits shifted out of lo with shifted hi
        hi = (a.hi << shift) | (a.lo >>> (32 - shift));
        lo = (a.lo << shift) >>> 0;
      }
    } else {
      lo = (shift >= 32) ? 0 : (a.lo << shift);
    }

    let result = new FixedInt(a.size, lo, hi);

    return result
  }

  /**
   * @param {FixedInt} a
   * @param {FixedInt|Number} b
   * @returns {FixedInt}
   */
  static sar(a, b) {
    let hi, lo, shift = +b;

    if (a.size === 8) {
      if (shift >= 64) {
        // Value entirely shifted out
        hi = lo = (a.isNegative() ? VAL_MASK[4] : 0);
      } else if (shift >= 32) {
        // Hi entirely shifted out
        hi = a.isNegative() ? VAL_MASK[4] : 0;
        lo = (a.hi >> (shift - 32)) >>> 0;
      } else {
        // Carry bits shifted out of hi into shifted lo
        lo = ((a.lo >>> shift) | (a.hi << (32 - shift))) >>> 0;
        hi = a.hi >> shift;
      }
    } else {
      if (a.isNegative()) {
        // Propagate the sign to the 4-byte sign bit
        lo = (shift >= 32) ? VAL_MASK[a.size] : (a.lo | ~VAL_MASK[a.size]) >> shift;
      } else {
        // Simply shift
        lo = (shift >= 32) ? 0 : (a.lo >> shift);
      }
    }

    let result = new FixedInt(a.size, lo, hi);

    return result;
  }

  /**
   * @param {FixedInt} a
   * @param {FixedInt|Number} b
   * @returns {FixedInt}
   */
  static shr(a, b) {
    let lo, hi, shift = +b;

    if (a.size === 8) {
      if (shift >= 64) {
        // Value entirely shifted out
        hi = lo = 0;
      } else if (shift >= 32) {
        // Hi entirely shifted out
        hi = 0;
        lo = a.hi >>> (shift - 32);
      } else {
        // Carry bits shifted out of lo into shifted hi
        lo = ((a.lo >>> shift) | (a.hi << (32 - shift))) >>> 0;
        hi = a.hi >>> shift;
      }
    } else {
      lo = (shift >= 32) ? 0 : (a.lo >>> shift);
    }

    let result = new FixedInt(a.size, lo, hi);

    return result;
  }

  /**
   * @param {FixedInt} a
   * @param {FixedInt|Number} b
   * @returns {FixedInt}
   */
  static and(a, b) {
    ({a, b} = validateOperands(a, b));
    let lo = a.lo & b.lo;
    let hi = a.hi & b.hi;

    let result = new FixedInt(a.size, lo >>> 0, hi);

    return result;
  }

  /**
   * @param {FixedInt} a
   * @param {FixedInt|Number} b
   * @returns {FixedInt}
   */
  static or(a, b) {
    ({a, b} = validateOperands(a, b));
    let lo = a.lo | b.lo;
    let hi = a.hi | b.hi;

    let result = new FixedInt(a.size, lo >>> 0, hi);

    return result;
  }


  /**
   * @param {FixedInt} a
   * @param {FixedInt|Number} b
   * @returns {FixedInt}
   */
  static xor(a, b) {
    ({a, b} = validateOperands(a, b));
    let lo = a.lo ^ b.lo;
    let hi = a.hi ^ b.hi;

    let result = new FixedInt(a.size, lo >>> 0, hi);

    return result;
  }


  /**
   * @param {FixedInt} a -- the number to be complemented
   * @returns {FixedInt} a new FixedInt with the same size as a and 1s complement value
   */
  static not(a) {
    if (!(a instanceof FixedInt))
      throw new FixedIntError('First operand must be instance of FixedInt');
    let lo = ~a.lo;
    let hi = ~a.hi;

    let result = new FixedInt(a.size, lo >>> 0, hi);

    return result;
  }

  /**
   * @param {FixedInt} a -- the number to be negated
   * @returns {FixedInt} a new FixedInt with the same size as a 
   * and its 2s complement value
   */
  static neg(a) {
    let lo, hi;
    if (!(a instanceof FixedInt))
      throw new FixedIntError('Operand must be instance of FixedInt');

    if (a.size === 8) {
      lo = (~a.lo + 1) >>> 0;
      // Carry +1 into hi if lo overflows
      hi = ~a.hi + (lo == 0);
    } else {
      lo = ~a.lo + 1;
    }

    let result = new FixedInt(a.size, lo, hi);
    return result;
  }
}


/**
 * Recursive helper function to perform division with remainder.
 * @param {FixedInt} dividend
 * @param {FixedInt} divisor
 * @returns {[FixedInt, FixedInt]} the quotient and remainder
 */
function divmod(dividend, divisor) {
  // Base case
  if (dividend.isLessThan(divisor)) {
    return [new FixedInt(divisor.size, 0), dividend];
  }

  // Recursively divide by divisor * 2
  let [quotient, remainder] = divmod(dividend, ALU.shl(divisor,1));
  quotient = ALU.shl(quotient, 1);

  if (divisor.isLessThan(remainder)) {
    quotient = ALU.add(quotient, 1);
    remainder = ALU.sub(remainder, divisor);
  }

  return [quotient, remainder];
}

/**
 * Ensure that the operands are the same size, or coerce both to FixedInt
 * @param {FixedInt} a
 * @param {FixedInt|Number} b
 * @returns {{a: FixedInt, b: FixedInt}}
 * @throws {FixedIntError} if a and b are not the same size, or a is not FixedInt
 */
function validateOperands(a, b) {
  // Validate type
  if (!(a instanceof FixedInt))
    throw new FixedIntError('First operand must be instance of FixedInt');

  // Validate sizes
  if (b instanceof FixedInt) {
    if (b.size !== a.size) 
      throw new FixedIntError(`FixedInt operands must be the same size.  a: ${a.size} b: ${b.size}`);
  } else {
    b = new FixedInt(a.size, b);
  }

  return {a, b};
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

module.exports = { FixedInt, ALU, SIGN_MASK, VAL_MASK, MODULUS, MAX_SAFE_HI };