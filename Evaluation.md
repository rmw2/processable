# Trial questions

_This is the alpha version of Processable, a student's debugger and program tracer for x86-64_

**Begin by opening the example program hello.s**

This is the Processable interface with hello.s loaded.

Quickly touring the display, we have the header bar, which contains buttons to control the process; from left to right these are restart, step, and continue.

Below this, from left to right, we first have the text section, which shows the assembly code for this program, and the current value of the program counter.  Breakpoints can be set by clicking on any address in the text section.

The next section is the console, which is bound to the current process' stdin, stdout, and stderr.  Whenever the process is paused, it can also be used to issue commands to the debugger.

**To begin the process, and push the arguments onto the stack, type the command "run" into the console, and press enter**

On the right is the stack section, which will show the value of every byte between the stack's origin and the current value of the stack pointer.  The rightmost column of the stack decodes the values into hex, binary, signed integer, unsigned integer, or characters in groups of bytes of equal size.  The size of the grouping can be toggled by the group of buttons titled "alignment," and the decoding for any particular grouping can be toggled by clicking on the corresponding box.

On the bottom left is the section for displaying static memory, with tabs to select the rodata, data, or bss section for display.  Labels, addresses, and contents of memory are shown as bytes and decodings, and can have their decodings toggled by clicking on the colored button to the left of each labeled byte group.

Finally, the Registers are shown in the bottom middle area.  Each row corresponds to a different group of overlapping registers, and the member of the group whose value is displayed can be toggled by the button to the left of the row showing the current register's name.  Similarly, the decoding scheme for the register can be toggled by the colored button at the right of each row.

Press the continue button to allow the program to run until completion.  Note that messages printed to stdout show up in the console.

_Return to the home page_

1. Open the example program euclid.s
    - Start the program, and step or continue to the beginning of the main() function
        - How would you find the value of the program counter?
        - What is the value in register %rsp?
        - On the top of the stack is the return address, what would you expect that value to be and how would you verify this?
    - Set a breakpoint at the first call to printf, and continue until that point
        - What is the value of %rdi before the call to printf?
        - What is the string at that address?
    - Advance the program until the first call to scanf()
        - What is the value in %rdi, and what is the string that resides at that address?
        - Step past the call to scanf, and enter the value 18 when prompted
        - What is the return value in %rax, interpreted as a long integer?
        - What is the value stored at the address just found in %rsi, interpretted as an integer?
    - Continue past the next call to scanf(), enter the value 12 when prompted
    - Step until the beginning of the gcd() function
    - Set a breakpoint at the je instruction at address 0x804806e
        - Continue until the breakpoint; what is the value of the zero flag?
        - Repeatedly continue until the zero flag is set
    - Set a breakpoint at the return statement from gcd
        - What is the long integer interpretation of the value about to be returned in %rax?
        - What is the address to which gcd will return, and what is the instruction at that address?

