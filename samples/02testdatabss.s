        ## ============================================================
        ## 02testdatabss.s
        ## ============================================================

        .section ".data"

label00:
        .ascii  "one", "two\n"
label01:
        .asciz  "three", "four"
label02:
        .skip   1
label03:

        .section ".bss"

label04:
        .skip   1
label05:

        .section ".data"

label06:
        .byte   1, 2
label07:
        .align  4
label08:
        .long   7, 8
label09:

        .section ".bss"

label10:
        .align  4
label11:
        .skip   2
label12:

