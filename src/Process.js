"use strict";
/** 
 * Module that defines a single-threaded processor
 * to execute instructions
 */

let { MemorySegment, TextSegment } = require('./Memory.js');
let { RegisterSet } = require('./Registers.js');
let { Int64 } = require('./Int64.js');
let x86 = require('./x86.js');

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

        // Gosh this is cumbersome
        if (base.name === 'Int64') base = base.val();
        if (idx.name === 'Int64') idx = idx.val();

        return disp + base + (idx * scale);
    }

    /**
     * Return the operand size implied by a given mnemonic
     */
    parseOperandSize(mnemonic) {
        const SUFFIXES = ['b', 'w', 'l', 'q'];
        const SIZES = [1, 2, 4, 8];

        let idx = SUFFIXES.indexOf(mnemonic.slice(-1));
        let size = SIZES[idx];
        let prefix = mnemonic.slice(0,-1);

        return {prefix, size};
    }

    /**
     * Fetch the next instruction and execute
     */
    step(verbose=true) {
        if (this.rip !== undefined) {
            let rip = this.rip;

            // Fetch mnemonic and operands from Text section
            let [mnemonic, ...operands] = this.text.read(this.rip);

            if (verbose) 
                this.print(rip, true, true);

            // Advance instruction pointer and execute
            this.rip = this.text.next(this.rip);
            this.execute(mnemonic, operands);

            if (verbose) {
                // Print stack pointer and operand values after operation
                console.log('\t-----');
                this.print(rip, false, true);
            }
        }

        return this.rip;
    }

    /**
     * Given a mnemonic and operands, transfer control to the proper instruction handler
     */
    execute(mnemonic, operands) {
        if (mnemonic in this.chip) {
            this.chip[mnemonic](operands);
        } else {
            let {prefix, size} = this.parseOperandSize(mnemonic);

            if (size) {
                this.chip[prefix](operands, size);
            } else {
                throw new AsmSyntaxError(`Unknown mnemonic: ${mnemonic}`);
            }
        }
    }

    /**
     * Run the process one instruction at a time.
     * Pause for delay ms between executing each.
     */
    run(delay=0, verbose=true) {
        if (delay) {
            // Time-out execution
            let interval;
            interval = setInterval(() => {
                if (this.rip === undefined || this.breakpoints[this.rip]) {
                    clearInterval(interval);
                    return;
                }

                this.step(verbose);
            }, delay);
        } else {
            // Continuous execution
            while (this.rip !== undefined && !this.breakpoints[this.rip])
                this.step();
        }
    }

    addBreakpoint(addressOrLabel) {
        if (this.labels[addressOrLabel] !== undefined)
            address = this.labels[addressOrLabel];
        else
            address = addressOrLabel;

        // TODO
    }

    /**
     * Dump current state
     */
    print(rip=this.rip, showPC=true, showStack=true) {
        let [mnemonic, ...operands] = this.text.read(rip);
        let {prefix, size} = this.parseOperandSize(mnemonic);

        // Output address and instruction to execute
        if (showPC && this.rip !== undefined)
            console.log(`0x${rip.toString(16)}: ${mnemonic}\t${operands.join(', ')}`);

        // Output stack pointer and operand values before operation
        if (showStack && operands.indexOf('%rsp') == -1)
            console.log(`\t%rsp:\t0x${this.regs.read('rsp').val().toString(16)}`);

        // Print operands and values
        for (let i in operands) {
            let op = operands[i];
            if (op.startsWith('$')) continue;
            try {
                console.log(`\t${op}:\t${this.read(op, size)}`);
            } catch (e) {
                if (!(e instanceof AsmSyntaxError)) 
                    throw e;
            }
        }
    }
}

module.exports = { Process };