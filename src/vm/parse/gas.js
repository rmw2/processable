import { FixedInt } from '../../fixed-int/FixedInt.js';

const SUFFIXES = ['b', 'w', 'l', 'q'];
const SIZES = [1, 2, 4, 8];

/**
 * Syntax definition for AT&T x86 (gas)
 */
export default function gas(wordsize) {
    /**
     * Get the value of a memory expression written in base/displacement or
     * scaled indexed form.
     *
     *      disp(reg1, reg2, scale) -> disp + reg1 + (scale * reg2)
     */
    const parseMemoryOperand = (operand) => {
        // GNARLY regular expression to match indirect memory accesses in all their forms
        let offset = /((?:0x)?-?[0-9]+)?\(%([a-z1-9]+)(?:,%([a-z1-9]+))?(?:,((?:0x)?[1248]))?\)/;
        let matches = operand.match(offset);

        if (!matches) throw new AsmSyntaxError(`Invalid address format: ${operand}`);

        // Parse the integers
        let disp  = matches[1] ? parseInt(matches[1])        : 0;
        let base  = matches[2] ? +this.regs.read(matches[2]) : 0;
        let idx   = matches[3] ? +this.regs.read(matches[3]) : 0;
        let scale = matches[4] ? parseInt(matches[4])        : 1;

        return disp + base + (idx * scale);
    }

    /**
     * Return the operand size implied by a given mnemonic
     */
    const parseOperandSize = (mnemonic) => {
        let idx = SUFFIXES.indexOf(mnemonic.slice(-1));
        let size = SIZES[idx];
        let prefix = mnemonic.slice(0,-1);

        return {prefix, size};
    }

    /**
     * Read the value in memory at the location specified by the operand.
     * The operand is a string defining a register, immediate, or memory
     * address as the information source
     */
    this.read = (operand, size=wordsize) => {
        // Immediate Operand
        if (operand.startsWith('$')) {
            let val, label;
            if (isNaN(val = parseInt(label = operand.slice(1)))) {
                if ((val = this.labels[label]) !== undefined) {
                    // Immediate label value (address)
                    return new FixedInt(wordsize, val);
                } else if (val = /'(\\?.)'/.exec(label)) {
                    // Ascii character
                    switch (val[1]) {
                        case '\\n':
                            return new FixedInt(size, 0x0a);
                        case '\\t':
                            return new FixedInt(size, 0x09);
                        case '\\r':
                            return new FixedInt(size, 0x0d);
                        case '\\b':
                            return new FixedInt(size, 0x08);
                        default:
                            return new FixedInt(size, val[1].charCodeAt(0));
                    }
                } else {
                    throw new AsmSyntaxError(`Label ${name} undefined`);
                }
            }
            // console.log(`Reading ${size}-byte immediate ${val}`);
            // console.log(new FixedInt(size, val));
            return new FixedInt(size, val);
        }

        if (this.labels[operand]) {
            return this.mem.read(this.labels[operand], size);
        }

        // Register operand
        if (operand.startsWith('%')) {
            return this.regs.read(operand.slice(1));
        }

        // Memory operand
        let address = parseMemoryOperand(operand);
        return this.mem.read(address, size);

        // TODO: Allow read from labeled memory address
    }

    /**
     * Write the value to the location in memory specified by the operand.
     * Operand is a string that defines either a register destination or
     * a memory address
     */
    this.write = (operand, value, size) => {
        // console.log(`writing ${value} to label: ${operand} = ${this.labels[operand]}`);

        // Immediate Operand
        if (operand.startsWith('$')) {
            throw new AsmSyntaxError(`Cannot write to an immediate operand: ${operand}`);
        }

        // Register operand
        if (operand.startsWith('%')) {
            this.regs.write(operand.slice(1), value);
            return;
        }

        // Label operand
        if (this.labels[operand] !== undefined) {
            let address = this.labels[operand];
            this.mem.write(value, address, size);
            return;
        }

        // Memory operand
        let address = parseMemoryOperand(operand);
        this.mem.write(value, address, size);
    }

    /**
     * Change the program counter to the value specified in the operand.
     * Operand can be a string representing an indirect memory access,
     * a label, or a literal address.
     */
    this.jump = (operand) => {
        // Indirect jump to address held in register
        if (operand.toString().startsWith('*')) {
            this.pc = +this.read(operand.slice(1));
        } else if (parseInt(+operand)) {
            this.pc = parseInt(+operand);
        } else {
            if (operand in this.labels)
                this.pc = this.labels[operand];
            else if (operand in this.lib) {
                // Bridge for "standard library" calls
                this.lib[operand]();
            } else {
                throw new AsmSyntaxError(`Unknown label "${operand}"`);
            }
        }
    }

    /**
     * Given a mnemonic and operands, transfer control to the proper instruction handler
     */
    this.execute = (mnemonic, operands) => {
        if (mnemonic in this.chip) {
            this.chip[mnemonic](operands);
        } else {
            let {prefix, size} = parseOperandSize(mnemonic);

            if (size) {
                this.chip[prefix](operands, size);
            } else {
                throw new AsmSyntaxError(`Unknown mnemonic: ${mnemonic}`);
            }
        }
    }
}
