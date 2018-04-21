"use strict";
/**
 * Module that defines a single-threaded processor
 * to execute instructions
 */

import { FixedInt } from '../fixed-int/FixedInt.js';
import { Memory } from './Memory.js';
import { RegisterSet } from './Registers.js';
import { Stdlib } from './lib.js';
import { exec } from './runtime.js';
import gas from './parse/gas.js';
import Signals from './Signals.js';
import Console from './IO.js';
import x86, { WORD_SIZE } from './arch/x86.js';

class AsmSyntaxError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AsmSyntaxError';
    }
}

class Process {
    constructor(image, labels={}, arch=x86, parser=gas, verbose=false) {
        // Intitialize memory and registers
        this.mem  = new Memory(image);
        this.regs = new RegisterSet(arch.registers);

        // Initialize stack pointer and instruction pointer
        this.pc = undefined;
        this.stackOrigin = this.mem.segments.stack.hi;
        this.regs.write('rsp', new FixedInt(arch.WORD_SIZE, this.stackOrigin));

        // Save the labels and reverse the label mapping
        this.labels = labels;
        this.labeled = {};
        for (let label in this.labels) {
            this.labeled[this.labels[label]] = this.labeled[this.labels[label]] || [];
            this.labeled[this.labels[label]].push(label);
        }

        // Object containing handlers indexed by instruction
        this.chip = arch.chip.call(this);

        // Bind the parsing modules
        parser.call(this, arch.WORD_SIZE);

        // Bind the console
        let cons = new Console();
        this.io = {
            stdout: cons,
            stdin: cons,
            stderr: cons
        };

        // Bind standard library to process
        this.lib = Stdlib.call(this, this.io);
        this.exec = exec.bind(this);

        // Intialize breakpoint dictionary
        this.breakpoints = {};

        // Initialize signal handlers
        this.signals = new Signals();

        // Start the process blocked
        this.blocked = true;
    }

    /**
     * Fetch the next instruction and execute
     */
    step(verbose=false) {
        if (this.pc && !this.blocked) {
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
                // console.log('\t-----');
                this.print(pc, false, true);
            }
        }

        return this.pc;
    }

    /**
     * Run the process one instruction at a time.
     * Pause for delay ms between executing each.
     * @param {Number} delay
     * @param {boolean} verbose
     * @returns {FixedInt} -- the process' return value
     */
    run(delay=0, verbose=false) {
        if (delay) {
            // Time-out execution
            let interval;
            interval = setInterval(() => {
                this.step(verbose);

                if (!this.pc || this.breakpoints[this.pc]) {
                    clearInterval(interval);
                    return;
                }
            }, delay);
        } else {
            // Continuous execution
            do {
                this.step();
            } while (this.pc && !this.breakpoints[this.pc] && !this.blocked)
        }

        return this.regs.read('rax');
    }

    /**
     * Add or remove a breakpoint at the specified address or label
     */
    toggleBreakpoint(addressOrLabel) {
        let address;
        addressOrLabel += ''; // coerce to string
        if (this.labels[addressOrLabel] !== undefined)
            address = this.labels[addressOrLabel];
        else
            address = addressOrLabel;

        // (undefined || false) -> true, true -> false
        this.breakpoints[address] = !this.breakpoints[address];
        return this.breakpoints[address];
    }

    /**
     * Dump current state
     */
    print(pc=this.pc, showPC=true, showStack=true) {
        let [mnemonic, ...operands] = this.mem.read(pc);
        let {prefix, size} = this.parseOperandSize(mnemonic);

        // Output address and instruction to execute
        if (showPC && this.pc !== undefined)
            // console.log(`0x${pc.toString(16)}: ${mnemonic}\t${operands.join(', ')}`);

        // Output stack pointer and operand values before operation
        if (showStack && operands.indexOf('%rsp') == -1)
            // console.log(`\t%rsp:\t0x${this.regs.read('rsp').val().toString(16)}`);

        // Print operands and values
        for (let i in operands) {
            let op = operands[i];
            if (op.startsWith('$')) continue;
            try {
                // console.log(`\t${op}:\t${this.read(op, size)}`);
            } catch (e) {
                // Hack in case we can't actually read this operand
                if (e.name !== 'AsmSyntaxError')
                    throw e;
            }
        }
    }
}

module.exports = { Process };