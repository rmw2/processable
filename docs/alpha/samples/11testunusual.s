        ## ============================================================
        ## 11testunusual.s
        ## ============================================================

        ## Mnemonics in the data section:

        .section ".data"
        addl    %eax, %ebx
        addl    %ebx, %ecx

        ## Data allocation directives in the text section:

        .section ".text"
        .byte   1
        .byte   -64
        .byte   41
        .byte   -64

        ## Relocation in the data section:

        .section ".data"
        .long   5
        jmp     somelabel
        .long   6

