        ## ============================================================
        ## 03testglobl.s
        ## ============================================================

        .section ".data"

label0:
        .long   1
        .globl  label0
        .long   2
        .globl  label1
        .long   3
label1:
        .long   4
        .globl  label2, label3
        .long   5
label4:

