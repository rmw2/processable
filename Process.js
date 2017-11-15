"use strict";
/** 
 * Module that defines a single-threaded processor
 * to execute instructions
 */

let { MemorySegment, TextSegment } = require('./Memory.js');
let { RegisterSet } = require('./Registers.js');
let { Int64 } = require('./Int64.js');
let x86 = require('./x86.js');

const SUFFIXES = ['b', 'w', 'l', 'q'];
const SIZES = [1, 2, 4, 8];
const STACK_START = 0xF000;

class AsmSyntaxError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AsmSyntaxError';
    }
}

class Process {
    constructor(instructions, labels, chip, verbose = false) {
        // Intitialize memory and registers
        this.mem  = new MemorySegment(STACK_START);
        this.regs = new RegisterSet(x86.Registers);
        this.regs.write('rsp', STACK_START);

        // Keep instruction pointer separate from registers, initialize to zero
        this.rip = 0;

        // Initialize the code segments
        this.text = new TextSegment(instructions);
        this.labels = labels;

        // Object containing handlers indexed by instruction
        this.chip = chip.call(this);

        // Intialize breakpoint dictionary
        this.breakpoints = {};
    }

    /**
     * Read the value in memory at the location specified by the operand.
     * The operand is a string defining a register, immediate, or memory
     * address as the information source
     */
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
        let address = this.parseMemoryOperand(operand);
        return this.mem.read(address, size);

        // TODO: Allow read from labeled memory address
    }

    /**
     * Write the value to the location in memory specified by the operand.
     * Operand is a string that defines either a register destination or 
     * a memory address
     */
    write(operand, value, size) {
        // Immediate Operand
        if (operand.startsWith('$')) {
            throw new AsmSyntaxError(`Cannot write to an immediate operand: ${operand}`);
        }

        // Register operand
        if (operand.startsWith('%')) {
            this.regs.write(operand.slice(1), value);
            return;
        }

        // Memory operand
        let address = this.parseMemoryOperand(operand);
        this.mem.write(value, address, size);

        // TODO: allow write from labeled address
    }

    /**
     * Change the program counter to the value specified in the operand.
     * Operand can be a string representing an indirect memory access,
     * a label, or a literal address.
     */
    jump(operand) {
        // Indirect jump to address held in register
        if (operand.startsWith('*')) {
            this.rip = this.read(operand.slice(1));
        } else if (parseInt(operand)) {
            this.rip = parseInt(operand);
        } else {
            let address = this.labels[operand];
            if (address === undefined) throw new AsmSyntaxError(`Unkown label: ${operand}`)
            this.rip = address;
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
        let offset = /((?:0x)?[0-9]+)?\(%([a-z1-9]+)(?:,%([a-z1-9]+))?(?:,((?:0x)?[1248]))?\)/;
        let matches = operand.match(offset);

        if (!matches) throw new AsmSyntaxError(`Invalid address format: ${operand}`);

        // Parse the integers
        let disp  = matches[1] ? parseInt(matches[1])       : 0;
        let base  = matches[2] ? this.regs.read(matches[2]) : 0;
        let idx   = matches[3] ? this.regs.read(matches[3]) : 0;
        let scale = matches[4] ? parseInt(matches[4])       : 1;

        return disp + base + (idx * scale);
    }

    /**
     * Fetch the next instruction and transfer control to the proper instruction handler
     */
    step() {
        let [mnemonic, ...operands] = this.text.read(this.rip);
        this.rip++;

        if (mnemonic in this.chip) {
            this.chip[mnemonic](operands);
        } else {
            let suffixIdx = SUFFIXES.indexOf(mnemonic.slice(-1));

            if (suffixIdx > -1) {
                this.chip[mnemonic.slice(0,-1)](operands, SIZES[suffixIdx]);
            } else {
                throw new AsmSyntaxError(`Unknown mnemonic: ${mnemonic}`);
            }
        }
    }

    /**
     * Run the process one instruction at a time.  Pause for delay ms between executing each.
     */
    run(delay) {
        // TODO
    }

    /**
     * Dump current state
     */
    print() {
        console.log('PC: ' + this.rip);
        console.log(this.text.read(this.rip));
    }
}

module.exports = { Process };