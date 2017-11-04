/** 
 * Module that defines a single-threaded processor
 * to execute instructions
 */
let { MemorySegment, TextSegment } = require('./Memory.js');
let { RegisterSet } = require('./Registers.js');
let x86 = require('./x86.js');

class AsmSyntaxError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AsmSyntaxError';
    }
}

class Process {
    constructor(instructions, registers, verbose = false) {
        this.mem  = new MemorySegment();
        this.text = new TextSegment();
        this.regs = new RegisterSet(x86.Registers);
    }

    read(operand, size) {
        // Immediate Operand
        if (operand.startsWith('$')) {
            return parseInt(operand.slice(1));
        }

        // Register operand
        if (operand.startsWith('%')) {
            return this.regs.read(operand.slice(1));
        }

        // Memory operand
        let address = parseMemoryOperand(operand);
        return this.mem.read(address, size);
    }

    write(operand, value, size) {
        // Immediate Operand
        if (operand.startsWith('$')) {
            throw new AsmSyntaxError(`Cannot write to an immediate operand: ${operand}`);
        }

        // Register operand
        if (operand.startsWith('%')) {
            this.regs.write(operand.slice(1), value);
        }

        // Memory operand
        let address = parseMemoryOperand(operand);
        this.mem.write(value, address, size);
    }

    jump(operand) {
        let address;
        // Indirect jump to address held in register
        if (operand.startwith('*')) {
            address = this.regs.read(operand.slice(1));
        }



    }

    /** 
     * Get the value of a memory expression written in base/displacement or
     * scaled indexed form.
     *
     *      disp(reg1, reg2, scale) -> disp + reg1 + (scale * reg2)
     */
    parseMemoryOperand(operand) {
        // GNARLY regular expression to match indirect memory accesses in all their forms
        let offset = /([x0-9]*)\(%([a-z1-9]+)(?:,%([a-z1-9]+))?(?:,((?:0x)?[1248]))?\)/;
        let matches = operand.match(offset);

        if (!matches) throw new AsmSyntaxError(`Invalid address format: ${operand}`);

        // Parse the integers
        let disp  = matches[1] ? parseInt(matches[1])       : 0;
        let base  = matches[2] ? this.regs.read(matches[2]) : 0;
        let idx   = matches[3] ? this.regs.read(matches[3]) : 0;
        let scale = matches[4] ? parseInt(matches[4])       : 1;

        return disp + base + (idx * scale);
    }
}