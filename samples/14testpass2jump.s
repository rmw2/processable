        ## ============================================================
        ## 14testpass2jump.s
        ## ============================================================

        .section ".text"

        addl    %eax, %eax

labelLocal0:

        addl    %eax, %eax
        addl    %eax, %eax

        .globl labelGlobal
labelGlobal:

        addl    %eax, %eax

        jmp     labelLocal0  # trouble 
        je      labelLocal1  # trouble
        jne     labelGlobal
        jl      labelUndefined
        jg      labelInDifSection

        addl    %eax, %eax

labelLocal1:

        addl    %eax, %eax

        .section ".data"

labelInDifSection:
        .asciz  "junk"

