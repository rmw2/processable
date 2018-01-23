        ## ============================================================
        ## 13testpass2call.s
        ## ============================================================

        .section ".text"

        addl    %eax, %eax

labelLocal0:

        addl    %eax, %eax
        addl    %eax, %eax

        .globl  labelGlobal
labelGlobal:

        addl    %eax, %eax

        call    labelLocal0 
        call    labelLocal1
        call    labelGlobal
        call    labelUndefined
        call    labelInDifSection

        addl    %eax, %eax

labelLocal1:

        addl    %eax, %eax

        .section ".data"

labelInDifSection:
        .asciz  "junk"

