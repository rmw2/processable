"use strict";
/** 
 * Module that defines a single-threaded processor
 * to execute instructions
 */

import { FixedInt } from './FixedInt.js';
import { Memory } from './Memory.js';
import { RegisterSet } from './Registers.js';
import x86 from './x86.js';

class AsmSyntaxError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AsmSyntaxError';
    }
}

class Process {
    constructor(image, labels={}, arch=x86, verbose=false) {
        // Intitialize memory and registers
        this.mem  = new Memory(image);
        this.regs = new RegisterSet(arch.registers);

        // Initialize stack pointer and instruction pointer
        this.pc = image.text.start;
        this.stackOrigin = this.mem.segments.stack.hi;
        this.regs.write('rsp', new FixedInt(arch.WORD_SIZE, this.stackOrigin));

        // Save the labels and reverse the label mapping
        this.labels = labels;
        this.labeled = {};
        for (let label in this.labels)
            this.labeled[this.labels[label]] = label;

        // Object containing handlers indexed by instruction
        this.chip = arch.chip.call(this);

        // Intialize breakpoint dictionary
        this.breakpoints = {};
    }

    /**
     * Read the value in memory at the location specified by the operand.
     * The operand is a string defining a register, immediate, or memory
     * address as the information source
     */
    read(operand, size=4) {
        // Immediate Operand
        if (operand.startsWith('$')) {
            let val, label;
            if (isNaN(val = parseInt(label = operand.slice(1)))) {
                val = this.labels[label];
                if (val !== undefined) {
                    return new FixedInt(size, val);
                } else {
                    throw new AsmSyntaxError(`Label ${name} undefined`);
                }
            }

            return new FixedInt(size, val);
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

        // Label operand
        if (this.labels[operand] !== undefined) {
            let address = this.labels[operand];
            this.mem.write(address, value);
        }

        // Memory operand
        let address = this.parseMemoryOperand(operand);
        this.mem.write(value, address, size);
    }

    /**
     * Change the program counter to the value specified in the operand.
     * Operand can be a string representing an indirect memory access,
     * a label, or a literal address.
     */
    jump(operand) {
        // Indirect jump to address held in register
        if (operand.startsWith('*')) {
            this.pc = +this.read(operand.slice(1));
        } else if (parseInt(+operand)) {
            this.pc = parseInt(+operand);
        } else {
            let address = this.labels[operand];
            // TODO: include bridge for "standard library" calls
            if (address === undefined) throw new AsmSyntaxError(`Unkown label: ${operand}`)
            this.pc = address;
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
        let disp  = matches[1] ? parseInt(matches[1])        : 0;
        let base  = matches[2] ? +this.regs.read(matches[2]) : 0;
        let idx   = matches[3] ? +this.regs.read(matches[3]) : 0;
        let scale = matches[4] ? parseInt(matches[4])        : 1;

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
    step(verbose=false) {
        if (this.pc !== undefined) {
            let pc = this.pc;

            // Fetch mnemonic and operands from Text section
            let [mnemonic, ...operands] = this.mem.read(this.pc);

            if (verbose) 
                this.print(pc, true, true);

            // Advance instruction pointer and execute
            this.pc = this.mem.next(this.pc);
            this.execute(mnemonic, operands);

            if (verbose) {
                // Print stack pointer and operand values after operation
                console.log('\t-----');
                this.print(pc, false, true);
            }
        }

        return this.pc;
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
    run(delay=0, verbose=false) {
        if (delay) {
            // Time-out execution
            let interval;
            interval = setInterval(() => {
                this.step(verbose);

                if (this.pc === undefined || this.breakpoints[this.pc]) {
                    clearInterval(interval);
                    return;
                }
            }, delay);
        } else {
            // Continuous execution
            do {
                this.step();
            } while (this.pc !== undefined && !this.breakpoints[this.pc])
        }
    }

    /**
     * Add or remove a breakpoint at the specified address or label
     */
    toggleBreakpoint(addressOrLabel) {
        let address;
        addressOrLabel += '';
        if (this.labels[addressOrLabel] !== undefined)
            address = this.labels[addressOrLabel];
        else
            address = addressOrLabel;

        // (undefined || false) -> true, true -> false
        this.breakpoints[address] = !this.breakpoints[address];
    }
f
    /**
     * Dump current state
     */
    print(pc=this.pc, showPC=true, showStack=true) {
        let [mnemonic, ...operands] = this.mem.read(pc);
        let {prefix, size} = this.parseOperandSize(mnemonic);

        // Output address and instruction to execute
        if (showPC && this.pc !== undefined)
            console.log(`0x${pc.toString(16)}: ${mnemonic}\t${operands.join(', ')}`);

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
                // Hack in case we can't actually read this operand
                if (e.name !== 'AsmSyntaxError')
                    throw e;
            }
        }
    }
}

module.exports = { Process };