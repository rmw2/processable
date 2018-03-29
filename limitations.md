# Limitations and Assumptions

## x86 Instructions
We implmented a minimal but quite usable subset of x86-64, including most control flow and integer arithmetic instructions.  Important limitations to note include
* No floating point instructions or registers
* No support for the x86 AF (auxiliary / half-carry) and PF (parity) flags
* 64-bit multiplication is not supported (mulq, imulq)

The full list of supported instructions is as follows (suffixes ommitted):
**mov, movabs, push, pop, cltq, cqto, movsb, movsw, movsl, movzb, movzw, movzl, add, sub, imul, idiv, adc, lea, xor, or, and, inc, dec, not, neg, call, ret, jmp, jne, jo, jno, ja, jae, jb, jbe, jg, jge, jl, jle, js, jns, jcxz, jecxz, jz, jnz, jc, jnc, jnb, jnbe, jna, jnae, jng, jnge, jnl, jnle, shl, shr, sal, sar, stc, cmc, cmp, test, hlt**

## C Standard Library
A subset of the C standard library has been implemented with javascript functions that produce similar behavior on the emulation environment as their corresponding functions on a linux C runtime.  The list of currently supported functions and their specific limitations is:
- `printf` supported format specifiers: %s, %d, %ld, %x
- `scanf` supported format specifiers: %s, %d, %ld, %x
- `getchar`
- `putchar`
- `abs`
- `labs`
- `exit`

## Runtime
Programs are loaded by something analagous to an exec() call by the debugger.  This pushes the command-line arguments onto the stack, as well as the `argv` array and finally the pointer to `argv`, and `argc`.  Note that there are no environment variables pushed onto the stack, and no corresponding envp array.  Additionally, when an assembly file is loaded, the "assembler" injects a minimal C runtime (commonly referred to as crt0.s) which does 4 things: First it copies `argc` and `argv` from the stack into `%edi` and `%rsi` respectively, then it `and`s the last byte of the stack pointer (`%spl`) with `0xF0`, to force a 16-byte alignment, and calls `main()`.  When main returns, it moves the return value `%rax` into `%rdi` and calls `exit()`.
