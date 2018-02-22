        ## ============================================================
        ## 12testduplabel.s
        ## ============================================================

        .section ".data"
label0:
        .long 1
label1:
        .long 2
label2:
        .long 3
label1:
        .long 4
label4:
        .long 5

        addl    %eax, %ebx
        addl    %ebx, %ecx

