/**
 *
 */
import {FixedInt, ALU} from './FixedInt.js';

const QWORD = 8;
const DWORD = 4;
const WORD = 2;
const BYTE = 1;

const crt0 = [
    ['movq', '%rsp', '%rbp'],
    ['movl', '0(%rsp)', '%edi'],
    ['movq' ,'4(%rsp)', '%rsi'],
    ['call','main'],
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

    console.log(`argc: ${+argc}`);
    console.log(`lengths: [${arglengths}]`);

    // Total length of argv array
    let bytes_argv = arglengths.reduce((total, next) => total + next);

    // One 8-byte pointer per argument, plus a null
    let bytes_pointers = (arglengths.length + 1) * QWORD;

    // 8-byte pointer char** argv, 4-byte argc
    let bytes_args = QWORD + DWORD;

    // Total size of the stack before the program begins
    let bytes_total = bytes_argv + bytes_pointers + bytes_args;

    console.log(`args: ${bytes_args}, pointers: ${bytes_pointers}, argv: ${bytes_argv}`);

    // Get the stack origin and calculate new stack top
    let stackorigin = this.regs.read('rsp');
    let stacktop = ALU.sub(stackorigin, bytes_total);

    console.log(`ORIGIN: ${stackorigin.toString(16)}`);
    console.log(`TOP: ${stacktop.toString(16)}`);

    // Write it all to memory
    this.mem.write(argc, stacktop, DWORD);
    this.mem.write(ALU.add(stacktop, bytes_args), stacktop + DWORD, QWORD);

    let offset = bytes_args + bytes_pointers;
    for (let i = 0; i < argv.length; i++) {
        console.log(`&arg[${i}]: ${(stacktop + bytes_args + QWORD*i).toString(16)}`);
        console.log(`arg[${i}]: ${(stacktop + offset).toString(16)}`);

        // Write the pointer argv[i]
        this.mem.write(ALU.add(stacktop, offset), stacktop + bytes_args + QWORD*i, QWORD);
        // Write the argument *argv[i]
        writeString(this.mem, stacktop + offset, argv[i]);
        offset += arglengths[i];
    }

    // Finally correct the stack pointer
    this.regs.write('rsp', stacktop);
    console.log('Finished with exec.  Stack *should* be set up');
}

/**
 * Utility function for writing a null-terminated string to Memory
 * beginning at addresss addr
 */
function writeString(mem, addr, str) {
    for (let i = 0; i < str.length; i++) {
        console.log((addr+i).toString(16));
        mem.write(new FixedInt(BYTE, str.charCodeAt(i)), addr + i, BYTE);
    }

    mem.write(new FixedInt(BYTE), addr + str.length, BYTE);
}

export default crt0;