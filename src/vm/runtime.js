/**
 *
 */
import {FixedInt, ALU} from '../fixed-int/FixedInt.js';

const QWORD = 8;
const DWORD = 4;
const WORD = 2;
const BYTE = 1;

const crt0 = [
    ['movl', '0(%rsp)', '%edi'],
    ['movq', '4(%rsp)', '%rsi'],
    ['andb', '$0xF0', '%spl'],
    ['movq', '%rsp', '%rbp'],
    ['call', 'main'],
    ['movq' ,'%rax', '%rdi'],
    ['call' ,'exit']
];

/**
 * @this is the process object
 *
 *        ------------
 *       |     ...    |
 *        ------------
 *       |*argv[1] \0 | <-
 *        ------------    |
 *       |*argv[0] \0 | <-+---
 *        ------------    |   |
 *       |  \0\0\0\0  |   |   |
 *        ------------    |   |
 *       |     ...    |   |   |
 *        ------------    |   |
 *       |  argv[1]   | --    |
 *        ------------        |
 *     ->|  argv[0]   | ------
 *    |   ------------
 *     --|    argv    |
 *        ------------
 *       |    argc    |
 *        ------------
 *
 */
export function exec(argv) {
    // Count the args
    let argc = new FixedInt(4, argv.length);
    let arglengths = argv.map((arg) => arg.length + 1);

    // Total length of argv array
    let bytes_argv = arglengths.reduce((total, next) => total + next);

    // One 8-byte pointer per argument, plus a null
    let bytes_pointers = (arglengths.length + 1) * QWORD;

    // 8-byte pointer char** argv, 4-byte argc
    let bytes_args = QWORD + DWORD;

    // Total size of the stack before the program begins
    let bytes_total = bytes_argv + bytes_pointers + bytes_args;

    // Get the stack origin and calculate new stack top
    let stackorigin = this.regs.read('rsp');
    let stacktop = ALU.sub(stackorigin, bytes_total);

    // Write it all to memory
    this.mem.write(argc, stacktop, DWORD);
    this.mem.write(ALU.add(stacktop, bytes_args), stacktop + DWORD, QWORD);

    let offset = bytes_args + bytes_pointers;
    for (let i = 0; i < argv.length; i++) {

        // Write the pointer argv[i]
        this.mem.write(ALU.add(stacktop, offset), stacktop + bytes_args + QWORD*i, QWORD);
        // Write the argument *argv[i]
        writeString(this.mem, stacktop + offset, argv[i]);
        offset += arglengths[i];
    }

    // Finally correct the stack pointer and unblock the process
    this.regs.write('rsp', stacktop);
    this.blocked = false;
    this.pc = this.mem.segments.text.lo;
}

/**
 * Utility function for writing a null-terminated string to Memory
 * beginning at addresss addr
 */
function writeString(mem, addr, str) {
    for (let i = 0; i < str.length; i++) {
        mem.write(new FixedInt(BYTE, str.charCodeAt(i)), addr + i, BYTE);
    }

    mem.write(new FixedInt(BYTE), addr + str.length, BYTE);
}

export default crt0;