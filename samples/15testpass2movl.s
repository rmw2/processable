        ## ============================================================
        ## 14testpass2movl.s
        ## ============================================================

        .section ".text"

        addl    %eax, %eax

labelLocal0:

        addl    %eax, %eax
        addl    %eax, %eax

        .globl labelGlobal
labelGlobal:

        addl    %eax, %eax

        movl    $labelLocal0, %eax 
        movl    $labelLocal1, %eax
        movl    $labelGlobal, %eax
        movl    $labelUndefined, %eax
        movl    $labelInDiffSection, %eax

        addl    %eax, %eax

labelLocal1:

        addl    %eax, %eax

        .section ".data"

labelInDifSection:
        .asciz  "junk"

